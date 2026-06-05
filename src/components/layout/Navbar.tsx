'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Menu, X, Search, Bell, ChevronDown, Globe, BookOpen, Landmark, Briefcase, Store, Rocket, TrendingUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useIsAdmin } from '@/hooks/useIsAdmin'

const careerCategories = [
  { icon: Landmark, key: 'government', slug: 'government', color: '#00296B' },
  { icon: Briefcase, key: 'private', slug: 'private', color: '#003F88' },
  { icon: Store, key: 'self_employment', slug: 'self-employment', color: '#00509D' },
  { icon: Rocket, key: 'entrepreneurship', slug: 'entrepreneurship', color: '#FDC500' },
  { icon: TrendingUp, key: 'economic_literacy', slug: 'economic-literacy', color: '#10B981' },
]

export default function Navbar() {
  const t = useTranslations()
  const locale = useLocale()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isCareersOpen, setIsCareersOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [user, setUser] = useState<null | { name: string; email?: string }>(null)
  const supabase = createClient()
  const { isAdmin } = useIsAdmin()

  const otherLocale = locale === 'en' ? 'te' : 'en'
  const localePath = (path: string) => `/${locale}${path}`
  const dashboardPath = isAdmin ? '/admin' : '/dashboard'

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false)
    setIsCareersOpen(false)
  }, [pathname])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data: rawProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', authUser.id)
          .single()
        const profile = rawProfile as any
        setUser({
          name: profile?.full_name || authUser.email?.split('@')[0] || 'User',
          email: authUser.email
        })
      } else {
        setUser(null)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: rawProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', session.user.id)
            .single()
          const profile = rawProfile as any
          setUser({
            name: profile?.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email
          })
        } else {
          setUser(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = localePath('/')
  }

  const isActive = (path: string) =>
    pathname === `/${locale}${path}` || pathname.startsWith(`/${locale}${path}/`)

  return (
    <>
      {/* Desktop + Mobile Top Navbar */}
      <header
        className={`sticky top-0 z-[100] w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100'
            : 'bg-white border-b border-slate-100'
        }`}
      >
        <nav className="container-base flex items-center justify-between h-16">

          {/* Logo */}
          <Link href={localePath('/')} className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-imperial-blue">
              <BookOpen className="w-5 h-5 text-school-bus-yellow" />
            </div>
            <div className="hidden sm:block">
              <span className="font-heading font-bold text-lg text-imperial-blue leading-none">
                Ramanujonomics
              </span>
              <p className="text-[10px] text-muted leading-none font-medium tracking-wide">
                Wealth is Health
              </p>
            </div>
            <span className="sm:hidden font-heading font-bold text-base text-imperial-blue">
              RAM
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {/* Careers dropdown */}
            <div className="relative" onMouseLeave={() => setIsCareersOpen(false)}>
              <button
                onMouseEnter={() => setIsCareersOpen(true)}
                onClick={() => setIsCareersOpen(!isCareersOpen)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-imperial-blue hover:bg-slate-50 transition-colors"
              >
                {t('nav.careers')}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCareersOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isCareersOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    onMouseEnter={() => setIsCareersOpen(true)}
                    className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden"
                  >
                    <div className="p-2">
                      {careerCategories.map(({ icon: Icon, key, slug, color }) => (
                        <Link
                          key={slug}
                          href={localePath(`/careers?category=${slug}`)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${color}18` }}
                          >
                            <Icon className="w-4 h-4" style={{ color }} />
                          </div>
                          <span className="text-sm font-medium text-slate-700 group-hover:text-imperial-blue transition-colors">
                            {t(`categories.${key}`)}
                          </span>
                        </Link>
                      ))}
                      <div className="border-t border-slate-100 mt-2 pt-2">
                        <Link
                          href={localePath('/careers')}
                          className="flex items-center justify-between px-3 py-2 text-sm font-semibold text-imperial-blue hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          {t('careers.explore_all')}
                          <ChevronDown className="-rotate-90 w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href={localePath('/blog')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/blog')
                  ? 'text-imperial-blue bg-blue-50'
                  : 'text-slate-700 hover:text-imperial-blue hover:bg-slate-50'
              }`}
            >
              {t('nav.blog')}
            </Link>

            <Link
              href={localePath('/events')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/events')
                  ? 'text-imperial-blue bg-blue-50'
                  : 'text-slate-700 hover:text-imperial-blue hover:bg-slate-50'
              }`}
            >
              {t('nav.events')}
            </Link>

            <Link
              href={localePath('/compare')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/compare')
                  ? 'text-imperial-blue bg-blue-50'
                  : 'text-slate-700 hover:text-imperial-blue hover:bg-slate-50'
              }`}
            >
              {t('nav.compare')}
            </Link>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Language Switcher */}
            <Link
              href={pathname.replace(`/${locale}`, `/${otherLocale}`)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-imperial-blue hover:bg-slate-50 transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span>{otherLocale === 'te' ? 'తెలుగు' : 'English'}</span>
            </Link>

            {/* Search */}
            <Link
              href={localePath('/search')}
              className="p-2 rounded-lg text-slate-600 hover:text-imperial-blue hover:bg-slate-50 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </Link>

            {user ? (
              <>
                <Link href={localePath(dashboardPath)} className="p-2 rounded-lg text-slate-600 hover:text-imperial-blue hover:bg-slate-50 transition-colors">
                  <Bell className="w-5 h-5" />
                </Link>
                <Link href={localePath(dashboardPath)} className="btn-primary text-sm px-4 h-9">
                  {isAdmin ? 'Admin Panel' : t('nav.dashboard')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link href={localePath('/login')} className="px-4 py-2 text-sm font-semibold text-imperial-blue hover:bg-slate-50 rounded-lg transition-colors">
                  {t('nav.login')}
                </Link>
                <Link href={localePath('/signup')} className="btn-primary text-sm px-4 h-9">
                  {t('nav.signup')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Right: Language + Hamburger */}
          <div className="flex md:hidden items-center gap-1">
            <Link
              href={pathname.replace(`/${locale}`, `/${otherLocale}`)}
              className="p-2 rounded-lg text-slate-600"
              aria-label="Switch language"
            >
              <Globe className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Slide-down Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/30 z-[98] md:hidden"
            />

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-16 left-0 right-0 z-[99] bg-white border-b border-slate-100 shadow-xl md:hidden overflow-y-auto max-h-[calc(100dvh-64px)]"
            >
              <div className="container-base py-4 space-y-1">

                {/* Career categories */}
                <div className="pb-2">
                  <p className="px-3 pb-2 text-xs font-semibold text-muted uppercase tracking-widest">
                    Careers
                  </p>
                  {careerCategories.map(({ icon: Icon, key, slug, color }) => (
                    <Link
                      key={slug}
                      href={localePath(`/careers?category=${slug}`)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
                        <Icon className="w-5 h-5" style={{ color }} />
                      </div>
                      <span className="font-medium text-slate-800">{t(`categories.${key}`)}</span>
                    </Link>
                  ))}
                </div>

                <div className="divider" />

                <Link href={localePath('/blog')} className="flex items-center px-3 py-3 rounded-xl font-medium text-slate-700 hover:bg-slate-50 hover:text-imperial-blue transition-colors">
                  {t('nav.blog')}
                </Link>
                <Link href={localePath('/events')} className="flex items-center px-3 py-3 rounded-xl font-medium text-slate-700 hover:bg-slate-50 hover:text-imperial-blue transition-colors">
                  {t('nav.events')}
                </Link>
                <Link href={localePath('/compare')} className="flex items-center px-3 py-3 rounded-xl font-medium text-slate-700 hover:bg-slate-50 hover:text-imperial-blue transition-colors">
                  {t('nav.compare')}
                </Link>
                <Link href={localePath('/contact')} className="flex items-center px-3 py-3 rounded-xl font-medium text-slate-700 hover:bg-slate-50 hover:text-imperial-blue transition-colors">
                  {t('nav.contact')}
                </Link>

                <div className="divider" />

                <div className="pt-2 flex flex-col gap-2">
                  {user ? (
                    <>
                      <Link href={localePath(dashboardPath)} className="btn-primary w-full text-center">
                        {isAdmin ? 'Admin Panel' : t('nav.dashboard')}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="btn-outline w-full border-red-200 text-red-600 hover:bg-red-50 text-center"
                      >
                        {t('nav.logout')}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href={localePath('/login')} className="btn-outline w-full text-center">
                        {t('nav.login')}
                      </Link>
                      <Link href={localePath('/signup')} className="btn-cta w-full text-center">
                        {t('nav.signup')}
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
