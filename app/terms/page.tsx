import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Terms of Service | BizNest USA Directory Platform',
  description: 'Read the BizNest USA terms of service. Learn the rules and guidelines for listing, verifying, and discovering businesses on our platform.',
  alternates: {
    canonical: 'https://biznestusa.com/terms/',
  },
  robots: { index: true, follow: true },
}

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-xs text-slate-500 mb-8 border-b border-slate-200 pb-4">Last Updated: September 2026 • BizNest USA Legal Department</p>

        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          <h2 className="text-xl font-bold text-slate-900 pt-2">1. Agreement to Terms</h2>
          <p>
            These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity (&quot;you&quot;) and <strong>BizNest USA</strong> (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), concerning your access to and use of <a href="https://biznestusa.com/" className="text-blue-600 underline">https://biznestusa.com/</a> and related directory services (the &quot;Site&quot;).
          </p>
          <p>
            By accessing the Site, you represent that you have read, understood, and agree to be bound by all of these Terms of Service. If you do not agree with all of these terms, you are expressly prohibited from using the Site.
          </p>

          <h2 className="text-xl font-bold text-slate-900 pt-4">2. Intellectual Property Rights</h2>
          <p>
            Unless otherwise indicated, the Site is our proprietary property, including its software, layout algorithms, directory databases, marks, and design system. Public business data voluntarily provided by owners is published for commercial discoverability.
          </p>

          <h2 className="text-xl font-bold text-slate-900 pt-4">3. User Representations &amp; Submissions</h2>
          <p>
            By listing a business, professional portfolio, or employment opportunity on BizNest USA, you warrant that:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>All registration and contact details provided are accurate, genuine, and legally compliant.</li>
            <li>You hold the legal authority or trade representation for the business or portfolio submitted.</li>
            <li>You will promptly update your listing if address, operating hours, phone, or licensing status change.</li>
            <li>You will not submit duplicate spam entries or keyword-stuffed trade names.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 pt-4">4. Editorial Review &amp; Moderation</h2>
          <p>
            BizNest USA reserves the right to audit, verify, edit for clarity, or remove any directory entry or customer review that violates our listing guidelines, contains misleading information, or infringes upon applicable federal or state laws.
          </p>

          <h2 className="text-xl font-bold text-slate-900 pt-4">5. Disclaimer &amp; Limitation of Liability</h2>
          <p>
            BizNest USA is an informational and commercial directory platform. We do not warrant or guarantee the quality, safety, or legality of services rendered by third-party businesses or independent contractors listed on our platform. In no event will BizNest USA be liable for disputes arising between directory users and listed enterprises.
          </p>

          <h2 className="text-xl font-bold text-slate-900 pt-4">6. Governing Law</h2>
          <p>
            These Terms of Service are governed by and construed in accordance with the laws of the State of Delaware and the United States of America.
          </p>

          <h2 className="text-xl font-bold text-slate-900 pt-4">7. Contact Information</h2>
          <p>
            For legal inquiries, copyright notices, or questions regarding these Terms, contact our compliance team:
          </p>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs space-y-1">
            <p className="font-bold text-slate-900 text-sm">BizNest USA Compliance Desk</p>
            <p className="text-slate-600">Email: <a href="mailto:legal@biznestusa.com" className="text-blue-600 underline">legal@biznestusa.com</a></p>
            <p className="text-slate-600">Address: 100 Wall Street, Suite 1200, New York, NY 10005, United States</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
