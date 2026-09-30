import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Professionals Directory across the USA | Verified Experts & Portfolios | BizNestUSA',
  description: 'Discover skilled professionals, software engineers, doctors, attorneys, designers, accountants, and trade experts across all 50 US states on BizNestUSA.',
  alternates: { canonical: 'https://biznestusa.com/professionals/' },
  openGraph: {
    title: 'Professionals Directory across the USA | Verified Experts & Portfolios | BizNestUSA',
    description: 'Discover skilled professionals, software engineers, doctors, attorneys, designers, accountants, and trade experts across all 50 US states on BizNestUSA.',
    url: 'https://biznestusa.com/professionals/',
    type: 'website',
  },
}

export default function ProfessionalsLayout({ children }: { children: React.ReactNode }) {
  return children
}
