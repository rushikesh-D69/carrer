'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function EditTestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const supabase = createClient()
  const router = useRouter()
  const locale = useLocale()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    duration: 60,
    total_marks: 100,
    passing_percentage: 40,
    negative_marking: 0.33,
    category: 'aptitude',
    difficulty: 'medium',
    is_premium: false,
    random_order: true,
    published: false,
  })

  useEffect(() => {
    supabase.from('tests').select('*').eq('id', id).single().then(({ data }) => {
      const row = data as typeof formData | null
      if (row) setFormData(row)
    })
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.from('tests').update({
        title: formData.title,
        description: formData.description,
        instructions: formData.instructions,
        duration: Number(formData.duration),
        total_marks: Number(formData.total_marks),
        passing_percentage: Number(formData.passing_percentage),
        negative_marking: Number(formData.negative_marking),
        category: formData.category,
        difficulty: formData.difficulty,
        is_premium: formData.is_premium,
        random_order: formData.random_order,
        published: formData.published,
      } as never).eq('id', id)
      if (error) throw error
      toast.success('Test updated')
      router.push(`/${locale}/admin/tests`)
    } catch {
      toast.error('Failed to update test')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/admin/tests`} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-slate-900">Edit Test</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <input required name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" placeholder="Title" />
        <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={2} className="w-full px-4 py-2 border rounded-lg" placeholder="Description" />
        <div className="grid grid-cols-2 gap-4">
          <input type="number" name="duration" value={formData.duration} onChange={handleChange} className="px-4 py-2 border rounded-lg" placeholder="Duration (mins)" />
          <input type="number" name="total_marks" value={formData.total_marks} onChange={handleChange} className="px-4 py-2 border rounded-lg" placeholder="Total marks" />
        </div>
        <label className="flex items-center gap-2"><input type="checkbox" name="published" checked={formData.published} onChange={handleChange} /> Published</label>
        <div className="flex justify-end gap-3">
          <Link href={`/${locale}/admin/tests/${id}/questions`} className="px-4 py-2 text-sm text-imperial-blue font-semibold">Manage Questions</Link>
          <button type="submit" disabled={loading} className="flex items-center gap-2 bg-imperial-blue text-white px-6 py-2.5 rounded-lg text-sm font-bold">
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
      </form>
    </div>
  )
}
