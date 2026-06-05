'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { ArrowLeft, Save, Calendar, Clock, MapPin, Link as LinkIcon, DollarSign } from 'lucide-react'
import Link from 'next/link'

export default function AddEventPage() {
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
    published: false
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

      if (!formData.start_date) {
        alert('Start date and time is required.')
        setLoading(false)
        return
      }

      const payload: any = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        event_type: formData.event_type,
        start_date: new Date(formData.start_date).toISOString(),
        location: formData.location,
        meeting_url: formData.meeting_url,
        registration_link: formData.registration_link,
        is_free: formData.is_free,
        price: formData.is_free ? 0 : Number(formData.price),
        max_participants: Number(formData.max_participants),
        published: formData.published,
        created_by: userData.user.id,
      }

      if (formData.end_date) {
        payload.end_date = new Date(formData.end_date).toISOString()
      }

      const { error } = await supabase.from('events').insert(payload)
      if (error) throw error

      router.push(`/${locale}/admin/events`)
    } catch (err) {
      console.error('Error creating event:', err)
      alert('Failed to save event. Ensure the slug is unique.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/admin/events`} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Schedule New Event</h1>
            <p className="text-sm text-slate-500 mt-1">Add a webinar, workshop, or offline session.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Event Title *</label>
                <input
                  required
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  onBlur={generateSlug}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">URL Slug *</label>
                <input
                  required
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue resize-none"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Event Type</label>
                <select
                  name="event_type"
                  value={formData.event_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue bg-white"
                >
                  <option value="webinar">Webinar (Online)</option>
                  <option value="seminar">Seminar (Offline)</option>
                  <option value="workshop">Workshop</option>
                  <option value="live_class">Live Class</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Max Participants</label>
                <input
                  type="number"
                  name="max_participants"
                  value={formData.max_participants}
                  onChange={handleChange}
                  min={1}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-imperial-blue" />
              Event Schedule (Timers)
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Date & Time *</label>
              <input
                required
                type="datetime-local"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Date & Time</label>
              <input
                type="datetime-local"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-imperial-blue" />
              Location & Details
            </h2>
          </div>
          <div className="p-6 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Offline Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Hyderabad Campus"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Online Meeting URL</label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    name="meeting_url"
                    value={formData.meeting_url}
                    onChange={handleChange}
                    placeholder="https://zoom.us/..."
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mb-4">
            <input
              type="checkbox"
              id="published"
              name="published"
              checked={formData.published}
              onChange={handleChange}
              className="w-5 h-5 text-imperial-blue rounded border-slate-300 focus:ring-imperial-blue"
            />
            <label htmlFor="published" className="text-sm font-medium text-slate-700 cursor-pointer">
              Publish Event Now
            </label>
        </div>

        <div className="flex items-center justify-end gap-4">
          <Link href={`/${locale}/admin/events`} className="px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-imperial-blue hover:bg-french-blue text-white px-8 py-2.5 rounded-lg text-sm font-bold transition-all shadow-md shadow-imperial-blue/20 disabled:opacity-50"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
            Save Event
          </button>
        </div>
      </form>
    </div>
  )
}
