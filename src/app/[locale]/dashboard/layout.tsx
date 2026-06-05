'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, ClipboardList, BookMarked, Award, User, Crown, ArrowRight, Compass } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const t = useTranslations()
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<{
    fullName: string
    email: string
    isPremium: boolean
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.replace(`/${locale}/login?redirect=${encodeURIComponent(pathname)}`)
          return
        }

        const { data: rawProfile } = await supabase
          .from('profiles')
          .select('full_name, is_premium')
          .eq('id', user.id)
          .single()

        const profileData = rawProfile as any

        setProfile({
          fullName: profileData?.full_name || user.email?.split('@')[0] || 'Student',
          email: user.email || '',
          isPremium: profileData?.is_premium || false,
        })
      } catch (err) {
        if (process.env.NODE_ENV === 'development') console.error('Error fetching profile:', err)
        router.replace(`/${locale}/login?redirect=${encodeURIComponent(pathname)}`)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()

    // Listen to profile updates or auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: rawProfile } = await supabase
            .from('profiles')
            .select('full_name, is_premium')
            .eq('id', session.user.id)
            .single()

          const profileData = rawProfile as any
          setProfile({
            fullName: profileData?.full_name || session.user.email?.split('@')[0] || 'Student',
            email: session.user.email || '',
            isPremium: profileData?.is_premium || false,
          })
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const menuItems = [
    { icon: LayoutDashboard, label: t('dashboard.overview'), path: `/${locale}/dashboard` },
    { icon: ClipboardList, label: t('dashboard.my_tests'), path: `/${locale}/dashboard/tests` },
    { icon: Compass, label: 'Career Assessment', path: `/${locale}/dashboard/assessments` },
    { icon: BookMarked, label: t('dashboard.my_library'), path: `/${locale}/dashboard/library` },
    { icon: Award, label: t('dashboard.certificates'), path: `/${locale}/dashboard/certificates` },
    { icon: User, label: t('dashboard.my_profile'), path: `/${locale}/dashboard/profile` },
  ]

  const isLinkActive = (path: string) => {
    if (path === `/${locale}/dashboard`) {
      return pathname === path
    }
    return pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="container-base py-6 sm:py-8 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar - Desktop Only */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card space-y-6">
              
              {/* User Quick Info */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-hero-gradient flex items-center justify-center text-white font-heading font-bold text-lg shadow-sm">
                  {profile?.fullName.charAt(0).toUpperCase() || 'S'}
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-heading font-bold text-slate-800 text-sm truncate">
                    {profile?.fullName || 'Student'}
                  </h4>
                  <p className="text-xs text-slate-400 truncate">{profile?.email}</p>
                  {profile?.isPremium ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mt-1.5 border border-amber-100">
                      <Crown className="w-3 h-3" />
                      {t('dashboard.premium_badge')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full mt-1.5">
                      Free Account
                    </span>
                  )}
                </div>
              </div>

              {/* Sidebar Menu Links */}
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const active = isLinkActive(item.path)
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        active
                          ? 'bg-blue-50/60 text-imperial-blue'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-imperial-blue' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* Premium Upgrade Promo Panel */}
              {!profile?.isPremium && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 rounded-xl p-4 border border-amber-100/80 shadow-sm relative overflow-hidden">
                  <div className="absolute -right-3 -bottom-3 text-amber-500/10">
                    <Crown className="w-16 h-16" />
                  </div>
                  <h5 className="font-heading font-bold text-slate-800 text-xs flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 text-amber-600" />
                    Unlock Premium Guides
                  </h5>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium leading-relaxed">
                    Get access to premium questions, mock tests, and certification exams.
                  </p>
                  <button
                    onClick={() => toast.info('Premium subscription coming soon!')}
                    className="btn-primary w-full text-[11px] h-8 mt-3 bg-amber-600 hover:bg-amber-700 text-white shadow-sm gap-1 group cursor-pointer"
                  >
                    <span>{t('dashboard.upgrade')}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* Main Dashboard Content Area */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
