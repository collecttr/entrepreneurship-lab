#!/usr/bin/env node
/**
 * Bootstrap two allowlisted Auth users + profile metadata via service role.
 *
 * Usage (after migrations + seed allowlist emails):
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/bootstrap-users.mjs
 *
 * Optional env:
 *   LEARNER_A_EMAIL / LEARNER_A_PASSWORD / LEARNER_A_NAME
 *   LEARNER_B_EMAIL / LEARNER_B_PASSWORD / LEARNER_B_NAME
 *
 * NEVER expose SERVICE_ROLE_KEY to the Vite client (no VITE_ prefix).
 */

import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Need SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const users = [
  {
    email: (process.env.LEARNER_A_EMAIL || 'learner.a@example.com').toLowerCase(),
    password: process.env.LEARNER_A_PASSWORD || 'ChangeMe-A-2026!',
    display_name: process.env.LEARNER_A_NAME || 'Участник A',
    role: 'learner',
    participant_slot: 'A',
  },
  {
    email: (process.env.LEARNER_B_EMAIL || 'learner.b@example.com').toLowerCase(),
    password: process.env.LEARNER_B_PASSWORD || 'ChangeMe-B-2026!',
    display_name: process.env.LEARNER_B_NAME || 'Участник B',
    role: 'admin',
    participant_slot: 'B',
  },
]

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

for (const u of users) {
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 200 })
  const existing = list?.users?.find((x) => x.email?.toLowerCase() === u.email)

  let userId = existing?.id
  if (!userId) {
    const { data, error } = await admin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { display_name: u.display_name },
    })
    if (error) {
      console.error('createUser failed', u.email, error.message)
      process.exit(1)
    }
    userId = data.user.id
    console.log('created auth user', u.email, userId)
  } else {
    console.log('auth user exists', u.email, userId)
  }

  await admin.from('allowed_emails').upsert({ email: u.email })

  const { error: profileErr } = await admin.from('profiles').upsert({
    id: userId,
    email: u.email,
    display_name: u.display_name,
    role: u.role,
    participant_slot: u.participant_slot,
  })
  if (profileErr) {
    console.error('profile upsert failed', profileErr.message)
    process.exit(1)
  }
  console.log('profile ready', u.email, u.role, u.participant_slot)
}

console.log('Bootstrap complete. Disable public sign-ups in Auth settings.')
