import { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { AlertTriangle, MapPin, Phone, Building2, ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Report a Listing | BizNest USA Directory Integrity',
  description: 'Report inaccurate, duplicate, closed, infringing, or fraudulent business listings on BizNestUSA for rapid investigation and editorial directory correction.',
  alternates: {
    canonical: 'https://www.biznestusa.com/report-listing/',
  },
  openGraph: {
    title: 'Report a Listing | BizNest USA Directory Integrity',
    description: 'Report inaccurate, duplicate, closed, infringing, or fraudulent business listings on BizNestUSA for rapid investigation and editorial directory correction.',
    url: 'https://www.biznestusa.com/report-listing/',
    type: 'website',
  },
}

export default function ReportListingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Report Inaccurate or Closed Business Listing',
    description: 'Submit correction or closure notices for business listings published on BizNestUSA.',
    url: 'https://www.biznestusa.com/report-listing/'
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30 mb-4">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Data Integrity &amp; Quality Control</span>
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Report an Inaccurate Listing
            </h1>
            <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Help us maintain the United States&apos; most reliable and verified business directory by notifying our editorial moderation team of outdated or incorrect listings.
            </p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-12 space-y-8">
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              When Should You Submit a Correction or Report?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              BizNestUSA relies on continuous automated data feeds and vigilant community reporting to maintain high data fidelity. Please submit a report if you encounter any of the scenarios described below:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-600">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <span>Permanently Closed or Relocated</span>
                </div>
                <p className="text-xs leading-relaxed text-slate-600">
                  The commercial establishment has ceased operations, declared bankruptcy, or moved to a different physical address. We mark closed profiles accordingly or update to the new commercial location.
                </p>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span>Disconnected or Wrong Telephone</span>
                </div>
                <p className="text-xs leading-relaxed text-slate-600">
                  The published telephone number is out of service, belongs to a residential private party, or redirects to an unaffiliated call center. We verify and correct official phone routing.
                </p>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Unauthorized Ownership Claim</span>
                </div>
                <p className="text-xs leading-relaxed text-slate-600">
                  An unauthorized third party or former contractor has claimed ownership of your company listing. We execute rapid owner verification to restore administrative control to rightful managers.
                </p>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Falsified Licensing or Credentials</span>
                </div>
                <p className="text-xs leading-relaxed text-slate-600">
                  A contractor or medical provider claims state certifications or professional licenses that are inactive, revoked, or non-existent in state registry databases.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Verification Documentation Checklist &amp; SLA</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Upon receiving your report, our editorial staff cross-references state corporate records, calls the business directly, and verifies the requested modification. Corrections and removals are typically finalized within 24 to 48 business hours. To expedite review for claimed ownership or moved locations, please be prepared to supply:
              </p>
              <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-600 space-y-1.5">
                <li>Proof of official representation (e.g. corporate email ending in @yourcompany.com).</li>
                <li>Recent utility invoice, commercial lease agreement, or Secretary of State annual report showing the new address.</li>
                <li>State contractor license lookup link or registration certificate number if credential correction is requested.</li>
              </ul>
            </div>

            <div className="pt-6 text-center">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-colors"
              >
                <span>Submit Listing Correction Report</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
