'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const t = useTranslations()
  const locale = useLocale()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/${locale}/reset-password`,
      })

      if (error) {
        toast.error(error.message)
      } else {
        setIsSent(true)
        toast.success('Password reset email sent!')
      }
    } catch (err) {
      toast.error('An unexpected error occurred')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSent) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-hero-gradient-subtle flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white py-10 px-8 shadow-card rounded-2xl border border-slate-100 text-center"
          >
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-600 mb-4">
              <Mail className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-heading font-extrabold text-imperial-blue mb-2">
              Email Sent
            </h2>
            <p className="text-slate-500 font-medium mb-6">
              We have sent password reset instructions to <strong>{email}</strong>. Please check your spam folder if you do not receive it shortly.
            </p>
            <Link href={`/${locale}/login`} className="btn-primary w-full justify-center">
              {t('auth.login')}
            </Link>
          </motion.div>
        </div>
      </div>
    )
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
          <div className="mb-6">
            <Link
              href={`/${locale}/login`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-imperial-blue transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Login</span>
            </Link>
            <h2 className="text-3xl font-heading font-extrabold text-imperial-blue tracking-tight">
              {t('auth.reset_password')}
            </h2>
            <p className="mt-2 text-sm text-slate-500 font-medium">
              Enter your email and we will send you instructions to reset your password.
            </p>
          </div>

          <form onSubmit={handleReset} className="space-y-6">
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
                  <span>Send Instructions</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
