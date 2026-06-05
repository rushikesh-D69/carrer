'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Home, Briefcase, ClipboardList, LayoutDashboard, User } from 'lucide-react'
import { useIsAdmin } from '@/hooks/useIsAdmin'

export default function MobileBottomNav() {
  const locale = useLocale()
  const pathname = usePathname()
  const { isAdmin } = useIsAdmin()

  const dashboardPath = isAdmin ? '/admin' : '/dashboard'

  if (pathname.includes('/admin')) return null

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Briefcase, label: 'Careers', path: '/careers' },
    { icon: ClipboardList, label: 'Tests', path: isAdmin ? '/admin/tests' : '/dashboard/tests' },
    { icon: LayoutDashboard, label: isAdmin ? 'Admin' : 'Dashboard', path: dashboardPath },
    { icon: User, label: 'Profile', path: isAdmin ? '/admin/settings' : '/dashboard/profile' },
  ]

  return (
    <nav className="mobile-bottom-nav md:hidden" aria-label="Mobile navigation">
      {navItems.map(({ icon: Icon, label, path }) => {
        const href = `/${locale}${path}`
        const isActive =
          path === '/'
            ? pathname === `/${locale}` || pathname === `/${locale}/`
            : pathname === href || pathname.startsWith(`${href}/`)

        return (
          <Link
            key={path}
            href={href}
            className={isActive ? 'active' : ''}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon
              className="w-5 h-5"
              strokeWidth={isActive ? 2.5 : 1.75}
            />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
