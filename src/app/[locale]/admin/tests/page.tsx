'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Plus, Edit2, Trash2, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useLocale } from 'next-intl'

export default function TestsAdminPage() {
  const supabase = createClient()
  const locale = useLocale()
  const [tests, setTests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchTests()
  }, [])

  const fetchTests = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setTests(data || [])
    } catch (err) {
      console.error('Error fetching tests:', err)
    } finally {
      setLoading(false)
    }
  }

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('tests')
        // @ts-ignore
        .update({ published: !currentStatus } as any)
        .eq('id', id)

      if (error) throw error
      
      setTests(tests.map(t => t.id === id ? { ...t, published: !currentStatus } : t))
    } catch (err) {
      console.error('Error toggling test publish status:', err)
    }
  }

  const filteredTests = tests.filter(t => 
    (t.title?.toLowerCase() || '').includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Test Builder</h1>
          <p className="text-sm text-slate-500 mt-1">Manage mock exams, their durations, and difficulty levels.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search tests..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue transition-all"
            />
          </div>
          <Link href={`/${locale}/admin/tests/new`} className="flex items-center gap-2 bg-imperial-blue hover:bg-french-blue text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            New Test
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Test Name & Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Timer & Marks</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Access</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-imperial-blue border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading tests...
                  </td>
                </tr>
              ) : filteredTests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No tests found. Click "New Test" to create one.
                  </td>
                </tr>
              ) : (
                filteredTests.map((test) => (
                  <tr key={test.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{test.title}</div>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{test.category}</span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          test.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                          test.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {test.difficulty}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-700 font-medium">
                        <Clock className="w-4 h-4 text-imperial-blue" />
                        {test.duration} mins
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {test.total_marks} Marks ({test.passing_percentage}% to pass)
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                        test.is_premium ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {test.is_premium ? 'Premium' : 'Free'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => togglePublish(test.id, test.published)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-imperial-blue focus:ring-offset-2 ${test.published ? 'bg-green-500' : 'bg-slate-300'}`}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${test.published ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/${locale}/admin/tests/${test.id}/questions`} className="p-2 text-slate-400 hover:text-imperial-blue hover:bg-slate-100 rounded-lg transition-colors" title="Manage Questions">
                          <CheckCircle className="w-4 h-4" />
                        </Link>
                        <button className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
