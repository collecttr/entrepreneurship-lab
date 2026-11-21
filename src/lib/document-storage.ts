import { isDemoAuth, supabase, supabaseConfigured } from '@/lib/supabase'

/**
 * Private download path. Never returns a permanent public URL.
 * - Demo: temporary object URL from IndexedDB blob (caller must revoke).
 * - Live: short-lived Supabase signed URL after authz (bucket `documents` is private).
 */
export async function createSignedDownloadUrl(params: {
  storagePath: string
  /** Demo blob key in IndexedDB */
  blobKey?: string
  expiresInSec?: number
  getDemoBlob: (key: string) => Promise<Blob | null>
}): Promise<{ url: string; mode: 'demo-object-url' | 'supabase-signed'; revoke?: () => void }> {
  const expiresInSec = params.expiresInSec ?? 120

  if (isDemoAuth || !supabaseConfigured || !supabase) {
    if (!params.blobKey) throw new Error('Нет ключа blob для демо-скачивания')
    const blob = await params.getDemoBlob(params.blobKey)
    if (!blob) throw new Error('Файл не найден в приватном демо-хранилище (IndexedDB)')
    const url = URL.createObjectURL(blob)
    return {
      url,
      mode: 'demo-object-url',
      revoke: () => URL.revokeObjectURL(url),
    }
  }

  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(params.storagePath, expiresInSec)

  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? 'Не удалось создать signed URL')
  }

  return { url: data.signedUrl, mode: 'supabase-signed' }
}

/** Upload helper for live Supabase Storage (private bucket). */
export async function uploadPrivateDocument(params: {
  userId: string
  groupId: string
  version: number
  filename: string
  file: File
}): Promise<string> {
  if (!supabase) throw new Error('Supabase не настроен')
  const path = `${params.userId}/${params.groupId}/v${params.version}/${params.filename}`
  const { error } = await supabase.storage.from('documents').upload(path, params.file, {
    upsert: false,
    contentType: params.file.type,
  })
  if (error) throw error
  return path
}

export function privacyBannerText(): string {
  if (isDemoAuth || !supabaseConfigured) {
    return 'Приватность (демо): файлы в IndexedDB на этом устройстве, без публичных URL. Object URL создаётся только на время скачивания и отзывается. Это не production Storage.'
  }
  return 'Приватность: bucket documents private; скачивание только через короткий signed URL после проверки доступа.'
}
