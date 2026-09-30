import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import Script from 'next/script'
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
  metadataBase: new URL('https://www.biznestusa.com'),
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
    url: 'https://www.biznestusa.com/',
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
    google: 'j0hBai_GiUhcTsm3fJPgN5izwzEMxIbXjUWHdayOPbo',
    other: {
      'msvalidate.01': '32107703ABE97F472472231CBA07F2E5',
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BizNestUSA',
    url: 'https://www.biznestusa.com/',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.biznestusa.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  }

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BizNestUSA',
    url: 'https://www.biznestusa.com/',
    logo: 'https://www.biznestusa.com/logo.png',
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
        <meta name="google-site-verification" content="j0hBai_GiUhcTsm3fJPgN5izwzEMxIbXjUWHdayOPbo" />
        <meta name="msvalidate.01" content="32107703ABE97F472472231CBA07F2E5" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationSchema, websiteSchema]) }}
        />
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "yqal7ky4hx");
          `}
        </Script>
      </head>
      <body className="font-sans antialiased bg-slate-50/50 text-slate-900 pb-16 md:pb-0 min-h-screen selection:bg-blue-600 selection:text-white">
        {children}
        <ClientProviders />
      </body>
    </html>
  )
}
