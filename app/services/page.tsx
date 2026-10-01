import React from 'react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import Link from 'next/link'
import { Metadata } from 'next'
import { POPULAR_SERVICES } from '@/lib/services-data'
import { BUSINESS_CATEGORIES } from '@/lib/data'
import { toCanonicalUrl } from '@/lib/directory-helpers'
import {
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Wrench,
  Building2,
  Stethoscope,
  Briefcase,
  Car,
  Laptop,
  CheckCircle2,
  DollarSign
} from 'lucide-react'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'All Professional & Home Services in USA | Verified Contractors & Specialists | BizNestUSA',
  description: 'Browse specialized, state-licensed professional contractors and local services across all 50 states. Dedicated landing pages for plumbers, roofers, electricians, HVAC, and more on BizNestUSA.',
  alternates: {
    canonical: toCanonicalUrl('services'),
  },
  openGraph: {
    title: 'All Professional & Home Services in USA | BizNestUSA',
    description: 'Browse specialized, state-licensed professional contractors and local services across all 50 states.',
    url: toCanonicalUrl('services'),
    siteName: 'BizNestUSA',
    locale: 'en_US',
    type: 'website',
  },
}

export default function AllServicesIndexPage() {
  // Group services by parent category
  const categoriesWithServices = BUSINESS_CATEGORIES.map(cat => {
    const services = POPULAR_SERVICES.filter(s => s.parentCategoryId === cat.id)
    return {
      ...cat,
      services
    }
  }).filter(c => c.services.length > 0)

  // Quick category icon selector
  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'home-services':
        return <Wrench className="w-5 h-5 text-sky-600" />
      case 'professional-services':
        return <Briefcase className="w-5 h-5 text-indigo-600" />
      case 'health-wellness':
        return <Stethoscope className="w-5 h-5 text-rose-600" />
      case 'automotive':
        return <Car className="w-5 h-5 text-teal-600" />
      case 'technology':
        return <Laptop className="w-5 h-5 text-blue-600" />
      default:
        return <Building2 className="w-5 h-5 text-slate-600" />
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
        name: 'Services Directory',
        item: toCanonicalUrl('services')
      }
    ]
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-b from-[#0a192f] via-[#0f2444] to-[#1e3a66] text-white pt-12 pb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-slate-300 font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-blue-300 font-semibold">Services</span>
          </nav>

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>United States Specialized Contractor Hub</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Specialized Professional &amp; Home Services in the USA
            </h1>

            <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-normal">
              Find dedicated landing pages for licensed contractors, skilled trades, and certified specialists across all 50 states. Compare US average pricing, credentialing standards, and verified companies.
            </p>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT: GROUPED SERVICES */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-12">
        {categoriesWithServices.map((group) => (
          <section key={group.id} className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                  {getCategoryIcon(group.id)}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {group.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    {group.desc}
                  </p>
                </div>
              </div>
              <Link
                href={`/category/${group.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors"
              >
                View Category Hub
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {group.services.map((srv) => (
                <Link
                  key={srv.slug}
                  href={`/services/${srv.slug}`}
                  className="bg-white rounded-3xl border border-slate-200/90 hover:border-blue-400 hover:shadow-md p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between group space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                        {srv.singularTitle}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                        Explore
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {srv.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {srv.heroDescription}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-slate-700 font-semibold truncate max-w-[190px]">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      {srv.typicalCost.split('(')[0]}
                    </span>
                    <span className="text-[11px] text-blue-600 font-bold group-hover:underline">
                      View Page →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {/* BOTTOM CTA: ADD YOUR SERVICE */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-bold border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Contractor Registration
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Do You Offer Professional Services in the USA?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Create your verified business listing today on BizNestUSA. Reach thousands of American clients seeking licensed plumbers, roofers, electricians, and certified local professionals.
            </p>
            <div className="pt-3">
              <Link
                href="/add-business"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all"
              >
                Register Your Business Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
