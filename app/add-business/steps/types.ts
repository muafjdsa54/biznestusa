import type { FormLocation } from '../add-business-client'

/**
 * The add-business wizard form state, shared by the lazy-loaded step
 * panels. Shape mirrors the useState initializer in
 * app/add-business/add-business-client.tsx — keep the two in sync.
 */
export interface AddBusinessFormData {
  businessName: string
  category: string
  subcategory: string
  logo: string
  locations: FormLocation[]
  faqs: Array<{ question: string; answer: string }>
  ownerName: string
  phone: string
  whatsapp: string
  email: string
  website: string
  description: string
  services: string
  yearEstablished: string
  priceRange: string
  serviceArea: string
  gallery: string[]
  proofDoc: string
  googleBusinessProfile: string
  facebookUrl: string
  instagramUrl: string
  linkedinUrl: string
}
