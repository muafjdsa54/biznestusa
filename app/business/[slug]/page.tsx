import React from 'react'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Phone, Mail, MapPin, MessageCircle, ShieldCheck, ShieldAlert, Info, Star, Clock, CheckCircle2, Building2, Briefcase, Award, Sparkles, Globe, ExternalLink, ArrowRight, BookOpen } from 'lucide-react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { getAllBusinesses, getBusinessBySlug } from '@/lib/db-service'
import { getPublishedPostsByBusinessId } from '@/lib/user-post-service'
import LazyMap from '@/components/business/lazy-map'
import BusinessFaqsSection from '@/components/business/business-faqs'
import { BusinessHeroActions, BusinessReviewsSection } from './business-interactive-actions'
import {
  toCanonicalUrl,
  normalizeBusinessCategoryId,
  normalizeCitySlug,
  normalizeSubcategorySlug,
  getSubcategoryDefinition,
  VERIFICATION_DISCLAIMER
} from '@/lib/directory-helpers'

export const dynamicParams = true
export const revalidate = 0

export async function generateStaticParams() {
  const businesses = await getAllBusinesses()
  return businesses.map((biz) => ({
    slug: biz.slug,
  }))
}

function formatBusinessTitle(biz: any, fallbackName: string): string {
  const name = (biz?.business_name || biz?.name || fallbackName || '').trim()
  const subOrCat = (biz?.subcategory || biz?.subCategory || biz?.category || 'Services').trim()
  const loc = (biz?.city ? `${biz.city}${biz?.state_code || biz?.state ? `, ${biz.state_code || biz.state}` : ''}` : 'USA').trim()

  const candidates = [
    `${name} – ${subOrCat} in ${loc} | BizNestUSA`,
    `${name} – ${subOrCat} Services in ${loc} | BizNestUSA`,
    `${name} – ${subOrCat} in ${loc} – BizNestUSA`,
    `${name} – ${subOrCat} in ${loc} on BizNestUSA`,
    `${name} – ${subOrCat} Services | BizNestUSA`,
    `${name} – ${subOrCat} | BizNestUSA`,
    `${name} – ${subOrCat} Directory | BizNestUSA`,
    `${name} – ${subOrCat} Profile | BizNestUSA`,
    `${name} in ${loc} | BizNestUSA Directory`,
    `${name} in ${loc} – BizNestUSA Directory`,
    `${name} in ${loc} | BizNestUSA`,
    `${name} – Official Business Profile | BizNestUSA`,
    `${name} – Directory Profile | BizNestUSA`,
    `${name} – Verified Business | BizNestUSA`,
    `${name} | BizNestUSA Business Directory`,
    `${name} | BizNestUSA Directory Profile`,
    `${name} – Local Business Directory | BizNestUSA`
  ]

  for (const c of candidates) {
    if (c.length >= 50 && c.length <= 60) return c
  }

  for (const c of candidates) {
    if (c.length >= 40 && c.length < 50) {
      const withUSA = c.replace(' | BizNestUSA', ' in the USA | BizNestUSA')
      if (withUSA.length >= 50 && withUSA.length <= 60) return withUSA

      const withOfficial = c.replace(`${name} – `, `${name} – Official `)
      if (withOfficial.length >= 50 && withOfficial.length <= 60) return withOfficial

      const withVerified = c.replace(`${name} – `, `${name} – Verified `)
      if (withVerified.length >= 50 && withVerified.length <= 60) return withVerified

      const withDirectory = c.replace(' | BizNestUSA', ' | BizNestUSA Directory')
      if (withDirectory.length >= 50 && withDirectory.length <= 60) return withDirectory
    }
  }

  for (const c of candidates) {
    if (c.length > 60) {
      const brand = ' | BizNestUSA'
      const maxPrefixLen = 60 - brand.length
      if (name.length <= maxPrefixLen) {
        const title = `${name} – ${subOrCat}`.slice(0, maxPrefixLen).trim() + brand
        if (title.length >= 50 && title.length <= 60) return title
      } else {
        const title = name.slice(0, maxPrefixLen - 3).trim() + '...' + brand
        if (title.length >= 50 && title.length <= 60) return title
      }
    }
  }

  const base = `${name} | BizNestUSA Directory`
  if (base.length >= 50 && base.length <= 60) return base
  if (base.length < 50) {
    return `${name} – Official USA Business Profile | BizNestUSA`.slice(0, 60)
  }
  return base.slice(0, 46).trim() + ' | BizNestUSA'
}

