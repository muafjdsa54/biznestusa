import { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Headphones, Mail, Phone, Clock, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Customer Support | BizNestUSA Help Desk',
  description: 'Connect with the BizNestUSA support team for assistance with business listings, verified badges, professional profiles, and directory inquiries.',
  alternates: {
    canonical: 'https://biznestusa.com/support/',
  },
}

export default function SupportPage() {
  return (
    <>
      <Navbar />
      <main className="bg-slate-50 text-slate-900 font-sans min-h-screen pb-16">
        
        {/* HEADER */}
        <section className="bg-white border-b border-slate-200 py-14 sm:py-16 text-center space-y-3">
          <div className="max-w-4xl mx-auto px-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Headphones className="w-6 h-6" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Customer Support Desk
            </h1>
            <p className="mt-2 text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Our support team is available Monday through Friday to assist with listing management, professional profile verification, and platform questions.
            </p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs text-center space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">How Can We Help You Today?</h2>
              <p className="text-xs text-slate-500 mt-1">Select a direct communication channel below or submit an inquiry.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <Phone className="w-5 h-5 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-xs">Direct Support</h4>
                <p className="text-xs text-slate-600 font-medium">(800) 555-0199</p>
                <p className="text-[11px] text-slate-400">Toll-free across all US states</p>
              </div>

              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <Mail className="w-5 h-5 text-blue-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-xs">Email Assistance</h4>
                <p className="text-xs text-slate-600 font-medium">support@biznestusa.com</p>
                <p className="text-[11px] text-slate-400">Response within 24 hours</p>
              </div>

              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <Clock className="w-5 h-5 text-indigo-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-xs">Support Hours</h4>
                <p className="text-xs text-slate-600 font-medium">9 AM – 6 PM EST</p>
                <p className="text-[11px] text-slate-400">Monday through Friday</p>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs"
              >
                <span>Submit a Support Ticket</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
