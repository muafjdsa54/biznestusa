import { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { ShieldAlert } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Report Abuse | BizNest USA Safety & Compliance',
  description: 'Report spam, harassment, counterfeit listings, copyright violations, or abusive behavior on BizNest USA.',
  alternates: {
    canonical: 'https://biznestusa.com/report-abuse/',
  },
}

export default function ReportAbusePage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#F8FAFC] text-slate-800 font-sans min-h-screen pb-16">
        <section className="bg-white border-b border-slate-200 py-16 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
              Report Abuse &amp; Compliance Concerns
            </h1>
            <p className="mt-3 text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
              We take copyright infringement, spam, and abusive behavior seriously to maintain platform integrity.
            </p>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Abuse Reporting Categories</h2>
            
            <div className="space-y-3 text-xs sm:text-sm text-slate-600">
              <div className="p-4 bg-red-50/60 rounded-xl border border-red-200">
                <h3 className="font-bold text-red-900">Copyright &amp; Trademark Infringement</h3>
                <p className="mt-1">DMCA notices regarding unauthorized use of logos, photos, or trade copy.</p>
              </div>

              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200">
                <h3 className="font-bold text-amber-900">Spam &amp; Automated Harassment</h3>
                <p className="mt-1">Deceptive mass messaging, phishing links, or artificial bot entries.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-900">Impersonation &amp; False Credentials</h3>
                <p className="mt-1">Profiles misrepresenting state contractor licensing or corporate ownership.</p>
              </div>
            </div>

            <div className="pt-4 text-center">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                <span>Submit Incident to Compliance Team</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
