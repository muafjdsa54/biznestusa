import { Metadata } from 'next'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'Editorial Policy | BizNest USA - Business Directory & Professional Hub',
  description: 'Our standards for publishing, reviewing, and fact-checking business listings, professional profiles, and market guides on BizNest USA.',
  alternates: {
    canonical: 'https://biznestusa.com/editorial-policy/',
  },
}

export default function EditorialPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#F8FAFC] text-slate-800 font-sans min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Editorial &amp; Publishing Policy
          </h1>
          <p className="text-sm text-slate-500 mb-8 border-b border-slate-100 pb-4">
            Last Updated: September 2026 • BizNest USA Editorial Team
          </p>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <p>
              At <strong>BizNest USA</strong>, we are committed to maintaining the highest standards of integrity, accuracy, and trustworthiness across all published directories, business profiles, professional portfolios, and local guides.
            </p>

            <h2 className="text-xl font-bold text-slate-900 pt-4">1. Listing Verification &amp; Accuracy</h2>
            <p>
              Every business and professional submission undergoes verification checks to prevent fraudulent, spam, or misleading directory listings. We verify Name, Address, and Phone (NAP) data against public registry records where possible.
            </p>

            <h2 className="text-xl font-bold text-slate-900 pt-4">2. Independence &amp; Objectivity</h2>
            <p>
              Paid listings, featured badges, or partner promotions do not alter consumer review integrity. Verified badges are awarded solely on the basis of credential verification and identity proof.
            </p>

            <h2 className="text-xl font-bold text-slate-900 pt-4">3. Corrections &amp; Inquiries</h2>
            <p>
              If a listing or guide contains inaccurate details, owners and visitors can submit a correction request through our <a href="/contact" className="text-blue-600 underline">Contact Desk</a> for prompt review within 24–48 business hours.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
