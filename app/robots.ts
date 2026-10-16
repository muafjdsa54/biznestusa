import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
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
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'ClaudeBot',
          'PerplexityBot',
          'Google-Extended',
          'Applebot-Extended',
          'CCBot',
          'cohere-ai',
        ],
        allow: [
          '/',
          '/llms.txt',
          '/llms-full.txt',
          '/categories/',
          '/cities/',
          '/jobs/',
          '/professionals/',
          '/about/',
          '/verification-policy/',
          '/editorial-policy/',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/dashboard/',
          '/business-dashboard/',
          '/login/',
          '/register/',
        ],
      },
    ],
    sitemap: 'https://www.biznestusa.com/sitemap.xml',
  }
}
