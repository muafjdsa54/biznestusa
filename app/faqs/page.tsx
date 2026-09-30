import { Metadata } from 'next'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { HelpCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQs) | BizNest USA',
  description: 'Find answers to common questions about listing your business, professional portfolios, posting jobs, and searching companies across the United States.',
  alternates: {
    canonical: 'https://biznestusa.com/faqs/',
  },
}

const faqs = [
  {
    q: "What is BizNest USA?",
    a: "BizNest USA is a unified national platform connecting verified American local businesses, licensed professionals, and hiring employers across all 50 states."
  },
  {
    q: "Is submitting a business listing on BizNest USA free?",
    a: "Yes! Submitting a business listing on BizNest USA is completely free. It includes your business name, address, contact phone, website, business category, service catalog, and business description with zero hidden fees."
  },
  {
    q: "How long does it take for my business to appear in search results?",
    a: "Once submitted, our editorial review team inspects listings to ensure high quality and compliance. Approved listings immediately index on state and city directories, category searches, and our XML sitemap."
  },
  {
    q: "How does the Verified Badge work for businesses and professionals?",
    a: "Verified badges indicate that our team has confirmed business registration details, state licensing, or phone credentials. Verified profiles receive priority placement in local search results and category rankings."
  },
  {
    q: "Can US employers post job vacancies?",
    a: "Yes, registered business owners and companies can post open roles across any US city, state, or remote classification directly through our employer portal."
  },
  {
    q: "How can I update or remove a listing?",
    a: "You can update or request removal through your Account Dashboard, submit an inquiry via our Contact Page, or email support@biznestusa.com with proof of business ownership."
  },
  {
    q: "How does BizNest USA support local SEO for small businesses?",
    a: "Every verified listing generates a permanent, crawlable profile with JSON-LD Schema structured data, clean URLs, state/city breadcrumbs, and direct links to your official website and phone line."
  }
]

export default function FAQsPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a
      }
    }))
  }

  return (
    <>
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="bg-[#F8FAFC] text-slate-800 font-sans min-h-screen pb-16">
        <section className="bg-white border-b border-slate-200 py-16 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Help &amp; Documentation
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mt-4">
              Frequently Asked Questions
            </h1>
            <p className="mt-3 text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
              Everything you need to know about navigating, listing your business, and hiring on BizNest USA.
            </p>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 py-12">
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 text-base flex items-start gap-2.5">
                  <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2.5 pl-7.5 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
