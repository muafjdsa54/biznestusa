import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Jobs in the USA | Search Career Vacancies by State & City | BizNestUSA',
  description: 'Find active job openings across the United States by title, company, category, state, city, and remote options on BizNestUSA.',
  alternates: { canonical: 'https://www.biznestusa.com/jobs/' },
  openGraph: {
    title: 'Jobs in the USA | Search Career Vacancies by State & City | BizNestUSA',
    description: 'Find active job openings across the United States by title, company, category, state, city, and remote options on BizNestUSA.',
    url: 'https://www.biznestusa.com/jobs/',
    type: 'website',
  },
}

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return children
}
