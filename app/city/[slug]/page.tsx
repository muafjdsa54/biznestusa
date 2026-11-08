import React from 'react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { CITIES } from '@/lib/data'
import { getAllJobs } from '@/lib/job-service'
import { getPublicJobPath } from '@/lib/job-url'
import { getAllBusinesses } from '@/lib/db-service'
import { getAllProfessionals } from '@/lib/professional-service'
import Link from 'next/link'
import Image from 'next/image'
import {
  MapPin,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Building2,
  Briefcase,
  Users,
  HelpCircle,
  DollarSign,
  FileText,
  BadgeCheck
} from 'lucide-react'
import { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { BreadcrumbSchema } from '@/components/seo/breadcrumb-schema'
import CityListingsPaginated from '@/components/city-listings-paginated'
import { paginate } from '@/lib/pagination'
import { toPublicBusiness } from '@/lib/listings-api'
import { getCitySeoCopy } from '@/lib/seo-directory-content'
import {
  filterBusinessesByCity,
  getCategoriesWithListingsForCity,
  getCityDisplayName,
  normalizeCitySlug,
  toCanonicalUrl,
  VERIFICATION_DISCLAIMER,
  isUsCity,
  isPakistaniCity
} from '@/lib/directory-helpers'

export const revalidate = 604800 // 7-day ISR revalidation
export const dynamicParams = true

export async function generateStaticParams() {
  const allBiz = await getAllBusinesses(false)
  const allJobs = await getAllJobs(false)
  const allPros = await getAllProfessionals(false)

  const activeCitySlugs = new Set<string>()
  allBiz.forEach(b => {
    if (b.city && isUsCity(b.city) && !isPakistaniCity(b.city)) activeCitySlugs.add(normalizeCitySlug(b.city))
    if (b.cities) b.cities.forEach(c => {
      if (isUsCity(c) && !isPakistaniCity(c)) activeCitySlugs.add(normalizeCitySlug(c))
    })
  })
  allJobs.forEach(j => {
    if (j.city && isUsCity(j.city) && !isPakistaniCity(j.city)) activeCitySlugs.add(normalizeCitySlug(j.city))
  })
  allPros.forEach(p => {
    if (p.city && isUsCity(p.city) && !isPakistaniCity(p.city)) activeCitySlugs.add(normalizeCitySlug(p.city))
  })

  activeCitySlugs.delete('usa')
  activeCitySlugs.delete('united-states')
  activeCitySlugs.delete('nationwide')
  activeCitySlugs.delete('remote')

  return Array.from(activeCitySlugs).map((slug) => ({ slug }))
}

function formatCityTitle(cityName: string): string {
  const candidates = [
    `Local Businesses, Jobs & Professionals in ${cityName} | BizNestUSA`,
    `Find Businesses, Jobs & Pros in ${cityName}, USA | BizNestUSA`,
    `Find Local Businesses in ${cityName}, USA | BizNestUSA`,
    `Local Businesses & Services in ${cityName} | BizNestUSA`,
    `Explore Businesses in ${cityName}, USA | BizNestUSA`,
    `${cityName}, USA Business Directory | BizNestUSA`,
    `Businesses, Jobs & Pros in ${cityName}, USA | BizNestUSA`,
    `Businesses in ${cityName}, USA | BizNestUSA`
  ]

  for (const c of candidates) {
    if (c.length >= 50 && c.length <= 60) return c
  }

  for (const c of candidates) {
    if (c.length > 60) {
      const trimmed = `Businesses in ${cityName}, USA`.slice(0, 46).trim() + ' | BizNestUSA'
      if (trimmed.length >= 50 && trimmed.length <= 60) return trimmed
    }
  }

  const padded = `${cityName} Business Directory | BizNestUSA`
  if (padded.length >= 50 && padded.length <= 60) return padded

  return `Businesses in ${cityName}, USA | BizNestUSA`.slice(0, 60)
}

function formatCityDescription(cityName: string): string {
  const templates = [
    `Find businesses, jobs, and professionals in ${cityName}, USA. Browse local listings by category, with contact details, on BizNestUSA — free to search.`,
    `Explore local businesses in ${cityName}, USA — services, shops, jobs, and professionals. Search by category on BizNestUSA.`,
    `Businesses in ${cityName}, USA: browse local companies, open jobs, and professionals by category on BizNestUSA — free to search.`
  ]

  for (const t of templates) {
    if (t.length >= 140 && t.length <= 160) return t
  }

  for (const t of templates) {
    if (t.length > 160) {
      const trimmed = t.slice(0, 156)
      const lastSpace = trimmed.lastIndexOf(' ')
      return trimmed.slice(0, lastSpace) + '...'
    }
  }

  return templates[0]
}

// Static page: NO searchParams here. Reading ?page= in this file made
// the route dynamic (ƒ) and killed prerendering. Page 1 is the only
// server-rendered slice; pages 2+ are fetched client-side from
// /api/listings by CityListingsPaginated and are not indexed.
export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params
  const citySlug = params.slug.toLowerCase()

  if (isPakistaniCity(citySlug) || !isUsCity(citySlug)) {
    return {
      title: 'City Not Found | BizNestUSA',
      robots: { index: false, follow: false }
    }
  }

  const cityName = getCityDisplayName(citySlug)
  // Alias-aware: jobs/pros compare their alias-normalized city against the
  // canonical slug (see filterBusinessesByCity) — 'new-york' must resolve
  // to 'new-york-city' here too, or aliased city pages show no jobs/pros.
  const normCitySlug = normalizeCitySlug(citySlug)

  const allApproved = await getAllBusinesses(false)
  const cityBusinesses = filterBusinessesByCity(allApproved, citySlug)

  const allJobs = await getAllJobs(false)
  const cityJobs = allJobs.filter(
    (job) => normalizeCitySlug(job.city) === normCitySlug || job.cities?.some(c => normalizeCitySlug(c) === normCitySlug)
  )

  const allPros = await getAllProfessionals(false)
  const cityPros = allPros.filter(p => normalizeCitySlug(p.city) === normCitySlug)

  const hasData = cityBusinesses.length > 0 || cityJobs.length > 0 || cityPros.length > 0

  const title = formatCityTitle(cityName)
  const description = formatCityDescription(cityName)
  const canonicalUrl = toCanonicalUrl(`city/${normCitySlug}`)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'BizNestUSA',
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: { canonical: canonicalUrl },
    robots: {
      index: hasData,
      follow: true,
    },
  }
}

