import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import ClientProviders from '@/components/client-providers'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: "BizNestUSA | Find Trusted Local Businesses Across America",
  description: "Find trusted local businesses, home services, professionals, and jobs across the United States. Discover your neighborhood on BizNestUSA.",
  metadataBase: new URL('https://biznestusa.com'),
  keywords: [
    'BizNestUSA United States',
    'United States business directory',
    'free business listing United States',
    'jobs in United States',
    'USA professionals',
    'verified companies across the United States',
    'BizNestUSA business and careers ecosystem'
  ],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', sizes: 'any' }
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: "BizNestUSA | Find Trusted Local Businesses Across America",
    description: "Find trusted local businesses, home services, professionals, and jobs across the United States. Discover your neighborhood on BizNestUSA.",
    url: 'https://biznestusa.com/',
    siteName: 'BizNestUSA',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "BizNestUSA | Find Trusted Local Businesses Across America",
    description: "Find trusted local businesses, home services, professionals, and jobs across the United States. Discover your neighborhood on BizNestUSA.",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BizNestUSA',
    url: 'https://biznestusa.com/',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://biznestusa.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  }

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BizNestUSA',
    url: 'https://biznestusa.com/',
    logo: 'https://biznestusa.com/logo.png',
    email: 'admin@biznestusa.com',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      areaServed: 'US',
      availableLanguage: ['en'],
    },
  }

  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationSchema, websiteSchema]) }}
        />
      </head>
      <body className="font-sans antialiased bg-slate-50/50 text-slate-900 pb-16 md:pb-0 min-h-screen selection:bg-blue-600 selection:text-white">
        {children}
        <ClientProviders />
      </body>
    </html>
  )
}
