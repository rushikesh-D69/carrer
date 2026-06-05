'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function EditCareerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const supabase = createClient()
  const router = useRouter()
  const locale = useLocale()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    slug: '',
    category_id: '',
    short_description: '',
    duration: '',
    featured: false,
    published: false,
  })

  useEffect(() => {
    Promise.all([
      supabase.from('career_categories').select('id, name').order('name'),
      supabase.from('careers').select('*').eq('id', id).single(),
    ]).then(([{ data: cats }, { data: career }]) => {
      setCategories((cats || []) as { id: string; name: string }[])
      const row = career as typeof form | null
      if (row) setForm({
        title: row.title,
        slug: row.slug,
        category_id: row.category_id || '',
        short_description: row.short_description || '',
        duration: row.duration || '',
        featured: row.featured,
        published: row.published,
      })
    })
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setForm({ ...form, [name]: (e.target as HTMLInputElement).checked })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.from('careers').update(form as never).eq('id', id)
      if (error) throw error
      toast.success('Career updated')
      router.push(`/${locale}/admin/careers`)
    } catch {
      toast.error('Failed to update')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/admin/careers`} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-slate-900">Edit Career</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <input required name="title" value={form.title} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
        <input required name="slug" value={form.slug} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
        <select name="category_id" value={form.category_id} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg bg-white">
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <textarea name="short_description" value={form.short_description || ''} onChange={handleChange} rows={3} className="w-full px-4 py-2 border rounded-lg" />
        <div className="flex justify-between items-center">
          <Link href={`/${locale}/admin/careers/${id}/sections`} className="text-sm text-imperial-blue font-semibold">Edit content sections</Link>
          <button type="submit" disabled={loading} className="flex items-center gap-2 bg-imperial-blue text-white px-6 py-2.5 rounded-lg text-sm font-bold">
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
      </form>
    </div>
  )
}
