import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Verified US Professionals Directory | BizNestUSA Hub',
  description: 'Discover skilled professionals, software engineers, doctors, attorneys, designers, accountants, and trade experts across all 50 US states on BizNestUSA.',
  alternates: { canonical: 'https://www.biznestusa.com/professionals/' },
  openGraph: {
    title: 'Verified US Professionals Directory | BizNestUSA Hub',
    description: 'Discover skilled professionals, software engineers, doctors, attorneys, designers, accountants, and trade experts across all 50 US states on BizNestUSA.',
    url: 'https://www.biznestusa.com/professionals/',
    type: 'website',
  },
}

export default function ProfessionalsLayout({ children }: { children: React.ReactNode }) {
  return children
}
