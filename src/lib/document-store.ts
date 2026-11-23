import { DEMO_USERS } from '@/lib/demo-data'
import { idbDeleteBlob, idbGetBlob, idbPutBlob } from '@/lib/document-idb'
import {
  mimeForFile,
  validateUploadFile,
  type AiEvalStatus,
  type DocumentCategory,
  type DocumentComment,
  type DocumentFileMeta,
  type DocumentGroup,
} from '@/lib/document-types'
import { isDemoAuth, supabase, supabaseConfigured } from '@/lib/supabase'
import { createSignedDownloadUrl, uploadPrivateDocument } from '@/lib/document-storage'

const GROUPS_KEY = 'elab_document_groups'
const FILES_KEY = 'elab_document_files'
const COMMENTS_KEY = 'elab_document_comments'
const CHANNEL = 'elab-docs-v1'

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

function broadcast() {
  try {
    const bc = new BroadcastChannel(CHANNEL)
    bc.postMessage({ type: 'docs' })
    bc.close()
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent('elab-docs'))
}

export function subscribeDocuments(onChange: () => void): () => void {
  const onCustom = () => onChange()
  const onStorage = (e: StorageEvent) => {
    if (e.key === GROUPS_KEY || e.key === FILES_KEY || e.key === COMMENTS_KEY) onChange()
  }
  let bc: BroadcastChannel | null = null
  try {
    bc = new BroadcastChannel(CHANNEL)
    bc.onmessage = () => onChange()
  } catch {
    bc = null
  }
  window.addEventListener('elab-docs', onCustom)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener('elab-docs', onCustom)
    window.removeEventListener('storage', onStorage)
    bc?.close()
  }
}

export function listDocumentGroups(): DocumentGroup[] {
  return readJson<DocumentGroup[]>(GROUPS_KEY, []).sort((a, b) =>
    b.updated_at.localeCompare(a.updated_at),
  )
}

export function getDocumentGroup(id: string): DocumentGroup | undefined {
  return listDocumentGroups().find((g) => g.id === id)
}

export function listVersions(groupId: string): DocumentFileMeta[] {
  return readJson<DocumentFileMeta[]>(FILES_KEY, [])
    .filter((f) => f.document_group_id === groupId)
    .sort((a, b) => b.version - a.version)
}

export function latestVersion(groupId: string): DocumentFileMeta | undefined {
  return listVersions(groupId)[0]
}

