'use client'

import { useState, useEffect } from 'react'
import { fetchAdminUsers, updateUserRole } from '@/app/actions/admin'
import { Search, Users } from 'lucide-react'
import { toast } from 'sonner'

const ROLES = ['student', 'mentor', 'admin', 'super_admin'] as const

export default function UsersAdminPage() {
  const [users, setUsers] = useState<Awaited<ReturnType<typeof fetchAdminUsers>>>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchAdminUsers().then((data) => {
      setUsers(data)
      setLoading(false)
    })
  }, [])

  const handleRoleChange = async (userId: string, role: typeof ROLES[number]) => {
    setUpdating(userId)
    const result = await updateUserRole(userId, role)
    if (result.success) {
      setUsers((u) => u.map((x) => (x.id === userId ? { ...x, role } : x)))
      toast.success('Role updated')
    } else {
      toast.error(result.error || 'Failed to update role')
    }
    setUpdating(null)
  }

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.full_name?.toLowerCase() || '').includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500 mt-1">View users and assign roles.</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full sm:w-72"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={3} className="px-6 py-12 text-center">Loading users...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                  <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />No users found.
                </td></tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{u.full_name || 'No name'}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={u.role}
                        disabled={updating === u.id}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as typeof ROLES[number])}
                        className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white capitalize"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{r.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
