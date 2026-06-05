import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Search, Landmark, Briefcase, Store, Rocket, TrendingUp, Clock, AlertTriangle, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { FALLBACK_CAREERS, FALLBACK_CATEGORIES } from '@/lib/fallback-data'

export const revalidate = 3600 // Cache for 1 hour

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: '#10B981',
  intermediate: '#3B82F6',
  advanced: '#F59E0B',
  expert: '#EF4444',
}

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
}

const COMPETITION_COLORS: Record<string, string> = {
  low: '#10B981',
  medium: '#3B82F6',
  high: '#F59E0B',
  very_high: '#EF4444',
}

const CATEGORY_ICONS: Record<string, any> = {
  'government': Landmark,
  'private': Briefcase,
  'self-employment': Store,
  'entrepreneurship': Rocket,
  'economic-literacy': TrendingUp,
}

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    category?: string
    search?: string
    difficulty?: string
    competition?: string
  }>
}

export default async function CareersPage({ params, searchParams }: PageProps) {
  const { locale } = await params
  const sParams = await searchParams
  const selectedCategory = sParams.category || ''
  const searchQuery = sParams.search || ''
  const selectedDifficulty = sParams.difficulty || ''
  const selectedCompetition = sParams.competition || ''

  let careers = FALLBACK_CAREERS
  let categories = FALLBACK_CATEGORIES

  try {
    const supabase = await createClient()

    // Fetch categories
    const { data: dbCategories } = await supabase
      .from('career_categories')
      .select('*')
      .order('sort_order', { ascending: true })

    if (dbCategories && dbCategories.length > 0) {
      categories = dbCategories as any
    }

    // Start building query
    let query = supabase
      .from('careers')
      .select('id, slug, title, short_description, difficulty_level, competition_level, duration, salary_range, career_categories(id, name, color, slug)')
      .eq('published', true)

    if (selectedCategory) {
      // Find category ID
      const catObj = categories.find(c => c.slug === selectedCategory)
      if (catObj) {
        query = query.eq('category_id', catObj.id)
      }
    }

    if (selectedDifficulty) {
      query = query.eq('difficulty_level', selectedDifficulty)
    }

    if (selectedCompetition) {
      query = query.eq('competition_level', selectedCompetition)
    }

    if (searchQuery) {
      query = query.ilike('title', `%${searchQuery}%`)
    }

    const { data: dbCareers } = await query.order('created_at', { ascending: false })

    if (dbCareers && dbCareers.length > 0) {
      careers = dbCareers as any
    } else if (dbCareers && dbCareers.length === 0 && (selectedCategory || searchQuery || selectedDifficulty || selectedCompetition)) {
      careers = []
    }
  } catch (error) {
    // Database issue: filter static data instead
    careers = FALLBACK_CAREERS.filter((career) => {
      const matchesCategory = !selectedCategory || career.career_categories.slug === selectedCategory
      const matchesSearch = !searchQuery || career.title.toLowerCase().includes(searchQuery.toLowerCase()) || career.short_description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDifficulty = !selectedDifficulty || career.difficulty_level === selectedDifficulty
      const matchesCompetition = !selectedCompetition || career.competition_level === selectedCompetition
      return matchesCategory && matchesSearch && matchesDifficulty && matchesCompetition
    })
  }

  const localePath = (path: string) => `/${locale}${path}`

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Banner / Header */}
      <section className="bg-imperial-blue text-white py-12 md:py-16 relative overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container-base relative z-10 text-center max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-school-bus-yellow text-xs font-semibold uppercase tracking-wider mb-4 border border-white/5">
            <Landmark className="w-3.5 h-3.5" />
            Discover Your Potential
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-5xl text-white tracking-tight leading-tight mb-4">
            Explore Career Paths
          </h1>
          <p className="text-white/80 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Choose from professional, public-sector, business, and self-employment directories with expert guides.
          </p>
        </div>
      </section>

      {/* Filters & Content Area */}
      <section className="container-base -mt-6 relative z-20">
        {/* Search and Filters Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6 mb-8">
          <form method="GET" action="" className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="Search career paths..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue text-sm transition-all bg-slate-50/50"
              />
            </div>

            {/* Difficulty Filter */}
            <div>
              <select
                name="difficulty"
                defaultValue={selectedDifficulty}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-imperial-blue/20 focus:border-imperial-blue text-sm bg-slate-50/50"
              >
                <option value="">Difficulty: All</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            {/* Submit / Clear */}
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-imperial-blue hover:bg-french-blue text-white font-semibold text-sm rounded-xl transition-all shadow-sm"
              >
                Apply Filters
              </button>
              {(searchQuery || selectedDifficulty || selectedCategory || selectedCompetition) && (
                <Link
                  href={localePath('/careers')}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-all flex items-center justify-center"
                >
                  Reset
                </Link>
              )}
            </div>

            {/* Keep category in query params if it exists */}
            {selectedCategory && (
              <input type="hidden" name="category" value={selectedCategory} />
            )}
          </form>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          <Link
            href={{
              pathname: localePath('/careers'),
              query: {
                ...(searchQuery && { search: searchQuery }),
                ...(selectedDifficulty && { difficulty: selectedDifficulty }),
              },
            }}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
              !selectedCategory
                ? 'bg-imperial-blue text-white border-imperial-blue shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Sectors
          </Link>
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.slug] || Landmark
            const isSelected = selectedCategory === cat.slug

            return (
              <Link
                key={cat.id}
                href={{
                  pathname: localePath('/careers'),
                  query: {
                    category: cat.slug,
                    ...(searchQuery && { search: searchQuery }),
                    ...(selectedDifficulty && { difficulty: selectedDifficulty }),
                  },
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'text-white border-transparent shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
                style={isSelected ? { backgroundColor: cat.color || '#00296B' } : undefined}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.name}
              </Link>
            )
          })}
        </div>

        {/* Grid Area */}
        {careers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {careers.map((career) => {
              const cat = career.career_categories as any
              const salaryRange = career.salary_range as any

              return (
                <Link
                  key={career.id}
                  href={localePath(`/careers/${career.slug}`)}
                  className="card-base flex flex-col group overflow-hidden bg-white shadow-sm border border-slate-100 hover:shadow-md transition-all rounded-2xl"
                >
                  {/* Category Top Strip */}
                  <div
                    className="h-1.5 w-full"
                    style={{ backgroundColor: cat?.color || '#00296B' }}
                  />

                  <div className="flex flex-col flex-1 p-6">
                    {/* Header line with badges */}
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className="badge text-[11px] font-bold"
                        style={{
                          backgroundColor: `${cat?.color || '#00296B'}15`,
                          color: cat?.color || '#00296B',
                        }}
                      >
                        {cat?.name || 'Career'}
                      </span>
                      <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${DIFFICULTY_COLORS[career.difficulty_level] || '#00296B'}15`,
                          color: DIFFICULTY_COLORS[career.difficulty_level] || '#00296B',
                        }}
                      >
                        {DIFFICULTY_LABELS[career.difficulty_level] || 'Intermediate'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-heading font-bold text-lg text-slate-900 group-hover:text-imperial-blue transition-colors mb-2 leading-snug">
                      {career.title}
                    </h3>

                    {/* Short Description */}
                    <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                      {career.short_description}
                    </p>

                    {/* Meta section */}
                    <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Duration</span>
                        <div className="flex items-center gap-1 text-slate-700 text-xs font-bold">
                          <Clock className="w-3.5 h-3.5 text-steel-azure" />
                          {career.duration}
                        </div>
                      </div>
                      <div className="space-y-1 text-right">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Avg Salary</span>
                        <span className="text-slate-800 text-xs font-bold block">
                          {salaryRange?.display || '₹3.5L - ₹7L / yr'}
                        </span>
                      </div>
                    </div>

                    {/* Learn more */}
                    <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-imperial-blue group-hover:text-steel-azure group-hover:gap-2.5 transition-all pt-2">
                      View Detailed Roadmap
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto shadow-sm">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 text-amber-500 mb-4 border border-amber-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">No Careers Found</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              We couldn't find any career guides matching your search criteria. Try modifying your filters or search term to see more careers.
            </p>
            <Link
              href={localePath('/careers')}
              className="btn-primary text-sm px-6"
            >
              Reset All Filters
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
