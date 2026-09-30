import { MetadataRoute } from 'next'
import { CATEGORIES, CITIES, BusinessItem, ProfessionalItem, CompanyItem, JobItem } from '@/lib/data'
import { getAllBusinesses } from '@/lib/db-service'
import { getAllProfessionals } from '@/lib/professional-service'
import { getAllCompanies } from '@/lib/company-service'
import { getAllJobs } from '@/lib/job-service'
import { getPublicJobPath } from '@/lib/job-url'
import { BLOG_POSTS } from '@/lib/blog-data'
import {
  getPopulatedCategoryCityPairs,
  normalizeCitySlug
} from '@/lib/directory-helpers'

export const revalidate = 3600 // Revalidate sitemap XML every hour

function safeDate(input?: string | null, fallback: Date = new Date()): Date {
  if (!input) return fallback
  const d = new Date(input)
  return isNaN(d.getTime()) ? fallback : d
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.biznestusa.com'
  const currentDate = new Date()
  const canonicalUrl = (path: string) => path === '/' ? `${baseUrl}/` : `${baseUrl}/${path.replace(/^\/+|\/+$/g, '')}/`

  // 1. Homepage
  const homepageRoute = {
    url: canonicalUrl('/'),
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 1.0,
  }

  // 2. Core Portal Hubs
  const corePages = [
    '/business-directory',
    '/professional-directory',
    '/categories',
    '/cities',
    '/jobs',
    '/post-job',
    '/companies',
    '/add-company',
    '/professionals',
    '/add-professional',
    '/blog',
    '/add-business',
    '/html-sitemap',
    '/about',
    '/contact',
    '/careers',
    '/advertise-with-us',
    '/faqs',
    '/help-center',
    '/support'
  ].map((route) => ({
    url: canonicalUrl(route),
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // 3. Policy & Trust Pages
  const policyPages = [
    '/privacy',
    '/terms',
    '/cookie-policy',
    '/disclaimer',
    '/editorial-policy',
    '/community-guidelines',
    '/business-listing-guidelines',
    '/verification-policy',
    '/refund-policy',
    '/accessibility',
    '/report-listing',
    '/report-abuse'
  ].map((route) => ({
    url: canonicalUrl(route),
    lastModified: currentDate,
    changeFrequency: 'yearly' as const,
    priority: 0.3,
  }))

  // 4. Industry Categories (All 26)
  const categoryRoutes = CATEGORIES.map((cat) => ({
    url: canonicalUrl(`/category/${cat.id}`),
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  // Fetch approved entities
  let rawBusinesses: BusinessItem[] = []
  try {
    rawBusinesses = await getAllBusinesses(false)
  } catch (err) {
    console.error('Error fetching businesses for sitemap:', err)
  }

  let rawJobs: JobItem[] = []
  try {
    rawJobs = await getAllJobs(false)
  } catch (err) {
    console.error('Error fetching jobs for sitemap:', err)
  }

  let rawProfessionals: ProfessionalItem[] = []
  try {
    rawProfessionals = await getAllProfessionals(false)
  } catch (err) {
    console.error('Error fetching professionals for sitemap:', err)
  }

  let rawCompanies: CompanyItem[] = []
  try {
    rawCompanies = await getAllCompanies(false)
  } catch (err) {
    console.error('Error fetching companies for sitemap:', err)
  }

  // 5. Active Cities (Only index cities that have real businesses, jobs, or professionals)
  const activeCitySlugs = new Set<string>()
  rawBusinesses.forEach(b => {
    if (b.city) activeCitySlugs.add(normalizeCitySlug(b.city))
    if (b.cities) b.cities.forEach(c => activeCitySlugs.add(normalizeCitySlug(c)))
  })
  rawJobs.forEach(j => {
    if (j.city) activeCitySlugs.add(normalizeCitySlug(j.city))
  })
  rawProfessionals.forEach(p => {
    if (p.city) activeCitySlugs.add(normalizeCitySlug(p.city))
  })
  activeCitySlugs.delete('usa')
  activeCitySlugs.delete('united-states')
  activeCitySlugs.delete('remote')

  const cityRoutes = Array.from(activeCitySlugs).map((citySlug) => ({
    url: canonicalUrl(`/city/${citySlug}`),
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  // 6. Populated Category + City Landing Pages (Only combinations with real listings)
  const populatedCategoryCityPairs = getPopulatedCategoryCityPairs(rawBusinesses)
  const categoryCityRoutes = populatedCategoryCityPairs.map((pair) => ({
    url: canonicalUrl(`/category/${pair.categorySlug}/${pair.citySlug}`),
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }))

  // 7. Approved Business Pages
  const approvedBusinesses = rawBusinesses.filter(b => 
    (b.status || 'approved') === 'approved' && 
    Boolean(b.slug && b.slug.trim())
  )
  const businessRoutes = approvedBusinesses.map((biz) => ({
    url: canonicalUrl(`/business/${biz.slug}`),
    lastModified: safeDate(biz.approvedAt || biz.submittedAt, currentDate),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  // 8. Active Approved Job Openings (Excludes expired vacancies)
  const approvedJobs = rawJobs.filter((job) => 
    (job.status || 'approved') === 'approved' && 
    Boolean(job.slug || job.id)
  )
  const jobRoutes = approvedJobs.map((job) => ({
    url: canonicalUrl(getPublicJobPath(job)),
    lastModified: safeDate(job.postedDate || job.postedAt, currentDate),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  // 9. Approved Companies
  const approvedCompanies = rawCompanies.filter((comp) => 
    (comp.status || 'approved') === 'approved' && 
    Boolean(comp.slug && comp.slug.trim())
  )
  const companyRoutes = approvedCompanies.map((comp) => ({
    url: canonicalUrl(`/companies/${comp.slug}`),
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  // 10. Approved Professional Profiles
  const approvedPros = rawProfessionals.filter((pro) => 
    (pro.status || 'approved') === 'approved' && 
    (pro.profileStatus || 'APPROVED') === 'APPROVED' && 
    Boolean(pro.username || pro.slug)
  )
  const professionalRoutes = approvedPros.map((pro) => ({
    url: canonicalUrl(`/professionals/${pro.username || pro.slug}`),
    lastModified: safeDate(pro.approvedAt || pro.submittedAt || pro.verifiedAt, currentDate),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  // 11. Blog Post Pages
  const rawPostsList = Object.values(BLOG_POSTS)
  const blogPostsBySlug = new Map<string, { slug: string; date: string }>()
  for (const post of rawPostsList) {
    if (post && post.slug && !blogPostsBySlug.has(post.slug)) {
      blogPostsBySlug.set(post.slug, post)
    }
  }
  const allBlogPosts = Array.from(blogPostsBySlug.values())
  const blogRoutes = allBlogPosts.map((post) => ({
    url: canonicalUrl(`/blog/${post.slug}`),
    lastModified: safeDate(post.date, currentDate),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Combine all routes
  const allRoutes = [
    homepageRoute,
    ...corePages,
    ...policyPages,
    ...categoryRoutes,
    ...cityRoutes,
    ...categoryCityRoutes,
    ...businessRoutes,
    ...jobRoutes,
    ...companyRoutes,
    ...professionalRoutes,
    ...blogRoutes,
  ]

  // Deduplicate entries by URL to ensure XML validity
  const seenUrls = new Set<string>()
  const deduplicatedRoutes: MetadataRoute.Sitemap = []

  for (const item of allRoutes) {
    if (!seenUrls.has(item.url)) {
      seenUrls.add(item.url)
      deduplicatedRoutes.push(item)
    }
  }

  return deduplicatedRoutes
}
