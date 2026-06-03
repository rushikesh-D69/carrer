export interface FallbackBlogCategory {
  id: string
  name: string
  slug: string
  description?: string
  sort_order: number
}

export interface FallbackBlog {
  id: string
  title: string
  slug: string
  excerpt: string
  content_md: string
  featured_image?: string
  author: {
    full_name: string
    profile_image?: string
  }
  category: {
    name: string
    slug: string
  }
  tags?: string[]
  reading_time: number
  published_at: string
}

export const FALLBACK_BLOG_CATEGORIES: FallbackBlogCategory[] = [
  { id: 'bc-1', name: 'Career Guidance', slug: 'career', sort_order: 1 },
  { id: 'bc-2', name: 'Government Jobs', slug: 'government-jobs', sort_order: 2 },
  { id: 'bc-3', name: 'Economics', slug: 'economics', sort_order: 3 },
  { id: 'bc-4', name: 'Entrepreneurship', slug: 'entrepreneurship', sort_order: 4 },
  { id: 'bc-5', name: 'Personal Development', slug: 'personal-development', sort_order: 5 },
  { id: 'bc-6', name: 'Success Stories', slug: 'success-stories', sort_order: 6 },
  { id: 'bc-7', name: 'Announcements', slug: 'announcements', sort_order: 7 },
]

export const FALLBACK_BLOGS: FallbackBlog[] = []
