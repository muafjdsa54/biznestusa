import { Metadata } from 'next'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'Business Listing Guidelines | BizNest USA',
  description: 'Requirements for adding your company, professional practice, or local service to the BizNest USA verified business directory.',
  alternates: {
    canonical: 'https://biznestusa.com/business-listing-guidelines/',
  },
}

export default function BusinessListingGuidelinesPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#F8FAFC] text-slate-800 font-sans min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Business Listing Guidelines
          </h1>
          <p className="text-sm text-slate-500 mb-8 border-b border-slate-100 pb-4">
            Last Updated: September 2026 • BizNest USA Editorial Team
          </p>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <p>
              To ensure search engine indexability and consumer trust across all 50 states, business owners must adhere to the following listing criteria when submitting their profile to BizNest USA.
            </p>

            <h2 className="text-xl font-bold text-slate-900 pt-4">1. Eligible Businesses</h2>
            <p>
              Any legally operating business, professional service provider, corporate entity, medical practice, retail establishment, trade contractor, or technology firm located in or legally registered to operate in the United States is eligible for listing.
            </p>

            <h2 className="text-xl font-bold text-slate-900 pt-4">2. Accurate NAP Information (Name, Address, Phone)</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Business Name:</strong> Must match your official trade name (DBA or legal corporate registration) without spam keywords.</li>
              <li><strong>Physical Address:</strong> Accurate street address, city, state abbreviation, and ZIP code within the United States.</li>
              <li><strong>Phone Number:</strong> Valid direct US telephone line or verified toll-free customer support number.</li>
              <li><strong>Categories &amp; Services:</strong> Select accurate categories and describe real commercial offerings.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 pt-4">3. Prohibited Content</h2>
            <p>
              Listings promoting illegal activities, adult content, fraudulent schemes, predatory lending, or unregistered financial or medical practices will be rejected immediately by our compliance team.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
