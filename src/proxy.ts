import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'
import { getLocaleFromPathname, localePath } from '@/lib/i18n-path'

const intlMiddleware = createIntlMiddleware(routing)

const protectedPaths = ['/dashboard']
const adminPaths = ['/admin']
const authPaths = ['/login', '/signup', '/forgot-password', '/reset-password']

function matchesPath(pathname: string, paths: string[]): boolean {
  const locale = getLocaleFromPathname(pathname)
  const withoutLocale = pathname.replace(new RegExp(`^/${locale}`), '') || '/'
  return paths.some(
    (p) => withoutLocale === p || withoutLocale.startsWith(`${p}/`)
  )
}

export async function proxy(request: NextRequest) {
  const intlResponse = intlMiddleware(request)
  const { pathname } = request.nextUrl

  let supabaseResponse = intlResponse || NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = intlResponse || NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (matchesPath(pathname, adminPaths)) {
    if (!user) {
      const loginUrl = new URL(localePath(pathname, '/login'), request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!roleData || !['admin', 'super_admin'].includes(roleData.role)) {
      return NextResponse.redirect(
        new URL(localePath(pathname, '/dashboard'), request.url)
      )
    }
  }

  if (matchesPath(pathname, protectedPaths) && !user) {
    const loginUrl = new URL(localePath(pathname, '/login'), request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (matchesPath(pathname, authPaths) && user) {
    return NextResponse.redirect(
      new URL(localePath(pathname, '/dashboard'), request.url)
    )
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
