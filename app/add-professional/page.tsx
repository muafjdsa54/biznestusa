import AddProfessionalClient from './add-professional-client'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Professional Profile in USA | BizNestUSA Hub',
  description: 'Create your verified professional profile on BizNestUSA. Connect with American clients, showcase your portfolio and credentials, and receive hiring leads.',
  alternates: { canonical: 'https://www.biznestusa.com/add-professional/' },
  openGraph: {
    title: 'Create Professional Profile in USA | BizNestUSA Hub',
    description: 'Create your verified professional profile on BizNestUSA. Connect with American clients, showcase your portfolio and credentials, and receive hiring leads.',
    url: 'https://www.biznestusa.com/add-professional/',
    type: 'website',
  },
}

export default function AddProfessionalPage() {
  return <AddProfessionalClient />
}
