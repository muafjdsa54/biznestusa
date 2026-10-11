import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Jobs in USA: Search Open Career Vacancies | BizNest',
  description: 'Find verified job openings across the United States. Search career vacancies, remote roles, and top hiring employers by city and industry on BizNestUSA.',
  alternates: { canonical: 'https://www.biznestusa.com/jobs/' },
  openGraph: {
    title: 'Jobs in USA: Search Open Career Vacancies | BizNest',
    description: 'Find verified job openings across the United States. Search career vacancies, remote roles, and top hiring employers by city and industry on BizNestUSA.',
    url: 'https://www.biznestusa.com/jobs/',
    type: 'website',
  },
}

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return children
}
