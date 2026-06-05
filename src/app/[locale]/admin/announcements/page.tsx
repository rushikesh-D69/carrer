'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Plus, Edit2, Trash2, Bell, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { confirmAndDelete } from '@/lib/admin/helpers'
import { toast } from 'sonner'

export default function AnnouncementsAdminPage() {
  const supabase = createClient()
  const locale = useLocale()
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('publish_date', { ascending: false })
      
      if (error) throw error
      setAnnouncements(data || [])
    } catch (err) {
      console.error('Error fetching announcements:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('announcements')
        // @ts-ignore
        .update({ is_active: !currentStatus } as any)
        .eq('id', id)

      if (error) throw error
      
      setAnnouncements(announcements.map(a => a.id === id ? { ...a, is_active: !currentStatus } : a))
    } catch (err) {
      console.error('Error toggling announcement active status:', err)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    const ok = await confirmAndDelete(title, () => supabase.from('announcements').delete().eq('id', id))
    if (ok) {
      setAnnouncements((a) => a.filter((x) => x.id !== id))
      toast.success('Announcement deleted')
    }
  }

  const filteredAnnouncements = announcements.filter(a => 
    (a.title?.toLowerCase() || '').includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Announcements Manager</h1>
          <p className="text-sm text-slate-500 mt-1">Manage platform alerts, banners, and scheduled popups.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search announcements..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue transition-all"
            />
          </div>
          <Link href={`/${locale}/admin/announcements/new`} className="flex items-center gap-2 bg-imperial-blue hover:bg-french-blue text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            New Alert
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Title & Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Schedule</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-imperial-blue border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading announcements...
                  </td>
                </tr>
              ) : filteredAnnouncements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No announcements found. Click "New Alert" to schedule one.
                  </td>
                </tr>
              ) : (
                filteredAnnouncements.map((announcement) => (
                  <tr key={announcement.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{announcement.title}</div>
                      <div className="flex gap-2 mt-1">
                        {announcement.is_banner && <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Banner</span>}
                        {announcement.is_popup && <span className="text-[10px] font-bold uppercase bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Popup</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                        announcement.priority === 'high' ? 'bg-red-100 text-red-700' :
                        announcement.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {announcement.priority === 'high' && <AlertTriangle className="w-3 h-3" />}
                        {announcement.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700">
                        <span className="text-slate-400 text-xs mr-1">Starts:</span>
                        {new Date(announcement.publish_date).toLocaleString()}
                      </div>
                      {announcement.expiry_date && (
                        <div className="text-sm text-slate-700 mt-1">
                          <span className="text-slate-400 text-xs mr-1">Ends:</span>
                          {new Date(announcement.expiry_date).toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleActive(announcement.id, announcement.is_active)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-imperial-blue focus:ring-offset-2 ${announcement.is_active ? 'bg-green-500' : 'bg-slate-300'}`}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${announcement.is_active ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/${locale}/admin/announcements/${announcement.id}/edit`} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(announcement.id, announcement.title)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
