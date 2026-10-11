import { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { ShieldAlert, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Report Abuse & Safety Violations Desk | BizNestUSA',
  description: 'Report spam, harassment, counterfeit listings, copyright violations, or policy infractions directly to the BizNestUSA trust and platform safety department.',
  alternates: {
    canonical: 'https://www.biznestusa.com/report-abuse/',
  },
  openGraph: {
    title: 'Report Abuse & Safety Violations Desk | BizNestUSA',
    description: 'Report spam, harassment, counterfeit listings, copyright violations, or policy infractions directly to the BizNestUSA trust and platform safety department.',
    url: 'https://www.biznestusa.com/report-abuse/',
    type: 'website',
  },
}

export default function ReportAbusePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Report Abuse & Safety Violations Portal',
    description: 'Submit incident reports regarding copyright violations, fraudulent profiles, phishing, or harassment on BizNestUSA.',
    url: 'https://www.biznestusa.com/report-abuse/'
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30 mb-4">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Trust, Safety &amp; Legal Compliance</span>
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Report Abuse &amp; Safety Violations
            </h1>
            <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              BizNestUSA maintains strict safeguards against intellectual property infringement, fraudulent impersonation, recruitment scams, and cyber harassment.
            </p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-12 space-y-8">
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Platform Incident Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Our specialized Trust &amp; Safety officers review all abuse tickets within 24 to 48 hours. When reporting an incident, please review the specific category guidelines below to ensure all necessary evidentiary materials are provided:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-600">
              <div className="p-5 bg-red-50/60 rounded-2xl border border-red-200/80 space-y-2">
                <h3 className="font-bold text-red-950 text-sm">1. Copyright &amp; DMCA Notices</h3>
                <p className="text-xs leading-relaxed text-red-900/80">
                  If an unauthorized user has uploaded your proprietary photography, brand trademarks, copyrighted catalog copy, or registered architectural imagery, submit a formal DMCA takedown notice including proof of copyright ownership and specific URLs.
                </p>
              </div>

              <div className="p-5 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-2">
                <h3 className="font-bold text-amber-950 text-sm">2. Employment Scams &amp; Phishing</h3>
                <p className="text-xs leading-relaxed text-amber-900/80">
                  Report job postings or recruiter messages that solicit payment for equipment, request banking passwords, issue counterfeit checks, or direct candidates to suspicious unencrypted third-party domains.
                </p>
              </div>

              <div className="p-5 bg-blue-50/60 rounded-2xl border border-blue-200/80 space-y-2">
                <h3 className="font-bold text-blue-950 text-sm">3. Corporate Impersonation</h3>
                <p className="text-xs leading-relaxed text-blue-900/80">
                  If an entity has created an unauthorized listing using your registered corporate trade name (DBA) or claimed ownership of your practice without legal authority, our compliance team will initiate an expedited identity verification audit.
                </p>
              </div>

              <div className="p-5 bg-purple-50/60 rounded-2xl border border-purple-200/80 space-y-2">
                <h3 className="font-bold text-purple-950 text-sm">4. Harassment &amp; Doxxing</h3>
                <p className="text-xs leading-relaxed text-purple-900/80">
                  We enforce immediate account suspensions for profiles or user reviews that disclose private residential addresses, personal cell phone numbers, extortion threats, or hate speech targeting protected classes.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Investigation Process &amp; Required Information</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                To expedite investigation by our safety team, your report must include:
              </p>
              <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-600 space-y-1.5">
                <li>Exact BizNestUSA page URL where the offending material is displayed.</li>
                <li>Detailed description of the violation (statutory infraction, scam pattern, or trademark registration number).</li>
                <li>Your contact details and official affiliation with the affected entity.</li>
                <li>Supporting documentation (PDF certificates, correspondence screenshots, or trademark registry links).</li>
              </ul>
              <p className="text-xs text-slate-500 leading-relaxed pt-2">
                <strong>Emergency &amp; Law Enforcement Escalation:</strong> In cases involving imminent physical danger, extortion, or active criminal fraud, reports are expedited immediately and referred to appropriate federal or state law enforcement authorities.
              </p>
            </div>

            <div className="pt-6 text-center">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-colors"
              >
                <span>Submit Incident to Safety Desk</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
