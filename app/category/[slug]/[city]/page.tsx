import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { getAllBusinesses } from '@/lib/db-service'
import {
  filterBusinessesByCategoryAndCity,
  filterBusinessesByCategoryAndSubcategory,
  getPopulatedCategoryCityPairs,
  getCategoriesWithListingsForCity,
  getCitiesWithListingsForCategory,
  getCategoryDisplayName,
  getCityDisplayName,
  getSubcategoryDefinition,
  normalizeSubcategorySlug,
  toCanonicalUrl,
  VERIFICATION_DISCLAIMER,
  isUsCity,
  isPakistaniCity
} from '@/lib/directory-helpers'
import { CATEGORIES, BUSINESS_CATEGORIES } from '@/lib/data'
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
  ChevronRight,
  Wrench,
  HelpCircle,
  Briefcase,
  DollarSign,
  FileText,
  BadgeCheck
} from 'lucide-react'

export const revalidate = 86400
export const dynamicParams = true

const SUBCATEGORY_CANONICAL_REDIRECTS: Record<string, string> = {
  'home-services/general-contractor': '/category/construction/general-contractor/',
  'professional-services/insurance-agency': '/category/finance/insurance-agency/',
  'professional-services/real-estate-agency': '/category/real-estate/real-estate-agency/',
  'healthcare-professionals/physical-therapist': '/category/health-wellness/physical-therapist/',
  'local-services/event-planner': '/category/events-weddings/event-planner/',
  'skilled-trades/plumber': '/category/home-services/plumber/',
  'skilled-trades/roofer': '/category/home-services/roofer/',
  'skilled-trades/electrician': '/category/home-services/electrician/',
  'business-finance-professionals/accountant': '/category/professional-services/accountant/',
  'legal-professionals/attorney': '/category/professional-services/attorney/',
  'healthcare-professionals/dentist': '/category/health-wellness/dentist/',
  'healthcare-professionals/doctor': '/category/health-wellness/doctor/',
  'healthcare-professionals/therapist': '/category/health-wellness/therapist/',
}

export async function generateStaticParams() {
  const allBiz = await getAllBusinesses(false)
  
  // 1. All category + subcategory pairs (deduplicated)
  const subcategoryParams: { slug: string; city: string }[] = []
  for (const cat of BUSINESS_CATEGORIES) {
    for (const sub of cat.subcategories) {
      subcategoryParams.push({
        slug: cat.id,
        city: normalizeSubcategorySlug(sub)
      })
    }
  }

  // 2. All populated category + city pairs
  const cityPairs = getPopulatedCategoryCityPairs(allBiz)
  const cityParams = cityPairs
    .filter(pair => isUsCity(pair.citySlug) && !isPakistaniCity(pair.citySlug))
    .map(p => ({
      slug: p.categorySlug,
      city: p.citySlug
    }))

  return [...subcategoryParams, ...cityParams]
}

function formatSubcategoryTitle(sub: string, catName: string): string {
  const candidates = [
    `${sub} in USA – ${catName} Directory | BizNestUSA`,
    `${sub} Services in USA – ${catName} | BizNestUSA`,
    `${sub} in the USA – ${catName} Directory | BizNestUSA`,
    `${sub} in the United States – ${catName} | BizNestUSA`,
    `Verified ${sub} in USA – ${catName} | BizNestUSA`,
    `${sub} Directory in USA – ${catName} | BizNestUSA`,
    `${sub} in the USA – ${catName} | BizNestUSA`,
    `Verified ${sub} Directory in USA | BizNestUSA`,
    `${sub} in USA – ${catName} | BizNestUSA`,
    `${sub} in USA | BizNestUSA Directory`
  ]

  for (const c of candidates) {
    if (c.length >= 50 && c.length <= 60) return c
  }

  for (const c of candidates) {
    if (c.length > 60) {
      const truncated = `${sub} in USA – ${catName}`.slice(0, 46).trim() + ' | BizNestUSA'
      if (truncated.length >= 50 && truncated.length <= 60) return truncated
    }
  }

  const padded = `Top Verified ${sub} in the USA | BizNestUSA Directory`
  if (padded.length >= 50 && padded.length <= 60) return padded

  return `${sub} in USA – Official Directory | BizNestUSA`.slice(0, 60)
}

