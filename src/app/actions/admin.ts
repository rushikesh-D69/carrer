'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { logError } from '@/lib/logger'

export type AdminUserRow = {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
}

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  const role = (roleData as { role: string } | null)?.role
  if (!role || !['admin', 'super_admin'].includes(role)) return null
  return user
}

export async function fetchAdminUsers(): Promise<AdminUserRow[]> {
  try {
    if (!(await requireAdmin())) return []

    const admin = createAdminClient()
    const { data: authData } = await admin.auth.admin.listUsers({ perPage: 200 })
    const authUsers = authData?.users ?? []

    const { data: profiles } = await admin.from('profiles').select('id, full_name, created_at')
    const { data: roles } = await admin.from('user_roles').select('user_id, role')

    type ProfileRow = { id: string; full_name: string | null; created_at: string }
    type RoleRow = { user_id: string; role: string }
    const profileMap = new Map(((profiles ?? []) as ProfileRow[]).map((p) => [p.id, p]))
    const roleMap = new Map(((roles ?? []) as RoleRow[]).map((r) => [r.user_id, r.role]))

    return authUsers.map((u) => ({
      id: u.id,
      email: u.email ?? '',
      full_name: profileMap.get(u.id)?.full_name ?? null,
      role: roleMap.get(u.id) ?? 'student',
      created_at: profileMap.get(u.id)?.created_at ?? u.created_at,
    }))
  } catch (err) {
    logError('fetchAdminUsers', err)
    return []
  }
}

export async function updateUserRole(
  userId: string,
  role: 'student' | 'mentor' | 'admin' | 'super_admin'
): Promise<{ success: boolean; error?: string }> {
  try {
    const adminUser = await requireAdmin()
    if (!adminUser) return { success: false, error: 'Unauthorized' }

    const supabase = await createClient()
    const { error } = await supabase
      .from('user_roles')
      .upsert({ user_id: userId, role, granted_by: adminUser.id } as never, {
        onConflict: 'user_id',
      })

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err) {
    logError('updateUserRole', err)
    return { success: false, error: 'Failed to update role' }
  }
}

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
