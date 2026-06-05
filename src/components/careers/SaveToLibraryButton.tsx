'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bookmark } from 'lucide-react'
import { toast } from 'sonner'
import { saveToLibrary } from '@/app/actions/library'

type Props = {
  itemId?: string
  itemType?: 'career' | 'blog'
  locale: string
  className?: string
}

export default function SaveToLibraryButton({
  itemId,
  itemType = 'career',
  locale,
  className = 'btn-cta w-full text-sm font-bold justify-center',
}: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!itemId) {
      toast.error('Sign in and open a career from the live catalog to save it.')
      return
    }

    setSaving(true)
    const result = await saveToLibrary(itemId, itemType)
    setSaving(false)

    if (!result.success) {
      if (result.error.includes('log in')) {
        toast.error(result.error)
        router.push(`/${locale}/login?redirect=/${locale}/dashboard/library`)
      } else {
        toast.error(result.error)
      }
      return
    }

    toast.success('Saved to your library!')
    router.push(`/${locale}/dashboard/library`)
  }

  return (
    <button
      type="button"
      onClick={handleSave}
      disabled={saving}
      className={className}
    >
      <Bookmark className="w-4 h-4" />
      {saving ? 'Saving...' : 'Save to My Library'}
    </button>
  )
}
