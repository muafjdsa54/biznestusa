import { Metadata } from 'next'
import AddBusinessClient from './add-business-client'

export const metadata: Metadata = {
  title: 'List Your Business Free — American Business Directory | BizNest USA',
  description: 'Join the premier American business directory. List your business free, reach verified customers across all 50 states, and establish high-trust Google search visibility.',
  keywords: 'list business free USA, add business US directory, register business online USA, free business directory USA, BizNest USA onboarding',
  alternates: {
    canonical: 'https://biznestusa.com/add-business/',
  },
  openGraph: {
    title: 'List Your Business Free — American Business Directory | BizNest USA',
    description: 'Onboard your business to the premier US directory platform. Free listing with instant customer discoverability and verified credentials.',
    url: 'https://biznestusa.com/add-business/',
    siteName: 'BizNest USA',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'List Your Business Free on BizNest USA',
    description: 'Onboard your company to the premier American business directory platform.',
  }
}

export default function AddBusinessPage() {
  return <AddBusinessClient />
}
