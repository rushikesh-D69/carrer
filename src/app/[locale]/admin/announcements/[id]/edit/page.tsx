'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const supabase = createClient()
  const router = useRouter()
  const locale = useLocale()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal',
    is_popup: false,
    is_banner: true,
    is_active: true,
    publish_date: '',
    expiry_date: '',
  })

  useEffect(() => {
    supabase.from('announcements').select('*').eq('id', id).single().then(({ data }) => {
      const row = data as typeof formData & { publish_date?: string; expiry_date?: string } | null
      if (row) {
        setFormData({
          title: row.title,
          content: row.content || '',
          priority: row.priority,
          is_popup: row.is_popup,
          is_banner: row.is_banner,
          is_active: row.is_active,
          publish_date: row.publish_date ? row.publish_date.slice(0, 16) : '',
          expiry_date: row.expiry_date ? row.expiry_date.slice(0, 16) : '',
        })
      }
    })
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
        content: formData.content,
        priority: formData.priority,
        is_popup: formData.is_popup,
        is_banner: formData.is_banner,
        is_active: formData.is_active,
        publish_date: formData.publish_date ? new Date(formData.publish_date).toISOString() : new Date().toISOString(),
        expiry_date: formData.expiry_date ? new Date(formData.expiry_date).toISOString() : null,
      }
      const { error } = await supabase.from('announcements').update(payload as never).eq('id', id)
      if (error) throw error
      toast.success('Announcement updated')
      router.push(`/${locale}/admin/announcements`)
    } catch {
      toast.error('Failed to update')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/admin/announcements`} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-slate-900">Edit Announcement</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <input required name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
        <textarea name="content" value={formData.content || ''} onChange={handleChange} rows={4} className="w-full px-4 py-2 border rounded-lg" />
        <select name="priority" value={formData.priority} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg bg-white">
          {['low', 'normal', 'high', 'urgent'].map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <label className="flex items-center gap-2"><input type="checkbox" name="is_banner" checked={formData.is_banner} onChange={handleChange} /> Show as banner</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="is_popup" checked={formData.is_popup} onChange={handleChange} /> Show as popup</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} /> Active</label>
        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-imperial-blue text-white px-6 py-2.5 rounded-lg text-sm font-bold ml-auto">
          <Save className="w-4 h-4" /> Save
        </button>
      </form>
    </div>
  )
}
