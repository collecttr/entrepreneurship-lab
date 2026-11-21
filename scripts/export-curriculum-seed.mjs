/**
 * Curriculum seed is hand-synced / regenerated alongside src/data.
 * Preferred path: update src/data/sources.ts + curriculum.ts (demo source of truth),
 * then refresh supabase/seed_curriculum.sql source + week_sources blocks.
 *
 * Quick dump helper:
 *   npx tsx -e "import {LIBRARY_SOURCES} from './src/data/sources.ts'; import {WEEKS} from './src/data/curriculum.ts'; console.log(LIBRARY_SOURCES.length, WEEKS.reduce((n,w)=>n+w.sources.length,0))"
 */
console.log('Use src/data/* as source of truth; supabase/seed_curriculum.sql mirrors sources + week_sources.')
