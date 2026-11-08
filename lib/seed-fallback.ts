/**
 * ROUND 3 — build-time seed records (server-only data).
 *
 * This module statically imports biznestusa-seed-businesses.json (292
 * records). It must NEVER be statically imported by lib/db-service.ts or
 * by any 'use client' module: db-service.ts is imported by client
 * components (app/add-business/add-business-client.tsx, app/admin/page.tsx),
 * so a static import chain from there would ship all 292 records to
 * browsers.
 *
 * db-service.ts loads this module with a dynamic import() inside its
 * server-only build-phase branch (typeof window === 'undefined' &&
 * NEXT_PHASE === 'phase-production-build'), so the JSON lands in a lazy
 * chunk that is never fetched by browsers — it is not part of any
 * first-load client JS. (A dynamic `fs` import was tried first and is
 * rejected by Turbopack anywhere in the client module graph, which is
 * why the data lives in this separate lazily-loaded module instead.)
 */
import seedRecords from '../biznestusa-seed-businesses.json'

export function getSeedBusinessRecords(): Array<Record<string, any>> {
  const records = seedRecords as unknown as Array<Record<string, any>>
  return records.filter((r) => r && r.entity_type !== 'professional')
}
