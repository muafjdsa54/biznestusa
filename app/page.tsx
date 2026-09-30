import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Search, MapPin, Building2, Briefcase, Users, ShieldCheck, ArrowRight, 
  Sparkles, CheckCircle2, ChevronRight, UserPlus, Plus, ExternalLink,
  Laptop, HeartPulse, UtensilsCrossed, Car, GraduationCap, Wrench, Scissors, Grid
} from 'lucide-react'
import { 
  BUSINESS_CATEGORIES, 
  PROFESSIONAL_CATEGORIES, 
  TOP_CITIES, 
  US_STATES, 
  BusinessItem, 
  ProfessionalItem, 
  JobItem 
} from '@/lib/data'
import { getAllBusinesses } from '@/lib/db-service'
import { getAllJobs } from '@/lib/job-service'
import { getAllProfessionals } from '@/lib/professional-service'
import { getPublicJobPath } from '@/lib/job-url'

export const revalidate = 3600

export const metadata: Metadata = {
  title: "BizNestUSA | USA Business, Professional & Jobs Directory Platform",
  description: "Discover verified local businesses, skilled professionals, and career opportunities across all 50 US states. Search by category, profession, city, or state.",
  alternates: {
    canonical: 'https://www.biznestusa.com/',
  },
  openGraph: {
    title: "BizNestUSA | USA Business, Professional & Jobs Directory Platform",
    description: "Discover verified local businesses, skilled professionals, and career opportunities across all 50 US states.",
    url: 'https://www.biznestusa.com/',
    siteName: 'BizNestUSA',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "BizNestUSA | USA Business, Professional & Jobs Directory Platform",
    description: "Discover verified local businesses, skilled professionals, and career opportunities across all 50 US states.",
  },
}

const FAQS = [
  {
    question: 'What is BizNestUSA?',
    answer: 'BizNestUSA is a unified American directory platform connecting businesses, licensed professionals, and career opportunities across all 50 US states.'
  },
  {
    question: 'How do businesses list their company?',
    answer: 'Companies can use the "List Your Business" workflow to create a public profile including contact information, addresses, services, hours, and open job postings.'
  },
  {
    question: 'How can individual professionals create a profile?',
    answer: 'Professionals across technology, healthcare, design, finance, legal, and skilled trades can create a public profile showcasing their skills, portfolio, experience, and open-to-work status.'
  },
  {
    question: 'How do job postings work on the platform?',
    answer: 'Employers can post verified job vacancies with job type, remote/on-site status, salary ranges, and direct application methods for job seekers.'
  }
]

const POPULAR_SEARCH_TERMS = [
  { label: 'Plumbers in Texas', query: 'Plumber', state: 'Texas' },
  { label: 'Roofers in Florida', query: 'Roofer', state: 'Florida' },
  { label: 'Dentists in New York', query: 'Dentist', state: 'New York' },
  { label: 'Software Developers in California', query: 'Software Developer', state: 'California' },
  { label: 'Attorneys in Illinois', query: 'Attorney', state: 'Illinois' },
  { label: 'Accountants in Georgia', query: 'Accountant', state: 'Georgia' },
  { label: 'Electricians in Ohio', query: 'Electrician', state: 'Ohio' },
  { label: 'Remote Software Jobs', query: 'Software Development', workplace: 'Remote' },
]

