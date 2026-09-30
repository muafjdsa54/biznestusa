import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

const perks = [
  'Free to list – no credit card required',
  'Reach thousands of local customers',
  'Manage your business profile easily',
  'Get found on Google and other search engines',
]

export default function CTASection() {
  return (
    <section className="py-20 bg-[#0f2b3d]" aria-labelledby="cta-heading">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2
          id="cta-heading"
          className="text-3xl md:text-4xl font-bold text-white text-balance"
        >
          List Your Company <span className="text-[#60a5fa]">Free</span> Today
        </h2>
        <p className="mt-4 text-white/65 text-lg max-w-xl mx-auto text-pretty">
          Join local businesses and professionals growing with BizNestUSA, a modern directory built for American communities.
          It&apos;s completely free and takes less than 2 minutes.
        </p>

        <ul className="mt-8 flex flex-col sm:flex-row flex-wrap justify-center gap-4 text-sm text-white/80">
          {perks.map((perk) => (
            <li key={perk} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#60a5fa] shrink-0" aria-hidden="true" />
              {perk}
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/add-business"
            className="px-8 py-4 bg-[#60a5fa] hover:bg-blue-400 text-white font-bold rounded-xl transition-colors duration-200 text-base shadow-lg"
          >
            Add Your Business – It&apos;s Free
          </Link>
          <Link
            href="/categories"
            className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors duration-200 text-base border border-white/20"
          >
            Browse Businesses
          </Link>
        </div>
      </div>
    </section>
  )
}
