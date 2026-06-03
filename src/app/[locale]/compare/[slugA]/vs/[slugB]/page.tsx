import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftRight, ChevronRight, Home, ArrowLeft, Landmark, Briefcase, Store, Rocket, TrendingUp, CheckCircle, HelpCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { FALLBACK_CAREERS } from '@/lib/fallback-data'
import { FALLBACK_CAREER_DETAILS } from '@/lib/fallback-career-details'

export const revalidate = 3600 // Cache for 1 hour

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
}

const COMPETITION_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  very_high: 'Very High',
}

const CATEGORY_ICONS: Record<string, any> = {
  'government': Landmark,
  'private': Briefcase,
  'self-employment': Store,
  'entrepreneurship': Rocket,
  'economic-literacy': TrendingUp,
}

interface PageProps {
  params: Promise<{ locale: string; slugA: string; slugB: string }>
}

export default async function ComparePage({ params }: PageProps) {
  const { locale, slugA, slugB } = await params

  let careerA = FALLBACK_CAREERS.find(c => c.slug === slugA) as any
  let careerB = FALLBACK_CAREERS.find(c => c.slug === slugB) as any

  let detailsA = FALLBACK_CAREER_DETAILS[slugA] || []
  let detailsB = FALLBACK_CAREER_DETAILS[slugB] || []

  try {
    const supabase = await createClient()

    // Fetch Career A
    const { data: dbCareerA } = await supabase
      .from('careers')
      .select('*, career_categories(*)')
      .eq('slug', slugA)
      .eq('published', true)
      .single()

    if (dbCareerA) {
      careerA = dbCareerA
      const { data: secA } = await supabase
        .from('career_sections')
        .select('*')
        .eq('career_id', careerA.id)
        .order('sort_order', { ascending: true })
      if (secA && secA.length > 0) detailsA = secA as any
    }

    // Fetch Career B
    const { data: dbCareerB } = await supabase
      .from('careers')
      .select('*, career_categories(*)')
      .eq('slug', slugB)
      .eq('published', true)
      .single()

    if (dbCareerB) {
      careerB = dbCareerB
      const { data: secB } = await supabase
        .from('career_sections')
        .select('*')
        .eq('career_id', careerB.id)
        .order('sort_order', { ascending: true })
      if (secB && secB.length > 0) detailsB = secB as any
    }
  } catch (error) {
    // Fall back to static imports
  }

  if (!careerA || !careerB) {
    notFound()
  }

  const catA = careerA.career_categories as any
  const catB = careerB.career_categories as any
  const IconA = CATEGORY_ICONS[catA?.slug || 'government'] || Landmark
  const IconB = CATEGORY_ICONS[catB?.slug || 'government'] || Landmark

  const eligibilityA = detailsA.find(s => s.section_type === 'eligibility')?.content_md || 'Refer to the detailed guide.'
  const eligibilityB = detailsB.find(s => s.section_type === 'eligibility')?.content_md || 'Refer to the detailed guide.'

  const salaryRangeA = careerA.salary_range as any
  const salaryRangeB = careerB.salary_range as any

  const localePath = (path: string) => `/${locale}${path}`

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Header Banner */}
      <section className="bg-imperial-blue text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="container-base relative z-10 text-center max-w-4xl">
          <h1 className="font-heading font-extrabold text-3xl text-white tracking-tight leading-none mb-3">
            Career Comparison
          </h1>
          <p className="text-white/80 text-sm max-w-lg mx-auto">
            Analyzing {careerA.title} and {careerB.title} side by side.
          </p>
        </div>
      </section>

      {/* Main Results Table */}
      <section className="container-base py-12 max-w-5xl">
        {/* Breadcrumbs and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link href={localePath('/')} className="hover:text-imperial-blue flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={localePath('/compare')} className="hover:text-imperial-blue">Compare</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700">Side-by-Side</span>
          </div>
          <Link
            href={localePath('/compare')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-imperial-blue hover:text-steel-azure group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Compare other careers
          </Link>
        </div>

        {/* Side by Side Comparison Panels */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 border-b border-slate-200">
            {/* Career A Title Header */}
            <div className="p-6 md:p-8 flex flex-col justify-between space-y-4 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/20">
              <div className="space-y-1">
                <span
                  className="badge text-[10px] font-bold"
                  style={{ backgroundColor: `${catA?.color || '#00296B'}15`, color: catA?.color || '#00296B' }}
                >
                  {catA?.name || 'Career A'}
                </span>
                <h2 className="font-heading font-extrabold text-xl md:text-2xl text-slate-900 leading-snug">
                  {careerA.title}
                </h2>
              </div>
              <p className="text-slate-500 text-xs md:text-sm leading-relaxed line-clamp-3">
                {careerA.short_description}
              </p>
              <Link
                href={localePath(`/careers/${careerA.slug}`)}
                className="btn-primary self-start text-xs font-bold h-9 px-4 rounded-lg"
              >
                Read Career Guide
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Career B Title Header */}
            <div className="p-6 md:p-8 flex flex-col justify-between space-y-4 bg-slate-50/20">
              <div className="space-y-1">
                <span
                  className="badge text-[10px] font-bold"
                  style={{ backgroundColor: `${catB?.color || '#00296B'}15`, color: catB?.color || '#00296B' }}
                >
                  {catB?.name || 'Career B'}
                </span>
                <h2 className="font-heading font-extrabold text-xl md:text-2xl text-slate-900 leading-snug">
                  {careerB.title}
                </h2>
              </div>
              <p className="text-slate-500 text-xs md:text-sm leading-relaxed line-clamp-3">
                {careerB.short_description}
              </p>
              <Link
                href={localePath(`/careers/${careerB.slug}`)}
                className="btn-primary self-start text-xs font-bold h-9 px-4 rounded-lg"
              >
                Read Career Guide
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Comparison Table Details */}
          <div className="divide-y divide-slate-100">
            {/* Row 1: Average Salary */}
            <div className="grid grid-cols-1 md:grid-cols-2 p-6 md:p-8 gap-4 md:gap-8">
              <div className="space-y-1.5 md:border-r border-slate-100 md:pr-8">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Average Salary Range</span>
                <span className="text-lg font-extrabold text-emerald-600 block">
                  {salaryRangeA?.display || '₹3.5L - ₹7L / yr'}
                </span>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Average Salary Range</span>
                <span className="text-lg font-extrabold text-emerald-600 block">
                  {salaryRangeB?.display || '₹3.5L - ₹7L / yr'}
                </span>
              </div>
            </div>

            {/* Row 2: Preparation Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 p-6 md:p-8 gap-4 md:gap-8">
              <div className="space-y-1.5 md:border-r border-slate-100 md:pr-8">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Preparation Timeframe</span>
                <span className="text-slate-800 font-bold text-sm md:text-base block">
                  {careerA.duration || '6 - 12 Months'}
                </span>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Preparation Timeframe</span>
                <span className="text-slate-800 font-bold text-sm md:text-base block">
                  {careerB.duration || '6 - 12 Months'}
                </span>
              </div>
            </div>

            {/* Row 3: Difficulty & Competition */}
            <div className="grid grid-cols-1 md:grid-cols-2 p-6 md:p-8 gap-4 md:gap-8">
              <div className="space-y-2 md:border-r border-slate-100 md:pr-8">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Difficulty & Competition</span>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                    Difficulty: {DIFFICULTY_LABELS[careerA.difficulty_level]}
                  </span>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                    Competition: {COMPETITION_LABELS[careerA.competition_level]}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Difficulty & Competition</span>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                    Difficulty: {DIFFICULTY_LABELS[careerB.difficulty_level]}
                  </span>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                    Competition: {COMPETITION_LABELS[careerB.competition_level]}
                  </span>
                </div>
              </div>
            </div>

            {/* Row 4: Eligibility requirements */}
            <div className="grid grid-cols-1 md:grid-cols-2 p-6 md:p-8 gap-4 md:gap-8">
              <div className="space-y-1.5 md:border-r border-slate-100 md:pr-8">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Key Requirements</span>
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed whitespace-pre-line">
                  {eligibilityA.replace(/#+ /g, '').slice(0, 350)}...
                </p>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Key Requirements</span>
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed whitespace-pre-line">
                  {eligibilityB.replace(/#+ /g, '').slice(0, 350)}...
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
