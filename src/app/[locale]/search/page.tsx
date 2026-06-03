import Link from 'next/link'
import { Search, Briefcase, BookOpen, ChevronRight, Home, ShieldAlert } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { FALLBACK_CAREERS } from '@/lib/fallback-data'
import { FALLBACK_BLOGS } from '@/lib/fallback-blogs'

export const revalidate = 600 // Cache for 10 minutes

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    q?: string
  }>
}

export default async function SearchPage({ params, searchParams }: PageProps) {
  const { locale } = await params
  const sParams = await searchParams
  const query = sParams.q || ''

  let careersResult: any[] = []
  let blogsResult: any[] = []
  let hasSearched = false

  if (query) {
    hasSearched = true
    try {
      const supabase = await createClient()

      // Search careers
      const { data: dbCareers } = await supabase
        .from('careers')
        .select('title, slug, short_description, career_categories(name, color)')
        .eq('published', true)
        .or(`title.ilike.%${query}%,short_description.ilike.%${query}%`)
        .limit(10)

      if (dbCareers) {
        careersResult = dbCareers
      }

      // Search blogs
      const { data: dbBlogs } = await supabase
        .from('blogs')
        .select('title, slug, excerpt, blog_categories(name)')
        .eq('published', true)
        .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`)
        .limit(10)

      if (dbBlogs) {
        blogsResult = dbBlogs.map((b: any) => ({
          title: b.title,
          slug: b.slug,
          excerpt: b.excerpt,
          category_name: b.blog_categories?.name || 'Article'
        }))
      }
    } catch (error) {
      // Fallback filtering
      careersResult = FALLBACK_CAREERS.filter(c =>
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.short_description.toLowerCase().includes(query.toLowerCase())
      )

      blogsResult = FALLBACK_BLOGS.filter(b =>
        b.title.toLowerCase().includes(query.toLowerCase()) ||
        b.excerpt.toLowerCase().includes(query.toLowerCase())
      ).map(b => ({
        title: b.title,
        slug: b.slug,
        excerpt: b.excerpt,
        category_name: b.category.name
      }))
    }
  }

  const localePath = (path: string) => `/${locale}${path}`

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Banner */}
      <section className="bg-imperial-blue text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="container-base relative z-10 text-center max-w-3xl">
          <h1 className="font-heading font-extrabold text-3xl text-white tracking-tight mb-2">
            Global Search
          </h1>
          <p className="text-white/80 text-sm max-w-md mx-auto">
            Find career directories, exam structures, roadmaps, and educational articles.
          </p>
        </div>
      </section>

      {/* Main Area */}
      <section className="container-base py-8 max-w-3xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
          <Link href={localePath('/')} className="hover:text-imperial-blue flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-700">Search</span>
        </div>

        {/* Big Search Input */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6 mb-8">
          <form method="GET" action="" className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                name="q"
                defaultValue={query}
                autoFocus
                placeholder="What career or exam are you looking for?"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue text-sm transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-6 bg-imperial-blue hover:bg-french-blue text-white font-bold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center"
            >
              Search
            </button>
          </form>
        </div>

        {/* Results */}
        {hasSearched ? (
          <div className="space-y-8">
            {careersResult.length === 0 && blogsResult.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 text-slate-500 mb-4 border border-slate-100">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">No Results Found</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  We couldn't find any resources matching your search for <strong className="text-slate-800">"{query}"</strong>. Check your spelling or try more general keywords.
                </p>
              </div>
            ) : (
              <>
                {/* Careers Results Section */}
                {careersResult.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="font-heading font-extrabold text-base uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Briefcase className="w-4.5 h-4.5 text-steel-azure" />
                      Career Guides ({careersResult.length})
                    </h2>
                    <div className="space-y-3">
                      {careersResult.map((c) => (
                        <Link
                          key={c.slug}
                          href={localePath(`/careers/${c.slug}`)}
                          className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-imperial-blue hover:shadow-sm transition-all"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1">
                              <span
                                className="text-[10px] font-bold uppercase tracking-wider block"
                                style={{ color: c.career_categories?.color || '#00296B' }}
                              >
                                {c.career_categories?.name || 'Career'}
                              </span>
                              <h3 className="font-heading font-bold text-slate-950 text-base leading-snug">
                                {c.title}
                              </h3>
                              <p className="text-slate-600 text-xs md:text-sm leading-relaxed line-clamp-2 pt-1">
                                {c.short_description}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Articles Results Section */}
                {blogsResult.length > 0 && (
                  <div className="space-y-4 pt-4">
                    <h2 className="font-heading font-extrabold text-base uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <BookOpen className="w-4.5 h-4.5 text-steel-azure" />
                      Insights & Articles ({blogsResult.length})
                    </h2>
                    <div className="space-y-3">
                      {blogsResult.map((b) => (
                        <Link
                          key={b.slug}
                          href={localePath(`/blog/${b.slug}`)}
                          className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-imperial-blue hover:shadow-sm transition-all"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                {b.category_name}
                              </span>
                              <h3 className="font-heading font-bold text-slate-950 text-base leading-snug">
                                {b.title}
                              </h3>
                              <p className="text-slate-600 text-xs md:text-sm leading-relaxed line-clamp-2 pt-1">
                                {b.excerpt}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
            Enter a search term above to explore the Ramanujonomics library.
          </div>
        )}
      </section>
    </div>
  )
}
