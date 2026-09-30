import { Metadata } from 'next'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'Verification Policy | BizNest USA - Business Directory & Professional Hub',
  description: 'How BizNest USA verifies business profiles, addresses, contact details, state licenses, and professional credentials across the United States.',
  alternates: {
    canonical: 'https://biznestusa.com/verification-policy/',
  },
  openGraph: {
    title: 'Verification Policy | BizNest USA - Business Directory & Professional Hub',
    description: 'How BizNest USA verifies business profiles, addresses, contact details, state licenses, and professional credentials across the United States.',
    url: 'https://biznestusa.com/verification-policy/',
    type: 'website',
  },
}

export default function VerificationPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#F8FAFC] text-slate-800 font-sans min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Verification Policy &amp; Badge Protocol
          </h1>
          <p className="text-sm text-slate-500 mb-8 border-b border-slate-100 pb-4">
            Last Updated: September 2026 • BizNest USA Trust &amp; Safety
          </p>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            {/* Core Disclaimer Box */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-emerald-950 font-medium space-y-1">
              <strong className="block text-emerald-900 font-bold">Important Verification Notice:</strong>
              <p>
                BizNest USA verification indicates that the listing or profile completed our identity and credential verification process. Verification does not constitute an endorsement or legal warranty for every commercial engagement.
              </p>
            </div>

            <p>
              The <strong>Verified Badge</strong> on BizNest USA indicates that a business listing or professional profile has undergone structured verification to confirm primary identity, operational telephone channels, and legitimate trade presence.
            </p>

            <h2 className="text-xl font-bold text-slate-900 pt-4">1. Business Verification Steps</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Telephone &amp; Direct Channel Confirmation:</strong> Live telephone or email confirmation with authorized business management.</li>
              <li><strong>Physical Address Validation:</strong> Geolocation check and mapping to registered commercial or licensed operating addresses within the US.</li>
              <li><strong>Official Documentation (Optional/Expedited):</strong> Review of IRS EIN confirmation, Secretary of State corporate registration, state contractor licensing, or commercial utility records.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 pt-4">2. Professional Profile Verification</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Identity &amp; Credential Confirmation:</strong> Review of active state licensing (e.g. bar registration, medical board, CPA license), verified portfolio links, or corporate domain identity.</li>
              <li><strong>Direct Contact Verification:</strong> Validation that listed contact phone, professional email, and portfolio links are active and directly monitored.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 pt-4">3. Revocation of Verified Status</h2>
            <p>
              BizNest USA reserves the right to suspend or revoke verification badges if a business changes contact information without notification, provides misleading credentials, or receives substantiated unresolved consumer complaints.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
