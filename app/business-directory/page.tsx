import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { BUSINESS_CATEGORIES, US_STATES, TOP_CITIES } from '@/lib/data'
import { Building2, MapPin, CheckCircle2, ShieldCheck, Search, Plus, ArrowRight, Grid } from 'lucide-react'

export const metadata: Metadata = {
  title: 'USA Business Directory | Discover Verified Local Businesses & Services',
  description: 'Search America\'s verified business directory across all 50 states. Discover local home service contractors, healthcare clinics, automotive shops, and professional firms.',
  alternates: {
    canonical: 'https://www.biznestusa.com/business-directory/',
  },
  openGraph: {
    title: 'USA Business Directory | Discover Verified Local Businesses & Services',
    description: 'Explore verified US businesses by category and metropolitan area. Free self-service business listing profiles.',
    url: 'https://www.biznestusa.com/business-directory/',
    type: 'website',
  },
}

export default function BusinessDirectoryHub() {
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'USA Business Directory',
    description: 'Comprehensive directory of verified local businesses, licensed trade contractors, and commercial providers across all 50 US states.',
    url: 'https://www.biznestusa.com/business-directory/',
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.biznestusa.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Business Directory',
        item: 'https://www.biznestusa.com/business-directory/',
      },
    ],
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Navbar />

      <main className="flex-1 pb-16">
        {/* Hero Section */}
        <section className="bg-white border-b border-slate-200/80 py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                <Building2 className="w-3.5 h-3.5" />
                <span>Cornerstone Directory Hub</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
                USA Business Directory &amp; Local Service Hub
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                Connect with verified local businesses, licensed trade contractors, corporate consultants, and specialty service providers across all 50 states and over 250 metropolitan hubs.
              </p>
              
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href="/search"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Directory</span>
                </Link>
                <Link
                  href="/add-business"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>List Your Business Free</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
          
          {/* Browse by Category */}
          <section className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                <Grid className="w-6 h-6 text-blue-600" />
                <span>Browse by Industry &amp; Trade</span>
              </h2>
              <Link href="/categories" className="text-xs font-bold text-blue-600 hover:underline">
                View All Categories →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {BUSINESS_CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-base text-slate-900">
                      <Link href={`/category/${cat.id}`} className="hover:text-blue-600">
                        {cat.name}
                      </Link>
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {cat.desc}
                  </p>
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {cat.subcategories.slice(0, 5).map((sub) => (
                      <span
                        key={sub}
                        className="px-2 py-0.5 bg-slate-50 text-slate-600 rounded text-[11px] font-medium border border-slate-100"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                  <div className="pt-3">
                    <Link
                      href={`/category/${cat.id}`}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <span>Explore {cat.name} Listings</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Top Metro Areas */}
          <section className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-emerald-600" />
                <span>Featured Metropolitan Directories</span>
              </h2>
              <Link href="/cities" className="text-xs font-bold text-emerald-600 hover:underline">
                View All US Cities →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {TOP_CITIES.map((city) => {
                const slug = city.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                return (
                  <Link
                    key={city}
                    href={`/city/${slug}`}
                    className="p-3.5 bg-white rounded-xl border border-slate-200 text-center hover:border-emerald-300 hover:bg-emerald-50/30 transition-all block group"
                  >
                    <span className="font-bold text-xs text-slate-800 group-hover:text-emerald-700 block">
                      {city}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Local Listings
                    </span>
                  </Link>
                )
              })}
            </div>
          </section>

          {/* Why List With Us Banner */}
          <section className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xs space-y-6">
            <div className="max-w-2xl space-y-2">
              <h3 className="text-2xl font-extrabold text-slate-900">
                Self-Service Business Profiles That Drive Customer Calls
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                When you list your business on BizNest USA, you instantly receive a dedicated, crawlable public landing page (e.g., <code className="text-blue-600 font-mono text-xs">/businesses/your-company-name/</code>) featuring your logo, contact numbers, address, verified operating hours, and comprehensive service list.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>100% Free Public Page</span>
                </div>
                <p className="text-xs text-slate-500">No hidden paywalls or contact masking. Customers reach you directly.</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Local SEO Citations</span>
                </div>
                <p className="text-xs text-slate-500">Consistent NAP data reinforced with Schema.org LocalBusiness structured data.</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Post Hiring Vacancies</span>
                </div>
                <p className="text-xs text-slate-500">Connect job openings directly to your verified business profile.</p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/add-business"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors"
              >
                <span>Add Your Business in 2 Minutes</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  )
}
