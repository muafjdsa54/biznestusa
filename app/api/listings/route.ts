import { NextRequest, NextResponse } from 'next/server'
import { getAllBusinesses } from '@/lib/db-service'
import {
  filterBusinessesByCategory,
  filterBusinessesByCategoryAndCity,
  filterBusinessesByCategoryAndSubcategory,
  filterBusinessesByCity,
  getSubcategoryDefinition,
} from '@/lib/directory-helpers'
import { LIST_PAGE_SIZE, parsePageParam } from '@/lib/pagination'
import { paginatePublic, type ListingsKind } from '@/lib/listings-api'

/**
 * GET /api/listings — token-free public page of directory listings.
 *
 * Serves pages 2+ of the city / category / category×city / subcategory
 * index pages, which are statically prerendered with page 1 only (the
 * page components must NOT read searchParams — that forced them dynamic
 * and killed prerendering). The client pagination wrappers fetch this
 * route on page change instead of a full reload.
 *
 * Query params: kind=city|category|category-city|subcategory (required),
 * city, category, subcategory, page (1-based, default 1).
 *
 * BOUNDED READ — same as the pages: getAllBusinesses(false) reads
 * Firestore with where('status', '==', 'approved') + limit(500) and
 * skips docs with entity_type === 'professional' (see lib/db-service.ts);
 * the city/category matching is the same in-memory filtering the pages
 * use, then only 24 public-projected items + the total are returned.
 * No auth token is needed: the response contains approved public
 * listings only (toPublicBusiness strips owner email, userId, payment
 * fields, etc.). Pages 2+ fetched here are client-rendered and not
 * indexed; only the static page-1 HTML is indexable.
 */

export const dynamic = 'force-dynamic'

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/
const KINDS: ListingsKind[] = ['city', 'category', 'category-city', 'subcategory']

function cleanSlug(raw: string | null): string {
  return (raw || '').trim().toLowerCase()
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const kind = cleanSlug(params.get('kind')) as ListingsKind
  const city = cleanSlug(params.get('city'))
  const category = cleanSlug(params.get('category'))
  const subcategory = cleanSlug(params.get('subcategory'))
  const page = parsePageParam(params.get('page') ?? undefined)

  if (!KINDS.includes(kind)) {
    return NextResponse.json({ error: 'Invalid kind. Expected city, category, category-city or subcategory.' }, { status: 400 })
  }
  const required: Record<ListingsKind, string[]> = {
    city: [city],
    category: [category],
    'category-city': [category, city],
    subcategory: [category, subcategory],
  }
  if (required[kind].some((v) => !v || v.length > 80 || !SLUG_RE.test(v))) {
    return NextResponse.json({ error: 'Missing or invalid slug parameter for this kind.' }, { status: 400 })
  }
  // A subcategory slug that is not a real subcategory of the category
  // can never match anything — return an empty page, not an error, so
  // the client wrapper degrades to the empty state instead of crashing.
  if (kind === 'subcategory' && !getSubcategoryDefinition(category, subcategory)) {
    return NextResponse.json(
      { kind, page: 1, pageSize: LIST_PAGE_SIZE, total: 0, totalPages: 1, items: [] },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } },
    )
  }

  const allApproved = await getAllBusinesses(false)

  const filtered =
    kind === 'city'
      ? filterBusinessesByCity(allApproved, city)
      : kind === 'category'
        ? filterBusinessesByCategory(allApproved, category)
        : kind === 'category-city'
          ? filterBusinessesByCategoryAndCity(allApproved, category, city)
          : filterBusinessesByCategoryAndSubcategory(allApproved, category, subcategory)

  const slice = paginatePublic(filtered, page)
  const body = {
    kind,
    page: slice.page,
    pageSize: LIST_PAGE_SIZE,
    total: slice.total,
    totalPages: slice.totalPages,
    items: slice.pageItems,
  }

  return NextResponse.json(body, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  })
}
