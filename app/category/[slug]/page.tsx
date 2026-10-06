import React from 'react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { CATEGORIES } from '@/lib/data'
import { getAllBusinesses } from '@/lib/db-service'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ShieldCheck, Star, ArrowRight, ArrowLeft, MapPin, Building2, 
  CheckCircle2, HelpCircle, Sparkles, ChevronRight, Phone, ExternalLink 
} from 'lucide-react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BreadcrumbSchema } from '@/components/seo/breadcrumb-schema'
import { getCategorySeoCopy } from '@/lib/seo-directory-content'
import {
  filterBusinessesByCategory,
  getCitiesWithListingsForCategory,
  toCanonicalUrl,
  VERIFICATION_DISCLAIMER,
  normalizeSubcategorySlug
} from '@/lib/directory-helpers'
import { getCmsCategoryBySlug } from '@/lib/admin-cms-service'
import { getServicesByCategory } from '@/lib/services-data'
import { Wrench } from 'lucide-react'
import CategoryListingsView from '@/components/business/category-listings-view'

export const revalidate = 86400 // 24-hour ISR revalidation
export const dynamicParams = false

export async function generateStaticParams() {
  return CATEGORIES.map((cat) => ({
    slug: cat.id,
  }))
}

function formatCategoryTitle(name: string): string {
  const candidates = [
    `${name} Businesses in the USA | BizNestUSA`,
    `${name} Directory & Businesses in USA | BizNestUSA`,
    `${name} Businesses & Directory in USA | BizNestUSA`,
    `${name} in the United States | BizNestUSA Directory`,
    `Verified ${name} Businesses in USA | BizNestUSA`,
    `${name} Directory | BizNestUSA Directory`,
    `${name} | BizNestUSA Business Directory`
  ]

  for (const c of candidates) {
    if (c.length >= 50 && c.length <= 60) return c
  }
  for (const c of candidates) {
    if (c.length > 60) {
      const truncated = `${name} Businesses in the USA`.slice(0, 46).trim() + ' | BizNestUSA'
      if (truncated.length >= 50 && truncated.length <= 60) return truncated
    }
  }
  return `${name} – Official Directory | BizNestUSA`.slice(0, 60)
}

function formatCategoryDescription(name: string): string {
  const templates = [
    `Browse verified ${name.toLowerCase()} businesses across the USA. Compare top local companies, service specialties, contact details, and addresses on BizNestUSA.`,
    `Find verified ${name.toLowerCase()} providers across the USA. Explore local company ratings, verified contact numbers, addresses, and profiles on BizNestUSA.`,
    `Discover top-rated ${name.toLowerCase()} companies across the USA. Compare verified local business profiles, services, phone contacts, and details on BizNestUSA.`
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

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params
  const cat = CATEGORIES.find(c => c.id === params.slug)
  if (!cat) {
    return {
      title: 'Category Not Found | BizNest USA',
      robots: { index: false, follow: false },
    }
  }
  const cmsCat = await getCmsCategoryBySlug(params.slug)
  const title = cmsCat?.seoTitle || formatCategoryTitle(cat.name)
  const description = cmsCat?.metaDescription || formatCategoryDescription(cat.name)
  const canonicalUrl = toCanonicalUrl(`category/${cat.id}`)
  const shouldIndex = cmsCat?.noIndex ? false : true

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'BizNest USA',
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
      index: shouldIndex,
      follow: true,
    },
  }
}

