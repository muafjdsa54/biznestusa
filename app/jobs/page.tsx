import { Suspense } from 'react'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { getAllJobs } from '@/lib/job-service'
import JobsDirectoryClient from '@/components/jobs/jobs-directory-client'
import { Briefcase, Plus, ShieldCheck, CheckCircle2, HelpCircle } from 'lucide-react'

export const revalidate = 60

export default async function JobsPage() {
  const jobs = await getAllJobs(false)

  const faqItems = [
    {
      q: 'How does BizNestUSA verify hiring employers and active job vacancies?',
      a: 'BizNestUSA cross-references employer listings against registered state corporate registries, validates employer domains and corporate email addresses, and screens job postings against anti-spam protocols to ensure job seekers connect with genuine American employers.'
    },
    {
      q: 'Are remote work opportunities available for job seekers nationwide?',
      a: 'Yes. Our job directory features both on-site roles across major metropolitan hubs—such as New York, Austin, Chicago, and Los Angeles—and fully remote positions that accept applicants located anywhere in the United States.'
    },
    {
      q: 'What should job applicants review regarding compensation and benefits transparency?',
      a: 'Under various state laws (including regulations in California, New York, Colorado, and Washington), employers are required to disclose wage scales and salary ranges. We encourage applicants to evaluate total compensation, including 401(k) matching, health benefits, and paid time off.'
    },
    {
      q: 'Can employers and recruiters post jobs for free on BizNestUSA?',
      a: 'Yes. Verified US companies, local enterprises, and recruiting teams can submit job postings directly through our Post a Job portal. Listings undergo standard editorial and compliance screening before going live to our national audience.'
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
    name: 'Active USA Job Vacancies',
    itemListElement: jobs.slice(0, 15).map((job, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: job.title,
      url: `https://www.biznestusa.com/jobs/${job.slug || job.id}/`
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

      {/* Jobs Hero Header */}
      <section className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white pt-14 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 mb-3">
                <Briefcase className="w-3.5 h-3.5" />
                <span>USA Employment Portal</span>
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Find Jobs in USA: Career Vacancies &amp; Hiring Employers
              </h1>
              <p className="text-slate-400 text-sm mt-2 max-w-2xl leading-relaxed">
                Connect directly with verified American companies, local employers, and growing teams hiring across New York, Los Angeles, Chicago, and nationwide.
              </p>
            </div>

            <Link
              href="/post-job"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all inline-flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Post a Job Free</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Jobs Listing Content with Client Filter */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-12">
        <Suspense fallback={<div className="py-12 text-center text-slate-400 text-xs">Loading open vacancies...</div>}>
          <JobsDirectoryClient initialJobs={jobs} />
        </Suspense>

        {/* In-Depth Editorial & Employment Guide Section (350+ words of real content) */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-sm space-y-8">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Employment Resources</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Navigating the United States Job Market &amp; Career Opportunities
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              The modern American employment ecosystem is marked by rapid technological advancement, evolving labor standards, and a strong preference for workplace flexibility. Whether you are pursuing a specialized technology career in Silicon Valley, healthcare administration in Boston, construction project management in Dallas, or remote executive consulting, understanding regional hiring practices and regulatory frameworks is critical to career advancement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900">High-Demand Sectors &amp; Roles</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Key industries driving job creation nationwide include enterprise software engineering, cloud architecture, clinical healthcare, certified trades (electrical, HVAC, plumbing), renewable energy installation, and financial analysis. Employers prioritize verifiable project accomplishments and certified industry credentials.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900">Worker Rights &amp; Standards</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Federal and state statutes—such as the Fair Labor Standards Act (FLSA), Title VII of the Civil Rights Act, and the Americans with Disabilities Act (ADA)—protect workers against unlawful discrimination, enforce minimum wage floors, and guarantee overtime compensation for non-exempt employment classifications.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900">Total Compensation &amp; Benefits</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Comprehensive US compensation packages extend well beyond base hourly or annualized wages. Candidates must evaluate employer-sponsored medical, dental, and vision insurance coverage, 401(k) employer matching plans, paid family leave allowances, tuition reimbursement, and flexible remote work stipends.
              </p>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200/80 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>BizNestUSA Job Trust &amp; Anti-Scam Protocol</span>
            </div>
            <p className="text-xs text-emerald-950/80 leading-relaxed">
              Every job listing on BizNestUSA is screened to safeguard applicants from phishing schemes, upfront fee scams, and fake check processing operations. Legitimate employers will never ask candidates to pay for training materials, purchase equipment with unauthorized checks, or surrender sensitive tax details prior to an official job offer letter.
            </p>
          </div>

          {/* Frequently Asked Questions */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-xl font-extrabold text-slate-900">
              Frequently Asked Questions About US Job Applications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {faqItems.map((item, idx) => (
                <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
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
