import { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { BookOpen, ShieldCheck, Briefcase, Users, HelpCircle, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Help Center & Knowledgebase Support | BizNestUSA Hub',
  description: 'Search guidebooks, step-by-step tutorials, verification FAQs, and account documentation for business owners, job seekers, and recruiters on BizNestUSA.',
  alternates: {
    canonical: 'https://www.biznestusa.com/help-center/',
  },
  openGraph: {
    title: 'Help Center & Knowledgebase Support | BizNestUSA Hub',
    description: 'Search guidebooks, step-by-step tutorials, verification FAQs, and account documentation for business owners, job seekers, and recruiters on BizNestUSA.',
    url: 'https://www.biznestusa.com/help-center/',
    type: 'website',
  },
}

export default function HelpCenterPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Help Center & Knowledgebase Support',
    description: 'Official user guides, tutorials, and support articles for BizNestUSA.',
    url: 'https://www.biznestusa.com/help-center/'
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30 mb-4">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Platform Knowledgebase &amp; Tutorials</span>
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Help Center &amp; Support Knowledgebase
            </h1>
            <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Step-by-step guides, onboarding walkthroughs, and operational documentation for American business owners, independent specialists, and hiring employers.
            </p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 py-12 space-y-12">
          {/* 4 Knowledgebase Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h2 className="font-bold text-slate-900 text-base">Business Owners</h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  How to claim your profile, configure your Name, Address &amp; Phone (NAP), upload photos, and update operating hours.
                </p>
              </div>
              <Link href="/business-listing-guidelines" className="text-xs font-bold text-blue-600 inline-flex items-center gap-1 hover:underline pt-2">
                <span>View Guidelines</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Users className="w-6 h-6" />
                </div>
                <h2 className="font-bold text-slate-900 text-base">Professionals</h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Creating consultant profiles, linking verified GitHub or LinkedIn links, setting rates, and receiving client inquiries.
                </p>
              </div>
              <Link href="/professionals" className="text-xs font-bold text-emerald-600 inline-flex items-center gap-1 hover:underline pt-2">
                <span>Explore Directory</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h2 className="font-bold text-slate-900 text-base">Jobs &amp; Hiring</h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Publishing job openings, managing candidate applications, specifying remote work terms, and closing filled vacancies.
                </p>
              </div>
              <Link href="/post-job" className="text-xs font-bold text-purple-600 inline-flex items-center gap-1 hover:underline pt-2">
                <span>Post a Job</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="font-bold text-slate-900 text-base">Trust &amp; Verification</h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  How our 4-tier verification protocol works, uploading state contractor licenses, and earning the green Verified badge.
                </p>
              </div>
              <Link href="/verification-policy" className="text-xs font-bold text-indigo-600 inline-flex items-center gap-1 hover:underline pt-2">
                <span>Verification Policy</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Detailed Troubleshooting & Step-by-Step Guidance (300+ words) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-sm space-y-6">
            <h3 className="text-2xl font-bold text-slate-900">
              Frequently Consulted Troubleshooting Walkthroughs
            </h3>

            <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span>How to Claim an Existing Business Listing</span>
                </h4>
                <p className="text-xs sm:text-sm pl-6">
                  If your business is already listed in our directory, navigate to your public profile page and click the &ldquo;Claim This Business&rdquo; link. You will be prompted to authenticate your identity via an automated telephone PIN or official domain email address. Once verified, full administrative control is granted to your merchant dashboard.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span>Updating Relocated Addresses or Phone Numbers</span>
                </h4>
                <p className="text-xs sm:text-sm pl-6">
                  Profile administrators can modify address details, operating hours, and customer phone numbers directly through the dashboard. Updates to legal business names or state license numbers are subject to review by our editorial board within 24 to 48 hours to preserve data fidelity.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span>Resolving Disputed Reviews &amp; Malicious Content</span>
                </h4>
                <p className="text-xs sm:text-sm pl-6">
                  If your listing receives a fraudulent or defamatory review from a competitor or unauthorized party, business owners can submit a review dispute ticket with supporting transaction logs. Our moderation team reviews all flagged content in compliance with FTC guidelines.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 text-center">
              <p className="text-xs text-slate-500 mb-3">Still have questions or require personalized technical assistance?</p>
              <Link
                href="/support"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                <span>Connect With Support Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
