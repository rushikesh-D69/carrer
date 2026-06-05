'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const supabase = createClient()
  const router = useRouter()
  const locale = useLocale()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    event_type: 'seminar',
    start_date: '',
    end_date: '',
    location: '',
    meeting_url: '',
    registration_link: '',
    is_free: true,
    price: 0,
    max_participants: 100,
    published: false,
  })

  useEffect(() => {
    supabase.from('events').select('*').eq('id', id).single().then(({ data }) => {
      const row = data as typeof formData | null
      if (row) {
        setFormData({
          title: row.title,
          slug: row.slug,
          description: row.description || '',
          event_type: row.event_type,
          start_date: row.start_date ? String(row.start_date).slice(0, 16) : '',
          end_date: row.end_date ? String(row.end_date).slice(0, 16) : '',
          location: row.location || '',
          meeting_url: row.meeting_url || '',
          registration_link: row.registration_link || '',
          is_free: row.is_free,
          price: Number(row.price) || 0,
          max_participants: row.max_participants ?? 100,
          published: row.published,
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
        slug: formData.slug,
        description: formData.description,
        event_type: formData.event_type,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        location: formData.location,
        meeting_url: formData.meeting_url,
        registration_link: formData.registration_link,
        is_free: formData.is_free,
        price: formData.is_free ? 0 : Number(formData.price),
        max_participants: Number(formData.max_participants),
        published: formData.published,
      }
      const { error } = await supabase.from('events').update(payload as never).eq('id', id)
      if (error) throw error
      toast.success('Event updated')
      router.push(`/${locale}/admin/events`)
    } catch {
      toast.error('Failed to update event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/admin/events`} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-slate-900">Edit Event</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <input required name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
        <input required name="slug" value={formData.slug} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
        <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={3} className="w-full px-4 py-2 border rounded-lg" />
        <input required type="datetime-local" name="start_date" value={formData.start_date} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
        <input type="datetime-local" name="end_date" value={formData.end_date} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
        <input name="location" value={formData.location || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" placeholder="Location" />
        <label className="flex items-center gap-2"><input type="checkbox" name="published" checked={formData.published} onChange={handleChange} /> Published</label>
        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-imperial-blue text-white px-6 py-2.5 rounded-lg text-sm font-bold ml-auto">
          <Save className="w-4 h-4" /> Save Event
        </button>
      </form>
    </div>
  )
}
