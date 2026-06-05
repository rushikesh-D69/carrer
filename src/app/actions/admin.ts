'use server'

import { createClient } from '@/lib/supabase/server'
import { logError } from '@/lib/logger'

export type AdminStats = {
  users: number
  careers: number
  blogs: number
  leads: number
  tests: number
  events: number
}

export async function fetchAdminStats(): Promise<{
  stats: AdminStats
  recentLeads: Array<{
    id: string
    name: string
    email: string
    status: string
  }>
}> {
  const empty = {
    stats: { users: 0, careers: 0, blogs: 0, leads: 0, tests: 0, events: 0 },
    recentLeads: [],
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return empty

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const role = (roleData as { role: string } | null)?.role
    if (!role || !['admin', 'super_admin'].includes(role)) {
      return empty
    }

    const [
      usersRes,
      careersRes,
      blogsRes,
      leadsRes,
      testsRes,
      eventsRes,
      leadsDataRes,
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('careers').select('*', { count: 'exact', head: true }),
      supabase.from('blogs').select('*', { count: 'exact', head: true }),
      supabase.from('leads').select('*', { count: 'exact', head: true }),
      supabase.from('tests').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('leads').select('id, name, email, status').order('created_at', { ascending: false }).limit(5),
    ])

    return {
      stats: {
        users: usersRes.count ?? 0,
        careers: careersRes.count ?? 0,
        blogs: blogsRes.count ?? 0,
        leads: leadsRes.count ?? 0,
        tests: testsRes.count ?? 0,
        events: eventsRes.count ?? 0,
      },
      recentLeads: (leadsDataRes.data ?? []) as Array<{
        id: string
        name: string
        email: string
        status: string
      }>,
    }
  } catch (err) {
    logError('fetchAdminStats', err)
    return empty
  }
}
