'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, KeyRound, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { logError } from '@/lib/logger'

export default function ResetPasswordPage() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const supabase = createClient()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Password updated successfully')
        router.push(`/${locale}/login`)
        router.refresh()
      }
    } catch (err) {
      toast.error('Could not update password. Open the link from your email again.')
      logError('resetPassword', err)
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
          className="bg-white py-10 px-8 shadow-card rounded-2xl border border-slate-100"
        >
          <h2 className="text-3xl font-heading font-extrabold text-imperial-blue tracking-tight">
            {t('auth.reset_password')}
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-medium mb-6">
            Choose a new password for your account.
          </p>

          <form onSubmit={handleReset} className="space-y-5">
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  className="input-base pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 text-slate-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-2">
                {t('auth.confirm_password')}
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                minLength={8}
                className="input-base"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <button type="submit" className="btn-primary w-full justify-center gap-2" disabled={isLoading}>
              <span>Update password</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            <Link href={`/${locale}/login`} className="font-semibold text-imperial-blue hover:underline">
              {t('auth.login')}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
