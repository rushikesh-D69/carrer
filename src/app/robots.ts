import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ramanujonomics.com'
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/*/admin/', '/dashboard/', '/*/dashboard/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
