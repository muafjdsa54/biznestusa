'use client'

import { useMemo } from 'react'
import CategoryListingsView from '@/components/business/category-listings-view'
import PaginationNav from '@/components/pagination-nav'
import { usePaginatedListings } from '@/hooks/use-paginated-listings'
import type { ListingsKind, PublicBusinessItem } from '@/lib/listings-api'

interface CategoryListingsPaginatedProps {
  kind: Exclude<ListingsKind, 'city'>
  basePath: string
  categorySlug: string
  citySlug?: string
  subcategorySlug?: string
  initialItems: PublicBusinessItem[]
  total: number
  totalPages: number
  categoryName?: string
  cityName?: string
  subCategoryTitle?: string
}

/**
 * Client pagination for the category / category×city / subcategory
 * pages. Page 1 arrives as static server HTML (initialItems); pages
 * 2+ come from /api/listings with no full reload. The URL is updated
 * with replaceState (?page=N; clean path for page 1). Paginated views
 * are client-rendered and not indexed.
 */
export default function CategoryListingsPaginated({
  kind,
  basePath,
  categorySlug,
  citySlug,
  subcategorySlug,
  initialItems,
  total,
  totalPages,
  categoryName,
  cityName,
  subCategoryTitle,
}: CategoryListingsPaginatedProps) {
  const query = useMemo(
    () => ({ kind, category: categorySlug, city: citySlug, subcategory: subcategorySlug }),
    [kind, categorySlug, citySlug, subcategorySlug],
  )
  const { items, page, total: liveTotal, totalPages: liveTotalPages, loading, error, goToPage, listRef } =
    usePaginatedListings({
      basePath,
      query,
      initialItems,
      total,
      totalPages,
    })

  return (
    <div ref={listRef}>
      <CategoryListingsView
        businesses={items}
        categoryName={categoryName}
        cityName={cityName}
        subCategoryTitle={subCategoryTitle}
        totalCount={liveTotal}
      />
      {error && (
        <p role="alert" className="text-xs text-red-600 pt-2">
          {error}
        </p>
      )}
      <PaginationNav
        basePath={basePath}
        page={page}
        totalPages={liveTotalPages}
        total={liveTotal}
        onPageChange={goToPage}
        loading={loading}
      />
    </div>
  )
}