export default async function CategoryDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params
  const cat = CATEGORIES.find(c => c.id === params.slug)
  if (!cat) notFound()

  const allApproved = await getAllBusinesses(false)
  const businesses = filterBusinessesByCategory(allApproved, cat.id)
  const activeCities = getCitiesWithListingsForCategory(allApproved, cat.id)
  const relatedCategories = CATEGORIES.filter(c => c.id !== cat.id).slice(0, 8)
  const seoCopy = getCategorySeoCopy(cat.id)
  const cmsCat = await getCmsCategoryBySlug(cat.id)

  const currentPath = `category/${cat.id}`
  const canonicalUrl = toCanonicalUrl(currentPath)

  const displayH1 = cmsCat?.h1 || `${cat.name} Businesses in the USA`
  const displayIntro = cmsCat?.introContent || seoCopy?.intro || cat.desc
  const displayWhatIs = cmsCat?.longDescription || seoCopy?.whatIs || `This directory connects American consumers, business owners, and project managers with verified ${cat.name.toLowerCase()} providers across the country.`
  const ctaHeading = cmsCat?.ctaHeading || seoCopy?.ctaHeading || `Own a ${cat.name} Business?`
  const ctaText = cmsCat?.ctaText || seoCopy?.ctaText || `Create your verified business profile on BizNest USA and make it easy for local customers to discover your services.`

  // Category subcategories list
  const categorySubcategories = (cat as any).subcategories || []

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${cat.name} Directory in the United States`,
    description: `Find verified ${cat.name.toLowerCase()} providers across the United States. Browse local businesses, official contact info, and services on BizNest USA.`,
    url: canonicalUrl,
    isPartOf: { '@type': 'WebSite', name: 'BizNest USA', url: 'https://biznestusa.com/' },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: businesses.map((biz, idx) => ({
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
        item: 'https://biznestusa.com/'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Categories',
        item: 'https://biznestusa.com/categories/'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: cat.name,
        item: canonicalUrl
      }
    ]
  }

  const faqSchema = seoCopy?.faqs && seoCopy.faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: seoCopy.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  } : null

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <BreadcrumbSchema pathname={`/${currentPath}`} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([collectionSchema, breadcrumbSchema, ...(faqSchema ? [faqSchema] : [])]) }}
      />

      {/* LIGHT THEME HERO SECTION */}
      <section className="bg-white border-b border-slate-200/80 py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <nav aria-label="Breadcrumb" className="text-xs text-slate-500 flex items-center flex-wrap gap-1.5 font-medium">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            <Link href="/categories" className="hover:text-blue-600">Categories</Link>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="text-slate-900 font-semibold">{cat.name}</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-2">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
                <Building2 className="w-3.5 h-3.5" />
                <span>USA Industry Directory</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {displayH1}
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {displayIntro} Browse verified {cat.name.toLowerCase()} businesses across America by location, specialties, verified credentials, and direct contact details.
              </p>
            </div>

            {/* Quick Header CTA */}
            <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
              <Link
                href="/add-business"
                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>List Your {cat.name} Business</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <span className="text-[11px] text-slate-500 text-center">
                Free standard review or $5 priority exposure
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN TWO-COLUMN LAYOUT: CONTENT + STICKY SIDEBAR CTA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: DIRECTORY & RICH CONTENT (8 COLS) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Trust Notice */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-emerald-950">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Directory Standards:</strong> {VERIFICATION_DISCLAIMER}
              </p>
            </div>

            {/* Relevant Subcategories Links */}
            {categorySubcategories.length > 0 && (
              <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-5 shadow-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                      Browse {cat.name} Subcategories
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Explore specialized {cat.name.toLowerCase()} sectors, verified providers, and service details:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
                  {categorySubcategories.map((sub: string) => {
                    const subSlug = normalizeSubcategorySlug(sub)
                    const count = businesses.filter(b => 
                      (b.subcategory_slug || '').toLowerCase() === subSlug || 
                      normalizeSubcategorySlug(b.subcategory || b.subCategory || '') === subSlug
                    ).length

                    return (
                      <Link
                        key={sub}
                        href={`/category/${cat.id}/${subSlug}`}
                        className="group p-3.5 rounded-2xl border border-slate-200/90 hover:border-blue-500 bg-slate-50/60 hover:bg-blue-50/40 transition-all flex items-center justify-between shadow-2xs hover:shadow-xs"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors block truncate">
                            {sub}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {count > 0 ? `${count} ${count === 1 ? 'listing' : 'listings'}` : 'View directory'}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </Link>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Directory Overview & Coverage (Requirement 15) */}
            <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-5 shadow-xs">
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  About the {cat.name} Directory
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {displayWhatIs}
                </p>
              </div>

              {/* What Services Are Included */}
              {seoCopy?.includedServices && seoCopy.includedServices.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Common Services &amp; Specialties in This Category
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                    {seoCopy.includedServices.map((srv, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-medium">{srv}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What to Compare Before Hiring */}
              {seoCopy?.whatToCompare && seoCopy.whatToCompare.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    What to Evaluate When Choosing a Provider
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-600">
                    {seoCopy.whatToCompare.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Brand Explanation (Requirement 17) */}
              <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-1.5 text-xs text-blue-950">
                <h4 className="font-extrabold text-blue-900 text-sm">
                  What is BizNest USA and how does it help {cat.name.toLowerCase()} businesses?
                </h4>
                <p className="leading-relaxed text-blue-900/90 font-normal">
                  {seoCopy?.brandBenefit || `BizNest USA gives verified businesses an authoritative public business profile with contact details, services, operating hours, and location coverage. Create a complete business profile that gives customers another trusted place to discover your services online.`}
                </p>
              </div>
            </section>

            {/* City Location Navigation (Requirement 19 & 22) */}
            {activeCities.length > 0 && (
              <section className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-3 shadow-xs">
                <div className="flex justify-between items-center">
                  <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>Browse {cat.name} by US Metro Area</span>
                  </h2>
                  <span className="text-xs text-slate-500 font-medium">
                    {activeCities.length} {activeCities.length === 1 ? 'City' : 'Cities'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {activeCities.map((city) => (
                    <Link
                      key={city.citySlug}
                      href={`/category/${cat.id}/${city.citySlug}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors inline-flex items-center gap-1.5"
                    >
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{cat.name} in {city.cityName}</span>
                      <span className="text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {city.count}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* BUSINESS LISTINGS (LIST VIEW & GRID VIEW SUPPORTING $1, $5, $10 PLANS) */}
            <CategoryListingsView businesses={businesses} categoryName={cat.name} />

            {/* FREQUENTLY ASKED QUESTIONS SECTION */}
            {seoCopy?.faqs && seoCopy.faqs.length > 0 && (
              <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-xs">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    Frequently Asked Questions about {cat.name}
                  </h2>
                </div>
                <div className="space-y-3 pt-2">
                  {seoCopy.faqs.map((faq, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                      <h3 className="font-bold text-slate-900 text-sm flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{faq.question}</span>
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed pl-6">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* RELATED CATEGORIES (Requirement 19) */}
            <section className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-3 shadow-xs">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Explore Other Directory Categories
              </h2>
              <div className="flex flex-wrap gap-2 pt-1">
                {relatedCategories.map((rc) => (
                  <Link
                    key={rc.id}
                    href={`/category/${rc.id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
                  >
                    {rc.name}
                  </Link>
                ))}
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN: STICKY CATEGORY-AWARE SIDEBAR CTA (4 COLS) (Requirement 18) */}
          <aside className="lg:col-span-4 sticky top-24 space-y-6">
            
            {/* Primary Category-Aware Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xl shadow-slate-900/5 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-extrabold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                <span>Category Discovery</span>
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {ctaHeading}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                {ctaText}
              </p>

              <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Public business profile with contact channels</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>$1 Review plan or $5 Priority queue</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Direct customer phone &amp; inquiry leads</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/add-business"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
                >
                  <span>List Your Business Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Professional Talent Box */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/90 space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                For Independent Specialists
              </span>
              <h4 className="text-sm font-extrabold text-slate-900">
                Are you an independent {cat.name.toLowerCase()} contractor or specialist?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Build a certified professional profile with verified credentials and portfolio samples on BizNest USA.
              </p>
              <Link
                href="/register/professional"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline pt-1"
              >
                <span>Create Professional Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </aside>

        </div>
      </main>

      {/* MOBILE STICKY BOTTOM CTA (Requirement 18) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-extrabold text-slate-900 truncate">
              {ctaHeading}
            </p>
            <p className="text-[10px] text-slate-500 truncate">
              List on America&apos;s verified directory
            </p>
          </div>
          <Link
            href="/add-business"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs shrink-0 cursor-pointer"
          >
            List Business
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
