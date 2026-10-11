import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact BizNestUSA | Directory Support & Inquiries',
  description: 'Contact BizNestUSA for business listing support, verification requests, directory assistance, employer hiring inquiries, and customer service assistance.',
  alternates: { canonical: 'https://www.biznestusa.com/contact/' },
  openGraph: {
    title: 'Contact BizNestUSA | Directory Support & Inquiries',
    description: 'Contact BizNestUSA for business listing support, verification requests, directory assistance, employer hiring inquiries, and customer service assistance.',
    url: 'https://www.biznestusa.com/contact/',
    type: 'website',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
