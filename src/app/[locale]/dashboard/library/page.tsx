'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { BookMarked, Briefcase, FileText, Trash2, ArrowRight, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export default function LibraryPage() {
  const t = useTranslations()
  const locale = useLocale()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'careers' | 'blogs'>('careers')
  const [savedCareers, setSavedCareers] = useState<any[]>([])
  const [savedBlogs, setSavedBlogs] = useState<any[]>([])

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setLoading(false)
          return
        }

        // Fetch user_library records join with careers / blogs
        const { data: libraryItemsData } = await supabase
          .from('user_library')
          .select('*')
          .eq('user_id', user.id)

        const libraryItems = (libraryItemsData || []) as any[]

        if (libraryItems && libraryItems.length > 0) {
          const careers: any[] = []
          const blogs: any[] = []

          await Promise.all(
            libraryItems.map(async (item) => {
              if (item.item_type === 'career') {
                const { data: rawCareer } = await supabase
                  .from('careers')
                  .select('id, title, slug, short_description, category_id')
                  .eq('id', item.item_id)
                  .single()
                const career = rawCareer as any
                if (career) {
                  careers.push({
                    id: item.id,
                    career_id: career.id,
                    title: career.title,
                    slug: career.slug,
                    description: career.short_description,
                  })
                }
              } else if (item.item_type === 'blog') {
                const { data: rawBlog } = await supabase
                  .from('blogs')
                  .select('id, title, slug, excerpt')
                  .eq('id', item.item_id)
                  .single()
                const blog = rawBlog as any
                if (blog) {
                  blogs.push({
                    id: item.id,
                    blog_id: blog.id,
                    title: blog.title,
                    slug: blog.slug,
                    description: blog.excerpt,
                  })
                }
              }
            })
          )

          setSavedCareers(careers)
          setSavedBlogs(blogs)
        } else {
          setSavedCareers([])
          setSavedBlogs([])
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') console.error('Error fetching bookmarks:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLibrary()
  }, [])

  const handleRemove = async (id: string, type: 'careers' | 'blogs') => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Delete from database
        const { error } = await supabase
          .from('user_library')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)

        if (error) {
          toast.error(error.message)
          return
        }
      }

      // Local state update
      if (type === 'careers') {
        setSavedCareers(prev => prev.filter(c => c.id !== id))
      } else {
        setSavedBlogs(prev => prev.filter(b => b.id !== id))
      }
      toast.success('Item removed from library')
    } catch (err) {
      console.error(err)
      toast.error('Failed to remove item')
    }
  }

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-800 tracking-tight">
          {t('dashboard.my_library') || 'Saved Resource Library'}
        </h1>
        <p className="text-slate-500 font-medium text-sm sm:text-base mt-1">
          Keep track of your bookmarked career roadmaps, exam syllabus lists, and educational blogs.
        </p>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('careers')}
          className={`pb-3 font-heading font-semibold text-sm transition-all duration-200 border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'careers'
              ? 'border-imperial-blue text-imperial-blue'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Saved Careers</span>
        </button>
        <button
          onClick={() => setActiveTab('blogs')}
          className={`pb-3 font-heading font-semibold text-sm transition-all duration-200 border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'blogs'
              ? 'border-imperial-blue text-imperial-blue'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Saved Articles</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(n => (
            <div key={n} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              <div className="h-5 w-1/3 skeleton" />
              <div className="h-10 w-full skeleton" />
            </div>
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'careers' ? (
            <motion.div
              key="careers"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {savedCareers.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                  <BookMarked className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="font-heading font-bold text-slate-700 text-base">No Saved Careers</h3>
                  <p className="text-slate-400 text-xs mt-1">Explore career paths and click "Save Career" to add bookmarks here.</p>
                </div>
              ) : (
                savedCareers.map((career) => (
                  <div
                    key={career.id}
                    className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-card transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 max-w-xl">
                      <h3 className="font-heading font-bold text-slate-800 text-sm">{career.title}</h3>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{career.description}</p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      <button
                        onClick={() => handleRemove(career.id, 'careers')}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 cursor-pointer"
                        aria-label="Remove bookmark"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/${locale}/careers/${career.slug}`}
                        className="btn-primary text-xs h-8 px-3 rounded-lg gap-1 group whitespace-nowrap"
                      >
                        <span>View Roadmap</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div
              key="blogs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {savedBlogs.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                  <BookMarked className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="font-heading font-bold text-slate-700 text-base">No Saved Articles</h3>
                  <p className="text-slate-400 text-xs mt-1">Bookmark helpful blog posts to read them later.</p>
                </div>
              ) : (
                savedBlogs.map((blog) => (
                  <div
                    key={blog.id}
                    className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-card transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 max-w-xl">
                      <h3 className="font-heading font-bold text-slate-800 text-sm">{blog.title}</h3>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{blog.description}</p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      <button
                        onClick={() => handleRemove(blog.id, 'blogs')}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 cursor-pointer"
                        aria-label="Remove bookmark"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/${locale}/blog/${blog.slug}`}
                        className="btn-primary text-xs h-8 px-3 rounded-lg gap-1 group whitespace-nowrap"
                      >
                        <span>Read Article</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
