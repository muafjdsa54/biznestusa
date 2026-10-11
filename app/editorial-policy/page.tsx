import { Metadata } from 'next'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'Editorial Policy & Fact-Checking Guide | BizNestUSA',
  description: 'Our standards for publishing, reviewing, fact-checking, and updating business listings, professional credentials, and local industry guides on BizNestUSA.',
  alternates: {
    canonical: 'https://www.biznestusa.com/editorial-policy/',
  },
  openGraph: {
    title: 'Editorial Policy & Fact-Checking Guide | BizNestUSA',
    description: 'Our standards for publishing, reviewing, fact-checking, and updating business listings, professional credentials, and local industry guides on BizNestUSA.',
    url: 'https://www.biznestusa.com/editorial-policy/',
    type: 'website',
  },
}

export default function EditorialPolicyPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Editorial Policy & Fact-Checking Standards',
    description: 'BizNestUSA principles of editorial integrity, verification methodology, and commercial independence.',
    url: 'https://www.biznestusa.com/editorial-policy/'
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
              Editorial Policy &amp; Fact-Checking Standards
            </h1>
            <p className="text-sm text-slate-500 border-b border-slate-100 pb-4">
              Last Updated: October 2026 • BizNestUSA Editorial Standards Board
            </p>
          </div>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">1. Commitment to Truth &amp; Commercial Accuracy</h2>
              <p>
                <strong>BizNestUSA</strong> operates as an authoritative national resource for commercial discovery, professional verification, and employment transparency across the United States. We hold all published content—including directory catalogs, market guides, licensing overviews, salary benchmarks, and employer spotlights—to strict standards of factual accuracy, impartiality, and journalistic integrity.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">2. Research &amp; Fact-Checking Methodology</h2>
              <p>
                Our editorial staff and industry analysts adhere to defined fact-checking procedures when authoring hiring guides, local municipal overviews, and industry cost reports:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Primary Regulatory Sources:</strong> Legal, licensing, and trade compliance overviews cite official government entities, including the US Department of Labor (DOL), the Internal Revenue Service (IRS), the Federal Trade Commission (FTC), and respective state licensing divisions.
                </li>
                <li>
                  <strong>Economic &amp; Cost Benchmarking:</strong> Hourly rates, compensation data, and service fee projections incorporate statistics from the Bureau of Labor Statistics (BLS), verified industry association studies, and regional market quotes.
                </li>
                <li>
                  <strong>Directory Data Auditing:</strong> Business addresses, contact lines, operating classifications, and professional credentials are verified against state corporate databases and official registries prior to awarding verification credentials.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">3. Separation of Editorial Content &amp; Paid Promotions</h2>
              <p>
                Editorial integrity is strictly separated from commercial partnerships and advertising sales:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Sponsored Placements:</strong> Advertised profiles, sponsored category banners, and promoted employer listings are visibly labeled as &ldquo;Sponsored&rdquo; or &ldquo;Promoted&rdquo; to ensure total transparency for consumers.
                </li>
                <li>
                  <strong>Verified Badges Cannot Be Purchased:</strong> The BizNestUSA green Verified badge is awarded exclusively through empirical credential verification (valid license check, physical location proof, and domain authenticity) and can never be bought through advertising packages.
                </li>
                <li>
                  <strong>Unbiased Editorial Reviews:</strong> Advertisers have no editorial control or influence over educational articles, contractor vetting guides, or consumer advisory reports.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">4. Citations, AI Governance &amp; Content Authorship</h2>
              <p>
                All editorial publications undergo human review by qualified industry specialists. Where computational analysis or aggregated data models are utilized to analyze regional pricing trends, editorial oversight verifies qualitative nuance and factual context. We attribute third-party quotes, statistics, and industry benchmarks clearly.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">5. Corrections Policy &amp; Public Accountability</h2>
              <p>
                We are committed to correcting factual errors swiftly and transparently. If a business profile contains obsolete contact information, or an editorial article contains an inaccurate statutory citation, readers and business representatives may submit a correction request through our <a href="/contact" className="text-blue-600 underline">Contact Desk</a> or by emailing <a href="mailto:editor@biznestusa.com" className="text-blue-600 underline">editor@biznestusa.com</a>.
              </p>
              <p>
                Confirmed errors are corrected within 24 to 48 hours, accompanied by a public correction note on significant updates.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
