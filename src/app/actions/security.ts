'use server'

import { headers } from 'next/headers'
import { checkRateLimit, type RateLimitScope } from '@/lib/rate-limit'
import { verifyTurnstileToken, isTurnstileConfigured } from '@/lib/turnstile'

async function getClientIp(): Promise<string> {
  const h = await headers()
  return (
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip') ||
    'unknown'
  )
}

export type SecurityCheckResult =
  | { ok: true }
  | { ok: false; error: string }

export async function enforceFormSecurity(
  scope: RateLimitScope,
  turnstileToken?: string
): Promise<SecurityCheckResult> {
  const ip = await getClientIp()
  const rate = await checkRateLimit(scope, ip)

  if (!rate.allowed) {
    const mins = Math.ceil((rate.retryAfterSec ?? 60) / 60)
    return {
      ok: false,
      error: `Too many attempts. Please wait ${mins} minute${mins === 1 ? '' : 's'} and try again.`,
    }
  }

  if (isTurnstileConfigured()) {
    const valid = await verifyTurnstileToken(turnstileToken)
    if (!valid) {
      return { ok: false, error: 'Security check failed. Please complete the verification and try again.' }
    }
  }

  return { ok: true }
}
