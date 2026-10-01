import { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { BUSINESS_CATEGORIES, CATEGORIES, TOP_CITIES } from '@/lib/data'
import { getAllBusinesses } from '@/lib/db-service'
import { normalizeCitySlug } from '@/lib/directory-helpers'
import { MapPin, Sparkles, FileText, Briefcase, Building2, Store, Wrench } from 'lucide-react'
import { POPULAR_SERVICES, getSubcategoryHref } from '@/lib/services-data'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'HTML Sitemap | BizNest USA Directory Structure',
  description: 'Complete directory index of verified business listings, industry categories, major US cities, job portals, and documentation on BizNest USA.',
  alternates: {
    canonical: 'https://biznestusa.com/html-sitemap/',
  },
}

export default async function HTMLSitemapPage() {
  const businesses = await getAllBusinesses(false)
  const approvedBusinesses = businesses.filter(b => (b.status || 'approved') === 'approved')

  return (
    <>
      <Navbar />
      <main className="bg-[#F8FAFC] text-slate-800 font-sans min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm space-y-12">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              BizNest USA Complete Website HTML Sitemap
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Browse the hierarchical index of all public sections, verified business listings, industry categories, city business hubs, and support policies.
            </p>
          </div>

          {/* Core App Pages */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>Main Portal Sections</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold text-slate-700">
              <Link href="/" className="p-2.5 bg-slate-50 rounded-xl hover:text-blue-600 border border-slate-100">Homepage</Link>
              <Link href="/about" className="p-2.5 bg-slate-50 rounded-xl hover:text-blue-600 border border-slate-100">About Us</Link>
              <Link href="/contact" className="p-2.5 bg-slate-50 rounded-xl hover:text-blue-600 border border-slate-100">Contact Us</Link>
              <Link href="/search" className="p-2.5 bg-slate-50 rounded-xl hover:text-blue-600 border border-slate-100">Business Search</Link>
              <Link href="/add-business" className="p-2.5 bg-slate-50 rounded-xl hover:text-blue-600 border border-slate-100">Add Business</Link>
              <Link href="/categories" className="p-2.5 bg-slate-50 rounded-xl hover:text-blue-600 border border-slate-100">Categories Index</Link>
              <Link href="/cities" className="p-2.5 bg-slate-50 rounded-xl hover:text-blue-600 border border-slate-100">Cities Index</Link>
              <Link href="/jobs" className="p-2.5 bg-slate-50 rounded-xl hover:text-blue-600 border border-slate-100">Jobs Portal</Link>
              <Link href="/post-job" className="p-2.5 bg-slate-50 rounded-xl hover:text-blue-600 border border-slate-100">Post a Job</Link>
              <Link href="/professionals" className="p-2.5 bg-slate-50 rounded-xl hover:text-blue-600 border border-slate-100">Professionals</Link>
              <Link href="/blog" className="p-2.5 bg-slate-50 rounded-xl hover:text-blue-600 border border-slate-100">Business Blog</Link>
              <Link href="/login" className="p-2.5 bg-slate-50 rounded-xl hover:text-blue-600 border border-slate-100">Login</Link>
              <Link href="/register" className="p-2.5 bg-slate-50 rounded-xl hover:text-blue-600 border border-slate-100">Register Account</Link>
            </div>
          </div>

          {/* Verified Business Listings Index */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
              <Store className="w-5 h-5 text-blue-600" />
              <span>Verified Business Listings Index ({approvedBusinesses.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs text-slate-600">
              {approvedBusinesses.map((biz) => (
                <Link key={biz.id || biz.slug} href={`/business/${biz.slug}`} className="hover:text-blue-600 hover:underline flex items-center gap-1.5 p-1.5 bg-slate-50/50 rounded-lg border border-slate-100">
                  <span className="text-blue-500 font-bold">•</span>
                  <span className="font-semibold text-slate-800 truncate">{biz.name}</span>
                  <span className="text-slate-400 text-[10px]">({biz.city})</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Industry Categories & Sub-Services Hierarchy */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-2 mb-6 gap-2">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>Industry Categories &amp; Sub-Services ({BUSINESS_CATEGORIES.length} Categories, 160 Sub-Services)</span>
              </h2>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <Link href="/categories" className="text-blue-600 hover:underline">
                  All Categories Hub →
                </Link>
                <Link href="/services" className="text-blue-600 hover:underline">
                  All Services Hub →
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {BUSINESS_CATEGORIES.map(cat => (
                <div key={cat.id} className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <Link href={`/category/${cat.id}`} className="font-bold text-slate-900 hover:text-blue-600 text-sm">
                      {cat.name}
                    </Link>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {cat.subcategories.length} services
                    </span>
                  </div>

                  <ul className="space-y-1 text-xs text-slate-600">
                    {cat.subcategories.map(sub => (
                      <li key={sub}>
                        <Link href={getSubcategoryHref(sub, cat.id)} className="hover:text-blue-600 hover:underline flex items-center gap-1.5">
                          <span className="text-blue-400">•</span>
                          <span>{sub}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Major Cities */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-600" />
              <span>US Metro &amp; City Directories ({TOP_CITIES.length})</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 text-xs text-slate-600">
              {TOP_CITIES.map(city => (
                <Link key={city} href={`/city/${normalizeCitySlug(city)}`} className="hover:text-emerald-600 hover:underline">
                  • {city} Business Directory
                </Link>
              ))}
            </div>
          </div>

          {/* Trust, Support & Legal Policies */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <span>Trust, Support & Legal Documentation</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold text-slate-700">
              <Link href="/privacy" className="p-2 bg-slate-50 rounded-lg hover:text-purple-600">Privacy Policy</Link>
              <Link href="/terms" className="p-2 bg-slate-50 rounded-lg hover:text-purple-600">Terms of Service</Link>
              <Link href="/cookie-policy" className="p-2 bg-slate-50 rounded-lg hover:text-purple-600">Cookie Policy</Link>
              <Link href="/disclaimer" className="p-2 bg-slate-50 rounded-lg hover:text-purple-600">Disclaimer</Link>
              <Link href="/editorial-policy" className="p-2 bg-slate-50 rounded-lg hover:text-purple-600">Editorial Policy</Link>
              <Link href="/community-guidelines" className="p-2 bg-slate-50 rounded-lg hover:text-purple-600">Community Guidelines</Link>
              <Link href="/business-listing-guidelines" className="p-2 bg-slate-50 rounded-lg hover:text-purple-600">Listing Guidelines</Link>
              <Link href="/verification-policy" className="p-2 bg-slate-50 rounded-lg hover:text-purple-600">Verification Policy</Link>
              <Link href="/refund-policy" className="p-2 bg-slate-50 rounded-lg hover:text-purple-600">Refund Policy</Link>
              <Link href="/advertise-with-us" className="p-2 bg-slate-50 rounded-lg hover:text-purple-600">Advertise With Us</Link>
              <Link href="/careers" className="p-2 bg-slate-50 rounded-lg hover:text-purple-600">Careers</Link>
              <Link href="/faqs" className="p-2 bg-slate-50 rounded-lg hover:text-purple-600">FAQs</Link>
              <Link href="/help-center" className="p-2 bg-slate-50 rounded-lg hover:text-purple-600">Help Center</Link>
              <Link href="/support" className="p-2 bg-slate-50 rounded-lg hover:text-purple-600">Customer Support</Link>
              <Link href="/report-listing" className="p-2 bg-slate-50 rounded-lg hover:text-purple-600">Report Listing</Link>
              <Link href="/report-abuse" className="p-2 bg-slate-50 rounded-lg hover:text-purple-600">Report Abuse</Link>
              <Link href="/accessibility" className="p-2 bg-slate-50 rounded-lg hover:text-purple-600">Accessibility Statement</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
