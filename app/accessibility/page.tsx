import { Metadata } from 'next'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'Accessibility Statement | BizNest USA Inclusivity Standards',
  description: 'Our commitment to digital accessibility (WCAG 2.1 Level AA) ensuring equal access for all users across the United States.',
  alternates: {
    canonical: 'https://biznestusa.com/accessibility/',
  },
}

export default function AccessibilityPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#F8FAFC] text-slate-800 font-sans min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Accessibility Statement
          </h1>
          <p className="text-sm text-slate-500 mb-8 border-b border-slate-100 pb-4">
            Last Updated: September 2026 • BizNest USA Compliance Office
          </p>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <p>
              <strong>BizNest USA</strong> is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for all visitors and apply relevant accessibility standards (WCAG 2.1 Level AA conformance).
            </p>

            <h2 className="text-xl font-bold text-slate-900 pt-4">Measures to Support Accessibility</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>High-contrast text design and WCAG-tested color palettes.</li>
              <li>Keyboard-navigable search filters, modal dialogues, and directory catalogs.</li>
              <li>Descriptive alt text for business logos and category iconography.</li>
              <li>Semantic HTML5 landmark elements for assistive screen readers.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 pt-4">Feedback &amp; Contact</h2>
            <p>
              We welcome your feedback on the accessibility of BizNest USA. If you encounter accessibility barriers, please contact our accessibility coordinator at <a href="mailto:accessibility@biznestusa.com" className="text-blue-600 underline">accessibility@biznestusa.com</a> or via our <a href="/contact" className="text-blue-600 underline">Contact Desk</a>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
