import { Metadata } from 'next'
import AddCompanyClient from './add-company-client'
import { ShieldCheck, Building2, CheckCircle2, HelpCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Register Company | Add Employer Profile to BizNest',
  description: 'Register your employer profile on BizNestUSA to post career vacancies, recruit verified professionals, and expand corporate hiring visibility in the US.',
  alternates: { canonical: 'https://www.biznestusa.com/add-company/' },
  openGraph: {
    title: 'Register Company | Add Employer Profile to BizNest',
    description: 'Register your employer profile on BizNestUSA to post career vacancies, recruit verified professionals, and expand corporate hiring visibility in the US.',
    url: 'https://www.biznestusa.com/add-company/',
    type: 'website',
  },
}

export default function AddCompanyPage() {
  const faqItems = [
    {
      q: 'What corporate information is required to register an employer profile?',
      a: 'Organizations must provide their legal corporate trade name, physical headquarters address within the United States, primary industry sector, employee headcount band, official company domain website, and verified corporate HR email address.'
    },
    {
      q: 'How long does company profile review and verification take?',
      a: 'Our editorial and verification team typically reviews corporate registrations within 1 to 2 business days. During this period, we verify your corporate entity standing with state registration authorities.'
    },
    {
      q: 'Can our company post multiple job vacancies across different states?',
      a: 'Yes. Once your employer profile is approved, your HR team can post multiple job vacancies across multiple cities, states, or remote designations with individualized application URLs and job requirements.'
    },
    {
      q: 'Is there a cost to register a company profile on BizNestUSA?',
      a: 'Basic company registration and standard employer profile publishing are completely free. Optional premium featured placements and highlighted recruitment sponsorships are available for accelerated talent acquisition.'
    }
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Register Hiring Company & Employer Profile',
    description: 'Corporate onboarding and employer registration on BizNestUSA.',
    url: 'https://www.biznestusa.com/add-company/'
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AddCompanyClient />

      {/* Server-Rendered Comprehensive Guidance & Employer Standards (350+ words) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-sm space-y-6">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Employer Registration Standards</span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              Corporate Onboarding Guidelines &amp; Compliance Standards
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              BizNestUSA is dedicated to connecting top American talent with verified enterprises, startups, healthcare systems, and regional employers. To ensure candidate safety and directory credibility, all employer profiles undergo structured editorial screening prior to indexing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <Building2 className="w-6 h-6 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Entity Verification</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We verify active commercial incorporation filings (LLC, C-Corp, S-Corp, 501(c)(3)) across relevant US state Secretary of State commercial records.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">Legitimate Hiring Check</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Recruitment postings must represent genuine career vacancies offering standard W-2 or 1099 terms compliant with US Department of Labor standards.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <CheckCircle2 className="w-6 h-6 text-purple-600" />
              <h3 className="font-bold text-slate-900 text-sm">Domain Authentication</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Recruiters and HR administrators must utilize verified corporate email domains (e.g. hr@company.com) rather than anonymous free webmail providers.
              </p>
            </div>
          </div>

          {/* Additional Guidance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">Employer Recruitment Dashboard</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Registered organizations receive administrative dashboard access allowing HR managers to manage department listings, upload corporate press releases, configure custom job application URLs, track applicant volumes, and showcase workplace culture photographs to prospective hires nationwide.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">EEO &amp; Fair Hiring Compliance</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                All companies listing career opportunities on BizNestUSA must adhere to the regulations of the Equal Employment Opportunity Commission (EEOC) and relevant state fair-chance hiring acts. Job postings must avoid discriminatory screening requirements and clearly indicate compensation structures.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">Verified Corporate Badge</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Verified employer profiles display an official green badge indicating active state incorporation standing. This builds credibility with high-caliber talent and elevates organic visibility across US metropolitan and national directory searches.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">Direct Candidate Inquiries</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Unlike closed recruitment networks that restrict communication, BizNestUSA routes qualified applicants, contractor proposals, and commercial inquiries directly to your corporate inbox and talent acquisition tracking systems without middleman markups.
              </p>
            </div>
          </div>

          {/* FAQs */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">
              Frequently Asked Questions About Company Registration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {faqItems.map((item, idx) => (
                <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1.5">
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
        </div>
      </section>
    </div>
  )
}
