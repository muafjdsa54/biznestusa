// Shared contract for the paginated directory listings API
// (GET /api/listings) and the client pagination wrappers.
//
// WHY THIS EXISTS — the round-2 pagination work read `searchParams`
// (?page=) inside the city / category / category×city page components,
// which forced those routes dynamic (ƒ) and killed static prerendering
// (302 → 218 prerendered .html, city pages 59 → 0). The fix:
//   * the page component is static again and server-renders page 1 only;
//   * pages 2+ are fetched client-side from /api/listings (no full reload,
//     URL updated with history.replaceState);
//   * ?page=2+ views are therefore client-rendered only — they are NOT
//     indexed (the static page-1 HTML is the only indexable version;
//     generateMetadata on these pages no longer varies by ?page=).
//
// PUBLIC PROJECTION — the API and the client wrappers must never receive
// a full BusinessItem: it carries owner email, userId, payment fields,
// etc. Only the fields the listing views actually render are projected
// here, so neither the API JSON nor the RSC flight payload can leak
// owner-private data. Keep this list in sync with what
// CategoryListingsView and CityListingsGrid render; add a field here
// only if a view renders it.

import type { BusinessItem } from '@/lib/data'
import { LIST_PAGE_SIZE, paginate, parsePageParam } from '@/lib/pagination'

export type ListingsKind = 'city' | 'category' | 'category-city' | 'subcategory'

export interface ListingsQuery {
  kind: ListingsKind
  /** City slug (kind 'city'), or the city half of 'category-city'. */
  city?: string
  /** Category slug (kinds 'category', 'category-city', 'subcategory'). */
  category?: string
  /** Subcategory slug (kind 'subcategory' only). */
  subcategory?: string
  page?: number
}

export interface PublicBusinessItem {
  id: string
  slug: string
  name: string
  category: string
  categoryId: string
  subCategory?: string
  subcategory?: string
  subcategory_slug?: string
  city: string
  state?: string
  state_code?: string | null
  province?: string
  address: string
  phone: string
  website: string
  googleBusinessProfile?: string
  description: string
  rating: number
  reviewCount: number
  verified: boolean
  isClaimed: boolean
  isFeatured?: boolean
  status?: 'pending' | 'approved' | 'rejected' | 'needs_changes'
  plan?: BusinessItem['plan']
  planName?: string
  hasSinglePage?: boolean
  source_type?: string
  ownership_status?: string
  coverImage: string
  logo: string
  operatingHours: { [key: string]: string }
  hours?: string | Record<string, string> | null
}

export function toPublicBusiness(biz: BusinessItem): PublicBusinessItem {
  return {
    id: biz.id,
    slug: biz.slug,
    name: biz.name,
    category: biz.category,
    categoryId: biz.categoryId,
    subCategory: biz.subCategory,
    subcategory: biz.subcategory,
    subcategory_slug: biz.subcategory_slug,
    city: biz.city,
    state: biz.state,
    state_code: biz.state_code,
    province: biz.province,
    address: biz.address,
    phone: biz.phone,
    website: biz.website,
    googleBusinessProfile: biz.googleBusinessProfile,
    description: biz.description,
    rating: biz.rating,
    reviewCount: biz.reviewCount,
    verified: biz.verified,
    isClaimed: biz.isClaimed,
    isFeatured: biz.isFeatured,
    status: biz.status,
    plan: biz.plan,
    planName: biz.planName,
    hasSinglePage: biz.hasSinglePage,
    source_type: biz.source_type,
    ownership_status: biz.ownership_status,
    coverImage: biz.coverImage,
    logo: biz.logo,
    operatingHours: biz.operatingHours,
    hours: biz.hours,
  }
}

export interface ListingsPageResponse {
  kind: ListingsKind
  page: number
  pageSize: number
  total: number
  totalPages: number
  items: PublicBusinessItem[]
}

/** Slice a filtered list the same way the static page-1 render does. */
export function paginatePublic(
  items: readonly BusinessItem[],
  page: number,
): { pageItems: PublicBusinessItem[]; page: number; totalPages: number; total: number } {
  const slice = paginate(items, page, LIST_PAGE_SIZE)
  return {
    pageItems: slice.pageItems.map(toPublicBusiness),
    page: slice.page,
    totalPages: slice.totalPages,
    total: slice.total,
  }
}

export function buildListingsUrl(query: ListingsQuery): string {
  const params = new URLSearchParams()
  params.set('kind', query.kind)
  if (query.city) params.set('city', query.city)
  if (query.category) params.set('category', query.category)
  if (query.subcategory) params.set('subcategory', query.subcategory)
  params.set('page', String(parsePageParam(String(query.page ?? 1))))
  return `/api/listings?${params.toString()}`
}

export async function fetchListingsPage(query: ListingsQuery): Promise<ListingsPageResponse> {
  const res = await fetch(buildListingsUrl(query), { credentials: 'same-origin' })
  if (!res.ok) throw new Error(`Listings request failed (${res.status})`)
  return (await res.json()) as ListingsPageResponse
}
