'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, KeyRound, Mail, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export default function LoginPage() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const redirectUrl = searchParams.get('redirect') || `/${locale}/dashboard`
  
  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/${locale}/dashboard`,
        },
      })
      if (error) {
        toast.error(error.message)
      }
    } catch (err) {
      toast.error('An unexpected error occurred during Google sign-in')
      if (process.env.NODE_ENV === 'development') console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please enter your email and password')
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
      } else {
        toast.success(t('dashboard.welcome') || 'Welcome back!')
        
        let finalRedirectUrl = redirectUrl
        if (data.user) {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', data.user.id)
            .single()
            
          if (roleData && ['admin', 'super_admin'].includes((roleData as any).role)) {
            finalRedirectUrl = `/${locale}/admin`
          }
        }
        
        router.push(finalRedirectUrl)
        router.refresh()
      }
    } catch (err) {
      toast.error('An unexpected error occurred')
      if (process.env.NODE_ENV === 'development') console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-hero-gradient-subtle flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white py-10 px-8 shadow-card rounded-2xl border border-slate-100"
        >
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-heading font-extrabold text-imperial-blue tracking-tight">
              {t('auth.login')}
            </h2>
            <p className="mt-2 text-sm text-slate-500 font-medium">
              {t('hero.badge')}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                {t('auth.email')}
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="input-base pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                  {t('auth.password')}
                </label>
                <Link
                  href={`/${locale}/forgot-password`}
                  className="text-sm font-semibold text-french-blue hover:text-imperial-blue hover:underline transition-colors"
                >
                  {t('auth.forgot_password')}
                </Link>
              </div>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="input-base pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2 group cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t('common.loading')}
                </span>
              ) : (
                <>
                  <span>{t('auth.login')}</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-slate-500">
                {t('auth.or_continue_with') || 'Or continue with'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-200 hover:border-slate-300 rounded-xl bg-white text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-all shadow-sm cursor-pointer mb-6"
            disabled={isLoading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.62 0 3.08.56 4.22 1.65l3.15-3.15C17.45 1.84 14.97 1 12 1 7.24 1 3.2 3.74 1.25 7.75l3.79 2.94C5.97 7.55 8.78 5.04 12 5.04z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.43c-.28 1.46-1.1 2.69-2.33 3.51l3.63 2.82c2.13-1.97 3.76-4.88 3.76-8.48z"
              />
              <path
                fill="#FBBC05"
                d="M5.04 10.69c-.24-.72-.38-1.5-.38-2.31s.14-1.59.38-2.31L1.25 3.12C.45 4.74 0 6.56 0 8.5s.45 3.76 1.25 5.38l3.79-2.94a7.9 7.9 0 0 1 0-4.63z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.63-2.82c-1.1.74-2.52 1.18-4.33 1.18-3.22 0-6.03-2.51-7.01-5.65L1.2 16.74C3.15 20.74 7.19 23 12 23z"
              />
            </svg>
            <span>{t('auth.google_signin') || 'Sign in with Google'}</span>
          </button>

          <div className="text-center">
            <span className="text-sm text-slate-500">
              {t('auth.no_account')}{' '}
            </span>
            <Link
              href={`/${locale}/signup`}
              className="text-sm font-bold text-french-blue hover:text-imperial-blue hover:underline transition-colors"
            >
              {t('auth.signup')}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
