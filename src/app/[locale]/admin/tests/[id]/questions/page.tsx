'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLocale } from 'next-intl'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function TestQuestionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const supabase = createClient()
  const locale = useLocale()
  const [test, setTest] = useState<any>(null)
  const [linked, setLinked] = useState<any[]>([])
  const [bank, setBank] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const [{ data: t }, { data: tq }, { data: qb }] = await Promise.all([
      supabase.from('tests').select('*').eq('id', id).single(),
      supabase.from('test_questions').select('*, question_bank(*)').eq('test_id', id).order('sort_order'),
      supabase.from('question_bank').select('id, question_text, category, difficulty').order('created_at', { ascending: false }),
    ])
    setTest(t)
    setLinked(tq || [])
    setBank(qb || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [id])

  const linkedIds = new Set(linked.map((l) => l.question_id))
  const available = bank.filter((q) => !linkedIds.has(q.id))

  const addQuestion = async () => {
    if (!selectedId) return
    const { error } = await supabase.from('test_questions').insert({
      test_id: id,
      question_id: selectedId,
      sort_order: linked.length,
    } as never)
    if (error) {
      toast.error('Failed to add question')
      return
    }
    toast.success('Question added to test')
    setSelectedId('')
    load()
  }

  const removeQuestion = async (rowId: string) => {
    if (!window.confirm('Remove this question from the test?')) return
    const { error } = await supabase.from('test_questions').delete().eq('id', rowId)
    if (error) {
      toast.error('Failed to remove')
      return
    }
    toast.success('Removed')
    load()
  }

  if (loading) return <div className="p-12 text-center text-slate-500">Loading...</div>

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/admin/tests`} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Test Questions</h1>
          <p className="text-sm text-slate-500">{test?.title} — {linked.length} question(s)</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row gap-3">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="flex-1 px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm"
        >
          <option value="">Select from question bank...</option>
          {available.map((q) => (
            <option key={q.id} value={q.id}>
              [{q.category}] {q.question_text?.slice(0, 80)}
            </option>
          ))}
        </select>
        <button
          onClick={addQuestion}
          disabled={!selectedId}
          className="flex items-center gap-2 bg-imperial-blue text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
        <Link href={`/${locale}/admin/questions/new`} className="text-sm text-imperial-blue font-semibold self-center">
          + New question
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {linked.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No questions linked yet.</div>
        ) : (
          linked.map((row, i) => (
            <div key={row.id} className="p-4 flex items-start gap-4 hover:bg-slate-50">
              <span className="text-xs font-bold text-slate-400 w-6 pt-1">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">{row.question_bank?.question_text}</p>
                <p className="text-xs text-slate-500 mt-1 capitalize">{row.question_bank?.category} · {row.question_bank?.difficulty}</p>
              </div>
              <button onClick={() => removeQuestion(row.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
