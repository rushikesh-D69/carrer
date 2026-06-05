'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Plus, Edit2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { confirmAndDelete } from '@/lib/admin/helpers'
import { toast } from 'sonner'

export default function QuestionBankPage() {
  const supabase = createClient()
  const locale = useLocale()
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('question_bank')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setQuestions(data || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load questions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [])

  const handleDelete = async (id: string, text: string) => {
    const ok = await confirmAndDelete(text.slice(0, 40), () =>
      supabase.from('question_bank').delete().eq('id', id)
    )
    if (ok) {
      setQuestions((q) => q.filter((x) => x.id !== id))
      toast.success('Question deleted')
    }
  }

  const filtered = questions.filter((q) =>
    (q.question_text?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (q.topic?.toLowerCase() || '').includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Question Bank</h1>
          <p className="text-sm text-slate-500 mt-1">Manage MCQ questions for practice tests.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-imperial-blue/20"
            />
          </div>
          <Link
            href={`/${locale}/admin/questions/new`}
            className="flex items-center gap-2 bg-imperial-blue hover:bg-french-blue text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Question</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Difficulty</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">No questions yet.</td></tr>
              ) : (
                filtered.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 line-clamp-2 max-w-md">{q.question_text}</div>
                      <div className="text-xs text-slate-500 mt-1">{q.topic || 'General'} · Answer: {q.correct_answer?.toUpperCase()}</div>
                    </td>
                    <td className="px-6 py-4 text-sm capitalize">{q.category}</td>
                    <td className="px-6 py-4 text-sm capitalize">{q.difficulty}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link href={`/${locale}/admin/questions/${q.id}/edit`} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg">
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(q.id, q.question_text)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
