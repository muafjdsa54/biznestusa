import Link from 'next/link'
import HeroSearchForm from './hero-search-form'

export default function HeroSection() {
  return (
    <section
      className="relative bg-white overflow-hidden py-16 md:py-24 border-b border-slate-200"
      aria-labelledby="hero-heading"
    >
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="inline-flex items-center gap-2 text-blue-600 font-bold text-xs mb-3 tracking-wider uppercase bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
          America&apos;s Verified Business &amp; Talent Directory
        </p>

        <h1
          id="hero-heading"
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-4 tracking-tight"
        >
          Find Businesses, Professionals &amp; Jobs Across the USA
        </h1>
        <p className="text-slate-600 font-normal text-base sm:text-lg mb-8 max-w-2xl mx-auto">
          Connect directly with licensed contractors, verified companies, skilled professionals, and career opportunities across all 50 states.
        </p>

        {/* Search Bar */}
        <HeroSearchForm />

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Link
            id="hero-list-business-btn"
            href="/add-business"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 sm:px-8 py-3.5 rounded-xl transition-all text-sm sm:text-base shadow-md hover:shadow-lg text-center"
          >
            List Your Business for Free
          </Link>
          <Link
            id="hero-about-btn"
            href="/about"
            className="bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold px-6 sm:px-8 py-3.5 rounded-xl transition-all text-sm sm:text-base border border-slate-200 text-center"
          >
            Learn More About Us
          </Link>
        </div>

        <div className="mt-8 bg-slate-50 rounded-2xl p-4 sm:p-6 max-w-2xl mx-auto border border-slate-200/80">
          <p className="text-slate-700 text-sm font-semibold">
            BizNest USA connects American business owners, home-service pros, and employers with customers and candidates nationwide.
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs text-slate-600 font-medium">
            <span className="bg-white px-3 py-1 rounded-full border border-slate-200">Free Business Listing</span>
            <span className="bg-white px-3 py-1 rounded-full border border-slate-200">Verified Credentials</span>
            <span className="bg-white px-3 py-1 rounded-full border border-slate-200">Direct Customer Inquiries</span>
          </div>
        </div>
      </div>
    </section>
  )
}
