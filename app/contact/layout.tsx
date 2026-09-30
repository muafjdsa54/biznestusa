import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact BizNest USA | US Directory & Support Desk',
  description: 'Contact BizNest USA for business listing support, verification requests, directory assistance, and advertising inquiries.',
  alternates: { canonical: 'https://biznestusa.com/contact/' },
  openGraph: {
    title: 'Contact BizNest USA | US Directory & Support Desk',
    description: 'Contact BizNest USA for business listing support, verification requests, directory assistance, and advertising inquiries.',
    url: 'https://biznestusa.com/contact/',
    type: 'website',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
