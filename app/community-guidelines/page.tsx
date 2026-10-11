import { Metadata } from 'next'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'Community Guidelines & Member Standards | BizNestUSA',
  description: 'Read community conduct standards for business owners, job seekers, recruiters, and clients interacting within the BizNestUSA directory and hiring portal.',
  alternates: {
    canonical: 'https://www.biznestusa.com/community-guidelines/',
  },
  openGraph: {
    title: 'Community Guidelines & Member Standards | BizNestUSA',
    description: 'Read community conduct standards for business owners, job seekers, recruiters, and clients interacting within the BizNestUSA directory and hiring portal.',
    url: 'https://www.biznestusa.com/community-guidelines/',
    type: 'website',
  },
}

export default function CommunityGuidelinesPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Community Guidelines & Marketplace Standards',
    description: 'Rules of conduct, review integrity, and professional etiquette on BizNestUSA.',
    url: 'https://www.biznestusa.com/community-guidelines/'
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
              Community Guidelines &amp; Platform Standards
            </h1>
            <p className="text-sm text-slate-500 border-b border-slate-100 pb-4">
              Last Updated: October 2026 • BizNestUSA Trust, Safety &amp; Ethics Team
            </p>
          </div>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">1. Building a Trusted American Commercial Network</h2>
              <p>
                <strong>BizNestUSA</strong> connects millions of consumers, commercial purchasers, job seekers, and recruiters with verified enterprises and certified independent professionals across all 50 states. To maintain an environment grounded in mutual respect, transparency, and consumer protection, all platform participants must adhere to these Community Guidelines.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">2. Review Authenticity &amp; Anti-Manipulation Standards</h2>
              <p>
                Authentic consumer feedback is the cornerstone of our directory. Reviews and star ratings must satisfy rigorous integrity requirements:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Firsthand Experience Only:</strong> Reviews must detail genuine, firsthand transactions or direct commercial interactions with the listed business or professional.
                </li>
                <li>
                  <strong>Prohibition of Incentivized Reviews:</strong> Offering discounts, gift cards, rebates, or cash incentives in exchange for positive reviews (or withholding services for negative reviews) violates the FTC Trade Regulation Rule on Deceptive Consumer Reviews and will result in listing penalties.
                </li>
                <li>
                  <strong>Conflict of Interest:</strong> Business owners, current employees, competing service providers, and affiliated family members are strictly barred from reviewing their own business or posting retaliatory reviews against competitors.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">3. Non-Discrimination &amp; Equal Opportunity Protections</h2>
              <p>
                BizNestUSA adheres strictly to federal civil rights statutes, including Title VII of the Civil Rights Act, the Americans with Disabilities Act (ADA), and the Fair Housing Act (FHA). We prohibit discriminatory practices in employment postings, service quotes, or public commentary based on race, color, religion, sex, sexual orientation, gender identity, national origin, age, disability, or veteran status.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">4. Anti-Harassment, Privacy &amp; Communications Etiquette</h2>
              <p>
                All communications between consumers, employers, and professionals must remain professional and respectful. Prohibited conduct includes:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Doxxing, public disclosure of confidential personal information (PII), or unauthorized publication of personal phone numbers and home addresses.</li>
                <li>Hate speech, profanity, intimidation, sexual harassment, or defamatory attacks against individuals or organizations.</li>
                <li>Unsolicited bulk email marketing (SPAM), automated telemarketing robocalls, or deceptive lead generation activities.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">5. Intellectual Property &amp; Content Integrity</h2>
              <p>
                Users and merchants must only upload images, text descriptions, trademarked logos, and portfolio artifacts that they own or have obtained written license to distribute. Submitting copyrighted media belonging to other photographers or stock repositories without authorization is a violation of the Digital Millennium Copyright Act (DMCA).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">6. Enforcement Procedures &amp; Account Sanctions</h2>
              <p>
                Violations of these guidelines are addressed through progressive sanctions, which include content removal, verified badge revocation, profile suspension, or permanent domain blacklisting. Suspected legal infractions or fraudulent commercial activities are referred to appropriate municipal or federal enforcement agencies.
              </p>
              <p>
                To report suspected violations, please submit a report through our <a href="/report-abuse" className="text-blue-600 underline">Report Abuse</a> center or email our Trust &amp; Safety officers at <a href="mailto:safety@biznestusa.com" className="text-blue-600 underline">safety@biznestusa.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
