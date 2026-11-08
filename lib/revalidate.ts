// Client-side helper: ask the server to on-demand revalidate a public
// path (POST /api/revalidate). The route is admin-gated via the
// caller's Firebase ID token (lib/server-auth.ts verifyAdminToken), so
// callers spread getAuthHeaders() into the fetch — a missing token must
// never be silently sent as an anonymous call; the route then 401s
// honestly. Fire-and-forget: callers .catch() so a revalidation failure
// never fails the approval itself.
import { getAuthHeaders } from './client-auth'
import type { BusinessItem, CompanyItem, JobItem, ProfessionalItem } from './data'
import {
  computeCitySlugs,
  normalizeBusinessCategoryId,
} from './directory-helpers'

export async function requestRevalidate(path: string): Promise<void> {
  const res = await fetch('/api/revalidate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
    body: JSON.stringify({ path }),
  })
  if (!res.ok) {
    throw new Error(`Revalidate failed: ${res.status}`)
  }
}

/**
 * Revalidate several paths in one POST /api/revalidate call ({ paths }).
 * The route caps at 20 paths per request and rejects anything above it,
 * so callers must already cap their lists (the builders below do) and
 * this slices defensively as well. Auth is unchanged: the same
 * admin-token verification as the single-path call.
 */
export async function requestRevalidatePaths(paths: string[]): Promise<void> {
  const unique = [...new Set(paths.filter(Boolean))].slice(0, 20)
  if (unique.length === 0) return
  const res = await fetch('/api/revalidate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
    body: JSON.stringify({ paths: unique }),
  })
  if (!res.ok) {
    throw new Error(`Revalidate failed: ${res.status}`)
  }
}

/**
 * Canonical city slugs an entity appears in, from its primary city,
 * cities[] and (for businesses) branch locations[]. Slug aliases are
 * resolved (e.g. "New York" -> "new-york-city") and non-US / Pakistani
 * entries are dropped — those city pages 404 by design, so there is
 * nothing to revalidate. Single definition: delegates to the shared
 * computeCitySlugs helper (lib/directory-helpers.ts), which doubles as
 * the denormalized citySlugs field for future cursor pagination.
 */
function entityCitySlugs(item: Pick<BusinessItem, 'city' | 'cities' | 'locations'> | Pick<JobItem, 'city' | 'cities'> | Pick<ProfessionalItem, 'city' | 'cities'>): string[] {
  return computeCitySlugs(item)
}

/**
 * Index paths affected by approving a BUSINESS, in priority order:
 * detail page, homepage, business-directory hub, category page, then one
 * city page + one category×city page per city the business lists in.
 * Capped at 20 (the /api/revalidate per-request limit) — a business with
 * many branch cities revalidates its primary cities first; the rest
 * refresh at the next 7-day ISR window. The cap was raised from 10 to 20
 * on 2026-11-08 (round 3): revalidatePath only marks paths stale — the
 * actual regeneration happens on the next visit — so 20 marks cost the
 * approve call nothing measurable, and the call stays fire-and-forget
 * (admin page .catch()es it), so approve latency is unaffected.
 */
export function getBusinessRevalidatePaths(
  biz: Pick<BusinessItem, 'slug' | 'city' | 'cities' | 'locations' | 'categoryId' | 'category' | 'secondaryCategories'>,
): string[] {
  const catId = normalizeBusinessCategoryId(biz)
  const paths = [
    `/business/${biz.slug}`,
    '/',
    '/business-directory',
    `/category/${catId}`,
  ]
  for (const citySlug of entityCitySlugs(biz)) {
    paths.push(`/city/${citySlug}`)
    paths.push(`/category/${catId}/${citySlug}`)
  }
  return [...new Set(paths)].slice(0, 20)
}

/**
 * Index paths affected by approving a JOB: its detail page, the homepage
 * (recent-jobs rail), the /jobs index, and every city page that lists
 * jobs in that city. `detailPath` is the already-computed public job
 * path (getPublicJobPath).
 */
export function getJobRevalidatePaths(
  job: Pick<JobItem, 'city' | 'cities'>,
  detailPath: string,
): string[] {
  const paths = [detailPath, '/', '/jobs']
  for (const citySlug of entityCitySlugs(job)) {
    paths.push(`/city/${citySlug}`)
  }
  return [...new Set(paths)].slice(0, 20)
}

/**
 * Index paths affected by approving a PROFESSIONAL: its detail page, the
 * homepage (recent-professionals rail), the /professionals index, and
 * every city page that lists professionals in that city.
 */
export function getProfessionalRevalidatePaths(
  pro: Pick<ProfessionalItem, 'city' | 'cities'>,
  detailPath: string,
): string[] {
  const paths = [detailPath, '/', '/professionals']
  for (const citySlug of entityCitySlugs(pro)) {
    paths.push(`/city/${citySlug}`)
  }
  return [...new Set(paths)].slice(0, 20)
}

/**
 * Index paths affected by approving a COMPANY: its detail page and the
 * /companies index. (Companies do not render on the homepage or city
 * pages, so there is nothing else to revalidate.)
 */
export function getCompanyRevalidatePaths(
  comp: Pick<CompanyItem, 'slug'>,
): string[] {
  return [`/companies/${comp.slug}`, '/companies']
}
