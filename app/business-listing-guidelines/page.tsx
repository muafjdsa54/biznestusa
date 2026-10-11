import { Metadata } from 'next'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'Business Listing Guidelines & Rules | BizNestUSA Hub',
  description: 'Review business listing requirements for adding your company, licensing credentials, address proofs, and local service profiles to the BizNestUSA directory.',
  alternates: {
    canonical: 'https://www.biznestusa.com/business-listing-guidelines/',
  },
  openGraph: {
    title: 'Business Listing Guidelines & Rules | BizNestUSA Hub',
    description: 'Review business listing requirements for adding your company, licensing credentials, address proofs, and local service profiles to the BizNestUSA directory.',
    url: 'https://www.biznestusa.com/business-listing-guidelines/',
    type: 'website',
  },
}

export default function BusinessListingGuidelinesPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Business Listing Guidelines & Directory Standards',
    description: 'Official submission guidelines for companies, contractors, and merchants publishing on BizNestUSA.',
    url: 'https://www.biznestusa.com/business-listing-guidelines/'
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
              Business Listing Guidelines &amp; Submission Rules
            </h1>
            <p className="text-sm text-slate-500 border-b border-slate-100 pb-4">
              Last Updated: October 2026 • BizNestUSA Editorial Standards Board
            </p>
          </div>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">1. Purpose &amp; Quality Mandate</h2>
              <p>
                <strong>BizNestUSA</strong> maintains high standards of data accuracy, consumer transparency, and local commercial credibility. To protect consumers and preserve high search engine indexing signals across all 50 states, every business entity, independent practitioner, and employer profile submitted to our directory must comply with the guidelines detailed below.
              </p>
              <p>
                Profiles that fail to meet these criteria are returned for revision or removed by our editorial moderation team.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">2. Business Eligibility Criteria</h2>
              <p>To qualify for a public directory listing on BizNestUSA, an organization must:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Be a legally registered business entity (Sole Proprietorship, LLC, Corporation, Partnership, or Non-Profit) authorized to conduct commerce within the United States.</li>
                <li>Possess a physical office, commercial storefront, clinical facility, or legitimate service-area business (SAB) presence serving US consumers within defined municipal regions.</li>
                <li>Operate an active telephone line and monitored corporate or business domain email address.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">3. NAP Accuracy (Name, Address, Phone) &amp; Branding</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Business Name:</strong> Must reflect your registered legal entity or officially filed Doing Business As (DBA) trade name. Stuffing keywords, service descriptions, promotional claims, or phone numbers into the business title (e.g. &ldquo;Best Cheap Plumber Chicago 24/7&rdquo;) is strictly prohibited.
                </li>
                <li>
                  <strong>Physical Address &amp; Service Areas:</strong> Must indicate a valid US physical street address. P.O. Boxes, private mailbox drop centers (PMBs), and automated mail forwarding virtual hubs are ineligible as physical storefront addresses. Mobile contractors must designate their verified base of operations and explicit metropolitan radius.
                </li>
                <li>
                  <strong>Telephone &amp; Digital Routing:</strong> Provide a direct local area-code or official US toll-free number. Premium-rate forwarding numbers and international routing lines are not permitted.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">4. Licensure, Insurance &amp; Professional Verification</h2>
              <p>
                Trades requiring state or municipal licensing (such as general contracting, electrical, plumbing, HVAC, roofing) and regulated advisory professions (such as medicine, dentistry, law, and certified public accounting) must supply their valid license numbers, issuing state boards, and expiration dates during profile onboarding. Providing falsified credentials leads to immediate account blacklisting and notification to state regulatory authorities.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">5. Prohibited Listing Categories &amp; Practices</h2>
              <p>BizNestUSA enforces a zero-tolerance policy against listings that involve:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Predatory financial practices, unverified payday loans, or deceptive credit repair operations.</li>
                <li>Unregulated pharmaceutical distribution, illicit substances, or prohibited adult services.</li>
                <li>Multi-level marketing (MLM) schemes, pyramid recruitment offers, or &ldquo;work-from-home&rdquo; wire-transfer solicitations.</li>
                <li>Duplicate location listings created exclusively for manipulating local search ranking algorithms.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">6. Editorial Review Timelines &amp; Appeals</h2>
              <p>
                New business submissions undergo automated syntax verification followed by manual editorial review within 1 to 3 business days. If additional documentation (such as state business formation certificates, utility bills, or municipal permits) is requested, listing owners can upload verifications via the <a href="/support" className="text-blue-600 underline">Support Desk</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
