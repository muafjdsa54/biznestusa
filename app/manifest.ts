import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BizNestUSA — United States's Digital Business & Enterprise Ecosystem",
    short_name: 'BizNestUSA',
    description: "Discover, connect, and grow with United States's largest digital business platform. Verified businesses, job portal, and professional talent.",
    start_url: '/',
    display: 'standalone',
    background_color: '#F8FAFC',
    theme_color: '#2563EB',
    icons: [
      {
        src: '/favicon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
