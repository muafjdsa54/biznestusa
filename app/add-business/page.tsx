import { Metadata } from 'next'
import AddBusinessClient from './add-business-client'

export const metadata: Metadata = {
  title: 'Add Your Business to USA Directory | BizNestUSA Hub',
  description: 'List your American business on BizNestUSA. Reach local customers, showcase verified licenses, generate inquiries, and improve local search visibility.',
  keywords: 'list business free USA, add business US directory, register business online USA, free business directory USA, BizNest USA onboarding',
  alternates: {
    canonical: 'https://www.biznestusa.com/add-business/',
  },
  openGraph: {
    title: 'Add Your Business to USA Directory | BizNestUSA Hub',
    description: 'List your American business on BizNestUSA. Reach local customers, showcase verified licenses, generate inquiries, and improve local search visibility.',
    url: 'https://www.biznestusa.com/add-business/',
    siteName: 'BizNestUSA',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Add Your Business to USA Directory | BizNestUSA Hub',
    description: 'Onboard your company to the premier American business directory platform.',
  }
}

export default function AddBusinessPage() {
  return <AddBusinessClient />
}
