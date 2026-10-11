import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hiring Companies & Employers in USA | BizNestUSA Hub',
  description: 'Discover verified hiring companies, corporate profiles, and employers in the United States by industry, state, and city on the BizNestUSA employer directory.',
  alternates: { canonical: 'https://www.biznestusa.com/companies/' },
  openGraph: {
    title: 'Hiring Companies & Employers in USA | BizNestUSA Hub',
    description: 'Discover verified hiring companies, corporate profiles, and employers in the United States by industry, state, and city on the BizNestUSA employer directory.',
    url: 'https://www.biznestusa.com/companies/',
    type: 'website',
  },
}

export default function CompaniesLayout({ children }: { children: React.ReactNode }) {
  return children
}
