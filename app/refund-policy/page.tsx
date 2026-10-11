import { Metadata } from 'next'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'Refund Policy for Premium Services | BizNestUSA Hub',
  description: 'Read terms and conditions governing advertising banners, sponsored directory placements, and express profile verification services provided by BizNestUSA.',
  alternates: {
    canonical: 'https://www.biznestusa.com/refund-policy/',
  },
  openGraph: {
    title: 'Refund Policy for Premium Services | BizNestUSA Hub',
    description: 'Read terms and conditions governing advertising banners, sponsored directory placements, and express profile verification services provided by BizNestUSA.',
    url: 'https://www.biznestusa.com/refund-policy/',
    type: 'website',
  },
}

export default function RefundPolicyPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Refund & Cancellation Policy for Commercial Services',
    description: 'Terms of sale, billing dispute procedures, and refund guidelines for BizNestUSA premium directory services.',
    url: 'https://www.biznestusa.com/refund-policy/'
  }

  return (
    <>
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="bg-[#F8FAFC] text-slate-800 font-sans min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm space-y-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Refund &amp; Cancellation Policy for Premium Services
            </h1>
            <p className="text-sm text-slate-500 border-b border-slate-100 pb-4">
              Last Updated: October 2026 • BizNestUSA Billing &amp; Finance Operations
            </p>
          </div>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">1. Free Core Directory Access &amp; Commercial Services</h2>
              <p>
                Standard business listings, individual practitioner portfolios, and basic job discovery on <strong>BizNestUSA</strong> are 100% free of charge. For merchants, corporate recruiters, and agencies that purchase optional promotional solutions—such as featured category placements, top-of-city spotlight banners, or expedited editorial verification—this Refund &amp; Cancellation Policy defines your rights and financial obligations.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">2. Refund Eligibility &amp; Qualifying Circumstances</h2>
              <p>Refunds or account billing credits are considered under the following specific circumstances:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Service Activation Failure:</strong> If a purchased sponsored banner or promoted category listing fails to render or activate within 72 hours of confirmed payment due to technical malfunctions on BizNestUSA servers.
                </li>
                <li>
                  <strong>Duplicate or Erroneous Transactions:</strong> If an electronic processing error results in multiple charges for a single placement order or renewal invoice.
                </li>
                <li>
                  <strong>Cancellation Prior to Campaign Delivery:</strong> If a business owner requests cancellation in writing within 24 hours of purchasing a scheduled future advertising placement, before marketing assets have gone live.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">3. Non-Refundable Products &amp; Fees</h2>
              <p>Due to the immediate expenditure of administrative and operational resources, the following fees are non-refundable:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Expedited Verification Review Fees:</strong> Fees paid for fast-track manual investigation of state licenses, Secretary of State corporate filings, or commercial lease validations cover staff review time and are non-refundable, regardless of whether verification is approved or rejected due to falsified credentials.
                </li>
                <li>
                  <strong>Delivered Ad Impressions &amp; Featured Placements:</strong> Once a promotional campaign has commenced and served public impressions across directory pages, fees for that billing cycle cannot be refunded pro-rata.
                </li>
                <li>
                  <strong>Terminated Accounts for Policy Violations:</strong> Listings suspended or removed due to violations of our Business Listing Guidelines, Community Guidelines, or fraudulent commercial behavior forfeit all paid fees.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">4. Subscription Cancellations &amp; Renewals</h2>
              <p>
                Recurring sponsorships or monthly featured listing subscriptions may be cancelled at any time by the account administrator through their merchant dashboard or by emailing <a href="mailto:billing@biznestusa.com" className="text-blue-600 underline">billing@biznestusa.com</a> at least 3 business days prior to the next scheduled renewal date. Upon cancellation, your promotional features will remain active until the end of the current paid billing cycle without additional charges.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">5. Billing Dispute Procedures &amp; Processing Timelines</h2>
              <p>
                To request a refund or dispute an invoice charge, please contact our accounting department at <a href="mailto:billing@biznestusa.com" className="text-blue-600 underline">billing@biznestusa.com</a> with your company name, account email, transaction ID, and explanation. We review all claims within 3 business days. Approved refunds are credited to the original payment method within 5 to 10 business days depending on your financial institution.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
