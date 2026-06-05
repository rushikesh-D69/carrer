'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
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

  useEffect(() => {
    supabase.from('blogs').select('*').eq('id', id).single().then(({ data }) => {
      const row = data as typeof formData | null
      if (row) {
        setFormData({
          title: row.title,
          slug: row.slug,
          excerpt: row.excerpt || '',
          content_md: row.content_md,
          published: row.published,
          published_at: row.published_at ? String(row.published_at).slice(0, 16) : '',
        })
      }
    })
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload: Record<string, unknown> = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content_md: formData.content_md,
        published: formData.published,
      }
      if (formData.published_at) {
        payload.published_at = new Date(formData.published_at).toISOString()
      } else if (formData.published) {
        payload.published_at = new Date().toISOString()
      }
      const { error } = await supabase.from('blogs').update(payload as never).eq('id', id)
      if (error) throw error
      toast.success('Article updated')
      router.push(`/${locale}/admin/blogs`)
    } catch {
      toast.error('Failed to update article')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/admin/blogs`} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-slate-900">Edit Article</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <input required name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" placeholder="Title" />
        <input required name="slug" value={formData.slug} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" placeholder="slug" />
        <textarea name="excerpt" value={formData.excerpt || ''} onChange={handleChange} rows={2} className="w-full px-4 py-2 border rounded-lg" placeholder="Excerpt" />
        <textarea required name="content_md" value={formData.content_md} onChange={handleChange} rows={15} className="w-full px-4 py-2 border rounded-lg font-mono text-sm bg-slate-50" />
        <label className="flex items-center gap-2"><input type="checkbox" name="published" checked={formData.published} onChange={handleChange} /> Published</label>
        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-imperial-blue text-white px-6 py-2.5 rounded-lg text-sm font-bold ml-auto">
          <Save className="w-4 h-4" /> Save Article
        </button>
      </form>
    </div>
  )
}
