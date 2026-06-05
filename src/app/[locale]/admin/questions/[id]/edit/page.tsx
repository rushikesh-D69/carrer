'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function EditQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const supabase = createClient()
  const router = useRouter()
  const locale = useLocale()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    category: 'aptitude',
    topic: '',
    difficulty: 'medium',
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'a',
    explanation: '',
    marks: 1,
  })

  useEffect(() => {
    supabase.from('question_bank').select('*').eq('id', id).single().then(({ data }) => {
      const row = data as typeof form | null
      if (row) setForm({ ...row, marks: row.marks ?? 1 })
    })
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.from('question_bank').update({
        ...form,
        marks: Number(form.marks),
      } as never).eq('id', id)
      if (error) throw error
      toast.success('Question updated')
      router.push(`/${locale}/admin/questions`)
    } catch (err) {
      toast.error('Failed to update')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/admin/questions`} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-slate-900">Edit Question</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <textarea name="question_text" required value={form.question_text} onChange={handleChange} rows={3} className="w-full px-4 py-2 border rounded-lg" placeholder="Question text" />
        {(['option_a', 'option_b', 'option_c', 'option_d'] as const).map((k) => (
          <input key={k} name={k} value={form[k]} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" placeholder={k} />
        ))}
        <select name="correct_answer" value={form.correct_answer} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg bg-white">
          {['a', 'b', 'c', 'd'].map((o) => <option key={o} value={o}>{o.toUpperCase()}</option>)}
        </select>
        <textarea name="explanation" value={form.explanation} onChange={handleChange} rows={2} className="w-full px-4 py-2 border rounded-lg" placeholder="Explanation" />
        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-imperial-blue text-white px-6 py-2.5 rounded-lg text-sm font-bold ml-auto">
          <Save className="w-4 h-4" /> Update
        </button>
      </form>
    </div>
  )
}
