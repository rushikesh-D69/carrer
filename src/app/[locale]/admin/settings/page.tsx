'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Settings } from 'lucide-react'
import { toast } from 'sonner'

export default function SiteSettingsPage() {
  const supabase = createClient()
  const [settings, setSettings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('*')
      .order('group_name')
      .order('key')
      .then(({ data }) => {
        setSettings(data || [])
        setLoading(false)
      })
  }, [])

  const handleSave = async (key: string, value: string) => {
    setSaving(key)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('site_settings')
        .update({ value, updated_by: user?.id } as never)
        .eq('key', key)
      if (error) throw error
      toast.success(`Saved ${key}`)
    } catch {
      toast.error('Failed to save setting')
    } finally {
      setSaving(null)
    }
  }

  const groups = [...new Set(settings.map((s) => s.group_name || 'general'))]

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Loading settings...</div>
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-7 h-7 text-imperial-blue" />
          Site Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">Edit homepage, footer, SEO, and contact info.</p>
      </div>

      {groups.map((group) => (
        <div key={group} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider capitalize">{group}</h2>
          </div>
          <div className="p-6 space-y-4">
            {settings
              .filter((s) => (s.group_name || 'general') === group)
              .map((s) => (
                <div key={s.key} className="flex flex-col sm:flex-row sm:items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{s.label || s.key}</label>
                    <input
                      type="text"
                      value={s.value ?? ''}
                      onChange={(e) =>
                        setSettings((all) =>
                          all.map((x) => (x.key === s.key ? { ...x, value: e.target.value } : x))
                        )
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <button
                    onClick={() => handleSave(s.key, s.value ?? '')}
                    disabled={saving === s.key}
                    className="flex items-center gap-1.5 px-4 py-2 bg-imperial-blue text-white rounded-lg text-sm font-semibold disabled:opacity-50 shrink-0"
                  >
                    <Save className="w-4 h-4" />
                    {saving === s.key ? 'Saving...' : 'Save'}
                  </button>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}
