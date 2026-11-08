'use client'

import { useMemo } from 'react'
import CityListingsGrid from '@/components/city-listings-grid'
import PaginationNav from '@/components/pagination-nav'
import { usePaginatedListings } from '@/hooks/use-paginated-listings'
import type { PublicBusinessItem } from '@/lib/listings-api'

interface CityListingsPaginatedProps {
  citySlug: string
  initialItems: PublicBusinessItem[]
  total: number
  totalPages: number
}

/**
 * Client pagination for a city page. Page 1 arrives as static
 * server HTML (initialItems); pages 2+ come from /api/listings
 * (kind=city) with no full reload. The URL is updated with
 * replaceState (?page=N; clean path for page 1). Paginated views
 * are client-rendered and not indexed.
 */
export default function CityListingsPaginated({
  citySlug,
  initialItems,
  total,
  totalPages,
}: CityListingsPaginatedProps) {
  const query = useMemo(() => ({ kind: 'city' as const, city: citySlug }), [citySlug])
  const { items, page, total: liveTotal, totalPages: liveTotalPages, loading, error, goToPage, listRef } =
    usePaginatedListings({
      basePath: `/city/${citySlug}`,
      query,
      initialItems,
      total,
      totalPages,
    })

  return (
    <div ref={listRef}>
      <CityListingsGrid businesses={items} />
      {error && (
        <p role="alert" className="text-xs text-red-600 pt-2">
          {error}
        </p>
      )}
      <PaginationNav
        basePath={`/city/${citySlug}`}
        page={page}
        totalPages={liveTotalPages}
        total={liveTotal}
        onPageChange={goToPage}
        loading={loading}
      />
    </div>
  )
}
