'use client'

import { useEffect, useRef, useCallback } from 'react'
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

export default function TurnstileWidget({ onVerify, onExpire, className }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  const renderWidget = useCallback(() => {
    if (!siteKey || !containerRef.current || !window.turnstile) return
    if (widgetIdRef.current) {
      window.turnstile.remove(widgetIdRef.current)
      widgetIdRef.current = null
    }
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: onVerify,
      'expired-callback': onExpire,
      theme: 'light',
    })
  }, [siteKey, onVerify, onExpire])

  useEffect(() => {
    if (window.turnstile) renderWidget()
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
      }
    }
  }, [renderWidget])

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
        strategy="lazyOnload"
        onLoad={renderWidget}
      />
      <div ref={containerRef} className={className} />
    </>
  )
}
