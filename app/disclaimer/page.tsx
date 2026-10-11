import { Metadata } from 'next'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'Legal Directory Disclaimer & Terms of Use | BizNest',
  description: 'Review the legal disclaimer for BizNestUSA business listings, professional portfolios, job vacancies, third-party content, and editorial recommendations.',
  alternates: {
    canonical: 'https://www.biznestusa.com/disclaimer/',
  },
  openGraph: {
    title: 'Legal Directory Disclaimer & Terms of Use | BizNest',
    description: 'Review the legal disclaimer for BizNestUSA business listings, professional portfolios, job vacancies, third-party content, and editorial recommendations.',
    url: 'https://www.biznestusa.com/disclaimer/',
    type: 'website',
  },
}

export default function DisclaimerPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Legal Disclaimer & Commercial Directory Disclosures',
    description: 'Official legal disclaimer for BizNestUSA directory information, user interactions, and external links.',
    url: 'https://www.biznestusa.com/disclaimer/'
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
              Legal Disclaimer &amp; Directory Disclosures
            </h1>
            <p className="text-sm text-slate-500 border-b border-slate-100 pb-4">
              Last Updated: October 2026 • BizNestUSA Legal &amp; Compliance Office
            </p>
          </div>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">1. Commercial Directory &amp; Informational Scope</h2>
              <p>
                The information published by <strong>BizNestUSA</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) on <a href="https://www.biznestusa.com/" className="text-blue-600 underline">https://www.biznestusa.com/</a> is made available exclusively for general commercial indexing, discovery, and informational purposes. While we employ rigorous multi-tier verification workflows to validate business registries, address data, telephone numbers, and licensing records, we make no express or implied representations or warranties regarding the real-time accuracy, timeliness, completeness, or suitability of third-party business submissions.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">2. No Professional Advice (Legal, Medical, Financial, Engineering)</h2>
              <p>
                Directory profiles, articles, licensing overviews, and cost benchmark guides published on BizNestUSA do not constitute professional legal, medical, psychiatric, taxation, investment, financial, or structural engineering advice:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Legal Counsel:</strong> Listings of attorneys, law firms, and legal consultants do not establish an attorney-client relationship. Users must independently consult licensed attorneys in their jurisdiction regarding specific legal matters.
                </li>
                <li>
                  <strong>Healthcare Practitioners:</strong> Medical doctor, dental clinic, and therapist profiles are informational directories and should never be used as a substitute for professional clinical medical evaluation, diagnosis, or emergency care.
                </li>
                <li>
                  <strong>Financial &amp; Accounting Services:</strong> CPA and financial advisory listings do not constitute registered investment advice or formalized tax opinions.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">3. Employment &amp; Recruitment Relationship Notice</h2>
              <p>
                BizNestUSA is a discovery platform and job portal, not an employment agency, employer of record, or labor contractor. We do not participate in employment negotiations, payroll processing, interview screening, or background checks on job applicants or employers. Job seekers and employers are solely responsible for verifying work authorization, executing contracts, and validating wage scales.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">4. External Web Links &amp; Third-Party Services</h2>
              <p>
                Our directory pages contain outbound hyperlinks connecting to merchant websites, third-party portfolio repositories, social platforms, and external application applicant tracking systems (ATS). Such external links are provided for user convenience only. BizNestUSA does not monitor, warrant, endorse, or accept liability for the content, privacy practices, terms, or services offered by external websites.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">5. Limitation of Legal Liability</h2>
              <p>
                To the fullest extent permitted by applicable federal and state laws, BizNestUSA and its directors, officers, employees, and agents shall not be liable for any direct, indirect, incidental, special, punitive, or consequential damages resulting from your use of this directory, commercial agreements entered into with listed businesses, or reliance on information presented herein.
              </p>
              <p>
                For questions regarding this disclaimer, please contact our compliance counsel via our <a href="/contact" className="text-blue-600 underline">Contact Desk</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
