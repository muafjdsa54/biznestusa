/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  compress: true,
  reactStrictMode: true,

  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-collapsible',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slot',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      'recharts',
      'date-fns',
    ],
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'www.imrandigitals.com',
      },
      {
        protocol: 'https',
        hostname: 'imrandigitals.com',
      },
    ],
  },

  async headers() {
    if (process.env.NODE_ENV !== 'production') {
      return []
    }
    return [
      {
        source: '/:path*\\.(png|jpg|jpeg|webp|avif|svg|ico|woff|woff2|ttf|otf)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/((?!_next|api).*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },

  async redirects() {
    return [
      {
        source: '/category/electricians/',
        destination: '/services/electricians/',
        permanent: true,
      },
      {
        source: '/category/electricians',
        destination: '/services/electricians/',
        permanent: true,
      },
      {
        source: '/category/plumbers/',
        destination: '/services/plumbers/',
        permanent: true,
      },
      {
        source: '/category/plumbers',
        destination: '/services/plumbers/',
        permanent: true,
      },
      {
        source: '/category/roofers/',
        destination: '/services/roofers/',
        permanent: true,
      },
      {
        source: '/category/roofers',
        destination: '/services/roofers/',
        permanent: true,
      },
      // Issue 1: Canonical 301 redirects for duplicate subcategories
      {
        source: '/category/home-services/general-contractor/:path*',
        destination: '/category/construction/general-contractor/',
        permanent: true,
      },
      {
        source: '/category/professional-services/insurance-agency/:path*',
        destination: '/category/finance/insurance-agency/',
        permanent: true,
      },
      {
        source: '/category/professional-services/real-estate-agency/:path*',
        destination: '/category/real-estate/real-estate-agency/',
        permanent: true,
      },
      {
        source: '/category/healthcare-professionals/physical-therapist/:path*',
        destination: '/category/health-wellness/physical-therapist/',
        permanent: true,
      },
      {
        source: '/category/local-services/event-planner/:path*',
        destination: '/category/events-weddings/event-planner/',
        permanent: true,
      },
      {
        source: '/category/skilled-trades/plumber/:path*',
        destination: '/category/home-services/plumber/',
        permanent: true,
      },
      {
        source: '/category/skilled-trades/roofer/:path*',
        destination: '/category/home-services/roofer/',
        permanent: true,
      },
      {
        source: '/category/skilled-trades/electrician/:path*',
        destination: '/category/home-services/electrician/',
        permanent: true,
      },
      {
        source: '/category/business-finance-professionals/accountant/:path*',
        destination: '/category/professional-services/accountant/',
        permanent: true,
      },
      {
        source: '/category/legal-professionals/attorney/:path*',
        destination: '/category/professional-services/attorney/',
        permanent: true,
      },
      {
        source: '/category/healthcare-professionals/dentist/:path*',
        destination: '/category/health-wellness/dentist/',
        permanent: true,
      },
      {
        source: '/category/healthcare-professionals/doctor/:path*',
        destination: '/category/health-wellness/doctor/',
        permanent: true,
      },
      {
        source: '/category/healthcare-professionals/therapist/:path*',
        destination: '/category/health-wellness/therapist/',
        permanent: true,
      },
      // Issue 7: Dead URL redirection
      {
        source: '/business/verified-business/:path*',
        destination: '/business-directory/',
        permanent: true,
      },
    ]
  },

  async rewrites() {
    return [
      {
        source: '/businesses/:slug/',
        destination: '/business/:slug/',
      },
      {
        source: '/businesses/:slug',
        destination: '/business/:slug/',
      },
    ]
  },
}

export default nextConfig
