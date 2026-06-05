import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Search, Calendar, Clock, BookOpen, AlertTriangle, ChevronRight, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { FALLBACK_BLOGS, FALLBACK_BLOG_CATEGORIES } from '@/lib/fallback-blogs'

export const revalidate = 3600 // Cache for 1 hour

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    category?: string
    search?: string
  }>
}

export default async function BlogPage({ params, searchParams }: PageProps) {
  const { locale } = await params
  const sParams = await searchParams
  const selectedCategory = sParams.category || ''
  const searchQuery = sParams.search || ''

  let blogs = FALLBACK_BLOGS
  let categories = FALLBACK_BLOG_CATEGORIES

  try {
    const supabase = await createClient()

    // Fetch categories
    const { data: dbCategories } = await supabase
      .from('blog_categories')
      .select('*')
      .order('sort_order', { ascending: true })

    if (dbCategories && dbCategories.length > 0) {
      categories = dbCategories as any
    }

    // Fetch posts
    let query = supabase
      .from('blogs')
      .select('id, title, slug, excerpt, reading_time, published_at, featured_image, tags, blog_categories(name, slug), profiles(full_name, profile_image)')
      .eq('published', true)

    if (selectedCategory) {
      const catObj = categories.find(c => c.slug === selectedCategory)
      if (catObj) {
        query = query.eq('category_id', catObj.id)
      }
    }

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`)
    }

    const { data: dbBlogs } = await query.order('published_at', { ascending: false })

    if (dbBlogs && dbBlogs.length > 0) {
      // Map relationships to match FallbackBlog structure
      blogs = dbBlogs.map((b: any) => ({
        id: b.id,
        title: b.title,
        slug: b.slug,
        excerpt: b.excerpt,
        reading_time: b.reading_time || 5,
        published_at: b.published_at || b.created_at,
        featured_image: b.featured_image,
        tags: b.tags,
        category: {
          name: b.blog_categories?.name || 'General',
          slug: b.blog_categories?.slug || 'general',
        },
        author: {
          full_name: b.profiles?.full_name || 'Prof. Ramanujan',
          profile_image: b.profiles?.profile_image,
        }
      })) as any
    } else if (dbBlogs && dbBlogs.length === 0 && (selectedCategory || searchQuery)) {
      blogs = []
    }
  } catch (error) {
    // Database issue: filter static fallback data instead
    blogs = FALLBACK_BLOGS.filter((post) => {
      const matchesCategory = !selectedCategory || post.category.slug === selectedCategory
      const matchesSearch = !searchQuery || post.title.toLowerCase().includes(searchQuery.toLowerCase()) || post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }

  const localePath = (path: string) => `/${locale}${path}`

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Blog Hero Banner */}
      <section className="bg-imperial-blue text-white py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container-base relative z-10 text-center max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-school-bus-yellow text-xs font-semibold uppercase tracking-wider mb-4 border border-white/5">
            <BookOpen className="w-3.5 h-3.5" />
            Knowledge Base
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-5xl text-white tracking-tight leading-tight mb-4">
            Ramanujonomics Blog & Articles
          </h1>
          <p className="text-white/80 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Expert insights on career planning, economic literacy, startup strategies, and personal growth.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="container-base -mt-6 relative z-20">
        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6 mb-8">
          <form method="GET" action="" className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="Search articles, insights, tutorials..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue text-sm transition-all bg-slate-50/50"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-imperial-blue hover:bg-french-blue text-white font-semibold text-sm rounded-xl transition-all shadow-sm flex-shrink-0"
              >
                Search
              </button>
              {(searchQuery || selectedCategory) && (
                <Link
                  href={localePath('/blog')}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-all flex items-center justify-center"
                >
                  Reset
                </Link>
              )}
            </div>
            {selectedCategory && (
              <input type="hidden" name="category" value={selectedCategory} />
            )}
          </form>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          <Link
            href={{
              pathname: localePath('/blog'),
              query: { ...(searchQuery && { search: searchQuery }) },
            }}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
              !selectedCategory
                ? 'bg-imperial-blue text-white border-imperial-blue shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Topics
          </Link>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug

            return (
              <Link
                key={cat.id}
                href={{
                  pathname: localePath('/blog'),
                  query: {
                    category: cat.slug,
                    ...(searchQuery && { search: searchQuery }),
                  },
                }}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-steel-azure text-white border-transparent shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat.name}
              </Link>
            )
          })}
        </div>

        {/* Articles Grid */}
        {blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {blogs.map((post) => {
              const formattedDate = new Date(post.published_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })

              return (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all overflow-hidden flex flex-col group"
                >
                  {post.featured_image ? (
                    <div className="aspect-video w-full overflow-hidden bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video w-full bg-gradient-to-br from-imperial-blue/10 to-steel-azure/10 flex items-center justify-center">
                      <BookOpen className="w-10 h-10 text-imperial-blue/30" />
                    </div>
                  )}
                  <div className="p-4 sm:p-6 flex flex-col flex-1 space-y-4">
                    {/* Category & Date */}
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-steel-azure uppercase tracking-wider">
                        {post.category.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formattedDate}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-heading font-extrabold text-lg text-slate-900 group-hover:text-imperial-blue transition-colors leading-snug">
                      <Link href={localePath(`/blog/${post.slug}`)}>
                        {post.title}
                      </Link>
                    </h3>

                    {/* Excerpt */}
                    <p className="text-slate-600 text-sm leading-relaxed flex-1 line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Footer Row */}
                    <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold border border-slate-200">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                        <span className="font-semibold text-slate-800">{post.author.full_name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{post.reading_time} min read</span>
                      </div>
                    </div>

                    {/* Link */}
                    <div className="pt-2">
                      <Link
                        href={localePath(`/blog/${post.slug}`)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-imperial-blue group-hover:gap-2 transition-all"
                      >
                        Read Full Article
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto shadow-sm">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 text-amber-500 mb-4 border border-amber-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">No Articles Found</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              We couldn't find any articles matching your search criteria. Try modifying your search or selecting a different topic.
            </p>
            <Link
              href={localePath('/blog')}
              className="btn-primary text-sm px-6"
            >
              Show All Articles
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
