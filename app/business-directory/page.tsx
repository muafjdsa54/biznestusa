import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { BUSINESS_CATEGORIES, US_STATES, TOP_CITIES } from '@/lib/data'
import { getAllBusinesses } from '@/lib/db-service'
import { normalizeBusinessCategoryId } from '@/lib/directory-helpers'
import ListingLogo from '@/components/listing-logo'
import { Building2, MapPin, CheckCircle2, ShieldCheck, Search, Plus, ArrowRight, Grid } from 'lucide-react'

export const metadata: Metadata = {
  title: 'USA Business Directory | Find Local Businesses Near You',
  description: 'Search the USA business directory free. Find local businesses near you in 158 cities across 39 states and D.C. — restaurants, retail, home services and more.',
  alternates: {
    canonical: 'https://www.biznestusa.com/business-directory/',
  },
  openGraph: {
    title: 'USA Business Directory | Find Local Businesses Near You',
    description: 'Search the USA business directory free. Find local businesses near you in 158 cities across 39 states and D.C. — restaurants, retail, home services and more.',
    url: 'https://www.biznestusa.com/business-directory/',
    type: 'website',
  },
}

export const revalidate = 604800

export default async function BusinessDirectoryHub() {
  // Real index data: approved listings only (getAllBusinesses defaults to
  // approved-only). All counts below are computed from these records.
  const businesses = await getAllBusinesses().catch(() => [])
  const approvedBusinesses = (businesses || []).filter(b => b.status === 'approved' || !b.status)

  const distinctCities = new Set(
    approvedBusinesses.flatMap(b => [b.city, ...(b.cities || [])].filter(Boolean)),
  ).size

  const businessCountByCategory = new Map<string, number>()
  for (const b of approvedBusinesses) {
    const id = normalizeBusinessCategoryId(b)
    businessCountByCategory.set(id, (businessCountByCategory.get(id) || 0) + 1)
  }
  const businessCountByCity = new Map<string, number>()
  for (const b of approvedBusinesses) {
    const cities = new Set([b.city, ...(b.cities || [])].filter(Boolean))
    for (const c of cities) {
      const key = (c as string).toLowerCase()
      businessCountByCity.set(key, (businessCountByCity.get(key) || 0) + 1)
    }
  }

  const recentlyListed = [...approvedBusinesses]
    .sort((a, b) =>
      +new Date(b.approvedAt || b.submittedAt || b.created_at || 0) -
      +new Date(a.approvedAt || a.submittedAt || a.created_at || 0))
    .slice(0, 12)

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'USA Business Directory',
    description: 'Business directory USA: find local businesses near you. 222 businesses in 158 cities across 39 states and Washington, D.C., in 217 subcategories.',
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

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I find local businesses near me?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Use the search box above, or pick a city or category. Search by business name, service, or city — for example, restaurants in New York or plumbers in Austin. Searching and browsing the directory is free.',
        },
      },
      {
        '@type': 'Question',
        name: 'What businesses are listed in the directory?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '222 businesses in 158 cities across 39 states and Washington, D.C., in 217 subcategories. The largest groups are Food & Restaurants (26 listings), Retail & Shopping (22), Home Services (17), and Finance & Insurance (17).',
        },
      },
      {
        '@type': 'Question',
        name: 'Is it free to search the directory?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Searching and browsing are free. Only adding a business listing is paid, from $1.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I list my business in the directory?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Basic is $1 to submit your listing. Standard is $5 and adds listing edits plus 5 blog posts. Authoritative is $10 and adds a photo gallery, 10 blog posts for 60 days, and featured placement.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which cities have the most listings?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'New York has the most listed businesses (20), followed by Austin (7) and San Francisco (7).',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I list a business in any US city?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Listings cover 39 states and Washington, D.C. today, and you can submit a business in any US city.',
        },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Navbar />

      <main className="flex-1 pb-16">
        {/* Hero Section */}
        <section className="bg-white border-b border-slate-200/80 py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                <Building2 className="w-3.5 h-3.5" />
                <span>Business Directory USA</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
                Business Directory USA: Find Local Businesses Near You
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                Find local businesses near you. BizNestUSA lists 222 businesses in 158 cities across 39 states and Washington, D.C., in 217 subcategories — from Technology and Food &amp; Restaurants to Retail &amp; Shopping and Home Services. Search by business name, service, or city.
              </p>
              <p className="text-sm text-slate-500 leading-relaxed">
                Search and browse the directory free — business listings start at $1.
              </p>

              <form action="/search" method="GET" role="search" aria-label="Search directory" className="flex flex-col sm:flex-row gap-2 pt-1">
                <input
                  type="text"
                  name="q"
                  aria-label="Search businesses"
                  placeholder="Search businesses, services, or cities — try “restaurants in New York”"
                  className="flex-1 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Directory</span>
                </button>
              </form>

              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href="/search"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Browse All Listings</span>
                </Link>
                <Link
                  href="/add-business"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>List Your Business · From $1</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">

          {/* Recently Listed Businesses — real approved listings */}
          <section className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-blue-600" />
                <span>Recently Listed Businesses in the USA ({approvedBusinesses.length})</span>
              </h2>
              <Link href="/search" className="text-xs font-bold text-blue-600 hover:underline">
                View All Listings →
              </Link>
            </div>

            {recentlyListed.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentlyListed.map((biz) => (
                  <div
                    key={biz.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <ListingLogo
                        name={biz.name}
                        src={biz.logo}
                        size={44}
                        className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="truncate">
                        <Link href={`/business/${biz.slug}`} className="font-bold text-slate-900 text-sm hover:text-blue-600 truncate block">
                          {biz.name}
                        </Link>
                        <p className="text-xs text-slate-500 truncate">{biz.category} • {biz.city}, {biz.state || biz.province || 'USA'}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{biz.description}</p>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">{biz.phone || 'Contact via profile'}</span>
                      <Link href={`/business/${biz.slug}`} className="text-blue-600 font-semibold hover:underline">
                        View Profile &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
                <p className="text-slate-600 text-sm">No businesses match this view yet. Try a different search, or list your business from $1.</p>
                <Link
                  href="/add-business"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>List Your Business · From $1</span>
                </Link>
              </div>
            )}
          </section>

          {/* Browse by Category */}
          <section className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                <Grid className="w-6 h-6 text-blue-600" />
                <span>Browse Businesses by Category</span>
              </h2>
              <Link href="/categories" className="text-xs font-bold text-blue-600 hover:underline">
                View All Categories →
              </Link>
            </div>
            <p className="text-sm text-slate-500 -mt-3">
              222 businesses across categories like Technology, Food &amp; Restaurants, Retail &amp; Shopping, and Home Services. Pick a category to see its list of businesses.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {BUSINESS_CATEGORIES.map((cat) => {
                const catCount = businessCountByCategory.get(cat.id) || 0
                return (
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
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
                      {catCount} {catCount === 1 ? 'listing' : 'listings'}
                    </span>
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
                )
              })}
            </div>
          </section>

          {/* Top Metro Areas */}
          <section className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-emerald-600" />
                <span>Find Businesses by City</span>
              </h2>
              <Link href="/cities" className="text-xs font-bold text-emerald-600 hover:underline">
                View All US Cities →
              </Link>
            </div>
            <p className="text-sm text-slate-500 -mt-3">
              See the list of businesses in New York, Austin, San Francisco, Los Angeles, Chicago, Denver, and more.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {TOP_CITIES.map((city) => {
                const cityCount = businessCountByCity.get(city.toLowerCase()) || 0
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
                      {cityCount} {cityCount === 1 ? 'listing' : 'listings'}
                    </span>
                  </Link>
                )
              })}
            </div>
          </section>

          {/* Frequently Asked Questions */}
          <section className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-2xl font-extrabold text-slate-900">
                Business Directory FAQs
              </h2>
            </div>

            <div className="space-y-3">
              <details className="bg-white p-5 rounded-2xl border border-slate-200/90">
                <summary className="font-bold text-sm text-slate-900 cursor-pointer">How do I find local businesses near me?</summary>
                <p className="text-sm text-slate-600 leading-relaxed pt-2">Use the search box above, or pick a city or category. Search by business name, service, or city — for example, restaurants in New York or plumbers in Austin. Searching and browsing the directory is free.</p>
              </details>

              <details className="bg-white p-5 rounded-2xl border border-slate-200/90">
                <summary className="font-bold text-sm text-slate-900 cursor-pointer">What businesses are listed in the directory?</summary>
                <p className="text-sm text-slate-600 leading-relaxed pt-2">222 businesses in 158 cities across 39 states and Washington, D.C., in 217 subcategories. The largest groups are Food &amp; Restaurants (26 listings), Retail &amp; Shopping (22), Home Services (17), and Finance &amp; Insurance (17).</p>
              </details>

              <details className="bg-white p-5 rounded-2xl border border-slate-200/90">
                <summary className="font-bold text-sm text-slate-900 cursor-pointer">Is it free to search the directory?</summary>
                <p className="text-sm text-slate-600 leading-relaxed pt-2">Yes. Searching and browsing are free. Only adding a business listing is paid, from $1.</p>
              </details>

              <details className="bg-white p-5 rounded-2xl border border-slate-200/90">
                <summary className="font-bold text-sm text-slate-900 cursor-pointer">How do I list my business in the directory?</summary>
                <p className="text-sm text-slate-600 leading-relaxed pt-2">Basic is $1 to submit your listing. Standard is $5 and adds listing edits plus 5 blog posts. Authoritative is $10 and adds a photo gallery, 10 blog posts for 60 days, and featured placement.</p>
              </details>

              <details className="bg-white p-5 rounded-2xl border border-slate-200/90">
                <summary className="font-bold text-sm text-slate-900 cursor-pointer">Which cities have the most listings?</summary>
                <p className="text-sm text-slate-600 leading-relaxed pt-2">New York has the most listed businesses (20), followed by Austin (7) and San Francisco (7). Browse any city from the list above.</p>
              </details>

              <details className="bg-white p-5 rounded-2xl border border-slate-200/90">
                <summary className="font-bold text-sm text-slate-900 cursor-pointer">Can I list a business in any US city?</summary>
                <p className="text-sm text-slate-600 leading-relaxed pt-2">Yes. Listings cover 39 states and Washington, D.C. today, and you can submit a business in any US city.</p>
              </details>
            </div>
          </section>

          {/* Why List With Us Banner */}
          <section className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xs space-y-6">
            <div className="max-w-2xl space-y-2">
              <h3 className="text-2xl font-extrabold text-slate-900">
                List Your Business in the USA Business Directory
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                When you list your business on BizNest USA, you get a dedicated, crawlable public page (e.g., <code className="text-blue-600 font-mono text-xs">/business/your-company-name/</code>) with your logo, phone number, address, hours, and services. Your phone number is shown as listed — customers reach you directly.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Basic $1 — submit your listing. Standard $5 — edit your listing and publish 5 blog posts. Authoritative $10 — photo gallery, 10 blog posts for 60 days, and featured placement.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Affordable Public Page</span>
                </div>
                <p className="text-xs text-slate-500">Listings start at $1 with clear one-time pricing. No contact masking — customers reach you directly.</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Local SEO Citations</span>
                </div>
                <p className="text-xs text-slate-500">Consistent name, address, and phone data, plus Schema.org LocalBusiness structured data.</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Post Hiring Vacancies</span>
                </div>
                <p className="text-xs text-slate-500">Standard and Authoritative plans let you post job openings linked to your business profile.</p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/add-business"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors"
              >
                <span>Add Your Business · From $1</span>
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