export default async function CityDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params
  const citySlug = params.slug.toLowerCase()

  if (isPakistaniCity(citySlug) || !isUsCity(citySlug)) {
    notFound()
  }

  const cityName = getCityDisplayName(citySlug)
  // Alias slugs 301 to the canonical city URL (e.g. /city/new-york/ →
  // /city/new-york-city/) so aliased and canonical URLs never serve the
  // same content under two URLs. The canonical slug is what the sitemap
  // lists and what generateStaticParams emits.
  const normCitySlug = normalizeCitySlug(citySlug)
  if (normCitySlug !== citySlug) {
    permanentRedirect(`/city/${normCitySlug}/`)
  }

  const allApproved = await getAllBusinesses(false)
  const cityBusinesses = filterBusinessesByCity(allApproved, citySlug)
  // Static page 1 only (24 items): counts and headings use the full
  // filtered total; pages 2+ are fetched client-side from /api/listings.
  const bizPage = paginate(cityBusinesses, 1)

  const allJobs = await getAllJobs(false)
  const cityJobs = allJobs.filter(
    (job) => normalizeCitySlug(job.city) === normCitySlug || job.cities?.some(c => normalizeCitySlug(c) === normCitySlug)
  )

  const allPros = await getAllProfessionals(false)
  const cityPros = allPros.filter(p => normalizeCitySlug(p.city) === normCitySlug)

  const activeCategories = getCategoriesWithListingsForCity(allApproved, citySlug)
  const seoCopy = getCitySeoCopy(citySlug)
  const currentPath = `city/${normCitySlug}`
  const canonicalUrl = toCanonicalUrl(currentPath)

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Businesses in ${cityName}, USA`,
    description: `Explore businesses, services, jobs and professionals in ${cityName}, USA.`,
    url: canonicalUrl,
    isPartOf: { '@type': 'WebSite', name: 'BizNestUSA', url: 'https://www.biznestusa.com/' },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: bizPage.pageItems.map((biz, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: biz.name,
        url: toCanonicalUrl(`business/${biz.slug}`)
      }))
    }
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.biznestusa.com/'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Locations',
        item: 'https://www.biznestusa.com/cities/'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: cityName,
        item: canonicalUrl
      }
    ]
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar />
      <BreadcrumbSchema pathname={`/${currentPath}`} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([collectionSchema, breadcrumbSchema]) }}
      />

      <section className="bg-white text-slate-900 py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-3">
          <nav aria-label="Breadcrumb" className="text-xs text-slate-500 flex items-center flex-wrap gap-1.5">
            <Link href="/" className="hover:text-blue-600 underline">Home</Link>
            <span>/</span>
            <Link href="/cities" className="hover:text-blue-600 underline">Locations</Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">{cityName}</span>
          </nav>
          
          <Link href="/cities" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All US Locations</span>
          </Link>

          <div className="flex items-center gap-3.5 pt-1">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Businesses in {cityName}, USA
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                Explore local companies, services, active job vacancies, and professionals based in {cityName}.
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">
        
        {/* Verification Trust Callout */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Directory Trust Notice:</strong> {VERIFICATION_DISCLAIMER}
          </p>
        </div>

        {seoCopy && (
          <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <p className="text-sm text-slate-700 leading-relaxed">{seoCopy.intro}</p>
            <p className="text-xs text-slate-600 leading-relaxed">{seoCopy.guidance}</p>
            <nav aria-label="Related BizNest USA guides" className="flex flex-wrap gap-2">
              {seoCopy.links.map((link) => (
                <Link key={link.href} href={link.href} className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100">
                  {link.label}
                </Link>
              ))}
            </nav>
          </section>
        )}

        {/* Popular Categories in this City */}
        {activeCategories.length > 0 && (
          <section className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Popular Categories in {cityName}</span>
              </h2>
              <span className="text-xs text-slate-500">{activeCategories.length} Active Categories</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {activeCategories.map((cat) => (
                <Link
                  key={cat.categorySlug}
                  href={`/category/${cat.categorySlug}/${citySlug}`}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all flex items-center justify-between text-xs font-bold text-slate-800"
                >
                  <span>{cat.categoryName}</span>
                  <span className="text-[11px] text-slate-400 bg-white px-2 py-0.5 rounded-md border">
                    {cat.count}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
        
        {/* City Businesses */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>Businesses in {cityName} ({cityBusinesses.length})</span>
            </h2>
            <Link href={`/search?city=${encodeURIComponent(cityName)}`} className="text-xs font-bold text-blue-600 hover:underline">
              Advanced Search in {cityName} &rarr;
            </Link>
          </div>

          {cityBusinesses.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-3">
              <p className="text-slate-600 text-sm">No businesses are listed in {cityName} yet — listings appear here as businesses in {cityName} join BizNestUSA.</p>
              <p className="text-slate-400 text-xs">Run a business in {cityName}? List it from $1 — Basic $1 is submit-only, Standard $5 adds editing and 5 posts, Authoritative $10 adds a gallery, 10 posts, and featured placement.</p>
              <Link href="/add-business" className="inline-block mt-2 px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-xl">
                Add Your {cityName} Business · From $1
              </Link>
            </div>
          ) : (
            <CityListingsPaginated
              citySlug={citySlug}
              initialItems={bizPage.pageItems.map(toPublicBusiness)}
              total={bizPage.total}
              totalPages={bizPage.totalPages}
            />
          )}
        </div>

        {/* City Jobs (If any exist in this city) */}
        {cityJobs.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-600" />
              <span>Jobs in {cityName} ({cityJobs.length})</span>
            </h2>
            <div className="space-y-3">
              {cityJobs.map((job) => (
                <div key={job.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div>
                    <Link href={getPublicJobPath(job)} className="font-bold text-slate-900 text-base hover:text-blue-600 transition-colors">
                      {job.title}
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5">{job.company} • {job.salary} • {job.type}</p>
                  </div>
                  <Link
                    href={getPublicJobPath(job)}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 self-start sm:self-auto"
                  >
                    <span>View Vacancy</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* City Professionals (If any exist in this city) */}
        {cityPros.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>Professionals in {cityName} ({cityPros.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cityPros.map((pro) => (
                <div key={pro.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image
                      src={pro.avatar}
                      alt={pro.name}
                      width={44}
                      height={44}
                      className="w-11 h-11 rounded-full object-cover border border-slate-100"
                    />
                    <div>
                      <Link
                        href={`/professionals/${pro.username || pro.slug}`}
                        className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors flex items-center gap-1"
                      >
                        <span>{pro.name}</span>
                        {pro.verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />}
                      </Link>
                      <p className="text-xs text-slate-500">{pro.profession}</p>
                    </div>
                  </div>
                  <Link
                    href={`/professionals/${pro.username || pro.slug}`}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <span>Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Local Economic & Business Ecosystem Overview */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 inline-block">
              City Business Ecosystem
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Business Directory &amp; Local Guide for {cityName}, USA
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              This page lists the businesses, jobs, and professionals in {cityName} that are on BizNestUSA, grouped by category above. Use the listings to find a local provider, compare what each business offers, and contact it directly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <BadgeCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Local Licensing Boards</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Where a license applies to the work, ask for the number and check it with the state or city office that issued it. A listing on BizNestUSA is not proof of a license.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Permits &amp; Local Rules</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Some work needs a city permit before it starts — building work, for example. Ask the provider whether a permit applies to your job and who is responsible for pulling it.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Transparent Pricing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Compare multiple written bids from {cityName} service providers. Clear contracts protect consumers by specifying labor rates, equipment costs, warranty periods, and payment milestones.
              </p>
            </div>
          </div>
        </section>

        {/* Local FAQ Section */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Frequently Asked Questions about {cityName} Businesses
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Guidance for consumers and business owners in {cityName}, USA:
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <h3 className="text-sm font-bold text-slate-900">
                How do I verify a local business or contractor license in {cityName}?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Check the license number with the state licensing board or the {cityName} clerk&apos;s office. A BizNestUSA verification badge means the profile completed our basic validation — it does not confirm every license or claim.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <h3 className="text-sm font-bold text-slate-900">
                What are the benefits of hiring local {cityName} service providers?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Local providers are nearby, so they can respond faster and follow up in person. They also know the local rules and suppliers in {cityName}.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <h3 className="text-sm font-bold text-slate-900">
                How can {cityName} business owners register or claim their company listing?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Business owners in {cityName} can add their company profile (listings start at $1) or claim an existing directory entry using the &apos;Add Your Business&apos; portal on BizNestUSA. Basic ($1) is submit-only, Standard ($5) adds editing and 5 posts, and Authoritative ($10) adds a gallery, 10 posts over 60 days, and featured placement.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Links Back to Hubs */}
        <div className="flex flex-wrap gap-3 pt-4 justify-center text-xs">
          <Link
            href="/cities"
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            ← View All US Cities
          </Link>
          <Link
            href="/categories"
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            Browse Business Categories
          </Link>
          <Link
            href="/jobs"
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            Find Jobs in the USA
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  )
}
