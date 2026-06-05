'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Users, 
  MessageSquare, 
  Settings, 
  Image as ImageIcon,
  Bell,
  Calendar,
  BookOpen,
  CheckSquare,
  LogOut
} from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const [adminName, setAdminName] = useState('Admin')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: rawProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single()
            
          const profileData = rawProfile as any
          if (profileData?.full_name) {
            setAdminName(profileData.full_name)
          } else {
            setAdminName(user.email?.split('@')[0] || 'Admin')
          }
        }
      } catch (err) {
        console.error('Error fetching admin profile:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [supabase])

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard Overview', path: `/${locale}/admin` },
    { icon: Briefcase, label: 'Career Builder', path: `/${locale}/admin/careers` },
    { icon: FileText, label: 'Blog Editor', path: `/${locale}/admin/blogs` },
    { icon: BookOpen, label: 'Question Bank', path: `/${locale}/admin/questions` },
    { icon: CheckSquare, label: 'Test Builder', path: `/${locale}/admin/tests` },
    { icon: MessageSquare, label: 'Leads CRM', path: `/${locale}/admin/leads` },
    { icon: Users, label: 'User Management', path: `/${locale}/admin/users` },
    { icon: ImageIcon, label: 'Media Library', path: `/${locale}/admin/media` },
    { icon: Bell, label: 'Announcements', path: `/${locale}/admin/announcements` },
    { icon: Calendar, label: 'Events', path: `/${locale}/admin/events` },
    { icon: Settings, label: 'Site Settings', path: `/${locale}/admin/settings` },
  ]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push(`/${locale}/login`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-imperial-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-200">
          <Link href={`/${locale}`} className="text-xl font-black text-imperial-blue tracking-tight">
            RamanujonomicS
            <span className="block text-xs font-semibold text-french-blue uppercase tracking-widest mt-1">Admin Panel</span>
          </Link>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== `/${locale}/admin` && pathname.startsWith(item.path))
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm ${
                  isActive 
                  ? 'bg-imperial-blue text-white shadow-md shadow-imperial-blue/20' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-imperial-blue'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            )
          })}
        </div>
        
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-4 px-3">
            <div className="w-10 h-10 rounded-full bg-imperial-blue/10 flex items-center justify-center text-imperial-blue font-bold">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{adminName}</p>
              <p className="text-xs text-slate-500 truncate">Administrator</p>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden sticky top-0 z-20 bg-white border-b border-slate-200 px-2 py-2 overflow-x-auto flex gap-1 shrink-0">
        {menuItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== `/${locale}/admin` && pathname.startsWith(item.path))
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 ${
                isActive ? 'bg-imperial-blue text-white' : 'text-slate-600 bg-slate-100'
              }`}
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label.split(' ')[0]}
            </Link>
          )
        })}
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
