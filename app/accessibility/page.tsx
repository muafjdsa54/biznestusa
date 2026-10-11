import { Metadata } from 'next'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'Accessibility Statement & Standards | BizNestUSA Hub',
  description: 'Read our accessibility statement and WCAG 2.1 AA compliance standards across the BizNestUSA business directory, job portal, and professional network.',
  alternates: {
    canonical: 'https://www.biznestusa.com/accessibility/',
  },
  openGraph: {
    title: 'Accessibility Statement & Standards | BizNestUSA Hub',
    description: 'Read our accessibility statement and WCAG 2.1 AA compliance standards across the BizNestUSA business directory, job portal, and professional network.',
    url: 'https://www.biznestusa.com/accessibility/',
    type: 'website',
  },
}

export default function AccessibilityPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Accessibility Statement & Standards',
    description: 'BizNestUSA commitment to digital accessibility conforming to WCAG 2.1 Level AA guidelines.',
    url: 'https://www.biznestusa.com/accessibility/'
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
              Accessibility Statement &amp; Standards
            </h1>
            <p className="text-sm text-slate-500 border-b border-slate-100 pb-4">
              Last Updated: October 2026 • BizNestUSA Compliance &amp; Digital Inclusivity Office
            </p>
          </div>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">1. Our Commitment to Universal Inclusivity</h2>
              <p>
                <strong>BizNestUSA</strong> is dedicated to ensuring that digital access to local commercial information, professional portfolios, employer profiles, and job opportunities is equitable, intuitive, and readily accessible to all individuals across the United States, including individuals with visual, auditory, physical, speech, cognitive, or neurological disabilities.
              </p>
              <p>
                In furtherance of this mission, we systematically implement digital accessibility standards governed by the World Wide Web Consortium (W3C) Web Content Accessibility Guidelines (WCAG) 2.1, targeting Level AA conformance across all public directory views, administrative interfaces, and interactive search components.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">2. Technical Conformance &amp; Engineering Measures</h2>
              <p>
                Our engineering and product design teams integrate accessible design patterns into the software development lifecycle. Key technical accommodations implemented sitewide include:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Perceivable Content &amp; Contrast:</strong> Text and visual user interface components satisfy the minimum WCAG contrast ratio of 4.5:1 for normal text and 3:1 for large graphical elements. Decorative imagery and corporate logos include descriptive alternative (<code className="bg-slate-100 px-1 py-0.5 rounded text-xs">alt</code>) text attributes.
                </li>
                <li>
                  <strong>Keyboard Navigability:</strong> All interactive capabilities—including search dropdowns, metro city selectors, category filters, and modal dialogues—are completely operable via standard keyboard strokes without requiring a pointing device or trapping keyboard focus.
                </li>
                <li>
                  <strong>Screen Reader Compatibility:</strong> We employ valid HTML5 semantic landmark elements (<code className="bg-slate-100 px-1 py-0.5 rounded text-xs">&lt;main&gt;</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">&lt;nav&gt;</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">&lt;section&gt;</code>) and WAI-ARIA attributes to ensure clear hierarchy when parsed by screen readers like NVDA, JAWS, and Apple VoiceOver.
                </li>
                <li>
                  <strong>Responsive Zoom &amp; Reflow:</strong> Content dynamically reflows without loss of information or horizontal scrolling when users zoom desktop viewports up to 200%.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">3. Continuous Auditing &amp; Assistive Tech Testing</h2>
              <p>
                To maintain high accessibility benchmarks, BizNestUSA conducts automated and manual evaluations. Automated scans identify missing structural tags, low-contrast text nodes, and broken anchor links, while manual spot-checks test core user flows—such as searching for verified electricians in Chicago or submitting a job application—using screen readers and keyboard navigation alone.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">4. Third-Party Content &amp; Business Listings</h2>
              <p>
                While BizNestUSA enforces accessibility guidelines across all native platform infrastructure, our directory contains third-party content submitted by independent business owners and recruiters (such as external website links, user-uploaded PDFs, and external application tracking portals). We actively provide listing guidelines that instruct merchants to format their media and links accessibly.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">5. Accessibility Feedback &amp; Remediation Assistance</h2>
              <p>
                We welcome suggestions, questions, and reports regarding accessibility obstacles on our platform. If you encounter any element on BizNestUSA that presents a barrier to access, please reach out to our dedicated Accessibility Coordinator:
              </p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1 text-xs">
                <p><strong>Email:</strong> <a href="mailto:accessibility@biznestusa.com" className="text-blue-600 underline">accessibility@biznestusa.com</a></p>
                <p><strong>Support Desk:</strong> <a href="/contact" className="text-blue-600 underline">biznestusa.com/contact/</a></p>
                <p><strong>Response Protocol:</strong> We strive to acknowledge inquiries within 2 business days and implement necessary code modifications or provide alternative accessible formats promptly.</p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
