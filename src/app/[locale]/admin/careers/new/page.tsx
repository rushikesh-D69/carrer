'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { slugify } from '@/lib/admin/helpers'
import { toast } from 'sonner'

export default function NewCareerPage() {
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
    supabase.from('career_categories').select('id, name').order('name').then(({ data }) => {
      const cats = (data || []) as { id: string; name: string }[]
      setCategories(cats)
      if (cats[0]) setForm((f) => ({ ...f, category_id: cats[0].id }))
    })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setForm({ ...form, [name]: (e.target as HTMLInputElement).checked })
    } else {
      const next = { ...form, [name]: value }
      if (name === 'title' && !form.slug) next.slug = slugify(value)
      setForm(next)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase.from('careers').insert({
        ...form,
        slug: form.slug || slugify(form.title),
        created_by: user.id,
      } as never).select('id').single()
      if (error) throw error
      const created = data as { id: string } | null
      toast.success('Career created')
      router.push(`/${locale}/admin/careers/${created?.id}/sections`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to create career')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/admin/careers`} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-slate-900">New Career</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <input required name="title" value={form.title} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" placeholder="Career title" />
        <input required name="slug" value={form.slug} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" placeholder="url-slug" />
        <select name="category_id" value={form.category_id} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg bg-white">
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <textarea name="short_description" value={form.short_description} onChange={handleChange} rows={3} className="w-full px-4 py-2 border rounded-lg" placeholder="Short description" />
        <input name="duration" value={form.duration} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" placeholder="Duration e.g. 2-4 years" />
        <label className="flex items-center gap-2"><input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} /> Featured</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="published" checked={form.published} onChange={handleChange} /> Publish immediately</label>
        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-imperial-blue text-white px-6 py-2.5 rounded-lg text-sm font-bold ml-auto">
          <Save className="w-4 h-4" /> Save & Add Sections
        </button>
      </form>
    </div>
  )
}
