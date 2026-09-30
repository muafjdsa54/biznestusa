import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hiring Companies & Employers in the USA | Employer Directory | BizNest USA',
  description: 'Discover verified hiring companies, corporate profiles, and employers in the United States by industry, state, and city on BizNest USA.',
  alternates: { canonical: 'https://www.biznestusa.com/companies/' },
  openGraph: {
    title: 'Hiring Companies & Employers in the USA | Employer Directory | BizNest USA',
    description: 'Discover verified hiring companies, corporate profiles, and employers in the United States by industry, state, and city on BizNest USA.',
    url: 'https://www.biznestusa.com/companies/',
    type: 'website',
  },
}

export default function CompaniesLayout({ children }: { children: React.ReactNode }) {
  return children
}
