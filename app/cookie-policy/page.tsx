import { Metadata } from 'next'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'Cookie Policy & Browser Tracking Notice | BizNestUSA',
  description: 'Understand how BizNestUSA uses cookies, analytics trackers, and session technologies to deliver a secure, fast, and personalized business directory platform.',
  alternates: {
    canonical: 'https://www.biznestusa.com/cookie-policy/',
  },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Cookie Policy & Browser Tracking Notice | BizNestUSA',
    description: 'Understand how BizNestUSA uses cookies, analytics trackers, and session technologies to deliver a secure, fast, and personalized business directory platform.',
    url: 'https://www.biznestusa.com/cookie-policy/',
    type: 'website',
  },
}

export default function CookiePolicyPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Cookie Policy & Data Tracking Notice',
    description: 'Official disclosure regarding cookies, analytics technologies, and tracking controls on BizNestUSA.',
    url: 'https://www.biznestusa.com/cookie-policy/'
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
              Cookie Policy &amp; Data Tracking Notice
            </h1>
            <p className="text-sm text-slate-500 border-b border-slate-100 pb-4">
              Last Updated: October 2026 • BizNestUSA Privacy &amp; Data Governance Office
            </p>
          </div>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">1. Introduction to Cookie Technologies</h2>
              <p>
                This Cookie Policy explains how <strong>BizNestUSA</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) utilizes cookies, web beacons, pixel tags, and local storage technologies when you access our business directory, jobs platform, and professional registry at <a href="https://www.biznestusa.com/" className="text-blue-600 underline">https://www.biznestusa.com/</a>.
              </p>
              <p>
                Cookies are compact data packets placed on your web browser or hardware device by web servers. They allow our systems to recognize your browser across sessions, maintain security defenses, authenticate merchant accounts, and record user search preferences across US metropolitan areas.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">2. Categories of Cookies We Deploy</h2>
              <div className="space-y-4">
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-1">
                  <h3 className="font-bold text-slate-900 text-sm">A. Strictly Necessary &amp; Security Cookies</h3>
                  <p className="text-xs text-slate-600">
                    Essential for foundational platform security and session integrity. These enable Firebase user authentication, cross-site request forgery (CSRF) defenses, rate limiting, and secure access to business owner and recruiter dashboards. These cookies cannot be disabled without breaking core platform functionality.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-1">
                  <h3 className="font-bold text-slate-900 text-sm">B. Functional &amp; Preference Cookies</h3>
                  <p className="text-xs text-slate-600">
                    Retain your customized platform preferences—such as your selected state, preferred city view (e.g. New York, Dallas, Seattle), filter toggles, and saved job bookmarks—delivering an efficient, tailored user experience upon return visits.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-1">
                  <h3 className="font-bold text-slate-900 text-sm">C. Performance &amp; Analytics Cookies</h3>
                  <p className="text-xs text-slate-600">
                    Aggregate non-identifying telemetry regarding visitor volumes, bounce rates, high-demand commercial keywords, and page loading speeds. These analytics insights allow us to optimize server response times, refine taxonomy structures, and identify high-interest industry categories.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-1">
                  <h3 className="font-bold text-slate-900 text-sm">D. Advertising &amp; Commercial Measurement Cookies</h3>
                  <p className="text-xs text-slate-600">
                    Third-party advertising partners, such as Google AdSense, may place cookies or web beacons to serve contextually relevant commercial advertisements across directory categories. These cookies measure campaign impressions and prevent repeated ad displays.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">3. CCPA/CPRA &amp; State Privacy Rights</h2>
              <p>
                Under the California Consumer Privacy Act (CCPA), California Privacy Rights Act (CPRA), and related privacy laws in states such as Virginia, Colorado, Connecticut, and Texas, residents have the right to opt out of the &ldquo;sale&rdquo; or &ldquo;sharing&rdquo; of personal information for cross-context behavioral advertising. BizNestUSA respects browser-level Global Privacy Control (GPC) signals and provides opt-out options.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">4. Browser Controls &amp; Disabling Cookies</h2>
              <p>
                Most modern web browsers (including Google Chrome, Apple Safari, Mozilla Firefox, and Microsoft Edge) allow users to manage cookie storage settings. You may configure your browser to block third-party cookies, alert you before receiving a cookie, or wipe existing cookies from device cache. Please be aware that blocking functional cookies may limit access to authenticated merchant dashboards and bookmarking features.
              </p>
              <p>
                For further inquiries concerning our cookie protocols or data rights, please contact our privacy compliance officer at <a href="mailto:privacy@biznestusa.com" className="text-blue-600 underline">privacy@biznestusa.com</a> or via our <a href="/contact" className="text-blue-600 underline">Contact Desk</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
