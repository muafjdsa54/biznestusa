import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { getAllCompanies } from '@/lib/company-service'
import CompaniesDirectoryClient from '@/components/companies/companies-directory-client'
import { Building2, Plus, ShieldCheck, HelpCircle } from 'lucide-react'

export const revalidate = 604800

export const metadata: Metadata = {
  title: 'US Companies Directory: Employers & Open Jobs | BizNestUSA',
  description: 'Browse US company profiles, from Apple and Microsoft to Walmart and JPMorgan Chase. Search employers by industry and city, and view open jobs.',
  alternates: {
    canonical: 'https://www.biznestusa.com/companies/',
  },
  openGraph: {
    title: 'US Companies Directory: Employers & Open Jobs | BizNestUSA',
    description: 'Browse US company profiles, from Apple and Microsoft to Walmart and JPMorgan Chase. Search employers by industry and city, and view open jobs.',
    url: 'https://www.biznestusa.com/companies/',
    siteName: 'BizNestUSA',
    locale: 'en_US',
    type: 'website',
  },
}

export default async function CompaniesPage() {
  const companies = await getAllCompanies(false)

  const faqItems = [
    {
      q: 'How does BizNestUSA verify hiring employers and company profiles?',
      a: 'There is no self-serve verification process: a company cannot apply for Verified status or award it to itself. The Verified badge appears on a company profile only when a BizNestUSA admin marks that profile verified, and approving a listing for publication does not automatically add the badge.'
    },
    {
      q: 'What information does a company profile show?',
      a: 'Each profile shows the company’s industry, headquarters city, background, and HR contact, plus any open jobs it has listed on BizNestUSA. Use the directory search and filters to narrow profiles by industry or city.'
    },
    {
      q: 'How much does it cost to list a company on BizNestUSA?',
      a: 'Company listings are paid, starting at $1 for the Basic plan. Submit your company through the Register Company Profile page; a BizNestUSA admin reviews every submission before it is published.'
    },
    {
      q: 'How do I find companies hiring in my city?',
      a: 'Start with the city in the directory search. Atlanta employers listed here include Coca-Cola, Home Depot, UPS, and Delta Air Lines; Seattle includes Amazon and Starbucks; New York includes JPMorgan Chase and Pfizer. Open a profile to see that employer’s current job postings on BizNestUSA.'
    },
    {
      q: 'Can job seekers apply directly to companies listed in the directory?',
      a: 'Yes. Each approved company profile lists the employer’s current job postings active on BizNestUSA, and each posting links to its own page with the application route. The profile also shows the employer’s listed HR contact email.'
    }
  ]

  const jsonLdFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a
      }
    }))
  }

  const jsonLdList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Top Hiring Companies in the United States',
    itemListElement: companies.slice(0, 15).map((comp, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: comp.name,
      url: `https://www.biznestusa.com/companies/${comp.slug}/`
    }))
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdList) }}
      />

      {/* Hero Header */}
      <section className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">
                <Building2 className="w-3.5 h-3.5" />
                <span>Company and Employer Directory</span>
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Top Hiring Companies &amp; Employers in the USA
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
                Search US employer profiles by industry and city — technology, banking and finance, healthcare, retail, energy, logistics, airlines, and more — including Apple, Microsoft, Amazon, Google, Walmart, and JPMorgan Chase. Open a profile to see open jobs and HR contacts.
              </p>
            </div>

            <Link
              href="/add-company"
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register Company Profile</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-12">
        <Suspense fallback={<div className="py-12 text-center text-slate-400 text-xs">Loading employer directory...</div>}>
          <CompaniesDirectoryClient initialCompanies={companies} />
        </Suspense>

        {/* In-Depth Editorial & Corporate Employer Standards Guide (350+ words of real content) */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-sm space-y-8">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Employer Ecosystem Guide</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              How to Evaluate Large US Employers
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              When evaluating a large US employer, job seekers usually weigh the same things: the industry it works in, where it is headquartered, what its open roles look like, and how to reach its hiring team. This directory lists established employers across technology, banking and finance, healthcare, retail, energy, logistics, airlines, and automotive — use each profile’s industry, headquarters city, and open jobs to compare them side by side.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900">Equal Opportunity (EEO)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Reputable American enterprises strictly adhere to federal Equal Employment Opportunity Commission (EEOC) standards, ensuring non-discriminatory hiring, equitable compensation scales, and inclusive promotion pathways regardless of race, age, religion, or gender.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900">Total Rewards &amp; Benefits</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Competitive employers offer robust benefits programs that typically feature ACA-compliant health insurance, dental and vision care, defined-contribution retirement plans with company match, parental leave, mental health assistance, and professional education subsidies.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900">Career Mobility &amp; Training</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                High-retention employers invest continuously in workforce upskilling, mentorship cohorts, leadership pipelines, and lateral departmental mobility, fostering long-term career growth in rapidly shifting economic sectors.
              </p>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/80 space-y-3">
            <div className="flex items-center gap-2 text-blue-800 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>BizNestUSA Company Review Process</span>
            </div>
            <p className="text-xs text-blue-950/80 leading-relaxed">
              Every company submission is reviewed by a BizNestUSA admin before it appears in the directory. Admins approve or reject each submission; approval publishes the listing, but it does not award Verified status, which only an admin can apply. This review keeps phantom listings out and protects candidates during their job search.
            </p>
          </div>

          {/* Frequently Asked Questions */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-xl font-extrabold text-slate-900">
              Frequently Asked Questions About US Corporate Employers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {faqItems.map((item, idx) => (
                <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>{item.q}</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed pl-6">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