function formatSubcategoryDescription(sub: string, catName: string): string {
  const templates = [
    `Find verified ${sub.toLowerCase()} providers in ${catName.toLowerCase()} across the USA. Compare local business locations, contact numbers, services, and official profiles on BizNestUSA.`,
    `Discover verified ${sub.toLowerCase()} services in ${catName.toLowerCase()} across the USA. Explore local business addresses, phone contacts, service options, and profiles on BizNestUSA.`,
    `Browse licensed ${sub.toLowerCase()} specialists in ${catName.toLowerCase()} across the USA. View verified business addresses, phone contacts, service details, and profiles on BizNestUSA.`,
    `Find verified ${sub.toLowerCase()} in ${catName.toLowerCase()} across the USA. Compare top local locations, verified contact details, services, and directory profiles on BizNestUSA.`
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

  const shortT = `Find verified ${sub.toLowerCase()} providers in ${catName.toLowerCase()} across the USA. Compare local business locations, contact details, and profiles on BizNestUSA.`
  if (shortT.length >= 140 && shortT.length <= 160) return shortT

  return `Find verified ${sub.toLowerCase()} in ${catName.toLowerCase()} across the United States. Compare top business locations, contact details, services, and directory profiles on BizNestUSA.`
}

function formatCategoryCityTitle(categoryName: string, cityName: string): string {
  let cleanCat = categoryName
  if (cleanCat === 'Construction & Contractors') cleanCat = 'Construction'
  if (cleanCat === 'Real Estate & Properties') cleanCat = 'Real Estate'
  if (cleanCat === 'Beauty & Personal Care') cleanCat = 'Beauty & Salons'
  if (cleanCat === 'Restaurants & Food' || cleanCat === 'Food & Restaurants') cleanCat = 'Restaurants'
  if (cleanCat === 'Cleaning & Janitorial') cleanCat = 'Cleaning Services'
  if (cleanCat === 'Legal & Attorney Services') cleanCat = 'Legal Services'
  if (cleanCat === 'Business & Finance') cleanCat = 'Business & Finance'

  const candidates = [
    `${cleanCat} Businesses in ${cityName}, USA | BizNestUSA`,
    `${cleanCat} in ${cityName}, USA – Local Directory | BizNest`,
    `${cleanCat} in ${cityName}, USA | BizNestUSA Directory`,
    `Verified ${cleanCat} in ${cityName}, USA | BizNestUSA`,
    `${cleanCat} Directory in ${cityName}, USA | BizNestUSA`,
    `Top ${cleanCat} in ${cityName}, USA | BizNestUSA Directory`,
    `${cleanCat} in ${cityName}, USA | BizNestUSA`
  ]

  for (const c of candidates) {
    if (c.length >= 50 && c.length <= 60) return c
  }

  for (const c of candidates) {
    if (c.length > 60) {
      const prefix = `${cleanCat} in ${cityName}`.slice(0, 44).trim()
      const candidate = `${prefix}, USA | BizNestUSA`
      if (candidate.length >= 50 && candidate.length <= 60) return candidate
      if (candidate.length <= 60) return candidate
    }
  }

  const padded = `Verified Local ${cleanCat} in ${cityName}, USA | BizNestUSA`
  if (padded.length >= 50 && padded.length <= 60) return padded

  return `${cleanCat} in ${cityName}, USA | BizNestUSA Directory`.slice(0, 60)
}

function formatCategoryCityDescription(categoryName: string, cityName: string): string {
  const templates = [
    `Find verified ${categoryName.toLowerCase()} in ${cityName}, USA. Browse local business locations, contact phone numbers, verified addresses, and services on BizNestUSA.`,
    `Find verified ${categoryName.toLowerCase()} businesses in ${cityName}, USA. Browse local directory listings, verified contact details, hours, and services on BizNestUSA.`,
    `Explore top-rated ${categoryName.toLowerCase()} in ${cityName}, USA. Compare local business locations, verified phone numbers, specialized services, and ratings on BizNestUSA.`,
    `Browse licensed ${categoryName.toLowerCase()} in ${cityName}, USA. View verified local business addresses, phone contacts, service options, and directory profiles on BizNestUSA.`
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

  const base = `Find verified ${categoryName.toLowerCase()} businesses in ${cityName}, USA. Browse local directory listings, verified contact details, and services on BizNestUSA.`
  if (base.length >= 140 && base.length <= 160) return base
  if (base.length > 160) return base.slice(0, 156).replace(/\s\S*$/, '') + ' on BizNest.'
  return base.replace('on BizNestUSA.', 'and customer reviews on BizNestUSA.')
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string; city: string }>
}): Promise<Metadata> {
  const params = await props.params
  const catSlug = params.slug.toLowerCase().trim()
  const secondSlug = params.city.toLowerCase().trim()
  const pairKey = `${catSlug}/${secondSlug}`

  // Check if redirect is required for duplicate subcategory
  if (SUBCATEGORY_CANONICAL_REDIRECTS[pairKey]) {
    const target = SUBCATEGORY_CANONICAL_REDIRECTS[pairKey]
    return {
      title: 'Redirecting | BizNestUSA',
      alternates: { canonical: `https://www.biznestusa.com${target}` },
      robots: { index: false, follow: true }
    }
  }

  // Check if second slug is a subcategory
  const subDef = getSubcategoryDefinition(catSlug, secondSlug)
  if (subDef) {
    const title = formatSubcategoryTitle(subDef.name, subDef.categoryName)
    const description = formatSubcategoryDescription(subDef.name, subDef.categoryName)
    const canonicalUrl = toCanonicalUrl(`category/${catSlug}/${subDef.slug}`)

    return {
      title,
      description,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: 'BizNestUSA',
        locale: 'en_US',
        type: 'website'
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description
      },
      robots: { index: true, follow: true }
    }
  }

  // Otherwise check if second slug is a valid US city
  if (isPakistaniCity(secondSlug) || !isUsCity(secondSlug)) {
    return {
      title: 'Directory Page Not Found | BizNestUSA',
      robots: { index: false, follow: false }
    }
  }

  const allBiz = await getAllBusinesses(false)
  const matchingBusinesses = filterBusinessesByCategoryAndCity(allBiz, catSlug, secondSlug)

  if (matchingBusinesses.length === 0) {
    return {
      title: 'Directory Page Not Found | BizNestUSA',
      robots: { index: false, follow: false }
    }
  }

  const categoryName = getCategoryDisplayName(catSlug)
  const cityName = getCityDisplayName(secondSlug)

  const title = formatCategoryCityTitle(categoryName, cityName)
  const description = formatCategoryCityDescription(categoryName, cityName)
  const canonicalUrl = toCanonicalUrl(`category/${catSlug}/${secondSlug}`)

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
      siteName: 'BizNestUSA',
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

