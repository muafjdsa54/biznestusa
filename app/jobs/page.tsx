import { Suspense } from 'react'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { getAllJobs } from '@/lib/job-service'
import JobsDirectoryClient from '@/components/jobs/jobs-directory-client'
import { Briefcase, Plus, ShieldCheck, CheckCircle2, HelpCircle } from 'lucide-react'

export const revalidate = 604800

export const metadata = {
  title: 'Jobs in USA: Amazon, Google, Walmart & More Hiring',
  description:
    "Search open jobs in the USA at Amazon, Google, Walmart and FedEx. Browse by city, category and job type, then apply on the employer's own careers page.",
}

export default async function JobsPage() {
  const jobs = await getAllJobs(false)

  const faqItems = [
    {
      q: 'How do I apply for a job listed on BizNestUSA?',
      a: "Open the job to read the role details, requirements and salary. You can apply through BizNestUSA, or follow the careers link on the listing to the hiring employer's own careers site — for example, the Amazon Lead Associate role links to amazon.jobs — and apply directly with the employer."
    },
    {
      q: 'Are there remote jobs listed on BizNestUSA?',
      a: 'Not in the current listings: 22 of the 23 jobs are on-site and one — a Senior Claims Adjuster role at Progressive in Houston — is hybrid. Use the workplace filter to check for remote or hybrid roles as new jobs are added.'
    },
    {
      q: 'What salary will I earn in these jobs?',
      a: "The salary on each listing is the figure the employer provided — for example, $18.40 - $22.00 per hour for the FedEx Package Handler role in Cedar Rapids, or $35.84 - $58.84 per hour for the Mayo Clinic Registered Nurse role in Rochester. Listings that show 'Competitive Package' carry no figure from the employer, so check the employer's careers page for details."
    },
    {
      q: 'Which employers are hiring on BizNestUSA?',
      a: 'Amazon, Walmart, Google, FedEx, UPS, Pfizer, Mayo Clinic, HCA Healthcare, Delta Air Lines, Bank of America, McDonald’s, Chipotle, Caterpillar, Progressive, Hyatt, Lowe’s, Walgreens, UnitedHealth Group and Concord Hospitality — 19 employers across 16 states.'
    },
    {
      q: 'Which cities have open jobs?',
      a: 'Atlanta, Chicago, Houston, Kansas City, Las Vegas, Mountain View, Nashville, Phoenix, Rochester and 14 more — 23 cities in total. Use the city filter above to find jobs near you.'
    },
    {
      q: 'Can employers post jobs on BizNestUSA?',
      a: "Yes. Employers can submit a job posting through the Post a Job page. Each listing links applicants to the employer's own careers page to apply."
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
                Jobs in USA: Open Roles at Amazon, Google, Walmart &amp; More
              </h1>
              <p className="text-slate-400 text-sm mt-2 max-w-2xl leading-relaxed">
                Browse 23 open jobs in 23 cities from Amazon, Google, Walmart, FedEx, Pfizer, Mayo Clinic and more. Search by city, category or job type, then apply on the employer&apos;s own careers page.
              </p>
            </div>

            <Link
              href="/post-job"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all inline-flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Post a Job</span>
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
              Open Jobs in the USA: What Is Listed Here
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              This page lists open jobs from 19 employers hiring across 16 states — from a Senior Software Engineer role at Google in Mountain View to a Package Handler role at FedEx in Cedar Rapids. Most roles are full-time and on-site, with one hybrid role in Houston. Salaries are shown exactly as listed with each job; where an employer did not list a figure, the listing shows &lsquo;Competitive Package&rsquo; instead. Open a job to see its requirements, then follow the link to apply on the employer&apos;s own careers page.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900">Categories With Open Roles</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The largest groups in this directory are Transportation &amp; Logistics (5 jobs), Hospitality &amp; Tourism (4), Healthcare &amp; Medical (3) and Finance &amp; Accounting (3), alongside software, IT, sales and customer support roles. Use the category filter above to narrow the list.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900">How to Apply</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Open a job listing to read its description, requirements and salary. You can apply through BizNestUSA, or use the employer&apos;s careers link on the page to apply directly with the employer — the Amazon listing, for example, links to amazon.jobs. No legitimate employer will ever ask you to pay a fee to apply.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900">Salaries Shown As Listed</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Salaries are shown exactly as listed with each job — for example, $24.50 - $26.50 per hour for Amazon&apos;s Lead Associate role in Kansas City, $90,000 - $180,000 per year for Walmart&apos;s Staff, Technology Operations role in Bentonville, and $174,000 - $252,000 per year for Google&apos;s Senior Software Engineer role in Mountain View. Listings that show &lsquo;Competitive Package&rsquo; carry no figure from the employer.
              </p>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200/80 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Stay Safe When Applying for Jobs</span>
            </div>
            <p className="text-xs text-emerald-950/80 leading-relaxed">
              Apply only through the employer&apos;s own careers page linked on each listing, or through BizNestUSA. Legitimate employers will never ask candidates to pay for training materials, purchase equipment with unauthorized checks, or surrender sensitive tax details prior to an official job offer letter.
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
