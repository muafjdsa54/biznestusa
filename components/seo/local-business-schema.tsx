'use client'

interface BusinessData {
  name: string
  phone: string
  address: string
  city: string
  category: string
  description?: string
  website?: string
  logo?: string
}

export function LocalBusinessSchema({ business }: { business: BusinessData }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    description: business.description || `${business.name} - ${business.category} in ${business.city}`,
    url: business.website || `https://biznestusa.com/`,
    telephone: business.phone,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
      addressLocality: business.city,
      streetAddress: business.address
    },
    category: business.category,
    serviceType: business.category,
    areaServed: {
      '@type': 'Country',
      name: 'United States'
    },
    logo: business.logo || 'https://biznestusa.com/logo.svg',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: business.phone,
      contactType: 'customer service',
      areaServed: business.city
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function DirectorySchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BizNestUSA',
    description: 'United States Business Directory - Find and list local businesses',
    url: 'https://biznestusa.com/',
    mainEntity: {
      '@type': 'Organization',
      name: 'BizNestUSA',
      url: 'https://biznestusa.com/',
      description: 'United States Business Directory',
      areaServed: {
        '@type': 'Country',
        name: 'United States'
      }
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://biznestusa.com/categories/?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
