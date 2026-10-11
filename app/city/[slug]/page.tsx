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
  Star,
  ArrowRight,
  ArrowLeft,
  Building2,
  Briefcase,
  Users,
  Phone,
  HelpCircle,
  CheckCircle2,
  DollarSign,
  FileText,
  BadgeCheck
} from 'lucide-react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BreadcrumbSchema } from '@/components/seo/breadcrumb-schema'
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

export const revalidate = 86400 // 24-hour ISR revalidation
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
    `Top Businesses in ${cityName}, USA | BizNestUSA`,
    `Businesses in ${cityName}, USA | BizNestUSA Directory`,
    `Local Businesses in ${cityName}, USA | BizNestUSA`,
    `Verified Businesses in ${cityName}, USA | BizNestUSA`,
    `${cityName}, USA Business Directory | BizNestUSA`,
    `Explore Businesses in ${cityName}, USA | BizNestUSA`
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

  const padded = `Verified Top Businesses in ${cityName}, USA | BizNestUSA`
  if (padded.length >= 50 && padded.length <= 60) return padded

  return `Businesses in ${cityName}, USA | BizNestUSA Directory`.slice(0, 60)
}

function formatCityDescription(cityName: string): string {
  const templates = [
    `Explore verified local businesses, licensed trade contractors, active jobs, and skilled professionals in ${cityName}, USA on BizNestUSA.`,
    `Find verified local businesses, licensed contractors, open career vacancies, and independent professionals in ${cityName}, USA on BizNestUSA.`,
    `Discover verified local businesses, licensed trade specialists, jobs, and commercial services in ${cityName}, USA on the BizNestUSA directory.`
  ]

  for (const t of templates) {
    if (t.length >= 140 && t.length <= 160) return t
  }

  for (const t of templates) {
    if (t.length > 160) {
      const trimmed = t.slice(0, 156)
      const lastSpace = trimmed.lastIndexOf(' ')
      return trimmed.slice(0, lastSpace) + ' on BizNest.'
    }
  }

  return templates[0].padEnd(142, '.')
}

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

  const allApproved = await getAllBusinesses(false)
  const cityBusinesses = filterBusinessesByCity(allApproved, citySlug)

  const allJobs = await getAllJobs(false)
  const cityJobs = allJobs.filter(
    (job) => normalizeCitySlug(job.city) === citySlug || job.cities?.some(c => normalizeCitySlug(c) === citySlug)
  )

  const allPros = await getAllProfessionals(false)
  const cityPros = allPros.filter(p => normalizeCitySlug(p.city) === citySlug)

  const hasData = cityBusinesses.length > 0 || cityJobs.length > 0 || cityPros.length > 0

  const title = formatCityTitle(cityName)
  const description = formatCityDescription(cityName)
  const canonicalUrl = toCanonicalUrl(`city/${citySlug}`)

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

  const allApproved = await getAllBusinesses(false)
  const cityBusinesses = filterBusinessesByCity(allApproved, citySlug)

  const allJobs = await getAllJobs(false)
  const cityJobs = allJobs.filter(
    (job) => normalizeCitySlug(job.city) === citySlug || job.cities?.some(c => normalizeCitySlug(c) === citySlug)
  )

  const allPros = await getAllProfessionals(false)
  const cityPros = allPros.filter(p => normalizeCitySlug(p.city) === citySlug)

  const activeCategories = getCategoriesWithListingsForCity(allApproved, citySlug)
  const seoCopy = getCitySeoCopy(citySlug)
  const currentPath = `city/${citySlug}`
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
      itemListElement: cityBusinesses.map((biz, idx) => ({
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
              <p className="text-slate-600 text-sm">No businesses currently listed in {cityName} yet.</p>
              <p className="text-slate-400 text-xs">Are you a business owner in {cityName}? List your company free for local visibility.</p>
              <Link href="/add-business" className="inline-block mt-2 px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-xl">
                Add Your {cityName} Business Free
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cityBusinesses.map((biz) => (
                <div key={biz.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Image src={biz.logo} alt={biz.name} width={48} height={48} loading="lazy" sizes="48px" className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0" />
                        <div>
                          <Link href={`/business/${biz.slug}`} className="font-bold text-slate-900 text-base flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                            <span>{biz.name}</span>
                            {biz.verified && (
                              <span title="Verified Business">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                              </span>
                            )}
                          </Link>
                          <p className="text-xs text-slate-500">{biz.category}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg shrink-0">
                        {biz.reviewCount > 0 && biz.rating > 0 ? `★ ${biz.rating}` : 'Active'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{biz.description}</p>
                  </div>
                  <div className="pt-3 mt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                    {biz.phone ? (
                      <span className="text-slate-500 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{biz.phone}</span>
                      </span>
                    ) : (
                      <span></span>
                    )}
                    <Link href={`/business/${biz.slug}`} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:text-blue-700">
                      <span>View Listing</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
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
              Commercial Directory &amp; Economic Guide for {cityName}, USA
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              {cityName} represents a key regional economic hub supporting diverse industries including residential contracting, skilled trade services, healthcare practices, legal firms, and commercial retail. Sourcing local service providers in {cityName} ensures faster response times, accountability, and adherence to municipal safety standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <BadgeCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Local Licensing Boards</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Operating businesses in {cityName} are subject to state registration and local city licensing requirements. Always verify trade licenses with state regulatory boards before contracting major work.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Permits &amp; Building Codes</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Home renovations and commercial developments in {cityName} require official permits from the municipal building department to maintain structural integrity and property insurability.
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
                You can verify credentials through state licensing portals and the {cityName} municipal clerk or department of regulatory agencies. On BizNestUSA, verified badges highlight businesses that have completed documentary review.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <h3 className="text-sm font-bold text-slate-900">
                What are the benefits of hiring local {cityName} service providers?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Local providers possess direct familiarity with regional building codes, climate considerations, and municipal permit protocols in {cityName}, enabling timely project completion and accessible follow-up warranty service.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <h3 className="text-sm font-bold text-slate-900">
                How can {cityName} business owners register or claim their company listing?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Business owners in {cityName} can add their company profile or claim an existing directory entry for free using the &apos;Add Your Business&apos; portal on BizNestUSA to reach local customers across the metropolitan area.
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
