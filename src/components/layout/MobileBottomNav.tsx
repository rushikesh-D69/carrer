'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Home, Briefcase, ClipboardList, LayoutDashboard, User } from 'lucide-react'

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Briefcase, label: 'Careers', path: '/careers' },
  { icon: ClipboardList, label: 'Tests', path: '/dashboard/tests' },
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: User, label: 'Profile', path: '/dashboard/profile' },
]

export default function MobileBottomNav() {
  const locale = useLocale()
  const pathname = usePathname()

  return (
    <nav className="mobile-bottom-nav md:hidden" aria-label="Mobile navigation">
      {navItems.map(({ icon: Icon, label, path }) => {
        const href = `/${locale}${path}`
        const isActive =
          path === '/'
            ? pathname === `/${locale}` || pathname === `/${locale}/`
            : pathname.startsWith(`/${locale}${path}`)

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
