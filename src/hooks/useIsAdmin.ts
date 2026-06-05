'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const ADMIN_ROLES = ['admin', 'super_admin']

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      const role = (data as { role: string } | null)?.role
      setIsAdmin(!!role && ADMIN_ROLES.includes(role))
      setLoading(false)
    }

    check()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      check()
    })

    return () => subscription.unsubscribe()
  }, [])

  return { isAdmin, loading }
}
