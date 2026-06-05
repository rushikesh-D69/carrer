'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { ArrowLeft, Save, Clock, BookOpen, Settings } from 'lucide-react'
import Link from 'next/link'

export default function AddTestPage() {
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
    published: false
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData({ ...formData, [name]: checked })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not authenticated')

      const payload: any = {
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
        created_by: userData.user.id,
      }

      const { error, data } = await supabase.from('tests').insert(payload).select('id').single()
      if (error) throw error
      const created = data as { id: string } | null

      router.push(`/${locale}/admin/tests/${created?.id}/questions`)
    } catch (err) {
      console.error('Error creating test:', err)
      alert('Failed to save test.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/admin/tests`} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Create Mock Test</h1>
            <p className="text-sm text-slate-500 mt-1">Configure the test details, timers, and rules.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Test Title *</label>
              <input
                required
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue"
                placeholder="e.g. UPSC Prelims Mock Test 1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Question Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue bg-white"
                >
                  <option value="upsc">UPSC</option>
                  <option value="ssc">SSC</option>
                  <option value="rrb">RRB</option>
                  <option value="banking">Banking</option>
                  <option value="aptitude">Aptitude</option>
                  <option value="reasoning">Reasoning</option>
                  <option value="general_knowledge">General Knowledge</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Difficulty Level</label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue bg-white"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Short Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Pre-test Instructions</label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue resize-none"
                placeholder="1. Each question carries 2 marks.\n2. Do not refresh the page..."
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-imperial-blue" />
              Timers & Scoring Engine
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Test Duration Timer (Minutes) *</label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  min={1}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1.5">Test will automatically auto-submit when this timer reaches zero.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Total Marks</label>
                <input
                  required
                  type="number"
                  name="total_marks"
                  value={formData.total_marks}
                  onChange={handleChange}
                  min={1}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Passing %</label>
                <input
                  required
                  type="number"
                  name="passing_percentage"
                  value={formData.passing_percentage}
                  onChange={handleChange}
                  min={1}
                  max={100}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Negative Marking Deductions</label>
              <input
                required
                type="number"
                step="0.01"
                name="negative_marking"
                value={formData.negative_marking}
                onChange={handleChange}
                min={0}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue"
              />
              <p className="text-xs text-slate-500 mt-1.5">E.g., 0.33 means 1/3rd mark deducted per wrong answer.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-imperial-blue" />
              Advanced Settings
            </h2>
          </div>
          <div className="p-6 flex flex-col gap-4">
            <label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                name="random_order"
                checked={formData.random_order}
                onChange={handleChange}
                className="w-5 h-5 text-imperial-blue rounded border-slate-300 focus:ring-imperial-blue"
              />
              <div>
                <div className="font-semibold text-slate-900">Randomize Questions</div>
                <div className="text-xs text-slate-500">Shuffle the order of questions for every student attempt.</div>
              </div>
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer p-3 border border-amber-100 bg-amber-50 rounded-lg transition-colors">
              <input
                type="checkbox"
                name="is_premium"
                checked={formData.is_premium}
                onChange={handleChange}
                className="w-5 h-5 text-amber-600 rounded border-amber-300 focus:ring-amber-600"
              />
              <div>
                <div className="font-semibold text-amber-900">Premium Test (Paywall)</div>
                <div className="text-xs text-amber-700">Only accessible to users with an active premium subscription.</div>
              </div>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
            <input
              type="checkbox"
              id="published"
              name="published"
              checked={formData.published}
              onChange={handleChange}
              className="w-5 h-5 text-green-600 rounded border-slate-300 focus:ring-green-600"
            />
            <label htmlFor="published" className="text-sm font-medium text-slate-700 cursor-pointer">
              Publish Test (Make visible immediately)
            </label>
        </div>

        <div className="flex items-center justify-end gap-4">
          <Link href={`/${locale}/admin/tests`} className="px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-imperial-blue hover:bg-french-blue text-white px-8 py-2.5 rounded-lg text-sm font-bold transition-all shadow-md shadow-imperial-blue/20 disabled:opacity-50"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
            Save & Continue to Questions
          </button>
        </div>
      </form>
    </div>
  )
}
