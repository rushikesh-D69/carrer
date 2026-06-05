'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function NewQuestionPage() {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('question_bank').insert({
        ...form,
        marks: Number(form.marks),
        question_type: 'mcq',
        created_by: user.id,
      } as never)

      if (error) throw error
      toast.success('Question added')
      router.push(`/${locale}/admin/questions`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to save question')
    } finally {
      setLoading(false)
    }
  }

  const field = (label: string, name: keyof typeof form, type = 'text', required = false) => (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      <input
        required={required}
        type={type}
        name={name}
        value={form[name] as string}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-imperial-blue/20"
      />
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/admin/questions`} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Add Question</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
            <select name="category" value={form.category} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white">
              {['aptitude', 'reasoning', 'verbal', 'general_knowledge', 'economics', 'upsc', 'ssc', 'banking'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          {field('Topic', 'topic')}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Difficulty</label>
            <select name="difficulty" value={form.difficulty} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white">
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Question *</label>
          <textarea name="question_text" required value={form.question_text} onChange={handleChange} rows={3} className="w-full px-4 py-2 border border-slate-200 rounded-lg" />
        </div>
        {field('Option A', 'option_a', 'text', true)}
        {field('Option B', 'option_b', 'text', true)}
        {field('Option C', 'option_c', 'text', true)}
        {field('Option D', 'option_d', 'text', true)}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Correct Answer</label>
          <select name="correct_answer" value={form.correct_answer} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white">
            {['a', 'b', 'c', 'd'].map((o) => <option key={o} value={o}>{o.toUpperCase()}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Explanation</label>
          <textarea name="explanation" value={form.explanation} onChange={handleChange} rows={2} className="w-full px-4 py-2 border border-slate-200 rounded-lg" />
        </div>
        {field('Marks', 'marks', 'number')}
        <div className="flex justify-end gap-3 pt-4">
          <Link href={`/${locale}/admin/questions`} className="px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</Link>
          <button type="submit" disabled={loading} className="flex items-center gap-2 bg-imperial-blue text-white px-6 py-2.5 rounded-lg text-sm font-bold disabled:opacity-50">
            <Save className="w-4 h-4" /> Save Question
          </button>
        </div>
      </form>
    </div>
  )
}
