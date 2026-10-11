import { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Headphones, Mail, Phone, Clock, ArrowRight, ShieldCheck, HelpCircle, FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Customer Support Desk & Inquiries | BizNestUSA Team',
  description: 'Connect with the BizNestUSA support team for assistance with business listings, verified badges, professional profiles, and directory inquiries.',
  alternates: {
    canonical: 'https://www.biznestusa.com/support/',
  },
  openGraph: {
    title: 'Customer Support Desk & Inquiries | BizNestUSA Team',
    description: 'Connect with the BizNestUSA support team for assistance with business listings, verified badges, professional profiles, and directory inquiries.',
    url: 'https://www.biznestusa.com/support/',
    type: 'website',
  },
}

export default function SupportPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Customer Support Desk & Assistance',
    description: 'Contact BizNestUSA customer support for assistance with directory listings, verified badges, and account services.',
    url: 'https://www.biznestusa.com/support/'
  }

  return (
    <>
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="bg-[#F8FAFC] text-slate-800 font-sans min-h-screen pb-16">
        {/* Header */}
        <section className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white py-16 text-center border-b border-slate-800">
          <div className="max-w-4xl mx-auto px-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30 mb-4">
              <Headphones className="w-3.5 h-3.5" />
              <span>Dedicated Customer Assistance</span>
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Customer Support Desk &amp; Assistance
            </h1>
            <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Our US-based support specialists assist business owners, independent practitioners, job applicants, and recruiters with listing optimization and account operations.
            </p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 py-12 space-y-10">
          {/* Direct Communication Channels */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Direct Telephone Support</h3>
              <p className="text-sm text-slate-700 font-bold">(800) 555-0199</p>
              <p className="text-xs text-slate-500">Toll-free across all 50 US states</p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Email Helpdesk</h3>
              <p className="text-sm text-blue-600 font-bold">support@biznestusa.com</p>
              <p className="text-xs text-slate-500">Guaranteed response within 24 hours</p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-2">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Operating Hours</h3>
              <p className="text-sm text-slate-700 font-bold">9:00 AM – 6:00 PM EST</p>
              <p className="text-xs text-slate-500">Monday through Friday (Excl. federal holidays)</p>
            </div>
          </div>

          {/* Specialized Support Desks (300+ words) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-sm space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Specialized Department Desks &amp; Service Commitments
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                To route your technical and directory inquiries efficiently, BizNestUSA maintains four specialized support divisions:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-slate-600">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Merchant &amp; Listing Onboarding Desk</span>
                </h3>
                <p className="text-xs leading-relaxed text-slate-600">
                  Assists business owners with claiming company pages, correcting street addresses, updating phone routing, adding service portfolios, and merging duplicate business locations.
                </p>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Trust, Safety &amp; Verification Desk</span>
                </h3>
                <p className="text-xs leading-relaxed text-slate-600">
                  Handles expedited review of state contractor licensing documents, Secretary of State business registration certificates, professional liability policies, and badge renewals.
                </p>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-purple-600" />
                  <span>Employer &amp; Recruiter Hiring Desk</span>
                </h3>
                <p className="text-xs leading-relaxed text-slate-600">
                  Assists corporate human resources departments and recruiters with job vacancy postings, applicant screening workflow configurations, and employer branding spotlights.
                </p>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  <span>Consumer Inquiries &amp; Review Moderation</span>
                </h3>
                <p className="text-xs leading-relaxed text-slate-600">
                  Investigates consumer feedback disputes, deceptive advertising reports, and ensures strict compliance with our Community Guidelines and review authenticity standards.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">Response Time Standards &amp; Ticket Escalation SLAs</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We prioritize inquiries based on urgency. Critical account access issues, suspected security compromises, and trademark infringement tickets are triaged within 2 to 4 hours during business days. Standard listing modifications, profile updates, and general directory inquiries receive formal agent responses within 24 hours.
              </p>
              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                <strong>Self-Service Knowledgebase &amp; Immediate Solutions:</strong> Before submitting a support ticket, we recommend reviewing our comprehensive Help Center guides and Community Guidelines. Many common inquiries—such as claiming an existing business profile, updating commercial address data, uploading contractor license documents, or resetting recruiter dashboard credentials—can be completed independently in minutes.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500">
                Ready to submit detailed documentation or open a formal support ticket?
              </p>
              <Link
                href="/contact"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors shrink-0"
              >
                Open Support Ticket
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
