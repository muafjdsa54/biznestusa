import { Metadata } from 'next'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'Refund Policy | BizNest USA Directory Platform',
  description: 'Terms and conditions governing advertising banners, sponsored placements, and express verification services on BizNest USA.',
  alternates: {
    canonical: 'https://biznestusa.com/refund-policy/',
  },
}

export default function RefundPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#F8FAFC] text-slate-800 font-sans min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Refund &amp; Cancellation Policy
          </h1>
          <p className="text-sm text-slate-500 mb-8 border-b border-slate-100 pb-4">
            Last Updated: September 2026 • BizNest USA Finance &amp; Billing
          </p>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <p>
              Standard business listings and professional talent profiles on BizNest USA are 100% free. For optional promotional placements (such as homepage featured banners, category sponsorships, or expedited credential verification), this policy outlines refund eligibility.
            </p>

            <h2 className="text-xl font-bold text-slate-900 pt-4">1. Eligibility for Refund</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Service Non-Delivery:</strong> If a paid sponsorship or featured placement fails to activate within 48 hours of order confirmation.</li>
              <li><strong>Billing Errors:</strong> In the event of duplicate charges or erroneous subscription billing.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 pt-4">2. Non-Refundable Items</h2>
            <p>
              Once a targeted advertising campaign, promoted job vacancy, or verified badge evaluation has completed, fees are strictly non-refundable.
            </p>

            <h2 className="text-xl font-bold text-slate-900 pt-4">3. Requesting a Refund</h2>
            <p>
              To request a billing review, email <a href="mailto:billing@biznestusa.com" className="text-blue-600 underline">billing@biznestusa.com</a> with your transaction receipt and account details.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