function formatBusinessDescription(biz: any, fallbackName: string): string {
  const name = (biz?.business_name || biz?.name || fallbackName || '').trim()
  const subOrCat = (biz?.subcategory || biz?.subCategory || biz?.category || 'services').trim()
  const loc = biz?.city ? `in ${biz.city}${biz?.state_code || biz?.state ? `, ${biz.state_code || biz.state}` : ''}` : 'in the USA'

  const templates = [
    `Explore directory details for ${name}, offering professional ${subOrCat} ${loc}. View verified address, phone contact, and services on BizNestUSA.`,
    `Find ${name} ${loc}. View public contact details, address, ${subOrCat} services, and directory listing information on BizNestUSA.`,
    `Discover ${name} offering trusted ${subOrCat} ${loc}. Access verified address, phone number, operating details, and public profile on BizNestUSA.`,
    `Looking for ${subOrCat} ${loc}? Browse directory profile, verified address, phone number, and services for ${name} on BizNestUSA.`,
    `Connect with ${name} for ${subOrCat} ${loc}. View verified business contact numbers, address, operating hours, and profile on BizNestUSA.`
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

function getLocalBusinessSubtype(biz: any): string {
  const text = `${biz.subcategory_slug || ''} ${biz.subcategory || ''} ${biz.subCategory || ''} ${biz.category || ''}`.toLowerCase()
  if (text.includes('auto-repair') || text.includes('auto repair') || text.includes('car repair') || text.includes('tire shop') || text.includes('towing') || text.includes('auto detailing') || text.includes('body shop')) {
    return 'AutoRepair'
  }
  if (text.includes('car dealership') || text.includes('car-dealership')) {
    return 'AutoDealer'
  }
  if (text.includes('dentist') || text.includes('dental')) {
    return 'Dentist'
  }
  if (text.includes('plumber') || text.includes('plumbing')) {
    return 'PlumbingService'
  }
  if (text.includes('electrician') || text.includes('electrical')) {
    return 'Electrician'
  }
  if (text.includes('roofing')) {
    return 'RoofingContractor'
  }
  if (text.includes('hvac') || text.includes('heating')) {
    return 'HVACBusiness'
  }
  if (text.includes('attorney') || text.includes('legal') || text.includes('law firm') || text.includes('lawyer')) {
    return 'LegalService'
  }
  if (text.includes('accounting') || text.includes('cpa') || text.includes('financial') || text.includes('tax')) {
    return 'FinancialService'
  }
  if (text.includes('real estate') || text.includes('realtor')) {
    return 'RealEstateAgent'
  }
  if (text.includes('insurance')) {
    return 'InsuranceAgency'
  }
  if (text.includes('contractor') || text.includes('construction') || text.includes('remodeling')) {
    return 'GeneralContractor'
  }
  if (text.includes('veterinarian') || text.includes('animal hospital')) {
    return 'VeterinaryCare'
  }
  if (text.includes('restaurant') || text.includes('cafe') || text.includes('bakery')) {
    return 'Restaurant'
  }
  if (text.includes('hotel') || text.includes('motel')) {
    return 'LodgingBusiness'
  }
  return biz.schemaType || 'LocalBusiness'
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params
  const slug = params.slug

  const biz = await getBusinessBySlug(slug)
  const businessName = biz ? biz.name : slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  const title = formatBusinessTitle(biz, businessName)
  const description = formatBusinessDescription(biz, businessName)
  const canonicalUrl = toCanonicalUrl(`business/${slug}`)

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      siteName: 'BizNest USA',
      url: canonicalUrl,
      locale: 'en_US',
      type: 'website',
      images: biz?.coverImage ? [{ url: biz.coverImage, alt: businessName }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function BusinessPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params
  const slug = params.slug

  const biz = await getBusinessBySlug(slug)

  if (!biz) {
    notFound()
  }

  const allBiz = await getAllBusinesses(false)
  const publishedArticles = await getPublishedPostsByBusinessId(biz.id)
  const catId = normalizeBusinessCategoryId(biz)
  const citySlug = normalizeCitySlug(biz.city)
  const canonicalUrl = toCanonicalUrl(`business/${slug}`)

  const subDef = getSubcategoryDefinition(biz.subcategory_slug || biz.subcategory || biz.subCategory || '', catId)
  const subcategorySlug = subDef?.slug || (biz.subcategory_slug ? normalizeSubcategorySlug(biz.subcategory_slug) : null)
  const subcategoryName = subDef?.name || biz.subcategory || biz.subCategory || null

  const isSeed = biz.source_type === 'seed_research' || biz.ownership_status === 'directory_seed'
  const isUnclaimed = isSeed || biz.claim_status === 'unclaimed' || !biz.isClaimed

  // Related businesses in same category or city
  const relatedBusinesses = allBiz
    .filter(b => b.slug !== biz.slug && (normalizeBusinessCategoryId(b) === catId || normalizeCitySlug(b.city) === citySlug))
    .slice(0, 4)

  const reviewsList = biz.reviews || []

  // Ensure multi-location support
  const locationsList = biz.locations && biz.locations.length > 0
    ? biz.locations
    : [{ city: biz.city, address: biz.address, isPrimary: true }]

  const specificSubtype = getLocalBusinessSubtype(biz)

  const localBusinessSchema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': specificSubtype,
    name: biz.name,
    description: biz.metaDescription || biz.description,
    url: canonicalUrl,
    image: biz.coverImage || biz.logo,
    logo: biz.logo,
    address: {
      '@type': 'PostalAddress',
      ...(biz.address ? { streetAddress: biz.address } : {}),
      addressLocality: biz.city || 'United States',
      addressRegion: biz.state_code || biz.state || 'US',
      ...(biz.zipCode || biz.zip ? { postalCode: biz.zipCode || biz.zip } : {}),
      addressCountry: 'US',
    },
    sameAs: [
      biz.googleBusinessProfile,
      biz.facebookUrl,
      biz.instagramUrl,
      biz.linkedinUrl,
      (biz.website && !biz.website.includes('biznestusa.com') ? biz.website : null)
    ].filter(Boolean),
  }

  if (biz.phone) {
    localBusinessSchema.telephone = biz.phone.replace(/\s+/g, '')
  }
  if (biz.email) {
    localBusinessSchema.email = biz.email
  }
  if (biz.priceRange) {
    localBusinessSchema.priceRange = biz.priceRange
  }
  if (biz.city) {
    localBusinessSchema.areaServed = {
      '@type': 'City',
      name: biz.city
    }
  }

  if (locationsList.length > 1) {
    localBusinessSchema.department = locationsList.map(loc => ({
      '@type': specificSubtype,
      name: `${biz.name} - ${loc.city}`,
      address: {
        '@type': 'PostalAddress',
        ...(loc.address ? { streetAddress: loc.address } : {}),
        addressLocality: loc.city,
        addressRegion: loc.state || 'United States',
        addressCountry: 'US'
      }
    }))
  }

  if (reviewsList.length > 0 && biz.rating > 0 && biz.reviewCount > 0) {
    localBusinessSchema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: biz.rating,
      reviewCount: biz.reviewCount || reviewsList.length,
    }
  }

  if (biz.operatingHours && Object.keys(biz.operatingHours).length > 0) {
    const hoursSpecs = Object.entries(biz.operatingHours).map(([day, hours]) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: day,
      description: String(hours)
    }))
    if (hoursSpecs.length > 0) {
      localBusinessSchema.openingHoursSpecification = hoursSpecs
    }
  }

  if (biz.services && biz.services.length > 0) {
    localBusinessSchema.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: `${biz.name} Services`,
      itemListElement: biz.services.map((svc) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: svc
        }
      }))
    }
  }

  const breadcrumbElements = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://www.biznestusa.com/',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: biz.main_category || biz.category || 'Directory',
      item: toCanonicalUrl(`category/${catId}`),
    },
    ...(subcategorySlug && subcategoryName ? [{
      '@type': 'ListItem',
      position: 3,
      name: subcategoryName,
      item: toCanonicalUrl(`category/${catId}/${subcategorySlug}`),
    }] : []),
    {
      '@type': 'ListItem',
      position: subcategorySlug && subcategoryName ? 4 : 3,
      name: biz.name,
      item: canonicalUrl,
    }
  ]

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbElements,
  }

  const faqPageSchema = (biz.faqs && biz.faqs.length > 0) ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: biz.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  } : null

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar />
      <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-5 text-xs text-slate-500 flex items-center flex-wrap gap-1.5">
        <Link href="/" className="hover:text-blue-700 underline">Home</Link>
        <span>/</span>
        <Link href={`/category/${catId}`} className="hover:text-blue-700 underline">{biz.main_category || biz.category || 'Directory'}</Link>
        {subcategorySlug && subcategoryName && (
          <>
            <span>/</span>
            <Link href={`/category/${catId}/${subcategorySlug}`} className="hover:text-blue-700 underline">{subcategoryName}</Link>
          </>
        )}
        <span>/</span>
        <span className="text-slate-800 font-medium">{biz.name}</span>
      </nav>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqPageSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
        />
      )}

      {/* Hero Cover Banner */}
      <section className="relative bg-slate-900 text-white overflow-hidden mt-3">
        <div className="h-64 sm:h-80 w-full relative">
          <Image
            src={biz.coverImage}
            alt={biz.name}
            fill
            priority
            fetchPriority="high"
            sizes="(max-width: 640px) 100vw, (max-width: 1200px) 90vw, 1200px"
            quality={80}
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/60 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-24 pb-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-white shrink-0">
                <Image
                  src={biz.logo}
                  alt={biz.name}
                  width={144}
                  height={144}
                  priority
                  unoptimized={typeof biz.logo === 'string' && (biz.logo.startsWith('data:') || biz.logo.startsWith('/'))}
                  sizes="(max-width: 640px) 112px, 144px"
                  quality={85}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {biz.category}
                  </span>
                  {biz.secondaryCategories && biz.secondaryCategories.slice(0, 2).map((cat) => (
                    <span key={cat} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-700/60 text-slate-300 border border-slate-600/40 hidden sm:inline-flex">
                      {cat}
                    </span>
                  ))}
                  {isUnclaimed ? (
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-700/80 text-slate-200 border border-slate-600 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                      <span>Unclaimed Listing</span>
                    </span>
                  ) : biz.operatingHours && Object.keys(biz.operatingHours).length > 0 ? (
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Open Now</span>
                    </span>
                  ) : null}
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <span>{biz.name}</span>
                  {!isUnclaimed && biz.verified && (
                    <span title="Verified Business" className="inline-flex">
                      <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                    </span>
                  )}
                </h1>

                <div className="flex items-center gap-4 text-xs text-slate-300 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{biz.address || `${biz.city}, United States`}</span>
                    {locationsList.length > 1 && ` (+${locationsList.length - 1} branches)`}
                  </span>
                  <span>•</span>
                  {biz.reviewCount > 0 ? (
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{biz.rating} ({biz.reviewCount} customer reviews)</span>
                    </span>
                  ) : (
                    <span className="text-slate-300 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-slate-400" />
                      <span>Unrated • No reviews yet</span>
                    </span>
                  )}
                  {biz.website && !biz.website.includes('biznestusa.com') && (
                    <>
                      <span>•</span>
                      <a
                        href={biz.website.startsWith('http') ? biz.website : `https://${biz.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-300 hover:text-white transition-colors underline decoration-blue-400/50 hover:decoration-white font-medium"
                        title={`Visit official website: ${biz.website}`}
                      >
                        <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>{biz.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</span>
                        <ExternalLink className="w-3 h-3 opacity-75" />
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions Client Island */}
            <BusinessHeroActions
              businessName={biz.name}
              isClaimed={!isUnclaimed}
            />
          </div>
        </div>
      </section>

      {/* Main Profile Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        
        {/* Verification Info / Unclaimed Callout */}
        {isUnclaimed ? (
          <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-amber-950 shadow-2xs">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-slate-900 text-sm">Unclaimed Directory Listing</p>
                <p className="text-slate-600 leading-relaxed">
                  This public directory record was independently added to BizNestUSA using publicly available business information. If you are the owner or authorized representative, you can claim this listing to verify details and manage inquiries.
                </p>
              </div>
            </div>
            <div className="shrink-0">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100/90 px-3 py-1.5 rounded-lg border border-amber-300">
                Directory Seed Record
              </span>
            </div>
          </div>
        ) : biz.verified && (
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-emerald-900 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Verified Profile:</strong> {VERIFICATION_DISCLAIMER}
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">

            {/* SEO Short Introduction Card */}
            {biz.introduction && (
              <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/40 to-slate-50 border border-blue-100/90 rounded-2xl p-5 sm:p-6 text-sm text-slate-800 leading-relaxed font-medium shadow-xs">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <p>{biz.introduction}</p>
                </div>
              </div>
            )}
            
            {/* About Section */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-xl font-extrabold text-slate-900">About {biz.name}</h2>
              <div className="text-sm text-slate-700 leading-relaxed space-y-3 whitespace-pre-line">
                {biz.description}
              </div>
            </div>

            {/* Detailed Products & Services Offered */}
            {biz.detailedServices && biz.detailedServices.length > 0 ? (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Products & Services Offered</h2>
                  <p className="text-xs text-slate-500 mt-1">Specialized real estate and construction solutions provided in Sargodha.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {biz.detailedServices.map((service, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-blue-200 hover:shadow-xs transition-all space-y-1.5">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>{service.title}</span>
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed pl-5.5">
                        {service.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              biz.services && biz.services.length > 0 && (
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
                  <h2 className="text-xl font-extrabold text-slate-900">Products & Services Offered</h2>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {biz.services.map((service) => (
                      <span key={service} className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800">
                        ✓ {service}
                      </span>
                    ))}
                  </div>
                </div>
              )
            )}

            {/* Custom Structured SEO Sections */}
            {biz.sections && biz.sections.length > 0 && (
              biz.sections.map((section, sIdx) => (
                <div key={sIdx} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
                  <h2 className="text-xl font-extrabold text-slate-900">{section.heading}</h2>
                  
                  {section.content && (
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                      {section.content}
                    </p>
                  )}

                  {section.subSections && section.subSections.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      {section.subSections.map((sub, subIdx) => (
                        <div key={subIdx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5">
                          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                            <span>{sub.heading}</span>
                          </h3>
                          {sub.content && (
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {sub.content}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {section.items && section.items.length > 0 && (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                      {section.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="text-xs font-medium text-slate-700 flex items-start gap-2 bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            )}

            {/* Frequently Asked Questions (FAQs) Section */}
            <BusinessFaqsSection
              businessName={biz.name}
              category={biz.category}
              city={biz.city}
              faqs={biz.faqs}
            />

            {/* Locations & Branches Card List */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span>Business Location & Branches ({locationsList.length})</span>
                </h2>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {Array.from(new Set(locationsList.map(l => l.city))).join(', ')}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-1">
                {locationsList.map((loc, idx) => (
                  <div 
                    key={idx}
                    className={`p-4 rounded-xl border space-y-2 transition-all ${
                      loc.isPrimary 
                        ? 'bg-blue-50/40 border-blue-200/80 shadow-xs' 
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        {loc.city} Branch
                      </span>
                      {loc.isPrimary && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-bold">
                          Primary Office
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {loc.address || 'Street address available on inquiry.'}
                    </p>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((loc.address || '') + ', ' + loc.city)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-extrabold text-blue-600 hover:text-blue-800 transition-colors pt-1"
                    >
                      <span>View on Google Maps</span>
                      <span>→</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Articles & Insights by this Business (Requirement 26) */}
            {publishedArticles.length > 0 && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      <span>Articles by {biz.name}</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Expert advice and informational resources published by this business.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                    {publishedArticles.length} {publishedArticles.length === 1 ? 'Article' : 'Articles'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {publishedArticles.map((art) => (
                    <article
                      key={art.id || art.slug}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-all space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400">
                          {art.publishedAt ? new Date(art.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                        </span>
                        <h3 className="font-extrabold text-slate-900 text-sm hover:text-blue-600 transition-colors line-clamp-2">
                          <Link href={`/blog/${art.slug}`}>{art.title}</Link>
                        </h3>
                        {art.excerpt && (
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {art.excerpt}
                          </p>
                        )}
                      </div>
                      <Link
                        href={`/blog/${art.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 pt-2"
                      >
                        <span>Read Full Article</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* Deferred / Lazy Map */}
            <LazyMap address={biz.address} city={biz.city} name={biz.name} />

          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Contact {biz.name}</h2>
              
              <div className="space-y-2.5">
                {biz.website && !biz.website.includes('biznestusa.com') && (
                  <a
                    href={biz.website.startsWith('http') ? biz.website : `https://${biz.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Visit Official Website</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>
                )}

                <a
                  href={`tel:${biz.phone}`}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call {biz.phone}</span>
                </a>

                {biz.whatsapp && (
                  <a
                    href={`https://wa.me/${biz.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Inquiry</span>
                  </a>
                )}

                {biz.email && (
                  <a
                    href={`mailto:${biz.email}`}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Send Email</span>
                  </a>
                )}

                {/* Brand Authority & Social Profiles (Google Business Profile, Facebook, Instagram, LinkedIn) */}
                {(biz.googleBusinessProfile || biz.facebookUrl || biz.instagramUrl || biz.linkedinUrl) && (
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider block flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Brand Authority Profiles</span>
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {biz.googleBusinessProfile && (
                        <a
                          href={biz.googleBusinessProfile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl border border-blue-200 flex items-center justify-between transition-colors"
                        >
                          <span className="truncate">Google Profile</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      )}
                      {biz.facebookUrl && (
                        <a
                          href={biz.facebookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 flex items-center justify-between transition-colors"
                        >
                          <span className="truncate">Facebook</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      )}
                      {biz.instagramUrl && (
                        <a
                          href={biz.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold rounded-xl border border-pink-200 flex items-center justify-between transition-colors"
                        >
                          <span className="truncate">Instagram</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      )}
                      {biz.linkedinUrl && (
                        <a
                          href={biz.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl border border-indigo-200 flex items-center justify-between transition-colors"
                        >
                          <span className="truncate">LinkedIn</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Key Business Highlights */}
            {biz.features && biz.features.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3">
                <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span>Business Highlights</span>
                </h2>
                <div className="space-y-2 text-xs">
                  {biz.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-slate-700 py-1 border-b border-slate-50 last:border-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Operating Hours (Only when verified data exists) */}
            {biz.operatingHours && Object.keys(biz.operatingHours).length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3">
                <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Operating Hours</span>
                </h2>
                <div className="space-y-2 text-xs">
                  {Object.entries(biz.operatingHours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">{day}</span>
                      <span className="font-bold text-slate-900">{hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Directory Navigation Links */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3">
              <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Explore Directory</span>
              </h2>
              <div className="space-y-2 text-xs">
                {subcategorySlug && subcategoryName && (
                  <Link
                    href={`/category/${catId}/${subcategorySlug}`}
                    className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-indigo-700 font-bold hover:bg-indigo-100 transition-colors flex items-center justify-between"
                  >
                    <span>{subcategoryName} in the USA</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
                {citySlug && (
                  <Link
                    href={`/category/${catId}/${citySlug}`}
                    className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-blue-700 font-bold hover:bg-blue-100 transition-colors flex items-center justify-between"
                  >
                    <span>{biz.category} in {biz.city}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
                {citySlug && (
                  <Link
                    href={`/city/${citySlug}`}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 font-semibold hover:bg-slate-100 transition-colors flex items-center justify-between"
                  >
                    <span>All Businesses in {biz.city}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
                <Link
                  href={`/category/${catId}`}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 font-semibold hover:bg-slate-100 transition-colors flex items-center justify-between"
                >
                  <span>All {biz.category} in the USA</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Related Businesses Section */}
        {relatedBusinesses.length > 0 && (
          <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span>Related Businesses in {biz.city} & {biz.category}</span>
              </h2>
              <Link href={`/category/${catId}/${citySlug}`} className="text-xs font-bold text-blue-600 hover:underline">
                View All in {biz.city} &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
              {relatedBusinesses.map((rel) => (
                <div
                  key={rel.id}
                  className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <Image
                        src={rel.logo}
                        alt={rel.name}
                        width={36}
                        height={36}
                        loading="lazy"
                        sizes="36px"
                        className="w-9 h-9 rounded-lg object-cover border border-slate-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <Link
                          href={`/business/${rel.slug}`}
                          className="font-bold text-slate-900 text-xs hover:text-blue-600 truncate block"
                        >
                          {rel.name}
                        </Link>
                        <p className="text-[11px] text-slate-500">{rel.city}</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {rel.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-amber-600 font-bold">
                      {rel.reviewCount > 0 && rel.rating > 0 ? `★ ${rel.rating}` : 'Active'}
                    </span>
                    <Link
                      href={`/business/${rel.slug}`}
                      className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Database Customer Reviews */}
        <BusinessReviewsSection
          businessName={biz.name}
          initialReviews={reviewsList}
          initialRating={biz.rating || 0}
          initialReviewCount={biz.reviewCount || reviewsList.length}
        />

        {/* Data Provenance & Public Record Notice */}
        {isSeed && (
          <section className="bg-slate-100/70 border border-slate-200/90 rounded-2xl p-5 sm:p-6 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
              <Info className="w-4 h-4 text-slate-500" />
              <span>Listing Provenance & Public Directory Notice</span>
            </div>
            <p className="leading-relaxed">
              This listing for <strong>{biz.name}</strong> was independently indexed from publicly accessible records for the BizNestUSA business directory.
              {biz.source_checked_date ? ` Record checked: ${biz.source_checked_date}.` : ''}
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Inclusion in BizNestUSA does not imply endorsement, formal affiliation, or official sponsorship. Business owners or authorized representatives may claim this listing to verify or update information at any time.
            </p>
          </section>
        )}

      </main>

      <Footer />
    </div>
  )
}
