'use client'

import Link from 'next/link'
import { LIST_PAGE_SIZE, pageHref } from '@/lib/pagination'

interface PaginationNavProps {
  /** Base path without any ?page= query, e.g. `/city/new-york-city`. */
  basePath: string
  page: number
  totalPages: number
  total: number
  pageSize?: number
  /**
   * When provided, Prev/Next are buttons that call this instead of
   * navigating: the parent fetches the slice from /api/listings and
   * updates the URL with replaceState. Used by the static index pages
   * (page 1 is prerendered HTML; pages 2+ are client-rendered and not
   * indexed). When omitted, plain Links are rendered as before.
   */
  onPageChange?: (page: number) => void
  /** True while a client page fetch is in flight. */
  loading?: boolean
}

/**
 * Prev/Next navigation for the paginated directory index pages.
 * Renders nothing when there is a single page. Page 1 links back to
 * the clean base path.
 */
export default function PaginationNav({
  basePath,
  page,
  totalPages,
  total,
  pageSize = LIST_PAGE_SIZE,
  onPageChange,
  loading = false,
}: PaginationNavProps) {
  if (totalPages <= 1) return null

  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  const prevClass =
    'px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors disabled:opacity-50'
  const nextClass =
    'px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors disabled:opacity-50'
  const disabledClass =
    'px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-400'

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2"
    >
      <p className="text-xs text-slate-500">
        Showing {start}–{end} of {total} listings · Page {page} of {totalPages}
        {loading ? ' · Loading…' : ''}
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          onPageChange ? (
            <button type="button" disabled={loading} onClick={() => onPageChange(page - 1)} className={prevClass}>
              ← Previous
            </button>
          ) : (
            <Link href={pageHref(basePath, page - 1)} rel="prev" className={prevClass}>
              ← Previous
            </Link>
          )
        ) : (
          <span aria-disabled="true" className={disabledClass}>
            ← Previous
          </span>
        )}
        {page < totalPages ? (
          onPageChange ? (
            <button type="button" disabled={loading} onClick={() => onPageChange(page + 1)} className={nextClass}>
              Next →
            </button>
          ) : (
            <Link href={pageHref(basePath, page + 1)} rel="next" className={nextClass}>
              Next →
            </Link>
          )
        ) : (
          <span aria-disabled="true" className={disabledClass}>
            Next →
          </span>
        )}
      </div>
    </nav>
  )
}