export function listDocumentComments(groupId: string): DocumentComment[] {
  return readJson<DocumentComment[]>(COMMENTS_KEY, [])
    .filter((c) => c.document_group_id === groupId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
}

export function authorName(userId: string): string {
  const demo = DEMO_USERS.find((u) => u.profile.id === userId)?.profile
  if (demo) return demo.display_name
  return 'Участник'
}

export async function createDocumentWithUpload(input: {
  owner_id: string
  title: string
  description_md: string
  category: DocumentCategory
  week_number: number | null
  assignment_code: string | null
  source_notes: string
  file: File
}): Promise<DocumentGroup> {
  const err = validateUploadFile(input.file)
  if (err) throw new Error(err)

  const now = new Date().toISOString()
  const groupId = crypto.randomUUID()
  const mime = mimeForFile(input.file)
  const version = 1
  const fileId = crypto.randomUUID()
  const blobKey = `blob:${groupId}:v${version}`
  const path = `${input.owner_id}/${groupId}/v${version}/${input.file.name}`

  if (isDemoAuth || !supabaseConfigured || !supabase) {
    await idbPutBlob(blobKey, input.file)
  } else {
    await uploadPrivateDocument({
      userId: input.owner_id,
      groupId,
      version,
      filename: input.file.name,
      file: input.file,
    })
  }

  const group: DocumentGroup = {
    id: groupId,
    owner_id: input.owner_id,
    title: input.title.trim(),
    description_md: input.description_md.trim(),
    category: input.category,
    week_number: input.week_number,
    assignment_code: input.assignment_code,
    source_notes: input.source_notes.trim(),
    created_at: now,
    updated_at: now,
    // AI spend lock default ON → never invent a grade
    ai_status: 'pending_ai',
    manual_score: null,
    manual_feedback_md: null,
  }

  const fileMeta: DocumentFileMeta = {
    id: fileId,
    document_group_id: groupId,
    owner_id: input.owner_id,
    path,
    filename: input.file.name,
    mime,
    size_bytes: input.file.size,
    version,
    created_at: now,
    blob_key: blobKey,
  }

  writeJson(GROUPS_KEY, [group, ...listDocumentGroups()])
  writeJson(FILES_KEY, [...readJson<DocumentFileMeta[]>(FILES_KEY, []), fileMeta])
  broadcast()
  await syncDocumentMetaToSupabase(group, fileMeta)
  return group
}

async function syncDocumentMetaToSupabase(group: DocumentGroup, fileMeta: DocumentFileMeta) {
  if (isDemoAuth || !supabaseConfigured || !supabase) return
  try {
    const { error: gErr } = await supabase.from('document_groups').upsert({
      id: group.id,
      owner_id: group.owner_id,
      title: group.title,
      description_md: group.description_md,
      category: group.category,
      week_number: group.week_number,
      assignment_code: group.assignment_code,
      source_notes: group.source_notes,
      created_at: group.created_at,
      updated_at: group.updated_at,
    })
    if (gErr) throw gErr
    const { error: fErr } = await supabase.from('document_files').upsert({
      id: fileMeta.id,
      document_group_id: fileMeta.document_group_id,
      owner_id: fileMeta.owner_id,
      path: fileMeta.path,
      filename: fileMeta.filename,
      mime: fileMeta.mime,
      size_bytes: fileMeta.size_bytes,
      version: fileMeta.version,
      created_at: fileMeta.created_at,
    })
    if (fErr) throw fErr
    await supabase.from('document_evaluations').upsert({
      document_group_id: group.id,
      ai_status: 'pending_ai',
      updated_at: group.updated_at,
    })
  } catch (err) {
    console.warn('document meta sync skipped:', err)
  }
}

export async function uploadNewVersion(groupId: string, ownerId: string, file: File): Promise<DocumentFileMeta> {
  const group = getDocumentGroup(groupId)
  if (!group) throw new Error('Документ не найден')
  if (group.owner_id !== ownerId) throw new Error('Только владелец может загружать новую версию')
  const err = validateUploadFile(file)
  if (err) throw new Error(err)

  const prev = latestVersion(groupId)
  const version = (prev?.version ?? 0) + 1
  const mime = mimeForFile(file)
  const now = new Date().toISOString()
  const fileId = crypto.randomUUID()
  const blobKey = `blob:${groupId}:v${version}`
  const path = `${ownerId}/${groupId}/v${version}/${file.name}`

  if (isDemoAuth || !supabaseConfigured || !supabase) {
    await idbPutBlob(blobKey, file)
  } else {
    await uploadPrivateDocument({
      userId: ownerId,
      groupId,
      version,
      filename: file.name,
      file,
    })
  }

  const fileMeta: DocumentFileMeta = {
    id: fileId,
    document_group_id: groupId,
    owner_id: ownerId,
    path,
    filename: file.name,
    mime,
    size_bytes: file.size,
    version,
    created_at: now,
    blob_key: blobKey,
  }

  writeJson(FILES_KEY, [...readJson<DocumentFileMeta[]>(FILES_KEY, []), fileMeta])
  const groups = listDocumentGroups().map((g) =>
    g.id === groupId
      ? { ...g, updated_at: now, ai_status: 'pending_ai' as AiEvalStatus, manual_score: null }
      : g,
  )
  writeJson(GROUPS_KEY, groups)
  const updated = groups.find((g) => g.id === groupId)
  broadcast()
  if (updated) await syncDocumentMetaToSupabase(updated, fileMeta)
  return fileMeta
}

export async function openPrivateDownload(file: DocumentFileMeta): Promise<() => void> {
  const result = await createSignedDownloadUrl({
    storagePath: file.path,
    blobKey: file.blob_key,
    getDemoBlob: idbGetBlob,
  })
  const a = document.createElement('a')
  a.href = result.url
  a.download = file.filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  const revoke = () => {
    result.revoke?.()
  }
  // Revoke shortly after click (demo object URLs)
  window.setTimeout(revoke, 60_000)
  return revoke
}

export function addDocumentComment(input: {
  document_group_id: string
  author_id: string
  body_md: string
  quote_md?: string | null
  document_file_id?: string | null
}): DocumentComment {
  const c: DocumentComment = {
    id: crypto.randomUUID(),
    document_group_id: input.document_group_id,
    document_file_id: input.document_file_id ?? null,
    author_id: input.author_id,
    body_md: input.body_md.trim(),
    quote_md: input.quote_md ?? null,
    created_at: new Date().toISOString(),
  }
  writeJson(COMMENTS_KEY, [...readJson<DocumentComment[]>(COMMENTS_KEY, []), c])
  broadcast()
  return c
}

export function setManualEvaluation(
  groupId: string,
  score: number | null,
  feedback: string,
): void {
  const groups = listDocumentGroups().map((g) =>
    g.id === groupId
      ? {
          ...g,
          ai_status: 'manual_only' as AiEvalStatus,
          manual_score: score,
          manual_feedback_md: feedback,
          updated_at: new Date().toISOString(),
        }
      : g,
  )
  writeJson(GROUPS_KEY, groups)
  broadcast()
}

/** Cleanup helper for tests — not exposed in UI */
export async function deleteDocumentGroup(groupId: string): Promise<void> {
  const files = listVersions(groupId)
  for (const f of files) {
    await idbDeleteBlob(f.blob_key).catch(() => undefined)
  }
  writeJson(
    GROUPS_KEY,
    listDocumentGroups().filter((g) => g.id !== groupId),
  )
  writeJson(
    FILES_KEY,
    readJson<DocumentFileMeta[]>(FILES_KEY, []).filter((f) => f.document_group_id !== groupId),
  )
  writeJson(
    COMMENTS_KEY,
    readJson<DocumentComment[]>(COMMENTS_KEY, []).filter((c) => c.document_group_id !== groupId),
  )
  broadcast()
}
