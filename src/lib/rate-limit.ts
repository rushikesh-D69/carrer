import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export type RateLimitScope = 'contact' | 'login' | 'signup'

const LIMITS: Record<RateLimitScope, { requests: number; window: `${number} ${'s' | 'm' | 'h' | 'd'}` }> = {
  contact: { requests: 5, window: '10 m' },
  login: { requests: 10, window: '15 m' },
  signup: { requests: 5, window: '1 h' },
}

function getLimiter(scope: RateLimitScope): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null

  const { requests, window } = LIMITS[scope]
  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix: `ramanujonomics:${scope}`,
    analytics: true,
  })
}

export async function checkRateLimit(
  scope: RateLimitScope,
  identifier: string
): Promise<{ allowed: boolean; retryAfterSec?: number }> {
  const limiter = getLimiter(scope)
  if (!limiter) {
    return { allowed: true }
  }

  const { success, reset } = await limiter.limit(identifier)
  if (success) return { allowed: true }

  const retryAfterSec = Math.max(1, Math.ceil((reset - Date.now()) / 1000))
  return { allowed: false, retryAfterSec }
}
