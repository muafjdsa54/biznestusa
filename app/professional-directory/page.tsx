import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { PROFESSIONAL_CATEGORIES, TOP_CITIES } from '@/lib/data'
import { Users, CheckCircle2, ShieldCheck, Search, UserPlus, ArrowRight, Sparkles, Briefcase, Award } from 'lucide-react'

export const metadata: Metadata = {
  title: 'USA Professional Directory | Discover Verified Experts & Freelancers',
  description: 'Search America\'s verified professional directory. Connect with independent software engineers, UX designers, marketing consultants, licensed attorneys, and certified trades specialists.',
  alternates: {
    canonical: 'https://biznestusa.com/professional-directory',
  },
  openGraph: {
    title: 'USA Professional Directory | Discover Verified Experts & Freelancers',
    description: 'Find verified American professionals by specialization and location. Dedicated portfolio profiles for independent specialists.',
    url: 'https://biznestusa.com/professional-directory',
    type: 'website',
  },
}

export default function ProfessionalDirectoryHub() {
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'USA Professional Directory',
    description: 'Directory of verified independent professionals, engineers, consultants, and trade practitioners across the United States.',
    url: 'https://biznestusa.com/professional-directory',
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://biznestusa.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Professional Directory',
        item: 'https://biznestusa.com/professional-directory',
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
                <Users className="w-3.5 h-3.5" />
                <span>Verified Talent Marketplace</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
                USA Professional Directory &amp; Talent Portfolios
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                Discover independent consultants, certified engineers, creative directors, licensed legal advisors, and skilled master tradesmen across the United States.
              </p>
              
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href="/professionals"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Browse Professionals</span>
                </Link>
                <Link
                  href="/register/professional"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Your Free Profile</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
          
          {/* Professional Categories */}
          <section className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                <Award className="w-6 h-6 text-indigo-600" />
                <span>Explore Specializations</span>
              </h2>
              <Link href="/professionals" className="text-xs font-bold text-indigo-600 hover:underline">
                View All Talent →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PROFESSIONAL_CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all space-y-3"
                >
                  <h3 className="font-extrabold text-base text-slate-900">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {cat.desc}
                  </p>
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {cat.professions.slice(0, 6).map((prof) => (
                      <span
                        key={prof}
                        className="px-2 py-0.5 bg-slate-50 text-slate-600 rounded text-[11px] font-medium border border-slate-100"
                      >
                        {prof}
                      </span>
                    ))}
                  </div>
                  <div className="pt-3">
                    <Link
                      href={`/professionals?profession=${encodeURIComponent(cat.professions[0])}`}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <span>Find {cat.name} Specialists</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Dedicated Profile Value Proposition */}
          <section className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xs space-y-6">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                Self-Service Profile Advantage
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900">
                A Dedicated Public Portfolio Page Built for Direct Client Inquiries
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                When you create your profile, BizNest USA generates a dedicated, permanent public URL (e.g., <code className="text-indigo-600 font-mono text-xs">/professionals/your-name/</code>) that acts as your online portfolio.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Showcase Skills &amp; Projects</span>
                </div>
                <p className="text-xs text-slate-500">Highlight your GitHub, live demo URLs, portfolio case studies, and certifications.</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Verified Credentials</span>
                </div>
                <p className="text-xs text-slate-500">Earn a verified trust badge that validates your real identity and credentials.</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>One-Click Job Applications</span>
                </div>
                <p className="text-xs text-slate-500">Apply to active US employer job postings with your verified credentials.</p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/register/professional"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors"
              >
                <span>Create Your Professional Profile Now</span>
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
