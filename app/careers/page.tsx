import { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Briefcase, MapPin, Sparkles, Heart, Rocket, ShieldCheck, CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Careers at BizNestUSA: Open Jobs & Positions in USA',
  description: 'Explore career opportunities at BizNestUSA. Join our engineering, editorial, and growth teams building the verified business directory platform in the USA.',
  alternates: {
    canonical: 'https://www.biznestusa.com/careers/',
  },
  openGraph: {
    title: 'Careers at BizNestUSA: Open Jobs & Positions in USA',
    description: 'Explore career opportunities at BizNestUSA. Join our engineering, editorial, and growth teams building the verified business directory platform in the USA.',
    url: 'https://www.biznestusa.com/careers/',
    type: 'website',
  },
}

export default function CareersPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Careers at BizNestUSA: Job Opportunities',
    description: 'Explore open engineering, product, and editorial roles at BizNestUSA.',
    url: 'https://www.biznestusa.com/careers/'
  }

  return (
    <>
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="bg-[#F8FAFC] text-slate-800 font-sans min-h-screen pb-16">
        <section className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white py-16 text-center border-b border-slate-800">
          <div className="max-w-4xl mx-auto px-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 mb-4">
              <Briefcase className="w-3.5 h-3.5" />
              <span>We Are Hiring Across the USA</span>
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Careers at BizNestUSA: Build the Future of Commerce
            </h1>
            <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Join a high-velocity team of software engineers, directory researchers, technical SEO strategists, and operations specialists connecting millions of Americans with verified local businesses.
            </p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-12 space-y-12">
          {/* Why Work at BizNestUSA */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-sm space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">
              Why Join the BizNestUSA Team?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              At BizNestUSA, our mission is to provide transparent, reliable, and verified business data to consumers and enterprises across all 50 states. We operate as an autonomous, remote-first team committed to engineering excellence, operational integrity, and high-impact software craft.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Rocket className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Remote-First Flexibility</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Work from anywhere in the United States with flexible asynchronous hours, modern collaboration tools, and dedicated home-office setup stipends.
                </p>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Heart className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Comprehensive Benefits</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  100% premium-covered healthcare, dental, and vision insurance for full-time staff, 401(k) retirement plans with 4% company matching, and generous paid time off.
                </p>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Learning &amp; Growth</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Annual professional development stipends for books, conferences, specialized cloud certifications, and technical courses to accelerate your career.
                </p>
              </div>
            </div>
          </div>

          {/* Open Opportunities */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-200 pb-3">
              Open Positions at BizNestUSA
            </h2>
            
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">Engineering</span>
                <h3 className="font-bold text-slate-900 text-lg">Senior Full Stack Engineer (Next.js / TypeScript / React)</h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                  Scale our Next.js App Router directory platform serving millions of monthly impressions. Design high-performance cached API endpoints, optimize Web Vitals, and build delightful experiences.
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> Remote (USA)</span>
                  <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-slate-400" /> Full-Time</span>
                </div>
              </div>
              <Link href="/contact" className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors shrink-0">
                Apply for Position
              </Link>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">Growth &amp; SEO</span>
                <h3 className="font-bold text-slate-900 text-lg">Technical SEO &amp; Directory Operations Specialist</h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                  Monitor crawl efficiency, structured JSON-LD schemas, taxonomy deduplication, internal linking architecture, and indexation across hundreds of thousands of US local pages.
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> Remote (USA)</span>
                  <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-slate-400" /> Full-Time</span>
                </div>
              </div>
              <Link href="/contact" className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors shrink-0">
                Apply for Position
              </Link>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md">Compliance</span>
                <h3 className="font-bold text-slate-900 text-lg">Directory Data Quality &amp; Verification Analyst</h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                  Investigate business submissions, review contractor state licenses, authenticate Secretary of State records, and maintain the highest verification integrity benchmarks sitewide.
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> Remote (USA)</span>
                  <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-slate-400" /> Full-Time</span>
                </div>
              </div>
              <Link href="/contact" className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors shrink-0">
                Apply for Position
              </Link>
            </div>
          </div>

          {/* Equal Opportunity Statement (300+ words total) */}
          <div className="bg-slate-100/80 rounded-2xl p-6 border border-slate-200 text-xs text-slate-600 space-y-2 leading-relaxed">
            <strong className="block text-slate-900 font-bold">Equal Employment Opportunity (EEO) Policy:</strong>
            <p>
              BizNestUSA is an Equal Opportunity Employer. We evaluate all qualified candidates regardless of race, color, national origin, religion, gender, sex, sexual orientation, gender identity, age, disability, or protected veteran status in full compliance with federal and state labor regulations.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
