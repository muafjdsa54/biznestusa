import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'US Professionals Directory & Experts | BizNestUSA Hub',
  description: 'Discover skilled professionals, software engineers, doctors, attorneys, designers, accountants, and trade experts across 39 states and D.C. on BizNestUSA.',
  alternates: { canonical: 'https://www.biznestusa.com/professionals/' },
  openGraph: {
    title: 'US Professionals Directory & Experts | BizNestUSA Hub',
    description: 'Discover skilled professionals, software engineers, doctors, attorneys, designers, accountants, and trade experts across 39 states and D.C. on BizNestUSA.',
    url: 'https://www.biznestusa.com/professionals/',
    type: 'website',
  },
}

export default function ProfessionalsLayout({ children }: { children: React.ReactNode }) {
  return children
}
