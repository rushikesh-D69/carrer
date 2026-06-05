'use client'

import { useEffect, useRef } from 'react'
import Script from 'next/script'

type TurnstileWidgetProps = {
  onVerify: (token: string) => void
  onExpire?: () => void
  className?: string
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          'expired-callback'?: () => void
          theme?: 'light' | 'dark' | 'auto'
        }
      ) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
  }
}

function safeRemoveWidget(widgetId: string | null) {
  if (!widgetId || !window.turnstile) return
  try {
    window.turnstile.remove(widgetId)
  } catch {
    // Already removed — common with React strict mode double-mount
  }
}

export default function TurnstileWidget({ onVerify, onExpire, className }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const mountedRef = useRef(false)
  const onVerifyRef = useRef(onVerify)
  const onExpireRef = useRef(onExpire)

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  useEffect(() => {
    onVerifyRef.current = onVerify
    onExpireRef.current = onExpire
  }, [onVerify, onExpire])

  const mountWidget = () => {
    if (!siteKey || !containerRef.current || !window.turnstile || mountedRef.current) return

    mountedRef.current = true
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: (token) => onVerifyRef.current(token),
      'expired-callback': () => onExpireRef.current?.(),
      theme: 'light',
    })
  }

  useEffect(() => {
    mountWidget()
    return () => {
      safeRemoveWidget(widgetIdRef.current)
      widgetIdRef.current = null
      mountedRef.current = false
    }
  }, [siteKey])

  if (!siteKey) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Turnstile not configured — add NEXT_PUBLIC_TURNSTILE_SITE_KEY in .env.local
        </p>
      )
    }
    return null
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={mountWidget}
      />
      <div ref={containerRef} className={className} />
    </>
  )
}
