import { Metadata } from 'next'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import Link from 'next/link'
import { 
  Building2, Users, Briefcase, ShieldCheck, HeartHandshake, 
  Sparkles, CheckCircle2, ArrowRight, MapPin, Globe
} from 'lucide-react'

export const metadata: Metadata = {
  title: "About Us | BizNestUSA Business & Professional Directory Platform",
  description: "Learn about BizNestUSA, our mission to connect local businesses, skilled independent professionals, and career opportunities across all 50 US states.",
  alternates: {
    canonical: 'https://biznestusa.com/about/',
  },
  openGraph: {
    title: "About Us | BizNestUSA Platform",
    description: "Discover the mission and values behind BizNestUSA: connecting local businesses, skilled professionals, and career opportunities across the United States.",
    url: 'https://biznestusa.com/about/',
    siteName: 'BizNestUSA',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "About Us | BizNestUSA Platform",
    description: "Connecting local businesses, skilled professionals, and career opportunities across all 50 US states.",
  },
}

const CORE_VALUES = [
  { 
    title: "Transparent & Accessible", 
    desc: "We believe in direct connectivity. No pay-per-lead gimmicks, no hidden contact phone numbers, and no predatory lead markups.", 
    icon: ShieldCheck 
  },
  { 
    title: "Genuine User-Generated Content", 
    desc: "Every profile and business listing is created and maintained directly by the business owner or professional. We never fabricate reviews or numbers.", 
    icon: CheckCircle2 
  },
  { 
    title: "A Connected Ecosystem", 
    desc: "Companies post open jobs, professionals showcase their verified skills and portfolios, and customers discover trusted local services.", 
    icon: HeartHandshake 
  },
  { 
    title: "Nationwide Discovery Across All 50 States", 
    desc: "From local family-owned trades in Dallas and Atlanta to venture-backed engineering startups in Austin and Seattle, we support all 50 states.", 
    icon: Globe 
  }
]

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="bg-slate-50 text-slate-900 font-sans min-h-screen pb-16">
        
        {/* HERO SECTION */}
        <section className="bg-white border-b border-slate-200 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Our Mission</span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
              Connecting American Businesses, Professionals & Careers
            </h1>
            <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              BizNestUSA is a modern directory platform built to bridge local service discovery, individual professional talent, and career opportunities across the United States.
            </p>
          </div>
        </section>

        {/* 3 CONNECTED PILLARS */}
        <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-1">
            <h2 className="text-2xl font-bold text-slate-900">The Three Pillars of Our Platform</h2>
            <p className="text-xs text-slate-500">Built to empower small businesses, independent specialists, and job seekers together.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">1. Business Directory</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Brick-and-mortar storefronts, commercial contractors, and local service providers create dedicated public listings complete with multiple branch locations, services, operating hours, and direct customer contact options.
              </p>
              <Link href="/search" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline pt-2">
                <span>Explore businesses</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">2. Professional Portfolios</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Individual people—developers, designers, accountants, medical specialists, and skilled tradespeople—publish their personal public portfolio page with verifiable skills, portfolio links, credentials, and open-to-work status.
              </p>
              <Link href="/professionals" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline pt-2">
                <span>Browse professionals</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">3. Job Opportunities</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Companies post remote, hybrid, and local on-site vacancies with upfront salary indications and direct application routes. Job seekers can apply directly or connect their verified professional profiles.
              </p>
              <Link href="/jobs" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline pt-2">
                <span>Search open jobs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* CORE PRINCIPLES & INTEGRITY */}
        <section className="py-14 bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center mb-10 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Platform Standards</span>
              <h2 className="text-2xl font-bold text-slate-900">Built on Trust & Transparency</h2>
              <p className="text-xs text-slate-500">We prioritize genuine directory data over artificial vanity metrics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {CORE_VALUES.map((val) => {
                const Icon = val.icon
                return (
                  <div key={val.title} className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-blue-600 flex items-center justify-center shrink-0">
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{val.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pl-12">{val.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTAS */}
        <section className="py-16 max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Join the Growing Network</h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Whether you want to list your company, create your personal professional portfolio, or recruit talent for an open position, get started today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/add-business"
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs"
            >
              List Your Business
            </Link>
            <Link
              href="/add-professional"
              className="w-full sm:w-auto px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
            >
              Create Professional Profile
            </Link>
            <Link
              href="/post-job"
              className="w-full sm:w-auto px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
            >
              Post a Job Opening
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
