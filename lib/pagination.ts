// Shared list pagination for the directory index pages (city, category,
// category×city). The Firestore read behind these pages is bounded
// (getAllBusinesses caps it with limit()), but city/category matching is
// in-memory and fuzzy — slug aliases, the cities[]/locations[] arrays,
// text-inferred categories — so a Firestore where()+startAfter cursor
// cannot express the filter. Pages therefore slice the bounded,
// already-filtered array here (?page=N) instead of pretending a
// server-side cursor page is the filtered set.

export const LIST_PAGE_SIZE = 24

/** Parse ?page= from searchParams: 1-based, defaults to 1, never < 1. */
export function parsePageParam(raw: string | string[] | undefined): number {
  const n = typeof raw === 'string' ? parseInt(raw, 10) : NaN
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1
}

export interface PageSlice<T> {
  pageItems: T[]
  /** The page actually rendered (clamped into range). */
  page: number
  totalPages: number
  total: number
  hasPrev: boolean
  hasNext: boolean
}

export function paginate<T>(
  items: readonly T[],
  page: number,
  pageSize: number = LIST_PAGE_SIZE,
): PageSlice<T> {
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * pageSize
  return {
    pageItems: items.slice(start, start + pageSize),
    page: safePage,
    totalPages,
    total,
    hasPrev: safePage > 1,
    hasNext: safePage < totalPages,
  }
}

/** Page 1 links to the clean base path (no ?page=1); later pages get ?page=N. */
export function pageHref(basePath: string, page: number): string {
  return page <= 1 ? basePath : `${basePath}?page=${page}`
}
