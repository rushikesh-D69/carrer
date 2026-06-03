import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Clock, ChevronRight, BookOpen, ArrowLeft, User, Share2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { FALLBACK_BLOGS } from '@/lib/fallback-blogs'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export const revalidate = 3600 // Cache for 1 hour

interface PageProps {
  params: Promise<{ locale: string; slug: string }>
}

export default async function BlogPostPage({ params }: PageProps) {
  const { locale, slug } = await params

  let post = FALLBACK_BLOGS.find(b => b.slug === slug) as any

  try {
    const supabase = await createClient()

    // Fetch the post
    const { data: dbPost } = await supabase
      .from('blogs')
      .select('*, blog_categories(name, slug), profiles(full_name, profile_image)')
      .eq('slug', slug)
      .eq('published', true)
      .single() as any


    if (dbPost) {
      post = {
        id: dbPost.id,
        title: dbPost.title,
        slug: dbPost.slug,
        excerpt: dbPost.excerpt,
        content_md: dbPost.content_md,
        reading_time: dbPost.reading_time || 5,
        published_at: dbPost.published_at || dbPost.created_at,
        featured_image: dbPost.featured_image,
        tags: dbPost.tags,
        category: {
          name: dbPost.blog_categories?.name || 'General',
          slug: dbPost.blog_categories?.slug || 'general',
        },
        author: {
          full_name: dbPost.profiles?.full_name || 'Prof. Ramanujan',
          profile_image: dbPost.profiles?.profile_image,
        }
      }
    }
  } catch (error) {
    // Graceful fallback to static blogs when db not configured
  }

  if (!post) {
    notFound()
  }

  const formattedDate = new Date(post.published_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const localePath = (path: string) => `/${locale}${path}`

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Blog Details Header */}
      <header className="bg-imperial-blue text-white py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-french-blue/30 rounded-full blur-3xl pointer-events-none" />

        <div className="container-base relative z-10">
          {/* Breadcrumbs */}
          <div className="flex flex-wrap items-center gap-2 mb-6 text-xs font-semibold text-white/70">
            <Link href={localePath('/')} className="hover:text-school-bus-yellow transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 text-white/40" />
            <Link href={localePath('/blog')} className="hover:text-school-bus-yellow transition-colors">Blog</Link>
            <ChevronRight className="w-3 h-3 text-white/40" />
            <span className="text-school-bus-yellow truncate max-w-xs">{post.title}</span>
          </div>

          <div className="max-w-3xl space-y-4">
            <Link
              href={localePath(`/blog?category=${post.category.slug}`)}
              className="badge text-[11px] font-bold bg-white/10 hover:bg-white/20 text-school-bus-yellow transition-colors border border-white/10"
            >
              {post.category.name}
            </Link>
            <h1 className="font-heading font-extrabold text-2xl md:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
              {post.title}
            </h1>
            <p className="text-white/80 text-sm md:text-base leading-relaxed italic">
              {post.excerpt}
            </p>

            {/* Meta Row */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-white/75 border-t border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center font-bold border border-white/15">
                  <User className="w-4 h-4 text-school-bus-yellow" />
                </div>
                <span>By <strong className="text-white">{post.author.full_name}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-school-bus-yellow" />
                <span>Published on {formattedDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-school-bus-yellow" />
                <span>{post.reading_time} min read</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Blog Body */}
      <div className="container-base py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Back button and Sharing block on the left (Desktop) */}
          <aside className="lg:col-span-1 space-y-4 hidden lg:block">
            <Link
              href={localePath('/blog')}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-imperial-blue transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Articles
            </Link>
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Share This Post</span>
              <div className="flex gap-2">
                <button className="w-9 h-9 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-imperial-blue flex items-center justify-center transition-all">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </aside>

          {/* Post Content */}
          <main className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 md:p-10 shadow-sm">
            {/* Mobile Back Link */}
            <div className="lg:hidden mb-6">
              <Link
                href={localePath('/blog')}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-imperial-blue transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Articles
              </Link>
            </div>

            {/* Markdown content */}
            <article className="markdown-content prose max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content_md}
              </ReactMarkdown>
            </article>

            {/* Tags row */}
            {post.tags && post.tags.length > 0 && (
              <div className="border-t border-slate-100 pt-6 mt-8">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Tags:</span>
                  {post.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
