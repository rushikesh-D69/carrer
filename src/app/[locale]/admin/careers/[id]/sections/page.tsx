'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLocale } from 'next-intl'
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

const SECTION_TYPES = [
  'overview', 'eligibility', 'salary', 'preparation_timeline', 'faq', 'roadmap', 'custom',
] as const

export default function CareerSectionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const supabase = createClient()
  const locale = useLocale()
  const [career, setCareer] = useState<any>(null)
  const [sections, setSections] = useState<any[]>([])
  const [newType, setNewType] = useState<string>('overview')
  const [saving, setSaving] = useState<string | null>(null)

  const load = async () => {
    const [{ data: c }, { data: s }] = await Promise.all([
      supabase.from('careers').select('title, slug').eq('id', id).single(),
      supabase.from('career_sections').select('*').eq('career_id', id).order('sort_order'),
    ])
    setCareer(c)
    setSections(s || [])
  }

  useEffect(() => {
    load()
  }, [id])

  const addSection = async () => {
    const { error } = await supabase.from('career_sections').insert({
      career_id: id,
      section_type: newType,
      title: newType.replace(/_/g, ' '),
      content_md: '',
      sort_order: sections.length,
    } as never)
    if (error) {
      toast.error('Failed to add section')
      return
    }
    toast.success('Section added')
    load()
  }

  const saveSection = async (section: any) => {
    setSaving(section.id)
    const { error } = await supabase.from('career_sections').update({
      title: section.title,
      content_md: section.content_md,
      is_visible: section.is_visible,
    } as never).eq('id', section.id)
    if (error) toast.error('Save failed')
    else toast.success('Section saved')
    setSaving(null)
  }

  const deleteSection = async (sectionId: string) => {
    if (!window.confirm('Delete this section?')) return
    const { error } = await supabase.from('career_sections').delete().eq('id', sectionId)
    if (error) toast.error('Delete failed')
    else {
      toast.success('Deleted')
      load()
    }
  }

  const updateLocal = (sectionId: string, field: string, value: string | boolean) => {
    setSections((s) => s.map((x) => (x.id === sectionId ? { ...x, [field]: value } : x)))
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/admin/careers`} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Content Sections</h1>
          <p className="text-sm text-slate-500">{career?.title}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <select value={newType} onChange={(e) => setNewType(e.target.value)} className="px-4 py-2 border rounded-lg bg-white text-sm">
          {SECTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button onClick={addSection} className="flex items-center gap-2 bg-imperial-blue text-white px-4 py-2 rounded-lg text-sm font-semibold">
          <Plus className="w-4 h-4" /> Add Section
        </button>
      </div>

      <div className="space-y-4">
        {sections.map((s) => (
          <div key={s.id} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase text-slate-400">{s.section_type}</span>
              <input
                value={s.title || ''}
                onChange={(e) => updateLocal(s.id, 'title', e.target.value)}
                className="flex-1 px-3 py-1.5 border rounded-lg text-sm font-semibold"
              />
              <label className="flex items-center gap-1 text-xs text-slate-600">
                <input type="checkbox" checked={s.is_visible} onChange={(e) => updateLocal(s.id, 'is_visible', e.target.checked)} /> Visible
              </label>
              <button onClick={() => deleteSection(s.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>
            <textarea
              value={s.content_md || ''}
              onChange={(e) => updateLocal(s.id, 'content_md', e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border rounded-lg font-mono text-sm bg-slate-50"
              placeholder="Markdown content..."
            />
            <button
              onClick={() => saveSection(sections.find((x) => x.id === s.id))}
              disabled={saving === s.id}
              className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold ml-auto"
            >
              <Save className="w-4 h-4" /> {saving === s.id ? 'Saving...' : 'Save Section'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
