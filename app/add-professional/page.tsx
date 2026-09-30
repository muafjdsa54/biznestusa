import AddProfessionalClient from './add-professional-client'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Professional Profile & Talent Portfolio | BizNest USA',
  description: 'Create your public professional portfolio on BizNest USA. Showcase verified skills, project history, certifications, and get discovered by clients and hiring managers across the United States.',
  alternates: { canonical: 'https://biznestusa.com/add-professional/' },
  openGraph: {
    title: 'Create Professional Profile & Talent Portfolio | BizNest USA',
    description: 'Create your public professional portfolio on BizNest USA. Showcase verified skills, project history, certifications, and get discovered by clients and hiring managers across the United States.',
    url: 'https://biznestusa.com/add-professional/',
    type: 'website',
  },
}

export default function AddProfessionalPage() {
  return <AddProfessionalClient />
}
