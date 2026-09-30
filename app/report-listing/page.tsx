import { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { AlertTriangle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Report a Listing | BizNest USA Directory Integrity',
  description: 'Report inaccurate, permanently closed, infringing, or fraudulent business listings on BizNest USA for rapid review.',
  alternates: {
    canonical: 'https://biznestusa.com/report-listing/',
  },
}

export default function ReportListingPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#F8FAFC] text-slate-800 font-sans min-h-screen pb-16">
        <section className="bg-white border-b border-slate-200 py-16 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
              Report an Inaccurate Listing
            </h1>
            <p className="mt-3 text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
              Help us maintain the United States&apos; most trusted and reliable business directory.
            </p>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Common Reporting Scenarios</h2>
            
            <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
              <li className="p-3.5 bg-slate-50 rounded-xl border border-slate-200"><strong>Business Permanently Closed:</strong> The entity no longer operates at this physical location.</li>
              <li className="p-3.5 bg-slate-50 rounded-xl border border-slate-200"><strong>Incorrect Contact / Phone:</strong> The telephone number belongs to a different individual or organization.</li>
              <li className="p-3.5 bg-slate-50 rounded-xl border border-slate-200"><strong>Unauthorized Ownership Claim:</strong> Someone listed your company or practice without legal authorization.</li>
              <li className="p-3.5 bg-slate-50 rounded-xl border border-slate-200"><strong>Fraudulent or Misleading Activity:</strong> The listing engages in deceptive trade practices.</li>
            </ul>

            <div className="pt-4 text-center">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                <span>Submit Report to Editorial Desk</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
