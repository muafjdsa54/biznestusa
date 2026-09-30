import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search Directory - Businesses, Professionals & Jobs | BizNestUSA',
  description: 'Search United States businesses, verified professionals, and job openings by keyword, category, state, and city on BizNestUSA.',
  robots: { index: false, follow: true },
  alternates: { canonical: 'https://www.biznestusa.com/search/' },
}

export default function SearchLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
