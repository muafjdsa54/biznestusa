import { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Megaphone, Target, BarChart3, CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Advertise With Us | BizNest USA Targeted Directory Media',
  description: 'Reach thousands of active commercial buyers, employers, and local consumers across the United States with high-impact targeted advertising on BizNest USA.',
  alternates: {
    canonical: 'https://biznestusa.com/advertise-with-us/',
  },
}

export default function AdvertiseWithUsPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#F8FAFC] text-slate-800 font-sans min-h-screen pb-16">
        <section className="bg-white border-b border-slate-200 py-16 sm:py-20 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-4">
              <Megaphone className="w-3.5 h-3.5 text-blue-600" /> High-Impact Local Advertising
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
              Grow Your Brand Across the United States
            </h1>
            <p className="mt-4 text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Connect directly with customers searching for local services, verified professionals, and hiring companies across all 50 states.
            </p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
              <Target className="w-10 h-10 text-blue-600 mx-auto mb-3" />
              <h3 className="font-bold text-slate-900 text-lg">Metro-Targeted Traffic</h3>
              <p className="text-xs text-slate-600 mt-2">Display your featured listing by specific US metro area or industry category for highest ROI.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
              <BarChart3 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
              <h3 className="font-bold text-slate-900 text-lg">Verified Leads</h3>
              <p className="text-xs text-slate-600 mt-2">Receive qualified inbound calls, quote inquiries, and clicks directly to your corporate domain.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
              <CheckCircle2 className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
              <h3 className="font-bold text-slate-900 text-lg">Featured Badging</h3>
              <p className="text-xs text-slate-600 mt-2">Stand out prominently at the top of category searches and state directory listings.</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Request Media Kit &amp; Partner Opportunities</h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto">Our marketing team can build a custom directory sponsorship package suited to your regional or national growth goals.</p>
            <div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors shadow-md"
              >
                <span>Contact Advertising Team</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
