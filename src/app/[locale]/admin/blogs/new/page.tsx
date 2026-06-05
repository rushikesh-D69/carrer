'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { ArrowLeft, Save, Calendar, Clock, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'

export default function AddBlogPage() {
  const supabase = createClient()
  const router = useRouter()
  const locale = useLocale()
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content_md: '',
    published: false,
    published_at: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData({ ...formData, [name]: checked })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
    setFormData({ ...formData, slug })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not authenticated')

      const payload: any = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content_md: formData.content_md,
        published: formData.published,
        author_id: userData.user.id,
      }

      if (formData.published_at) {
        payload.published_at = new Date(formData.published_at).toISOString()
      } else if (formData.published) {
        payload.published_at = new Date().toISOString()
      }

      const { error } = await supabase.from('blogs').insert(payload)
      if (error) throw error

      router.push(`/${locale}/admin/blogs`)
    } catch (err) {
      console.error('Error creating blog:', err)
      alert('Failed to save blog. Ensure the slug is unique.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/admin/blogs`} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Write New Article</h1>
            <p className="text-sm text-slate-500 mt-1">Create and schedule a new blog post.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Article Title *</label>
              <input
                required
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                onBlur={generateSlug}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue"
                placeholder="e.g. How to Crack UPSC in First Attempt"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">URL Slug *</label>
              <div className="flex items-center">
                <span className="px-4 py-2 bg-slate-50 border border-r-0 border-slate-200 rounded-l-lg text-slate-500 text-sm">/blog/</span>
                <input
                  required
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue"
                  placeholder="how-to-crack-upsc"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Short Excerpt</label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue resize-none"
                placeholder="A brief summary of the article..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Markdown Content *</span>
                <span className="text-xs text-slate-400 font-normal">Supports standard Markdown</span>
              </label>
              <textarea
                required
                name="content_md"
                value={formData.content_md}
                onChange={handleChange}
                rows={15}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue font-mono text-sm bg-slate-50"
                placeholder="# Introduction\n\nStart writing your amazing article here..."
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-imperial-blue" />
              Publishing & Scheduling
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="published"
                name="published"
                checked={formData.published}
                onChange={handleChange}
                className="w-5 h-5 text-imperial-blue rounded border-slate-300 focus:ring-imperial-blue"
              />
              <label htmlFor="published" className="text-sm font-medium text-slate-700 cursor-pointer">
                Publish immediately (or upon scheduled time)
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Schedule Publish Time (Optional)</label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="datetime-local"
                  name="published_at"
                  value={formData.published_at}
                  onChange={handleChange}
                  className="w-full sm:w-auto pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">If you select a future date, the article will not be visible to users until that time, even if "Publish" is checked.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <Link href={`/${locale}/admin/blogs`} className="px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-imperial-blue hover:bg-french-blue text-white px-8 py-2.5 rounded-lg text-sm font-bold transition-all shadow-md shadow-imperial-blue/20 disabled:opacity-50"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
            Save Article
          </button>
        </div>
      </form>
    </div>
  )
}
