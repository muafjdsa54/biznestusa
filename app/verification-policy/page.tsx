import { Metadata } from 'next'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'Verification Policy & Trust Standards | BizNestUSA',
  description: 'Learn how BizNestUSA verifies business profiles, addresses, contact details, state licenses, and professional credentials across all 50 United States.',
  alternates: {
    canonical: 'https://www.biznestusa.com/verification-policy/',
  },
  openGraph: {
    title: 'Verification Policy & Trust Standards | BizNestUSA',
    description: 'Learn how BizNestUSA verifies business profiles, addresses, contact details, state licenses, and professional credentials across all 50 United States.',
    url: 'https://www.biznestusa.com/verification-policy/',
    type: 'website',
  },
}

export default function VerificationPolicyPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Verification Policy & Trust Badge Standards',
    description: 'Official verification and validation protocol for businesses and professionals listed on BizNestUSA.',
    url: 'https://www.biznestusa.com/verification-policy/'
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
              Verification Policy &amp; Trust Badge Protocol
            </h1>
            <p className="text-sm text-slate-500 border-b border-slate-100 pb-4">
              Last Updated: October 2026 • BizNestUSA Trust &amp; Verification Board
            </p>
          </div>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-emerald-950 font-medium space-y-1">
              <strong className="block text-emerald-900 font-bold">Verification Notice &amp; Scope:</strong>
              <p>
                The BizNestUSA green Verified badge indicates that a commercial profile or individual specialist has completed our multi-step verification protocol. Verification confirms identity, operational communication channels, and public record standing, but does not constitute an unconditional guarantee of workmanship or commercial performance.
              </p>
            </div>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">1. Four-Tier Verification Architecture</h2>
              <p>
                To eliminate fraudulent directory listings, duplicate bot profiles, and misleading business registrations, BizNestUSA implements a four-tier verification review process:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1.5">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Tier 1</span>
                  <h3 className="font-bold text-slate-900 text-sm">Channel &amp; Domain Authentication</h3>
                  <p className="text-xs text-slate-600">
                    We verify active corporate web domains, direct DNS MX records, and require verification responses via authorized company email addresses and telephone lines.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1.5">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Tier 2</span>
                  <h3 className="font-bold text-slate-900 text-sm">Physical Address &amp; Geocoding</h3>
                  <p className="text-xs text-slate-600">
                    Commercial street addresses are validated against US Postal Service (USPS) address databases and municipal property databases to filter out illegitimate virtual maildrops.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1.5">
                  <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Tier 3</span>
                  <h3 className="font-bold text-slate-900 text-sm">State Corporate Cross-Reference</h3>
                  <p className="text-xs text-slate-600">
                    Entity status (LLC, Inc., LLP) is cross-referenced with Secretary of State commercial entity divisions to confirm &ldquo;Active&rdquo; or &ldquo;Good Standing&rdquo; corporate status.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1.5">
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Tier 4</span>
                  <h3 className="font-bold text-slate-900 text-sm">Professional Board Licensing</h3>
                  <p className="text-xs text-slate-600">
                    For licensed professions (General Contractors, Electricians, Plumbers, Attorneys, CPAs, Physicians), we inspect state licensing boards to verify active numbers and zero disciplinary bars.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">2. Professional Specialist &amp; Consultant Review</h2>
              <p>
                Individual practitioner profiles in our Professional Directory undergo verification of:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Professional identity and government-issued credential documentation where applicable.</li>
                <li>Verifiable work history, portfolio repositories (e.g. GitHub, Behance, published case studies), or corporate client references.</li>
                <li>Active professional certifications issued by recognized bodies (e.g. AWS Certified Solutions Architect, AICPA, Board of Professional Engineers).</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">3. Annual Audits &amp; Continuous Monitoring</h2>
              <p>
                Verification status is not perpetual. BizNestUSA performs periodic automated audits of listed licenses and state corporate statuses. If an entity’s corporate filing lapses into forfeiture, or if a contractor license expires without renewal, the profile’s Verified badge is automatically suspended pending updated proof of renewal.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">4. Badge Revocation &amp; Consumer Dispute Protocol</h2>
              <p>
                BizNestUSA actively investigates verified listings subject to substantiated consumer fraud reports or regulatory disciplinary actions. Verified status is subject to immediate revocation if:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>The business changes ownership, telephone lines, or physical location without submitting updated documentation.</li>
                <li>The entity receives formal sanctions from state licensing boards, the Better Business Bureau (BBB), or state Attorneys General.</li>
                <li>The merchant engages in fraudulent deceptive billing or predatory practices.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">5. Submitting Verification Proof</h2>
              <p>
                Business managers and practitioners wishing to expedite their verification review can submit official documentation—such as state formation certificates, commercial liability insurance certificates (COIs), or active trade licenses—through the <a href="/support" className="text-blue-600 underline">Verification Support Desk</a> or by emailing <a href="mailto:verify@biznestusa.com" className="text-blue-600 underline">verify@biznestusa.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
