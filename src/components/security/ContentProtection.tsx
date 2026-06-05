'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const ALLOWED_PATH_SUFFIXES = ['/login', '/signup', '/forgot-password', '/reset-password', '/contact']

function isFormElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  return target.isContentEditable || Boolean(target.closest('input, textarea, select, [contenteditable="true"]'))
}

export default function ContentProtection() {
  const pathname = usePathname()

  useEffect(() => {
    const isAuthOrContact = ALLOWED_PATH_SUFFIXES.some((p) => pathname.endsWith(p))
    if (isAuthOrContact) return

    const block = (e: Event) => {
      if (isFormElement(e.target)) return
      e.preventDefault()
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (isFormElement(e.target)) return
      const key = e.key.toLowerCase()
      const meta = e.ctrlKey || e.metaKey
      if (meta && ['c', 'x', 'a', 's', 'u', 'p'].includes(key)) {
        e.preventDefault()
      }
    }

    document.addEventListener('contextmenu', block)
    document.addEventListener('copy', block)
    document.addEventListener('cut', block)
    document.addEventListener('selectstart', block)
    document.addEventListener('dragstart', block)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('contextmenu', block)
      document.removeEventListener('copy', block)
      document.removeEventListener('cut', block)
      document.removeEventListener('selectstart', block)
      document.removeEventListener('dragstart', block)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [pathname])

  return null
}
