import { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Briefcase, MapPin } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Careers at BizNest USA | Join the National Business Directory Platform',
  description: 'Explore career opportunities at BizNest USA. Help build the most reliable digital directory, professional talent network, and jobs platform in the United States.',
  alternates: {
    canonical: 'https://biznestusa.com/careers/',
  },
}

export default function CareersPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#F8FAFC] text-slate-800 font-sans min-h-screen pb-16">
        <section className="bg-white border-b border-slate-200 py-16 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Join Our Mission
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mt-4">
              Build the Future of American Small Business Discovery
            </h1>
            <p className="mt-3 text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
              We are assembling a passionate team of engineers, data curators, and local search specialists across the United States.
            </p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-12 space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-200 pb-3">Open Opportunities at BizNest USA</h2>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">Engineering</span>
              <h3 className="font-bold text-slate-900 text-lg mt-2">Senior Full Stack Engineer (Next.js / TypeScript / Cloud)</h3>
              <p className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> New York, NY / Remote (US)</span>
                <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-slate-400" /> Full Time</span>
              </p>
            </div>
            <Link href="/contact" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors shrink-0">
              Apply via Contact
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">Growth &amp; SEO</span>
              <h3 className="font-bold text-slate-900 text-lg mt-2">Technical SEO &amp; Directory Operations Specialist</h3>
              <p className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> Remote (United States)</span>
                <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-slate-400" /> Full Time</span>
              </p>
            </div>
            <Link href="/contact" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors shrink-0">
              Apply via Contact
            </Link>
          </div>

          <div className="bg-blue-50/60 rounded-2xl p-6 border border-blue-200 text-center space-y-2">
            <h3 className="font-bold text-slate-900 text-base">Don&apos;t see your role?</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              We are always excited to connect with talented developers, data curators, and content creators. Send your resume to <a href="mailto:careers@biznestusa.com" className="text-blue-600 underline font-semibold">careers@biznestusa.com</a>.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
