import { Metadata } from 'next'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'Community Guidelines | BizNest USA Directory Platform',
  description: 'Standards of conduct for business owners, job seekers, employers, and consumers engaging across BizNest USA.',
  alternates: {
    canonical: 'https://biznestusa.com/community-guidelines/',
  },
}

export default function CommunityGuidelinesPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#F8FAFC] text-slate-800 font-sans min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Community Guidelines
          </h1>
          <p className="text-sm text-slate-500 mb-8 border-b border-slate-100 pb-4">
            Last Updated: September 2026 • BizNest USA Trust &amp; Safety
          </p>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <p>
              BizNest USA is dedicated to fostering a trustworthy, professional, and transparent marketplace for American businesses, professionals, employers, and consumers.
            </p>

            <h2 className="text-xl font-bold text-slate-900 pt-4">1. Authentic Ratings &amp; Reviews</h2>
            <p>
              Customer reviews must reflect firsthand, genuine experiences. Fake testimonials, competitor sabotage, employee-fabricated reviews, or incentivized feedback are strictly prohibited and subject to automated fraud detection.
            </p>

            <h2 className="text-xl font-bold text-slate-900 pt-4">2. Zero Tolerance for Spam &amp; Harassment</h2>
            <p>
              Unsolicited mass marketing, abusive messaging, deceptive claims, discriminatory language, or unauthorized use of personal credentials will result in immediate profile suspension and domain blacklisting.
            </p>

            <h2 className="text-xl font-bold text-slate-900 pt-4">3. Honest Representation of Qualifications</h2>
            <p>
              Professionals and service contractors must represent their state licensing, insurance, certifications, and service area accurately. Misrepresenting credentials violates federal and state consumer protection standards.
            </p>

            <h2 className="text-xl font-bold text-slate-900 pt-4">4. Reporting Violations</h2>
            <p>
              To report suspicious behavior, fraudulent listings, or abusive conduct, contact our safety team immediately via our <a href="/contact" className="text-blue-600 underline">Contact Desk</a> or by emailing <a href="mailto:safety@biznestusa.com" className="text-blue-600 underline">safety@biznestusa.com</a>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
