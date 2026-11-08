// Shared client pagination state for the directory index pages.
//
// The pages are static (page 1 server-rendered). This hook owns pages 2+:
// it fetches /api/listings on page change, swaps the list in place, and
// updates the URL with history.replaceState (?page=N, clean path for
// page 1) — no full reload, no server render, no searchParams in the
// page component. On mount it also honours a direct ?page=N landing
// (shared/bookmarked link): the static HTML is page 1, so the hook
// fetches the requested slice immediately instead of showing page 1.
//
// Pages 2+ are client-rendered only and are NOT indexed — only the
// static page-1 HTML is indexable (see lib/listings-api.ts).

import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchListingsPage, type ListingsQuery, type PublicBusinessItem } from '@/lib/listings-api'
import { pageHref, parsePageParam } from '@/lib/pagination'

export interface UsePaginatedListingsOptions {
  basePath: string
  /** Query without the page — kind + city/category/subcategory slugs. */
  query: Omit<ListingsQuery, 'page'>
  initialItems: PublicBusinessItem[]
  total: number
  totalPages: number
}

export function usePaginatedListings({
  basePath,
  query,
  initialItems,
  total: initialTotal,
  totalPages: initialTotalPages,
}: UsePaginatedListingsOptions) {
  const [items, setItems] = useState<PublicBusinessItem[]>(initialItems)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(initialTotal)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const inFlightRef = useRef(false)
  const mountedRef = useRef(false)

  const loadPage = useCallback(
    async (targetPage: number, opts?: { scroll?: boolean }) => {
      if (inFlightRef.current) return
      if (targetPage < 1 || targetPage > totalPages) return
      if (targetPage === page && items.length > 0) return
      inFlightRef.current = true
      setLoading(true)
      setError(null)
      try {
        const res = await fetchListingsPage({ ...query, page: targetPage })
        setItems(res.items)
        setPage(res.page)
        setTotal(res.total)
        setTotalPages(res.totalPages)
        window.history.replaceState(null, '', pageHref(basePath, res.page))
        if (opts?.scroll) listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } catch {
        // Keep the current slice visible; the user can retry the nav.
        setError('Could not load this page. Please try again.')
      } finally {
        setLoading(false)
        inFlightRef.current = false
      }
    },
    [basePath, items.length, page, query, totalPages],
  )

  // Direct ?page=N landing: static HTML is always page 1, so fetch the
  // requested slice on mount (StrictMode-safe via mountedRef).
  useEffect(() => {
    if (mountedRef.current) return
    mountedRef.current = true
    const requested = parsePageParam(
      new URLSearchParams(window.location.search).get('page') ?? undefined,
    )
    if (requested > 1 && requested <= initialTotalPages) {
      void loadPage(requested)
    }
    // Intentionally once-on-mount; loadPage is stable enough via its deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const goToPage = useCallback(
    (targetPage: number) => {
      void loadPage(targetPage, { scroll: true })
    },
    [loadPage],
  )

  return { items, page, total, totalPages, loading, error, goToPage, listRef }
}
