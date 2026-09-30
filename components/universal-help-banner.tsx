import Link from 'next/link'
import { LifeBuoy, ArrowRight, MessageSquare, ShieldCheck } from 'lucide-react'

export default function UniversalHelpBanner() {
  return (
    <section className="bg-slate-50 border-t border-slate-200 text-slate-800 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-xs flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-start sm:items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 border border-blue-100">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  BizNestUSA Help & Support
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                Need help managing your listing or have questions about our USA directory?
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                Whether you want to update your business profile, post an open role, or report inaccurate data, our team is here to assist.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <Link
              href="/contact"
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Contact Support</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/help-center"
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs sm:text-sm transition-colors text-center"
            >
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
