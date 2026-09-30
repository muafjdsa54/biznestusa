import { Metadata } from 'next'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'Disclaimer | BizNest USA Directory Platform',
  description: 'Legal disclaimer for BizNest USA business listings, professional portfolios, job vacancies, and third-party commercial content.',
  alternates: {
    canonical: 'https://biznestusa.com/disclaimer/',
  },
}

export default function DisclaimerPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#F8FAFC] text-slate-800 font-sans min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Disclaimer
          </h1>
          <p className="text-sm text-slate-500 mb-8 border-b border-slate-100 pb-4">
            Last Updated: September 2026 • BizNest USA Compliance Desk
          </p>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <p>
              The information provided by <strong>BizNest USA</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) on <a href="https://biznestusa.com/" className="text-blue-600 underline">https://biznestusa.com/</a> is for general commercial directory and informational purposes only.
            </p>

            <h2 className="text-xl font-bold text-slate-900 pt-4">1. Directory Information Accuracy</h2>
            <p>
              While we make diligent efforts to maintain accurate business profiles, addresses, operating hours, and employment vacancies, BizNest USA makes no warranties regarding the absolute completeness, accuracy, or real-time availability of third-party user-submitted listings.
            </p>

            <h2 className="text-xl font-bold text-slate-900 pt-4">2. Professional Advice Disclaimer</h2>
            <p>
              Listings related to legal, medical, accounting, financial, or engineering services are directory entries and do not constitute professional advice. Users should perform independent verification and license checks before engaging service providers.
            </p>

            <h2 className="text-xl font-bold text-slate-900 pt-4">3. External Links Disclaimer</h2>
            <p>
              BizNest USA contains links to external business websites, social channels, and third-party job application portals. We do not endorse or assume responsibility for content, privacy policies, or practices of third-party websites.
            </p>

            <h2 className="text-xl font-bold text-slate-900 pt-4">4. Limitation of Liability</h2>
            <p>
              Under no circumstances shall BizNest USA be liable for any direct, indirect, incidental, or consequential damages resulting from transactions or interactions between users, listed businesses, or candidates.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
