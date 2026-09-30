import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/admin/*',
        '/api/*',
        '/login',
        '/login/*',
        '/register',
        '/register/*',
        '/dashboard',
        '/dashboard/*',
        '/business-dashboard',
        '/business-dashboard/*',
        '/search',
        '/search/*',
        '/filter',
        '/filter/*',
      ],
    },
    sitemap: 'https://biznestusa.com/sitemap.xml',
  }
}
