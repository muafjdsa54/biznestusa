import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Post a Job in the USA | Employer Hiring & Vacancy Portal | BizNestUSA',
  description: 'Post job openings across the United States. Connect with qualified professionals, engineers, designers, healthcare experts, and skilled talent on BizNestUSA.',
  alternates: { canonical: 'https://biznestusa.com/post-job/' },
  openGraph: {
    title: 'Post a Job in the USA | Employer Hiring & Vacancy Portal | BizNestUSA',
    description: 'Post job openings across the United States. Connect with qualified professionals, engineers, designers, healthcare experts, and skilled talent on BizNestUSA.',
    url: 'https://biznestusa.com/post-job/',
    type: 'website',
  },
}

export default function PostJobLayout({ children }: { children: React.ReactNode }) {
  return children
}