export default async function CategorySubcategoryOrCityPage(props: {
  params: Promise<{ slug: string; city: string }>
}) {
  const params = await props.params
  const catSlug = params.slug.toLowerCase().trim()
  const secondSlug = params.city.toLowerCase().trim()
  const pairKey = `${catSlug}/${secondSlug}`

  // 301 Permanent Redirect for duplicate subcategories
  if (SUBCATEGORY_CANONICAL_REDIRECTS[pairKey]) {
    permanentRedirect(SUBCATEGORY_CANONICAL_REDIRECTS[pairKey])
  }

  const allBiz = await getAllBusinesses(false)

  // -------------------------------------------------------------
  // BRANCH A: SUBCATEGORY PAGE (e.g. /category/automotive/auto-repair/)
  // -------------------------------------------------------------
  const subDef = getSubcategoryDefinition(catSlug, secondSlug)
  if (subDef) {
    const businesses = filterBusinessesByCategoryAndSubcategory(allBiz, catSlug, subDef.slug)
    const currentPath = `category/${catSlug}/${subDef.slug}`
    const canonicalUrl = toCanonicalUrl(currentPath)

    // Sibling subcategories in parent category
    const parentCatDef = BUSINESS_CATEGORIES.find(c => c.id === catSlug)
    const siblingSubcategories = (parentCatDef?.subcategories || [])
      .filter(s => normalizeSubcategorySlug(s) !== subDef.slug)
      .slice(0, 8)

    const collectionSchema = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${subDef.name} Businesses in the United States`,
      description: `Find verified ${subDef.name.toLowerCase()} businesses and licensed specialists across the United States on BizNestUSA.`,
      url: canonicalUrl,
      isPartOf: {
        '@type': 'WebSite',
        name: 'BizNestUSA',
        url: 'https://www.biznestusa.com/'
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
          item: 'https://www.biznestusa.com/'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Categories',
          item: 'https://www.biznestusa.com/categories/'
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: subDef.categoryName,
          item: toCanonicalUrl(`category/${catSlug}`)
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: subDef.name,
          item: canonicalUrl
        }
      ]
    }

    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: `How do I find verified ${subDef.name.toLowerCase()} providers on BizNestUSA?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `BizNestUSA verifies public commercial listings across America. You can view official business locations, verified phone numbers, licensing references, operating hours, and direct web links on each listing profile.`
          }
        },
        {
          '@type': 'Question',
          name: `What credentials should I verify before hiring a ${subDef.name.toLowerCase()} specialist?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `Confirm that the provider maintains an active state or municipal business registration, required trade contractor licenses, commercial general liability insurance, and upfront written estimates for all project phases.`
          }
        },
        {
          '@type': 'Question',
          name: `How are service costs and project estimates structured for ${subDef.name.toLowerCase()} services?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `Most providers charge either a standardized flat-rate fee for diagnostic consultations and routine tasks or an hourly labor rate plus material costs. Always request an itemized contract outlining project milestones before work commences.`
          }
        },
        {
          '@type': 'Question',
          name: `Can business owners claim or update their ${subDef.name.toLowerCase()} directory listing?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `Yes. Business owners can claim an existing profile or add a new verified listing using our self-service portal to update operating hours, services offered, verified phone numbers, and company bios.`
          }
        }
      ]
    }

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <BreadcrumbSchema pathname={`/${currentPath}`} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([collectionSchema, breadcrumbSchema, faqSchema])
          }}
        />

        {/* HERO SECTION */}
        <section className="bg-white border-b border-slate-200/80 py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-4">
            <nav aria-label="Breadcrumb" className="text-xs text-slate-500 flex items-center flex-wrap gap-1.5 font-medium">
              <Link href="/" className="hover:text-blue-600">Home</Link>
              <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
              <Link href="/categories" className="hover:text-blue-600">Categories</Link>
              <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
              <Link href={`/category/${catSlug}`} className="hover:text-blue-600">{subDef.categoryName}</Link>
              <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="text-slate-900 font-semibold">{subDef.name}</span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-2">
              <div className="space-y-3 max-w-3xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                    <Wrench className="w-3.5 h-3.5" />
                    <span>{subDef.categoryName} Specialty</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                    <span>{businesses.length} {businesses.length === 1 ? 'Business' : 'Businesses'} Listed</span>
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {subDef.name} Businesses in the USA
                </h1>

                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  Browse directory listings for verified {subDef.name.toLowerCase()} businesses and licensed providers across the United States. Compare locations, official contact details, hours, and specialty services on BizNestUSA.
                </p>
              </div>

              <div className="shrink-0 flex flex-col gap-2">
                <Link
                  href="/add-business"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-md transition-all self-start lg:self-auto cursor-pointer"
                >
                  <span>List Your {subDef.name} Business</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href={`/category/${catSlug}`}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to {subDef.categoryName} Overview</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN CONTENT AREA */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">
          
          {/* Trust Notice */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Directory Standards:</strong> {VERIFICATION_DISCLAIMER}
            </p>
          </div>

          {/* Business Listings: List & Grid Views */}
          <CategoryListingsView
            businesses={businesses}
            categoryName={subDef.categoryName}
            subCategoryTitle={subDef.name}
          />

          {/* Comprehensive Industry Guidance Section */}
          <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 inline-block">
                Hiring Guide &amp; Industry Standards
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                How to Evaluate &amp; Select a Qualified {subDef.name} Specialist
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                When engaging a professional or commercial business in the {subDef.name.toLowerCase()} sector, verifying credentials, business history, and service capabilities protects your budget and project timeline. Below is our standard checklist for American consumers and business managers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <BadgeCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Licensing &amp; Certification</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Always verify that the provider holds valid state, municipal, or trade board credentials. Regulated professions require ongoing compliance and active registry status with relevant US authorities.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Insurance &amp; Liability</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Request proof of active general liability insurance and applicable worker compensation coverage. This ensures property protection and shields clients from accidental damage during on-site work.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Transparent Estimates</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Require a written, itemized cost estimate detailing labor rates, diagnostic fees, equipment charges, and estimated completion dates before committing funds to any major assignment.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Scope of Services for {subDef.name} in the United States</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Specialists operating in this field routinely handle diagnostic assessments, preventative maintenance, emergency interventions, routine servicing, and custom consultations. Because municipal building codes and service regulations differ across states, verify that the selected provider has established operating history in your target metropolitan market.
              </p>
            </div>
          </section>

          {/* Sibling Subcategories Section */}
          {siblingSubcategories.length > 0 && (
            <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <span>Related {subDef.categoryName} Specialties</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
                {siblingSubcategories.map(s => {
                  const sSlug = normalizeSubcategorySlug(s)
                  return (
                    <Link
                      key={s}
                      href={`/category/${catSlug}/${sSlug}`}
                      className="group p-3 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 transition text-xs font-bold text-slate-800 hover:text-blue-700 flex items-center justify-between"
                    >
                      <span className="truncate">{s}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {/* Factual FAQ Section */}
          <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Frequently Asked Questions
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Key questions and answers regarding {subDef.name.toLowerCase()} businesses and services across the USA:
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <h3 className="text-sm font-bold text-slate-900">
                  How do I find verified {subDef.name.toLowerCase()} providers on BizNestUSA?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  BizNestUSA verifies public commercial listings across America. You can view official business locations, verified phone numbers, licensing references, operating hours, and direct web links on each listing profile.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <h3 className="text-sm font-bold text-slate-900">
                  What credentials should I verify before hiring a {subDef.name.toLowerCase()} specialist?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Confirm that the provider maintains an active state or municipal business registration, required trade contractor licenses, commercial general liability insurance, and upfront written estimates for all project phases.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <h3 className="text-sm font-bold text-slate-900">
                  How are service costs and project estimates structured for {subDef.name.toLowerCase()} services?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Most providers charge either a standardized flat-rate fee for diagnostic consultations and routine tasks or an hourly labor rate plus material costs. Always request an itemized contract outlining project milestones before work commences.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <h3 className="text-sm font-bold text-slate-900">
                  How can business owners claim or update their {subDef.name.toLowerCase()} directory listing?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Business owners can claim an existing profile or add a new verified listing using our self-service portal to update operating hours, services offered, verified phone numbers, and company bios.
                </p>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    )
  }

  // -------------------------------------------------------------
  // BRANCH B: CATEGORY IN CITY PAGE (e.g. /category/automotive/dallas/)
  // -------------------------------------------------------------
  const citySlug = secondSlug
  const businessesInCity = filterBusinessesByCategoryAndCity(allBiz, catSlug, citySlug)

  if (isPakistaniCity(citySlug) || !isUsCity(citySlug) || businessesInCity.length === 0) {
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
    description: `Find verified ${categoryName.toLowerCase()} in ${cityName}, USA. Browse local business listings, contact details and verified directory information on BizNestUSA.`,
    url: canonicalUrl,
    isPartOf: {
      '@type': 'WebSite',
      name: 'BizNestUSA',
      url: 'https://www.biznestusa.com/'
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: businessesInCity.map((biz, idx) => ({
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
        name: 'Categories',
        item: 'https://www.biznestusa.com/categories/'
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

  const localFaqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How do I locate reputable ${categoryName.toLowerCase()} providers in ${cityName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Use BizNestUSA to review verified local businesses operating within ${cityName}. Compare published telephone numbers, registered business addresses, service areas, and direct customer reviews.`
        }
      },
      {
        '@type': 'Question',
        name: `What licensing regulations apply to ${categoryName.toLowerCase()} in ${cityName}, USA?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Businesses in ${cityName} must comply with state licensing boards, municipal operating permits, and local sales tax registrations. We recommend asking providers for their state trade registration number before commissioning major projects.`
        }
      },
      {
        '@type': 'Question',
        name: `How can local businesses in ${cityName} add or claim their profile on BizNestUSA?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Company owners in ${cityName} can submit their listing for human review via the 'List Your Business' link, enabling local residents and commercial clients to discover their services.`
        }
      }
    ]
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <BreadcrumbSchema pathname={`/${currentPath}`} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([collectionSchema, breadcrumbSchema, localFaqSchema]) }}
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
                  <span>{businessesInCity.length} Verified {businessesInCity.length === 1 ? 'Listing' : 'Listings'}</span>
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {categoryName} in {cityName}
              </h1>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Find verified {categoryName.toLowerCase()} in {cityName}, USA. Browse local business profiles, services, phone numbers, addresses, and official locations on BizNestUSA.
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

        {/* Business Listings */}
        <CategoryListingsView
          businesses={businessesInCity}
          categoryName={categoryName}
          cityName={cityName}
        />

        {/* Local Market Context & Consumer Guide */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 inline-block">
              Local Metro Insights
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Hiring {categoryName} in {cityName}, USA
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              When sourcing {categoryName.toLowerCase()} providers in the {cityName} metropolitan area, local proximity and regulatory compliance play crucial roles. Local providers offer responsive dispatch, familiar knowledge of regional building and trade standards, and established community reputations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Checking Local {cityName} Credentials</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Confirm that service providers hold current municipal permits and state registrations appropriate for {cityName}. Reputable businesses will readily provide active registration identifiers and commercial liability certificates upon request.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span>Comparing Quotes &amp; Service Estimates</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                For major commercial or residential undertakings in {cityName}, we recommend gathering at least two independent written estimates. Transparent contracts should clearly specify material costs, hourly rates, milestone schedules, and warranty conditions.
              </p>
            </div>
          </div>
        </section>

        {/* Localized FAQ Section */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Frequently Asked Questions about {categoryName} in {cityName}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Common questions regarding finding and engaging local providers in {cityName}:
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <h3 className="text-sm font-bold text-slate-900">
                How do I locate reputable {categoryName.toLowerCase()} providers in {cityName}?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Use BizNestUSA to review verified local businesses operating within {cityName}. Compare published telephone numbers, registered business addresses, service areas, and direct customer reviews.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <h3 className="text-sm font-bold text-slate-900">
                What licensing regulations apply to {categoryName.toLowerCase()} in {cityName}, USA?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Businesses in {cityName} must comply with state licensing boards, municipal operating permits, and local sales tax registrations. We recommend asking providers for their state trade registration number before commissioning major projects.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <h3 className="text-sm font-bold text-slate-900">
                How can local businesses in {cityName} add or claim their profile on BizNestUSA?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Company owners in {cityName} can submit their listing for human review via the &apos;List Your Business&apos; link, enabling local residents and commercial clients to discover their services.
              </p>
            </div>
          </div>
        </section>

        {/* Cross Linking Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {otherCategoriesInCity.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-3 shadow-xs">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Other Business Categories in {cityName}</span>
              </h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {otherCategoriesInCity.slice(0, 10).map(c => (
                  <Link
                    key={c.categorySlug}
                    href={`/category/${c.categorySlug}/${citySlug}`}
                    className="text-xs px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 transition font-medium"
                  >
                    {c.categoryName} ({c.count})
                  </Link>
                ))}
              </div>
            </div>
          )}

          {otherCitiesForCategory.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-3 shadow-xs">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>{categoryName} in Other US Cities</span>
              </h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {otherCitiesForCategory.slice(0, 10).map(c => (
                  <Link
                    key={c.citySlug}
                    href={`/category/${catSlug}/${c.citySlug}`}
                    className="text-xs px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 transition font-medium"
                  >
                    {c.cityName} ({c.count})
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
