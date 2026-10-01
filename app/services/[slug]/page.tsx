import React from 'react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import {
  POPULAR_SERVICES,
  getServiceBySlug,
  ServiceDefinition
} from '@/lib/services-data'
import { getAllBusinesses } from '@/lib/db-service'
import { getAllProfessionals } from '@/lib/professional-service'
import { toCanonicalUrl, VERIFICATION_DISCLAIMER } from '@/lib/directory-helpers'
import { TOP_CITIES } from '@/lib/data'
import {
  ShieldCheck,
  Star,
  CheckCircle2,
  MapPin,
  Phone,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Award,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Clock,
  Sparkles,
  Search,
  Wrench,
  Check,
  UserCheck
} from 'lucide-react'

export const revalidate = 86400 // 24-hour ISR revalidation
export const dynamicParams = false

export async function generateStaticParams() {
  return POPULAR_SERVICES.map((srv) => ({
    slug: srv.slug,
  }))
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params
  const service = getServiceBySlug(params.slug)
  if (!service) {
    return {
      title: 'Service Not Found | BizNestUSA',
      robots: { index: false, follow: false },
    }
  }

  const canonicalUrl = toCanonicalUrl(`services/${service.slug}`)
  return {
    title: service.metaTitle,
    description: service.metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: service.metaTitle,
      description: service.metaDescription,
      url: canonicalUrl,
      siteName: 'BizNestUSA',
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: service.metaTitle,
      description: service.metaDescription,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function ServiceDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params
  const service = getServiceBySlug(params.slug)
  if (!service) notFound()

  // Fetch approved USA businesses and professionals
  const [allBiz, allPros] = await Promise.all([
    getAllBusinesses(false).catch(() => []),
    getAllProfessionals(false).catch(() => [])
  ])

  // Filter businesses matching this service
  const serviceKeywords = service.searchKeywords.map(k => k.toLowerCase())
  const directMatchingBiz = allBiz.filter(biz => {
    const textBlob = `${biz.name} ${biz.category} ${biz.description || ''} ${(biz.services || []).join(' ')} ${(biz.detailedServices || []).join(' ')}`.toLowerCase()
    return serviceKeywords.some(kw => textBlob.includes(kw))
  })

  // Fallback to parent category businesses if direct match is small
  const parentCategoryBiz = allBiz.filter(b => b.category === service.parentCategoryId && !directMatchingBiz.some(d => d.id === b.id))
  const displayedBiz = [...directMatchingBiz, ...parentCategoryBiz].slice(0, 8)

  // Filter matching professionals
  const matchingPros = allPros.filter(pro => {
    const textBlob = `${pro.name} ${pro.title} ${pro.category} ${pro.bio || ''} ${(pro.skills || []).join(' ')}`.toLowerCase()
    return serviceKeywords.some(kw => textBlob.includes(kw))
  }).slice(0, 4)

  // Related services
  const relatedServices = POPULAR_SERVICES.filter(s =>
    service.relatedSlugs.includes(s.slug) || (s.parentCategoryId === service.parentCategoryId && s.slug !== service.slug)
  ).slice(0, 6)

  const currentPath = `services/${service.slug}`
  const canonicalUrl = toCanonicalUrl(currentPath)

  // Google Schema Markup
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
        name: service.parentCategoryName,
        item: toCanonicalUrl(`category/${service.parentCategoryId}`)
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: service.title,
        item: canonicalUrl
      }
    ]
  }

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    serviceType: service.singularTitle,
    description: service.heroDescription,
    url: canonicalUrl,
    areaServed: {
      '@type': 'Country',
      name: 'United States'
    },
    provider: {
      '@type': 'Organization',
      name: 'BizNestUSA Verified Directory',
      url: 'https://biznestusa.com/'
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      price: service.typicalCost
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${service.title} Services Offered in USA`,
      itemListElement: service.commonServices.map((cs, idx) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: cs
        }
      }))
    }
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: service.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <Navbar />

      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-b from-[#0a192f] via-[#0f2444] to-[#1e3a66] text-white pt-10 pb-16 overflow-hidden">
        {/* Decorative Grid & Glow */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-slate-300 font-medium flex-wrap">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <Link href={`/category/${service.parentCategoryId}`} className="hover:text-white transition-colors">
              {service.parentCategoryName}
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-blue-300 font-semibold">{service.title}</span>
          </nav>

          <div className="max-w-4xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold backdrop-blur-sm shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{service.badge}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
              {service.h1}
            </h1>

            <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-3xl font-normal">
              {service.heroDescription}
            </p>

            {/* Quick Metrics Bar */}
            <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <DollarSign className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">Average US Rate</div>
                  <div className="text-xs sm:text-sm font-bold text-white">{service.typicalCost}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 sm:col-span-1 lg:col-span-2">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-blue-300" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">US Licensing &amp; Compliance</div>
                  <div className="text-xs sm:text-sm text-slate-200 truncate font-medium" title={service.licensingRequirements}>
                    {service.licensingRequirements}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN TWO-COLUMN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 8 COLUMNS: MAIN DIRECTORY CONTENT */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Trust & Verification Standards Banner */}
            <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-4 flex items-start gap-3 text-xs text-emerald-950 shadow-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>BizNestUSA Verification Standard:</strong> All {service.title.toLowerCase()} and contractors listed are verified US-based businesses. {VERIFICATION_DISCLAIMER}
              </p>
            </div>

            {/* SPECIALIZED SERVICES OFFERED IN THIS FIELD */}
            <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-5 shadow-xs">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Common {service.title} Services in the USA
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Whether for residential routine maintenance or urgent commercial repairs, licensed {service.singularTitle.toLowerCase()} contractors in the United States commonly provide these certified solutions:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {service.commonServices.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3.5 bg-slate-50 hover:bg-blue-50/50 rounded-2xl border border-slate-200/80 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-semibold text-slate-800">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* VERIFIED MATCHING BUSINESSES */}
            <section className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    Verified {service.title} &amp; Contractors
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Showing top-rated American businesses specializing in {service.title.toLowerCase()}
                  </p>
                </div>
                <Link
                  href="/add-business"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  List Your {service.singularTitle} Business Free
                </Link>
              </div>

              {displayedBiz.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 shadow-xs">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <Search className="w-7 h-7" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h3 className="text-base font-bold text-slate-900">Be the First Verified {service.singularTitle}</h3>
                    <p className="text-xs text-slate-500">
                      We are currently vetting new licensed {service.title.toLowerCase()} across US metros. Register your company today to receive customer inquiries.
                    </p>
                  </div>
                  <Link
                    href="/add-business"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all"
                  >
                    Add Business Profile
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {displayedBiz.map((biz) => {
                    const primaryCity = biz.locations?.[0]?.city || biz.city || 'United States'
                    const primaryState = biz.locations?.[0]?.state || biz.state || ''
                    const displayLocation = primaryState ? `${primaryCity}, ${primaryState}` : primaryCity

                    return (
                      <article
                        key={biz.id}
                        className="bg-white rounded-3xl border border-slate-200/90 hover:border-blue-300 p-5 sm:p-6 transition-all hover:shadow-md flex flex-col sm:flex-row gap-5 items-start justify-between group"
                      >
                        <div className="flex gap-4 items-start flex-1 min-w-0">
                          {/* Business Logo / Thumbnail */}
                          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            <Image
                              src={biz.logo || biz.coverImage || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=200&q=80'}
                              alt={biz.name}
                              fill
                              sizes="80px"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>

                          {/* Info */}
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                Verified US Provider
                              </span>
                              {biz.plan === 'priority_5' && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                  Top Rated
                                </span>
                              )}
                            </div>

                            <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                              <Link href={`/business/${biz.slug}`}>
                                {biz.name}
                              </Link>
                            </h3>

                            <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                              <span className="flex items-center gap-1 font-medium text-slate-700">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {displayLocation}
                              </span>
                              {biz.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                                  {biz.phone}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed pt-1">
                              {biz.description}
                            </p>

                            {biz.services && biz.services.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap pt-1.5">
                                {biz.services.slice(0, 3).map((srv, sIdx) => (
                                  <span
                                    key={sIdx}
                                    className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
                                  >
                                    {srv}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action CTA */}
                        <div className="sm:self-center shrink-0 w-full sm:w-auto pt-2 sm:pt-0">
                          <Link
                            href={`/business/${biz.slug}`}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all"
                          >
                            View Profile
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </section>

            {/* VERIFIED MATCHING PROFESSIONALS */}
            {matchingPros.length > 0 && (
              <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-5 shadow-xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                      Licensed Specialists &amp; Master Technicians
                    </h2>
                  </div>
                  <Link
                    href="/add-professional"
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors"
                  >
                    + Join as Professional
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {matchingPros.map((pro) => (
                    <div
                      key={pro.id}
                      className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-blue-300 transition-all space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                          <Image
                            src={pro.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                            alt={pro.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-slate-900 truncate">{pro.name}</h4>
                          <p className="text-xs text-blue-600 font-medium truncate">{pro.title}</p>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {pro.city}, {pro.state}
                          </p>
                        </div>
                      </div>
                      {pro.skills && pro.skills.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          {pro.skills.slice(0, 3).map((sk, skIdx) => (
                            <span key={skIdx} className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                              {sk}
                            </span>
                          ))}
                        </div>
                      )}
                      <Link
                        href={`/professionals/${pro.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 hover:text-blue-600"
                      >
                        View Credentials
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* PRICING & LICENSING STANDARDS SECTION */}
            <section className="bg-gradient-to-br from-slate-900 to-[#1e3a66] text-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-lg">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-300">USA Industry Guide</span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  How Much Do {service.title} Cost in the United States?
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                Plumbing, roofing, and contractor pricing varies based on local state codes, permit costs, and emergency status. Here is what American homeowners and property managers can expect:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Clock className="w-4 h-4" />
                    <span>Hourly &amp; Project Rates</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    Typical hourly rates range from <strong>{service.typicalCost}</strong>. Flat-rate estimates are common for well-defined fixture replacements or inspections.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Licensing &amp; Insurance</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    Always confirm contractors possess minimum $1M general liability insurance, state license validation, and local municipal bond protection.
                  </p>
                </div>
              </div>
            </section>

            {/* FREQUENTLY ASKED QUESTIONS (ACCORDION & SCHEMA BACKED) */}
            <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-blue-600">
                  <HelpCircle className="w-5 h-5" />
                  <span className="text-xs font-extrabold uppercase tracking-wider">Expert Insights</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Frequently Asked Questions About {service.title} in the USA
                </h2>
              </div>

              <div className="divide-y divide-slate-100">
                {service.faqs.map((faq, idx) => (
                  <details key={idx} className="group py-4 text-left cursor-pointer first:pt-0 last:pb-0" open={idx === 0}>
                    <summary className="flex items-center justify-between text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors list-none">
                      <span>{faq.question}</span>
                      <span className="ml-4 w-6 h-6 rounded-full bg-slate-100 group-hover:bg-blue-50 text-slate-600 group-hover:text-blue-600 flex items-center justify-center shrink-0 transition-transform group-open:rotate-180">
                        ↓
                      </span>
                    </summary>
                    <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed pl-1">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>

            {/* TOP US CITIES JUMP LINKS */}
            <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Find Professional {service.title} Across Top US Metros
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                Browse verified {service.singularTitle.toLowerCase()} contractors by major metropolitan area:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-2">
                {TOP_CITIES.slice(0, 16).map((city) => {
                  const citySlug = city.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                  return (
                    <Link
                      key={city}
                      href={`/category/${service.parentCategoryId}/${citySlug}`}
                      className="p-2.5 rounded-xl border border-slate-200/70 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/50 text-xs font-semibold text-slate-700 hover:text-blue-700 transition-all text-center truncate"
                      title={`${service.title} in ${city}`}
                    >
                      {service.title} in {city}
                    </Link>
                  )
                })}
              </div>
            </section>

            {/* RELATED SUB-SERVICES */}
            {relatedServices.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Related Home &amp; Trade Services
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {relatedServices.map((rel) => (
                    <Link
                      key={rel.slug}
                      href={`/services/${rel.slug}`}
                      className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all group space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {rel.title}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {rel.badge}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* RIGHT 4 COLUMNS: STICKY SIDEBAR CTA & VERIFICATION BADGES */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* Business Listing CTA */}
            <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>For Contractors &amp; Firms</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-white tracking-tight">
                  Are You a Licensed {service.singularTitle}?
                </h3>
                <p className="text-xs text-blue-100 leading-relaxed">
                  Join thousands of verified US service providers. Get discovered by local customers searching for certified {service.title.toLowerCase()} in your service area.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2 text-xs text-blue-100">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Google-indexed business profile</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-blue-100">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Verified credentials badge</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-blue-100">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Direct client phone &amp; website clicks</span>
                </div>
              </div>

              <Link
                href="/add-business"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-blue-50 text-blue-950 text-xs font-extrabold shadow-md transition-all"
              >
                Register Your Business Free
                <ArrowRight className="w-4 h-4 text-blue-700" />
              </Link>
            </div>

            {/* Category Directory Link */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 space-y-3 shadow-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Parent Category
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                This page is part of our comprehensive <strong>{service.parentCategoryName}</strong> directory.
              </p>
              <Link
                href={`/category/${service.parentCategoryId}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900"
              >
                Browse All {service.parentCategoryName}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Need Emergency Service Help */}
            <div className="bg-amber-50/80 border border-amber-200/90 rounded-3xl p-5 space-y-3 text-amber-950">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-700" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Hiring Tip
                </h4>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                Before authorizing major repairs, request a written contract with clear labor warranties and verify the contractor holds active worker’s compensation and liability coverage.
              </p>
            </div>

          </aside>

        </div>
      </main>

      <Footer />
    </div>
  )
}
