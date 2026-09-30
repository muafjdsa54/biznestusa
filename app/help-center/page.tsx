import { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { BookOpen, ShieldCheck, Briefcase } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Help Center | BizNest USA Support Knowledgebase',
  description: 'Search guidebooks, step-by-step tutorials, and documentation for business owners, job seekers, and recruiters on BizNest USA.',
  alternates: {
    canonical: 'https://biznestusa.com/help-center/',
  },
}

export default function HelpCenterPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#F8FAFC] text-slate-800 font-sans min-h-screen pb-16">
        <section className="bg-white border-b border-slate-200 py-16 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Knowledgebase
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mt-4">
              BizNest USA Help Center
            </h1>
            <p className="mt-3 text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
              Browse guidebooks, onboarding tutorials, and verification policies for American business owners and professionals.
            </p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Link href="/business-listing-guidelines" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-500 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Business Owner Guide</h3>
              <p className="text-xs text-slate-600 mt-2">Learn how to submit, edit, optimize, and verify your local business listing.</p>
            </Link>

            <Link href="/jobs" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Jobs &amp; Employer Guide</h3>
              <p className="text-xs text-slate-600 mt-2">How to post vacancies, manage applicant resumes, and hire top talent in the United States.</p>
            </Link>

            <Link href="/verification-policy" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-500 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Trust &amp; Verification</h3>
              <p className="text-xs text-slate-600 mt-2">Understand verified badges, safety guidelines, and reporting suspicious activity.</p>
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-xl font-bold text-slate-900">Need direct human assistance?</h2>
            <p className="text-xs text-slate-600">Our customer support and compliance teams are available Monday through Friday, 9:00 AM – 6:00 PM EST.</p>
            <div>
              <Link href="/contact" className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors">
                Contact Support Desk
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
