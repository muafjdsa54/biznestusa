import AddCompanyClient from './add-company-client'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Register Hiring Company & HR Profile | BizNest USA',
  description: 'Create a verified hiring profile for your company on BizNest USA. Post job openings, build employer branding, and discover top candidates across the United States.',
  alternates: { canonical: 'https://biznestusa.com/add-company/' },
  openGraph: {
    title: 'Register Hiring Company & HR Profile | BizNest USA',
    description: 'Create a verified hiring profile for your company on BizNest USA. Post job openings, build employer branding, and discover top candidates across the United States.',
    url: 'https://biznestusa.com/add-company/',
    type: 'website',
  },
}

export default function AddCompanyPage() {
  return <AddCompanyClient />
}
