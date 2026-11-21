#!/usr/bin/env node
/**
 * Emits SQL seed snippets from the TypeScript curriculum pack.
 * Run: npx tsx scripts/export-curriculum-seed.mjs > supabase/seed_curriculum.sql
 * (This file documents the intended export; seed_curriculum.sql is maintained alongside.)
 */
console.log('-- Use supabase/seed_curriculum.sql (generated/hand-synced from src/data).')
console.log('-- Demo mode reads src/data/* directly without Postgres.')
