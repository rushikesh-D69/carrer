import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

const protectedRoutes = ['/dashboard', '/en/dashboard', '/te/dashboard']
const adminRoutes = ['/admin', '/en/admin', '/te/admin']

export async function proxy(request: NextRequest) {
  // Handle i18n routing first
  const intlResponse = intlMiddleware(request)

  const { pathname } = request.nextUrl

  // Create Supabase response to update auth cookies
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

  const { data: { user } } = await supabase.auth.getUser()

  // Check if route is admin-only
  const isAdminRoute = adminRoutes.some(r => pathname.startsWith(r))
  const isProtectedRoute = protectedRoutes.some(r => pathname.startsWith(r))

  if (isAdminRoute) {
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!roleData || !['admin', 'super_admin'].includes(roleData.role)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  if (isProtectedRoute && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect logged-in users away from auth pages
  const isAuthRoute = ['/login', '/signup', '/forgot-password',
    '/en/login', '/en/signup', '/te/login', '/te/signup'].some(r => pathname === r)

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
