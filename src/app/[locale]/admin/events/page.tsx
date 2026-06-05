'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Plus, Edit2, Trash2, Calendar } from 'lucide-react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { confirmAndDelete } from '@/lib/admin/helpers'
import { toast } from 'sonner'

export default function EventsAdminPage() {
  const supabase = createClient()
  const locale = useLocale()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: false })
      
      if (error) throw error
      setEvents(data || [])
    } catch (err) {
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('events')
        // @ts-ignore
        .update({ published: !currentStatus } as any)
        .eq('id', id)

      if (error) throw error
      
      setEvents(events.map(e => e.id === id ? { ...e, published: !currentStatus } : e))
    } catch (err) {
      console.error('Error toggling event publish status:', err)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    const ok = await confirmAndDelete(title, () => supabase.from('events').delete().eq('id', id))
    if (ok) {
      setEvents((ev) => ev.filter((x) => x.id !== id))
      toast.success('Event deleted')
    }
  }

  const filteredEvents = events.filter(e => 
    (e.title?.toLowerCase() || '').includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Events Manager</h1>
          <p className="text-sm text-slate-500 mt-1">Manage scheduled webinars, workshops, and offline events.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search events..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue transition-all"
            />
          </div>
          <Link href={`/${locale}/admin/events/new`} className="flex items-center gap-2 bg-imperial-blue hover:bg-french-blue text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Create Event
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Event Details</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type / Pricing</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-imperial-blue border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading events...
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No events found. Click "Create Event" to schedule one.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{event.title}</div>
                      <div className="text-xs text-slate-500 mt-1">/{event.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-700">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(event.start_date).toLocaleString()}
                      </div>
                      {event.end_date && (
                        <div className="text-xs text-slate-500 mt-1 ml-5">
                          to {new Date(event.end_date).toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-800 capitalize">{event.event_type}</div>
                      <div className="text-xs font-bold mt-1 text-emerald-600">
                        {event.is_free ? 'FREE' : `₹${event.price}`}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => togglePublish(event.id, event.published)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-imperial-blue focus:ring-offset-2 ${event.published ? 'bg-green-500' : 'bg-slate-300'}`}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${event.published ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/${locale}/admin/events/${event.id}/edit`} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(event.id, event.title)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
