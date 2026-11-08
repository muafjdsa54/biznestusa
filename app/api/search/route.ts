import { NextRequest, NextResponse } from 'next/server'
import { collection, getDocs, query, where, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { normalizeBusinessDoc } from '@/lib/db-service'
import { normalizeProfessionalDoc } from '@/lib/professional-service'
import { normalizeJobDoc, isExpiredJob } from '@/lib/job-service'
import { MOCK_JOBS, type BusinessItem, type JobItem, type ProfessionalItem } from '@/lib/data'
import { isPakistaniEntity } from '@/lib/directory-helpers'

/**
 * GET /api/search — server-side directory search.
 *
 * The old /search page was 'use client' and downloaded the ENTIRE
 * businesses / jobs / professionals collections into the browser on
 * every visit (getAllBusinesses() etc. with no limit), then filtered
 * in memory. This route moves the query + filtering server-side:
 * each collection is read with where('status', '==', 'approved') +
 * limit(200), the same substring/category/location/verified/rating
 * matching the old client page did is applied here, and only one
 * page of results (default 50) is sent to the client.
 *
 * Firestore has no full-text search, so keyword matching is a
 * substring match over the same fields the client used to check
 * (name, description, category, services/skills, ...). The where()
 * on status + the limit() bound the Firestore read; the in-route
 * filtering keeps the response small and the client download at
 * most 50 items per page.
 *
 * Query params: q, location, category, type (businesses |
 * professionals | jobs), verified (true), minRating (number),
 * page (1-based), pageSize (max 50). The response also carries
 * counts for all three tabs so the client can render tab badges
 * from a single request.
 */

export const dynamic = 'force-dynamic'

const SEARCH_READ_CAP = 500
const DEFAULT_PAGE_SIZE = 50
const MAX_PAGE_SIZE = 50

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

function businessMatches(biz: BusinessItem, q: string, loc: string, cat: string, onlyVerified: boolean, minRating: number): boolean {
  const matchesKeyword = !q ||
    biz.name.toLowerCase().includes(q) ||
    (biz.description || '').toLowerCase().includes(q) ||
    (biz.category || '').toLowerCase().includes(q) ||
    (biz.categoryId || '').toLowerCase().includes(q) ||
    (biz.subCategory || '').toLowerCase().includes(q) ||
    (biz.subcategory || '').toLowerCase().includes(q) ||
    (biz.secondaryCategories && biz.secondaryCategories.some(sc => sc.toLowerCase().includes(q))) ||
    (biz.services && biz.services.some(s => s.toLowerCase().includes(q)))

  const matchesLocation = !loc ||
    (biz.city || '').toLowerCase().includes(loc) ||
    (biz.state || '').toLowerCase().includes(loc) ||
    (biz.province || '').toLowerCase().includes(loc) ||
    (biz.address || '').toLowerCase().includes(loc) ||
    (biz.zipCode || '').toLowerCase().includes(loc) ||
    (biz.cities && biz.cities.some(c => c.toLowerCase().includes(loc))) ||
    (biz.locations && biz.locations.some(l =>
      (l.city || '').toLowerCase().includes(loc) ||
      (l.state || '').toLowerCase().includes(loc) ||
      (l.address || '').toLowerCase().includes(loc)
    ))

  const selNorm = norm(cat)
  const matchesCategory = !cat ||
    norm(biz.category || '').includes(selNorm) ||
    selNorm.includes(norm(biz.category || '')) ||
    norm(biz.categoryId || '').includes(selNorm) ||
    selNorm.includes(norm(biz.categoryId || '')) ||
    norm(biz.subCategory || biz.subcategory || '').includes(selNorm) ||
    (biz.secondaryCategories && biz.secondaryCategories.some(sc => norm(sc).includes(selNorm)))

  return Boolean(matchesKeyword && matchesLocation && matchesCategory &&
    (!onlyVerified || biz.verified) && (biz.rating || 0) >= minRating)
}

function professionalMatches(pro: ProfessionalItem, q: string, loc: string, cat: string, onlyVerified: boolean, minRating: number): boolean {
  const matchesKeyword = !q ||
    (pro.name || '').toLowerCase().includes(q) ||
    (pro.fullName || '').toLowerCase().includes(q) ||
    (pro.title || '').toLowerCase().includes(q) ||
    (pro.profession || '').toLowerCase().includes(q) ||
    (pro.specialization || '').toLowerCase().includes(q) ||
    (pro.bio || '').toLowerCase().includes(q) ||
    (pro.skills && pro.skills.some(s => s.toLowerCase().includes(q)))

  const matchesLocation = !loc ||
    (pro.city || '').toLowerCase().includes(loc) ||
    (pro.state || '').toLowerCase().includes(loc) ||
    (pro.province || '').toLowerCase().includes(loc) ||
    (pro.zipCode || '').toLowerCase().includes(loc) ||
    (pro.cities && pro.cities.some(c => c.toLowerCase().includes(loc)))

  const selNorm = norm(cat)
  const matchesCategory = !cat ||
    norm(pro.category || '').includes(selNorm) ||
    selNorm.includes(norm(pro.category || '')) ||
    norm(pro.profession || '').includes(selNorm) ||
    selNorm.includes(norm(pro.profession || ''))

  return Boolean(matchesKeyword && matchesLocation && matchesCategory &&
    (!onlyVerified || pro.verified) && (pro.rating || 0) >= minRating)
}

function jobMatches(job: JobItem, q: string, loc: string, cat: string, onlyVerified: boolean): boolean {
  const matchesKeyword = !q ||
    (job.title || '').toLowerCase().includes(q) ||
    (job.company || '').toLowerCase().includes(q) ||
    (job.description || '').toLowerCase().includes(q) ||
    (job.category || '').toLowerCase().includes(q) ||
    (job.skills && job.skills.some(s => s.toLowerCase().includes(q)))

  const matchesLocation = !loc ||
    (job.city || '').toLowerCase().includes(loc) ||
    (job.state || '').toLowerCase().includes(loc) ||
    (job.country || '').toLowerCase().includes(loc) ||
    (job.workplaceType || '').toLowerCase().includes(loc) ||
    (job.cities && job.cities.some(c => c.toLowerCase().includes(loc)))

  const selNorm = norm(cat)
  const matchesCategory = !cat ||
    norm(job.category || '').includes(selNorm) ||
    selNorm.includes(norm(job.category || ''))

  return Boolean(matchesKeyword && matchesLocation && matchesCategory &&
    (!onlyVerified || (job.verified ?? true)))
}

async function fetchBusinesses(): Promise<BusinessItem[]> {
  try {
    const snap = await getDocs(query(
      collection(db, 'businesses'),
      where('status', '==', 'approved'),
      limit(SEARCH_READ_CAP)
    ))
    const items: BusinessItem[] = []
    snap.forEach((docSnap) => {
      const raw = docSnap.data()
      // Seed docs with entity_type 'professional' are people, not
      // businesses (mirrors getAllBusinesses in lib/db-service.ts).
      if (raw.entity_type === 'professional') return
      const item = normalizeBusinessDoc(docSnap.id, raw)
      if (!isPakistaniEntity(item)) items.push(item)
    })
    return items.filter(b => b.status === 'approved')
  } catch (err) {
    console.warn('Firestore /api/search businesses fallback:', err)
    return []
  }
}

async function fetchProfessionals(): Promise<ProfessionalItem[]> {
  try {
    const snap = await getDocs(query(
      collection(db, 'professionals'),
      where('status', '==', 'approved'),
      limit(SEARCH_READ_CAP)
    ))
    const items: ProfessionalItem[] = []
    snap.forEach((docSnap) => {
      const item = normalizeProfessionalDoc(docSnap.id, docSnap.data())
      if (!isPakistaniEntity(item)) items.push(item)
    })
    // Public filter mirrors getAllProfessionals: approved status AND
    // APPROVED profile status.
    return items.filter(p => (p.status || 'pending') === 'approved' && (p.profileStatus || 'PENDING') === 'APPROVED')
  } catch (err) {
    console.warn('Firestore /api/search professionals fallback:', err)
    return []
  }
}

async function fetchJobs(): Promise<JobItem[]> {
  const fromFirestore: JobItem[] = []
  try {
    const snap = await getDocs(query(
      collection(db, 'jobs'),
      where('status', '==', 'approved'),
      limit(SEARCH_READ_CAP)
    ))
    snap.forEach((docSnap) => {
      const item = normalizeJobDoc(docSnap.id, docSnap.data())
      if (!isPakistaniEntity(item) && !isExpiredJob(item)) fromFirestore.push(item)
    })
  } catch (err) {
    console.warn('Firestore /api/search jobs fallback:', err)
  }
  // Jobs are seeded in-memory (MOCK_JOBS in lib/data.ts); merge them
  // the same way getAllJobs does, Firestore first, dedup by id.
  const ids = new Set(fromFirestore.map(j => j.id))
  const merged = [
    ...fromFirestore,
    ...MOCK_JOBS.filter(j => !ids.has(j.id) && !isPakistaniEntity(j) && !isExpiredJob(j)),
  ]
  return merged.filter(j => (j.status || 'pending') === 'approved')
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const q = (params.get('q') || '').toLowerCase().trim()
  const location = (params.get('location') || '').toLowerCase().trim()
  const category = params.get('category') || ''
  const type = params.get('type') || 'businesses'
  const onlyVerified = params.get('verified') === 'true'
  const minRating = Number(params.get('minRating') || 0) || 0
  const page = Math.max(1, Number(params.get('page') || 1) || 1)
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(params.get('pageSize') || DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE))

  const [businesses, professionals, jobs] = await Promise.all([
    fetchBusinesses(),
    fetchProfessionals(),
    fetchJobs(),
  ])

  const filteredBusinesses = businesses.filter(b => businessMatches(b, q, location, category, onlyVerified, minRating))
  const filteredProfessionals = professionals.filter(p => professionalMatches(p, q, location, category, onlyVerified, minRating))
  const filteredJobs = jobs.filter(j => jobMatches(j, q, location, category, onlyVerified))

  const active = type === 'professionals' ? filteredProfessionals : type === 'jobs' ? filteredJobs : filteredBusinesses
  const total = active.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, totalPages)
  const results = active.slice((safePage - 1) * pageSize, safePage * pageSize)

  return NextResponse.json({
    type: type === 'professionals' || type === 'jobs' ? type : 'businesses',
    page: safePage,
    pageSize,
    total,
    totalPages,
    results,
    counts: {
      businesses: filteredBusinesses.length,
      professionals: filteredProfessionals.length,
      jobs: filteredJobs.length,
    },
  })
}
