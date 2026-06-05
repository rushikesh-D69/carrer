'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { ArrowLeft, Save, Clock, Type, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function AddAnnouncementPage() {
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
    expiry_date: ''
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not authenticated')

      const payload: any = {
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
        is_popup: formData.is_popup,
        is_banner: formData.is_banner,
        is_active: formData.is_active,
        created_by: userData.user.id,
      }

      if (formData.publish_date) {
        payload.publish_date = new Date(formData.publish_date).toISOString()
      } else {
        payload.publish_date = new Date().toISOString()
      }

      if (formData.expiry_date) {
        payload.expiry_date = new Date(formData.expiry_date).toISOString()
      }

      const { error } = await supabase.from('announcements').insert(payload)
      if (error) throw error

      router.push(`/${locale}/admin/announcements`)
    } catch (err) {
      console.error('Error creating announcement:', err)
      alert('Failed to save announcement.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/admin/announcements`} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">New Announcement</h1>
            <p className="text-sm text-slate-500 mt-1">Create banners, popups, or general system alerts.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Alert Title *</label>
              <input
                required
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue"
                placeholder="e.g. New UPSC Batch starting this Monday!"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Message Content</span>
                <span className="text-xs text-slate-400 font-normal">Supports simple HTML (e.g. &lt;a href="..."&gt;)</span>
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue font-mono text-sm bg-slate-50 resize-none"
                placeholder="Join our new batch to get early bird discounts..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Priority Level</label>
                <div className="relative">
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue bg-white appearance-none"
                  >
                    <option value="low">Low (Subtle)</option>
                    <option value="normal">Normal (Standard color)</option>
                    <option value="high">High (Red / Urgent)</option>
                  </select>
                  <AlertTriangle className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
                    formData.priority === 'high' ? 'text-red-500' :
                    formData.priority === 'medium' ? 'text-amber-500' : 'text-slate-400'
                  }`} />
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
              <label className="text-sm font-semibold text-slate-700">Display Type</label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_banner"
                    checked={formData.is_banner}
                    onChange={handleChange}
                    className="w-4 h-4 text-imperial-blue rounded border-slate-300 focus:ring-imperial-blue"
                  />
                  Top Notification Banner
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_popup"
                    checked={formData.is_popup}
                    onChange={handleChange}
                    className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-600"
                  />
                  Modal Popup (Overlay)
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-imperial-blue" />
              Scheduling (Timers)
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Publish Date & Time</label>
              <input
                type="datetime-local"
                name="publish_date"
                value={formData.publish_date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue"
              />
              <p className="text-xs text-slate-500 mt-1.5">Leave blank to publish immediately.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Expiry Date & Time</label>
              <input
                type="datetime-local"
                name="expiry_date"
                value={formData.expiry_date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue"
              />
              <p className="text-xs text-slate-500 mt-1.5">Announcement will auto-hide after this time.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-5 h-5 text-green-600 rounded border-slate-300 focus:ring-green-600"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-slate-700 cursor-pointer">
              Active Status (Uncheck to completely pause)
            </label>
        </div>

        <div className="flex items-center justify-end gap-4">
          <Link href={`/${locale}/admin/announcements`} className="px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-imperial-blue hover:bg-french-blue text-white px-8 py-2.5 rounded-lg text-sm font-bold transition-all shadow-md shadow-imperial-blue/20 disabled:opacity-50"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
            Save Announcement
          </button>
        </div>
      </form>
    </div>
  )
}
