import { Suspense } from 'react'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { getAllProfessionals } from '@/lib/professional-service'
import ProfessionalsDirectoryClient from '@/components/professionals/professionals-directory-client'
import { Users, UserPlus, LogIn, ShieldCheck, HelpCircle } from 'lucide-react'

export const revalidate = 60

export default async function ProfessionalsPage() {
  const professionals = await getAllProfessionals(false)

  const faqItems = [
    {
      q: 'How does BizNestUSA verify credentials for listed professionals?',
      a: 'We review state professional licensing databases (such as State Bar associations for attorneys, State Boards of Accountancy for CPAs, and Medical Licensing Boards for physicians), confirm professional identity, and check LinkedIn and portfolio links before granting a Verified badge.'
    },
    {
      q: 'Can I hire independent consultants directly through BizNestUSA?',
      a: 'Yes. Profile listings include direct contact information, website links, portfolio repositories, and hourly or project rates, allowing businesses and clients to contact professionals directly without middleman markups.'
    },
    {
      q: 'What is the difference between a W-2 employee and an independent contractor (1099)?',
      a: 'Under US Department of Labor and IRS guidelines, independent contractors operate their own separate business entities, utilize their own tools, determine their work methods, and receive Form 1099-NEC. Businesses engaging contractors must ensure proper classification to remain compliant.'
    },
    {
      q: 'How can professionals join and list their services on BizNestUSA?',
      a: 'Qualified specialists across engineering, design, legal, accounting, healthcare, and trades can register for a free profile via our Create Professional Profile registration page. Profiles undergo review prior to directory publication.'
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
    name: 'Verified United States Professionals',
    itemListElement: professionals.slice(0, 15).map((pro, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: pro.name,
      url: `https://www.biznestusa.com/professionals/${pro.username}/`
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
                <Users className="w-3.5 h-3.5" />
                <span>United States Professional &amp; Talent Network</span>
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Verified US Professionals &amp; Subject Matter Experts
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
                Discover software engineers, physicians, certified accountants, attorneys, designers, marketing specialists, and skilled professionals across the United States.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Link
                href="/register/professional"
                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-105"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Professional Profile</span>
              </Link>
              <Link
                href="/login?role=professional"
                className="px-4 py-3 bg-slate-800/90 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-blue-400" />
                <span>Dashboard Login</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-12">
        <Suspense fallback={<div className="py-12 text-center text-slate-400 text-xs">Loading professionals directory...</div>}>
          <ProfessionalsDirectoryClient initialProfessionals={professionals} />
        </Suspense>

        {/* In-Depth Editorial & Professional Standards Guide (350+ words of real content) */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-sm space-y-8">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Professional Directory Guide</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Engaging Independent Consultants &amp; Licensed Specialists in the USA
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              From high-growth technology ventures and financial firms to residential homeowners and enterprise healthcare organizations, finding verified subject matter experts requires rigorous evaluation of professional licenses, state regulatory standing, portfolio achievements, and insurance coverage. BizNestUSA simplifies contractor discovery by highlighting verified practitioners across all 50 states.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900">State Licensure &amp; Boards</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Regulated professions—including legal counsel, Certified Public Accountants (CPAs), medical practitioners, civil engineers, and master electricians—must maintain active licenses issued by their respective state licensing authorities. We advise verifying disciplinary histories and renewal statuses.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900">Clear Scopes of Work (SOW)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Successful client-consultant collaborations depend on well-drafted Statements of Work outlining precise deliverables, milestone deadlines, hourly billing increments, intellectual property ownership terms, and mutual confidentiality agreements before project kickoff.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900">Errors &amp; Omissions Insurance</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Reputable independent practitioners carry Professional Liability (Errors &amp; Omissions) insurance alongside Commercial General Liability. This protects both the service provider and hiring organizations against unforeseen claims or implementation liabilities.
              </p>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/80 space-y-3">
            <div className="flex items-center gap-2 text-blue-800 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>BizNestUSA Practitioner Verification Standard</span>
            </div>
            <p className="text-xs text-blue-950/80 leading-relaxed">
              Practitioners displaying the green Verified badge have completed multi-point identity confirmation, official domain verification, and initial credential checks. This ensures transparent, trustworthy engagements between clients and American service providers.
            </p>
          </div>

          {/* Frequently Asked Questions */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-xl font-extrabold text-slate-900">
              Frequently Asked Questions About Hiring US Professionals
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
