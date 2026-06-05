'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Landmark, ArrowRight, ArrowLeftRight, ChevronRight, Home } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { FALLBACK_CAREERS } from '@/lib/fallback-data'

interface PageProps {
  params: Promise<{ locale: string }>
}

export default function CompareSelectorPage({ params }: PageProps) {
  const { locale } = use(params)
  const router = useRouter()

  const [careersList, setCareersList] = useState<any[]>(FALLBACK_CAREERS)
  const [careerASlug, setCareerASlug] = useState('')
  const [careerBSlug, setCareerBSlug] = useState('')

  useEffect(() => {
    async function loadCareers() {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('careers')
          .select('title, slug')
          .eq('published', true)
          .order('title', { ascending: true })

        if (data && data.length > 0) {
          setCareersList(data)
        }
      } catch (err) {
        // Fall back to static list
      }
    }
    loadCareers()
  }, [])

  const handleCompare = (e: React.FormEvent) => {
    e.preventDefault()
    if (!careerASlug || !careerBSlug) return
    
    if (careerASlug === careerBSlug) {
      alert('Please select two different careers to compare.')
      return
    }

    router.push(`/${locale}/compare/${careerASlug}/vs/${careerBSlug}`)
  }

  const localePath = (path: string) => `/${locale}${path}`

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Banner */}
      <section className="bg-imperial-blue text-white py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="container-base relative z-10 text-center max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-school-bus-yellow text-xs font-semibold uppercase tracking-wider mb-4 border border-white/5">
            <ArrowLeftRight className="w-3.5 h-3.5 animate-pulse" />
            Comparison Engine
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-5xl text-white tracking-tight leading-tight mb-4">
            Compare Careers Side-by-Side
          </h1>
          <p className="text-white/80 text-base max-w-xl mx-auto leading-relaxed">
            Compare salaries, preparation periods, difficulty levels, and job growth profiles to make informed choices.
          </p>
        </div>
      </section>

      {/* Selectors Area */}
      <section className="container-base py-12 -mt-6 relative z-20 max-w-3xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-8">
          <Link href={localePath('/')} className="hover:text-imperial-blue flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-700">Compare</span>
        </div>

        {/* Card Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-10 shadow-sm">
          <form onSubmit={handleCompare} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative">
              {/* Visual Connector Line */}
              <div className="hidden md:flex absolute left-1/2 top-[56px] -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-100 border border-slate-200 items-center justify-center text-slate-400 font-bold z-10 text-xs">
                VS
              </div>

              {/* Career A Select */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                  Select First Career
                </label>
                <select
                  value={careerASlug}
                  onChange={(e) => setCareerASlug(e.target.value)}
                  className="input-base text-sm bg-white"
                  required
                >
                  <option value="">-- Choose Career A --</option>
                  {careersList.map((c) => (
                    <option key={c.slug} value={c.slug} disabled={c.slug === careerBSlug}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Career B Select */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                  Select Second Career
                </label>
                <select
                  value={careerBSlug}
                  onChange={(e) => setCareerBSlug(e.target.value)}
                  className="input-base text-sm bg-white"
                  required
                >
                  <option value="">-- Choose Career B --</option>
                  {careersList.map((c) => (
                    <option key={c.slug} value={c.slug} disabled={c.slug === careerASlug}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={!careerASlug || !careerBSlug}
              className="btn-primary w-full h-12 text-base font-extrabold justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Compare Career Paths
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
