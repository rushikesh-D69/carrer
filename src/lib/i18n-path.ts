import { routing } from '@/i18n/routing'

export function getLocaleFromPathname(pathname: string): string {
  const segment = pathname.split('/')[1]
  if (routing.locales.includes(segment as (typeof routing.locales)[number])) {
    return segment
  }
  return routing.defaultLocale
}

export function localePath(pathname: string, path: string): string {
  const locale = getLocaleFromPathname(pathname)
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `/${locale}${normalized}`
}
