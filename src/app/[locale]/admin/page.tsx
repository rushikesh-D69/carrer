'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, Briefcase, FileText, MessageSquare, TrendingUp, Calendar, AlertCircle, Bell } from 'lucide-react'
import Link from 'next/link'
import { useLocale } from 'next-intl'

export default function AdminDashboardPage() {
  const supabase = createClient()
  const locale = useLocale()
  
  const [stats, setStats] = useState({
    users: 0,
    careers: 0,
    blogs: 0,
    leads: 0,
    tests: 0,
    events: 0
  })
  const [recentLeads, setRecentLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch counts for various entities
        const [
          { count: usersCount },
          { count: careersCount },
          { count: blogsCount },
          { count: leadsCount },
          { count: testsCount },
          { count: eventsCount },
          { data: leadsData }
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('careers').select('*', { count: 'exact', head: true }),
          supabase.from('blogs').select('*', { count: 'exact', head: true }),
          supabase.from('leads').select('*', { count: 'exact', head: true }),
          supabase.from('tests').select('*', { count: 'exact', head: true }),
          supabase.from('events').select('*', { count: 'exact', head: true }),
          supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(5)
        ])

        setStats({
          users: usersCount || 0,
          careers: careersCount || 0,
          blogs: blogsCount || 0,
          leads: leadsCount || 0,
          tests: testsCount || 0,
          events: eventsCount || 0
        })

        if (leadsData) {
          setRecentLeads(leadsData)
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  const statCards = [
    { title: 'Total Students', value: stats.users, icon: Users, color: 'bg-blue-500' },
    { title: 'Published Careers', value: stats.careers, icon: Briefcase, color: 'bg-indigo-500' },
    { title: 'Blog Articles', value: stats.blogs, icon: FileText, color: 'bg-purple-500' },
    { title: 'New Leads', value: stats.leads, icon: MessageSquare, color: 'bg-green-500' },
    { title: 'Practice Tests', value: stats.tests, icon: TrendingUp, color: 'bg-orange-500' },
    { title: 'Upcoming Events', value: stats.events, icon: Calendar, color: 'bg-rose-500' },
  ]

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-64"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">Welcome to the RamanujonomicS Admin Control Panel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl ${stat.color} text-white flex items-center justify-center shrink-0 shadow-inner`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.title}</p>
              <h3 className="text-3xl font-black text-slate-900">{stat.value.toLocaleString()}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Leads */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-imperial-blue" />
              Recent Leads & Inquiries
            </h2>
            <Link href={`/${locale}/admin/leads`} className="text-sm font-semibold text-imperial-blue hover:text-french-blue">
              View All
            </Link>
          </div>
          <div className="p-0 flex-1">
            {recentLeads.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">{lead.name}</p>
                      <p className="text-sm text-slate-500">{lead.email}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      lead.status === 'new' ? 'bg-blue-100 text-blue-700' :
                      lead.status === 'contacted' ? 'bg-amber-100 text-amber-700' :
                      lead.status === 'qualified' ? 'bg-green-100 text-green-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {lead.status || 'New'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center h-full">
                <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
                <p>No recent leads found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <Link href={`/${locale}/admin/blogs`} className="p-4 rounded-xl border border-slate-200 hover:border-imperial-blue hover:shadow-md transition-all flex flex-col items-center text-center gap-2 group">
              <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <span className="font-semibold text-slate-800">Write Article</span>
            </Link>
            <Link href={`/${locale}/admin/careers`} className="p-4 rounded-xl border border-slate-200 hover:border-imperial-blue hover:shadow-md transition-all flex flex-col items-center text-center gap-2 group">
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Briefcase className="w-6 h-6" />
              </div>
              <span className="font-semibold text-slate-800">Add Career</span>
            </Link>
            <Link href={`/${locale}/admin/announcements`} className="p-4 rounded-xl border border-slate-200 hover:border-imperial-blue hover:shadow-md transition-all flex flex-col items-center text-center gap-2 group">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <Bell className="w-6 h-6" />
              </div>
              <span className="font-semibold text-slate-800">New Alert</span>
            </Link>
            <Link href={`/${locale}/admin/events`} className="p-4 rounded-xl border border-slate-200 hover:border-imperial-blue hover:shadow-md transition-all flex flex-col items-center text-center gap-2 group">
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <Calendar className="w-6 h-6" />
              </div>
              <span className="font-semibold text-slate-800">Schedule Event</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
