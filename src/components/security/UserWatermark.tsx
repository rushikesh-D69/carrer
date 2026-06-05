'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const TILE_COUNT = 40

export default function UserWatermark() {
  const [label, setLabel] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setLabel(`${user.email} · Ramanujonomics`)
      }
    })
  }, [])

  if (!label) return null

  return (
    <div className="watermark-layer" aria-hidden>
      <div className="watermark-grid">
        {Array.from({ length: TILE_COUNT }).map((_, i) => (
          <span key={i} className="watermark-tile">
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
