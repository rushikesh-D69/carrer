import { MetadataRoute } from 'next'
import { FALLBACK_CAREERS } from '@/lib/fallback-data'
import { FALLBACK_BLOGS } from '@/lib/fallback-blogs'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ramanujonomics.com'

  // Standard routes
  const staticRoutes = [
    '',
    '/en',
    '/te',
    '/en/careers',
    '/te/careers',
    '/en/blog',
    '/te/blog',
    '/en/announcements',
    '/te/announcements',
    '/en/events',
    '/te/events',
    '/en/contact',
    '/te/contact',
    '/en/compare',
    '/te/compare',
    '/en/search',
    '/te/search',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' || route === '/en' || route === '/te' ? 1.0 : 0.8,
  }))

  // Career guides
  const careerRoutes = FALLBACK_CAREERS.flatMap((c) => [
    {
      url: `${baseUrl}/en/careers/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/te/careers/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ])

  // Blog articles
  const blogRoutes = FALLBACK_BLOGS.flatMap((b) => [
    {
      url: `${baseUrl}/en/blog/${b.slug}`,
      lastModified: new Date(b.published_at),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/te/blog/${b.slug}`,
      lastModified: new Date(b.published_at),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ])

  return [...staticRoutes, ...careerRoutes, ...blogRoutes]
}
