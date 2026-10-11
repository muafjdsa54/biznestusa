import { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Megaphone, Target, BarChart3, CheckCircle2, TrendingUp, Users, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Advertise With Us | Targeted USA Business Media Hub',
  description: 'Reach thousands of active commercial buyers, employers, and local consumers across the United States with high-impact targeted advertising on BizNest USA.',
  alternates: {
    canonical: 'https://www.biznestusa.com/advertise-with-us/',
  },
  openGraph: {
    title: 'Advertise With Us | Targeted USA Business Media Hub',
    description: 'Reach thousands of active commercial buyers, employers, and local consumers across the United States with high-impact targeted advertising on BizNest USA.',
    url: 'https://www.biznestusa.com/advertise-with-us/',
    type: 'website',
  },
}

export default function AdvertiseWithUsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Advertise With Us: Targeted Commercial Directory Media',
    description: 'High-impact advertising opportunities for American businesses and enterprise brands on BizNestUSA.',
    url: 'https://www.biznestusa.com/advertise-with-us/'
  }

  return (
    <>
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="bg-[#F8FAFC] text-slate-800 font-sans min-h-screen pb-16">
        <section className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white py-16 sm:py-20 text-center border-b border-slate-800">
          <div className="max-w-4xl mx-auto px-4">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 mb-4">
              <Megaphone className="w-3.5 h-3.5 text-blue-400" />
              <span>High-Intent Commercial Audience</span>
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Targeted Directory Advertising Across the USA
            </h1>
            <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Connect directly with qualified homeowners, enterprise purchasers, and hiring managers actively seeking verified commercial services across all 50 states.
            </p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 py-12 space-y-12">
          {/* Key Advantages */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Hyper-Local Geotargeting</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Position your brand at the exact moment customers search for services in designated US metropolitan areas and surrounding county zones.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Inbound Lead Generation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct qualified phone calls, quote requests, and referral clicks directly to your corporate domain, without intermediaries skimming leads.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Featured Top Placement</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gain competitive prominence with premier banner placements above standard organic listings in competitive trade and legal categories.
              </p>
            </div>
          </div>

          {/* In-Depth Advertising Solutions Guide (300+ words) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-sm space-y-8">
            <div className="max-w-3xl">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Media Opportunities</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Flexible Promotional Formats Tailored to Your Growth Strategy
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Whether you are a regional multi-location trade enterprise, an emerging national B2B SaaS platform, or an established corporate employer seeking specialized talent, BizNestUSA offers granular advertising configurations designed for maximum conversion efficiency:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-slate-600">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">1. Category &amp; Subcategory Exclusivity</h3>
                <p className="text-xs leading-relaxed text-slate-600">
                  Secure dedicated header banner sponsorship across key verticals—such as General Contracting, IT Support, Commercial Banking, or Roofing—capturing 100% share of voice when consumers browse listings within your industry.
                </p>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">2. City &amp; Regional Metro Dominance</h3>
                <p className="text-xs leading-relaxed text-slate-600">
                  Target searchers by specific metropolitan areas (e.g. Austin, Atlanta, Phoenix, Seattle) ensuring marketing expenditures are concentrated precisely where your dispatch teams and storefronts operate.
                </p>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">3. Featured Employer Brand Showcase</h3>
                <p className="text-xs leading-relaxed text-slate-600">
                  Elevate your recruitment pipeline by highlighting your company culture, employee benefits, and open job vacancies at the top of the BizNestUSA national Jobs portal.
                </p>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">4. Editorial Content &amp; Guide Sponsorship</h3>
                <p className="text-xs leading-relaxed text-slate-600">
                  Position your enterprise as an industry thought leader through co-branded informational guides, local licensing overviews, and cost breakdown resources viewed by commercial buyers.
                </p>
              </div>
            </div>

            {/* CTA Box */}
            <div className="pt-6 border-t border-slate-200 text-center space-y-3">
              <h3 className="text-xl font-bold text-slate-900">Request Custom Media Kit &amp; Rate Card</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Connect with our commercial media consultants to design a tailored campaign aligned with your marketing objectives and target return on ad spend (ROAS).
              </p>
              <div className="pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-colors"
                >
                  <span>Inquire with Media Team</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
