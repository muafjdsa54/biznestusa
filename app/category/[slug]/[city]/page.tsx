import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { getAllBusinesses } from '@/lib/db-service'
import {
  filterBusinessesByCategoryAndCity,
  getPopulatedCategoryCityPairs,
  getCategoriesWithListingsForCity,
  getCitiesWithListingsForCategory,
  getCategoryDisplayName,
  getCityDisplayName,
  toCanonicalUrl,
  VERIFICATION_DISCLAIMER,
  isUsCity,
  isPakistaniCity
} from '@/lib/directory-helpers'
import { CATEGORIES } from '@/lib/data'
import { BreadcrumbSchema } from '@/components/seo/breadcrumb-schema'
import CategoryListingsView from '@/components/business/category-listings-view'
import {
  Building2,
  MapPin,
  ShieldCheck,
  Star,
  ArrowRight,
  ArrowLeft,
  Phone,
  CheckCircle2,
  Globe,
  Sparkles,
  ChevronRight
} from 'lucide-react'

export const revalidate = 86400
export const dynamicParams = true

export async function generateStaticParams() {
  const allBiz = await getAllBusinesses(false)
  const pairs = getPopulatedCategoryCityPairs(allBiz)
  return pairs.map(p => ({
    slug: p.categorySlug,
    city: p.citySlug
  }))
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string; city: string }>
}): Promise<Metadata> {
  const params = await props.params
  const catSlug = params.slug.toLowerCase()
  const citySlug = params.city.toLowerCase()

  if (isPakistaniCity(citySlug) || !isUsCity(citySlug)) {
    return {
      title: 'Directory Page Not Found | BizNest USA',
      robots: { index: false, follow: false }
    }
  }

  const allBiz = await getAllBusinesses(false)
  const matchingBusinesses = filterBusinessesByCategoryAndCity(allBiz, catSlug, citySlug)

  if (matchingBusinesses.length === 0) {
    return {
      title: 'Directory Page Not Found | BizNest USA',
      robots: { index: false, follow: false }
    }
  }

  const categoryName = getCategoryDisplayName(catSlug)
  const cityName = getCityDisplayName(citySlug)

  const title = `${categoryName} in ${cityName}, USA | BizNest USA`
  const description = `Find verified ${categoryName.toLowerCase()} in ${cityName}, USA. Browse local listings, contact details and useful business information on BizNest USA.`
  const canonicalUrl = toCanonicalUrl(`category/${catSlug}/${citySlug}`)

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'BizNest USA',
      locale: 'en_US',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    },
    robots: {
      index: true,
      follow: true
    }
  }
}

export default async function CategoryCityLandingPage(props: {
  params: Promise<{ slug: string; city: string }>
}) {
  const params = await props.params
  const catSlug = params.slug.toLowerCase()
  const citySlug = params.city.toLowerCase()

  const allBiz = await getAllBusinesses(false)
  const businesses = filterBusinessesByCategoryAndCity(allBiz, catSlug, citySlug)

  if (isPakistaniCity(citySlug) || !isUsCity(citySlug) || businesses.length === 0) {
    notFound()
  }

  const categoryName = getCategoryDisplayName(catSlug)
  const cityName = getCityDisplayName(citySlug)
  const currentPath = `category/${catSlug}/${citySlug}`
  const canonicalUrl = toCanonicalUrl(currentPath)

  const otherCategoriesInCity = getCategoriesWithListingsForCity(allBiz, citySlug).filter(
    c => c.categorySlug !== catSlug
  )
  const otherCitiesForCategory = getCitiesWithListingsForCategory(allBiz, catSlug).filter(
    c => c.citySlug !== citySlug
  )

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${categoryName} in ${cityName}, USA`,
    description: `Find verified ${categoryName.toLowerCase()} in ${cityName}, USA. Browse local business listings, contact details and verified directory information on BizNest USA.`,
    url: canonicalUrl,
    isPartOf: {
      '@type': 'WebSite',
      name: 'BizNest USA',
      url: 'https://biznestusa.com/'
    },
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
        name: categoryName,
        item: toCanonicalUrl(`category/${catSlug}`)
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: cityName,
        item: canonicalUrl
      }
    ]
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <BreadcrumbSchema pathname={`/${currentPath}`} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([collectionSchema, breadcrumbSchema]) }}
      />

      {/* LIGHT THEME HEADER SECTION */}
      <section className="bg-white border-b border-slate-200/80 py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <nav aria-label="Breadcrumb" className="text-xs text-slate-500 flex items-center flex-wrap gap-1.5 font-medium">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            <Link href="/categories" className="hover:text-blue-600">Categories</Link>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            <Link href={`/category/${catSlug}`} className="hover:text-blue-600">{categoryName}</Link>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="text-slate-900 font-semibold">{cityName}</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-2">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{cityName}, USA</span>
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                  <span>{businesses.length} Verified {businesses.length === 1 ? 'Listing' : 'Listings'}</span>
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {categoryName} in {cityName}
              </h1>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Find verified {categoryName.toLowerCase()} in {cityName}, USA. Browse local business profiles, services, phone numbers, addresses, and official locations on BizNest USA.
              </p>
            </div>

            <Link
              href="/add-business"
              className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-md transition-all self-start lg:self-auto cursor-pointer shrink-0"
            >
              <span>List Your {cityName} Business</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">
        
        {/* Verification Info Callout */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Directory Trust Notice:</strong> {VERIFICATION_DISCLAIMER}
          </p>
        </div>

        {/* Business Listings (List View & Grid View supporting $1, $5, $10 plans) */}
        <CategoryListingsView businesses={businesses} categoryName={categoryName} cityName={cityName} />

        {/* Cross-Link Section 1: Other Popular Categories in this City */}
        {otherCategoriesInCity.length > 0 && (
          <section className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-extrabold text-slate-900">
                Other Popular Categories in {cityName}
              </h2>
              <Link href={`/city/${citySlug}`} className="text-xs font-bold text-blue-600 hover:underline">
                Explore All {cityName} Categories &rarr;
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {otherCategoriesInCity.map((cat) => (
                <Link
                  key={cat.categorySlug}
                  href={`/category/${cat.categorySlug}/${citySlug}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>{cat.categoryName}</span>
                  <span className="text-[10px] text-slate-400 bg-white px-1.5 py-0.2 rounded border">
                    {cat.count}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Cross-Link Section 2: Other Cities for this Category */}
        {otherCitiesForCategory.length > 0 && (
          <section className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-extrabold text-slate-900">
                Find {categoryName} in Other US Cities
              </h2>
              <Link href={`/category/${catSlug}`} className="text-xs font-bold text-blue-600 hover:underline">
                All {categoryName} in USA &rarr;
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {otherCitiesForCategory.map((c) => (
                <Link
                  key={c.citySlug}
                  href={`/category/${catSlug}/${c.citySlug}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors inline-flex items-center gap-1.5"
                >
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{c.cityName}</span>
                  <span className="text-[10px] text-slate-400 bg-white px-1.5 py-0.2 rounded border">
                    {c.count}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Hub Navigation Bar */}
        <div className="flex flex-wrap gap-3 pt-2 justify-center text-xs">
          <Link
            href={`/category/${catSlug}`}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            ← Back to All {categoryName} in USA
          </Link>
          <Link
            href={`/city/${citySlug}`}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            Businesses in {cityName} →
          </Link>
          <Link
            href="/categories"
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            All Categories
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  )
}