export default async function HomePage() {
  const [allBusinesses, allJobs, allProfessionals] = await Promise.all([
    getAllBusinesses().catch(() => [] as BusinessItem[]),
    getAllJobs().catch(() => [] as JobItem[]),
    getAllProfessionals().catch(() => [] as ProfessionalItem[])
  ])

  const approvedBusinesses = (allBusinesses || []).filter(b => b.status === 'approved' || !b.status).slice(0, 6)
  const approvedJobs = (allJobs || []).filter(j => j.status === 'approved' || !j.status).slice(0, 4)
  const approvedProfessionals = (allProfessionals || []).filter(p => p.status === 'approved' || !p.status).slice(0, 4)

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BizNestUSA',
    url: 'https://www.biznestusa.com/',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.biznestusa.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    },
    description: 'USA business directory, professional network, and jobs platform'
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main id="main-content" className="flex-1">
        {/* 1. HERO SECTION */}
        <section className="bg-white border-b border-slate-200/80 pt-12 pb-16 md:pt-16 md:pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>United States Business & Professional Ecosystem</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Businesses, Professionals & Jobs <br className="hidden sm:inline" />
              <span className="text-blue-600">Across the USA</span>
            </h1>

            <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Explore trusted local companies, connect with verified skilled professionals, and discover career opportunities across all 50 states.
            </p>

            {/* Global Hero Search */}
            <div className="max-w-3xl mx-auto bg-white rounded-2xl p-2.5 sm:p-3 shadow-sm border border-slate-200 text-left mt-8">
              <form action="/search" method="GET" className="grid grid-cols-1 md:grid-cols-12 gap-2">
                <div className="md:col-span-6 flex items-center gap-3 px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <label htmlFor="hero-search-q" className="sr-only">Keywords, business, skill or title</label>
                  <input
                    id="hero-search-q"
                    type="text"
                    name="q"
                    placeholder="e.g. Plumber, Web Developer, Dental Clinic..."
                    className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none"
                  />
                </div>

                <div className="md:col-span-4 flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <label htmlFor="hero-location-select" className="sr-only">City or State</label>
                  <select
                    id="hero-location-select"
                    name="location"
                    className="w-full bg-transparent text-slate-900 text-xs sm:text-sm focus:outline-none cursor-pointer"
                  >
                    <option value="">All States & Cities</option>
                    <optgroup label="Top Metros">
                      {TOP_CITIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </optgroup>
                    <optgroup label="All 50 US States">
                      {US_STATES.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    aria-label="Search Platform"
                    className="w-full h-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </button>
                </div>
              </form>

              {/* Quick Search Chips */}
              <div className="pt-3 px-2 flex items-center gap-2 flex-wrap text-xs text-slate-500">
                <span className="font-semibold text-slate-400">Popular:</span>
                {POPULAR_SEARCH_TERMS.slice(0, 5).map((term, i) => (
                  <span key={term.label} className="inline-flex items-center gap-1.5">
                    <Link
                      href={`/search?q=${encodeURIComponent(term.query)}&location=${encodeURIComponent(term.state || '')}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {term.label}
                    </Link>
                    {i < 4 && <span className="text-slate-300">•</span>}
                  </span>
                ))}
              </div>
            </div>

            {/* Core Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto pt-6">
              <Link
                href="/add-business"
                className="p-3.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 rounded-xl transition-all text-left flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600">List Your Business</h3>
                  <p className="text-[11px] text-slate-500">Publish your company listing</p>
                </div>
              </Link>

              <Link
                href="/add-professional"
                className="p-3.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 rounded-xl transition-all text-left flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600">Create Profile</h3>
                  <p className="text-[11px] text-slate-500">Showcase your skills & portfolio</p>
                </div>
              </Link>

              <Link
                href="/post-job"
                className="p-3.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 rounded-xl transition-all text-left flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600">Post a Job</h3>
                  <p className="text-[11px] text-slate-500">Recruit qualified talent</p>
                </div>
              </Link>
            </div>

          </div>
        </section>

        {/* 2. THE THREE CONNECTED PILLARS (Business -> Jobs -> Professionals) */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Integrated Platform</span>
            <h2 className="text-2xl font-bold text-slate-900">One Connected Ecosystem</h2>
            <p className="text-xs text-slate-600">
              Businesses post open jobs, professionals showcase their skills, and customers discover trusted services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">A. Business Directory</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Create comprehensive business listings with address, multiple branches, operating hours, phone, email, and services.
              </p>
              <Link href="/search" className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline pt-1">
                <span>Explore Businesses</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">B. Professional Profiles</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Individual public profiles for developers, designers, doctors, accountants, attorneys, and tradespeople with open-to-work status.
              </p>
              <Link href="/professionals" className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline pt-1">
                <span>Browse Professionals</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">C. Jobs Across the USA</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Companies post openings directly linked to their corporate profile. Filter remote, hybrid, or on-site opportunities by state and city.
              </p>
              <Link href="/jobs" className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline pt-1">
                <span>Search Open Jobs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* 3. BUSINESS DIRECTORY CATEGORIES */}
        <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Local Services</span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Browse Business Categories
              </h2>
            </div>
            <Link href="/categories" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <span>View All Categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BUSINESS_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <Link href={`/category/${cat.id}`} className="font-bold text-slate-900 text-sm hover:text-blue-600">
                      {cat.name}
                    </Link>
                  </div>
                  <Link href={`/category/${cat.id}`} className="text-slate-400 hover:text-blue-600">
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <p className="text-xs text-slate-500 line-clamp-1">{cat.desc}</p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cat.subcategories.slice(0, 4).map((sub) => (
                    <Link
                      key={sub}
                      href={`/search?q=${encodeURIComponent(sub)}&category=${encodeURIComponent(cat.name)}`}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80 transition-colors"
                    >
                      {sub}
                    </Link>
                  ))}
                  {cat.subcategories.length > 4 && (
                    <Link
                      href={`/category/${cat.id}`}
                      className="text-[11px] px-2 py-0.5 rounded-md text-blue-600 font-medium hover:underline"
                    >
                      +{cat.subcategories.length - 4} more
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. PROFESSIONAL DIRECTORY CATEGORIES */}
        <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Individual Talent</span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Explore Professional Categories
              </h2>
            </div>
            <Link href="/professionals" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <span>All Professionals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROFESSIONAL_CATEGORIES.map((proCat) => (
              <div
                key={proCat.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{proCat.name}</h3>
                    <p className="text-[11px] text-slate-500">{proCat.desc}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {proCat.professions.slice(0, 3).map((prof) => (
                    <Link
                      key={prof}
                      href={`/professionals?profession=${encodeURIComponent(prof)}`}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80 transition-colors"
                    >
                      {prof}
                    </Link>
                  ))}
                  {proCat.professions.length > 3 && (
                    <Link
                      href={`/professionals?category=${encodeURIComponent(proCat.name)}`}
                      className="text-[11px] px-2 py-0.5 rounded-md text-indigo-600 font-medium hover:underline"
                    >
                      +{proCat.professions.length - 3} more
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. TOP LOCATIONS (USA METROS & STATES) */}
        <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">National Reach</span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Explore Top US Locations
              </h2>
            </div>
            <Link href="/cities" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <span>View All 50 States</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {TOP_CITIES.map((city) => (
              <Link
                key={city}
                href={`/city/${city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                className="p-3 bg-white hover:bg-blue-50/50 border border-slate-200 rounded-lg text-slate-700 hover:text-blue-700 transition-colors flex items-center justify-between text-xs font-medium group"
              >
                <div className="flex items-center gap-2 truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
                  <span className="truncate">{city}</span>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </Link>
            ))}
          </div>
        </section>

        {/* 6. RECENT BUSINESSES (REAL DATA ONLY) */}
        <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Live Database</span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Recently Added Businesses
              </h2>
            </div>
            {approvedBusinesses.length > 0 && (
              <Link href="/search" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                <span>View All Businesses</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {approvedBusinesses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {approvedBusinesses.map((biz) => (
                <div key={biz.id} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs hover:border-slate-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <Image
                      src={biz.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80'}
                      alt={biz.name}
                      width={44}
                      height={44}
                      className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div className="truncate">
                      <Link href={`/business/${biz.slug}`} className="font-bold text-slate-900 text-sm hover:text-blue-600 truncate block">
                        {biz.name}
                      </Link>
                      <p className="text-xs text-slate-500 truncate">{biz.category} • {biz.city}, {biz.state || biz.province || 'USA'}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{biz.description}</p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">{biz.phone || 'Contact via profile'}</span>
                    <Link href={`/business/${biz.slug}`} className="text-blue-600 font-semibold hover:underline">
                      View Profile &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center space-y-3 max-w-xl mx-auto">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">No businesses listed yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Be the first to list your company and connect with customers searching for local services in your city.
              </p>
              <Link
                href="/add-business"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>List Your Business Now</span>
              </Link>
            </div>
          )}
        </section>

        {/* 7. RECENT JOBS (REAL DATA ONLY) */}
        <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Career Opportunities</span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Recent Job Postings
              </h2>
            </div>
            {approvedJobs.length > 0 && (
              <Link href="/jobs" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                <span>View All Jobs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {approvedJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {approvedJobs.map((job) => (
                <div key={job.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between gap-3 hover:border-slate-300 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={job.companyLogo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80'}
                        alt={job.company}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{job.title}</h3>
                        <p className="text-xs text-slate-500">{job.company} • {job.city}, {job.state || 'USA'}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {job.workplaceType || job.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{job.description}</p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-900">{job.salary}</span>
                    <Link href={getPublicJobPath(job)} className="text-blue-600 font-semibold hover:underline">
                      Apply Now &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center space-y-3 max-w-xl mx-auto">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">No open positions posted yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Are you hiring? Post your opening on BizNestUSA to reach skilled professionals across the United States.
              </p>
              <Link
                href="/post-job"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Post an Open Role</span>
              </Link>
            </div>
          )}
        </section>

        {/* 8. RECENT PROFESSIONALS (REAL DATA ONLY) */}
        <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Verified Talent</span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Recent Professional Profiles
              </h2>
            </div>
            {approvedProfessionals.length > 0 && (
              <Link href="/professionals" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                <span>View All Professionals</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {approvedProfessionals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {approvedProfessionals.map((pro) => (
                <div key={pro.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 hover:border-slate-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <Image
                      src={pro.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                      alt={pro.name}
                      width={44}
                      height={44}
                      className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="truncate">
                      <Link href={`/professionals/${pro.username}`} className="font-bold text-slate-900 text-sm hover:text-blue-600 truncate block">
                        {pro.name}
                      </Link>
                      <p className="text-xs text-slate-500 truncate">{pro.profession}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{pro.bio}</p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">{pro.city}, {pro.state || 'USA'}</span>
                    <Link href={`/professionals/${pro.username}`} className="text-indigo-600 font-semibold hover:underline">
                      View Profile &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center space-y-3 max-w-xl mx-auto">
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">No professional profiles created yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Showcase your skills, portfolio, and experience. Join our directory as a certified professional or consultant.
              </p>
              <Link
                href="/add-professional"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Professional Profile</span>
              </Link>
            </div>
          )}
        </section>

        {/* 9. PLATFORM FAQS */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-slate-900">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-500">Everything you need to know about navigating and listing on BizNestUSA.</p>
          </div>

          <div className="divide-y divide-slate-200 bg-white rounded-xl border border-slate-200 px-6 shadow-xs">
            {FAQS.map((faq, i) => (
              <div key={i} className="py-4 space-y-1">
                <h3 className="text-sm font-bold text-slate-900">{faq.question}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
