import { Metadata } from 'next'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'Cookie Policy | BizNest USA Directory Platform',
  description: 'Understand how BizNest USA uses cookies, analytics, and session technologies to deliver a secure, fast, and personalized user experience.',
  alternates: {
    canonical: 'https://biznestusa.com/cookie-policy/',
  },
  robots: { index: true, follow: true },
}

export default function CookiePolicyPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#F8FAFC] text-slate-800 font-sans min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Cookie &amp; Tracking Policy
          </h1>
          <p className="text-sm text-slate-500 mb-8 border-b border-slate-100 pb-4">
            Last Updated: September 2026 • BizNest USA Privacy Office
          </p>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <p>
              This Cookie Policy explains how <strong>BizNest USA</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) uses cookies, web beacons, and similar browser storage technologies when you visit <a href="https://biznestusa.com/" className="text-blue-600 underline">https://biznestusa.com/</a>.
            </p>

            <h2 className="text-xl font-bold text-slate-900 pt-4">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files placed on your browser or device by web servers. They allow the directory platform to remember your authentication session, retain search preferences (such as your chosen state or metro area), and keep your dashboard interactions secure.
            </p>

            <h2 className="text-xl font-bold text-slate-900 pt-4">2. Categories of Cookies We Use</h2>
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
                <h3 className="font-bold text-slate-900 mb-1">A. Strictly Necessary &amp; Security Cookies</h3>
                <p className="text-xs text-slate-600">
                  Required for core platform features including Firebase user authentication, CSRF tokens, anti-spam validation, and account dashboard navigation. These cannot be disabled.
                </p>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
                <h3 className="font-bold text-slate-900 mb-1">B. Preference &amp; Functionality Cookies</h3>
                <p className="text-xs text-slate-600">
                  Remember your city and category filters, bookmarked profiles, and interactive layout settings so your directory navigation remains seamless across visits.
                </p>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
                <h3 className="font-bold text-slate-900 mb-1">C. Performance &amp; Analytics Cookies</h3>
                <p className="text-xs text-slate-600">
                  Help us understand how visitors discover businesses, popular search terms, and page performance so we can continuously optimize search indexation and site speed.
                </p>
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-900 pt-4">3. Managing Cookie Preferences</h2>
            <p>
              You can control or delete cookies directly within your web browser settings (Chrome, Safari, Firefox, Edge). Note that disabling essential cookies may impact account logins and dashboard functionality.
            </p>

            <p className="text-xs text-slate-500 pt-4">
              Questions regarding our cookie practices? Contact our team at <a href="mailto:privacy@biznestusa.com" className="text-blue-600 underline">privacy@biznestusa.com</a>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
