import Link from 'next/link'
import { ArrowRight, Clock, TrendingUp, Users } from 'lucide-react'
import { getLocale } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'

import { FALLBACK_CAREERS } from '@/lib/fallback-data'

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

export default async function FeaturedCareersSection() {
  const locale = await getLocale()
  let careers: typeof FALLBACK_CAREERS = FALLBACK_CAREERS.filter(c => c.featured).slice(0, 6)

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('careers')
      .select('id, slug, title, short_description, difficulty_level, competition_level, duration, salary_range, career_categories(name, color, slug)')
      .eq('featured', true)
      .eq('published', true)
      .order('created_at', { ascending: true })
      .limit(6)

    if (data && data.length > 0) {
      careers = data as any
    }
  } catch {
    // DB not configured — use fallback
  }

  return (
    <section className="section bg-white">
      <div className="container-base">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 md:mb-14">
          <div>
            <div className="divider-gold mb-4 mx-0" />
            <h2 className="section-title text-left mb-2">Featured Career Paths</h2>
            <p className="text-muted text-sm sm:text-base max-w-lg">
              Curated career paths with complete roadmaps, resources, and guidance
            </p>
          </div>
          <Link
            href={`/${locale}/careers`}
            className="btn-outline flex-shrink-0 self-start sm:self-auto text-sm px-5 h-10"
          >
            View All Careers
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {careers.map((career) => {
            const cat = career.career_categories as any
            const salaryRange = career.salary_range as any

            return (
              <Link
                key={career.id}
                href={`/${locale}/careers/${career.slug}`}
                className="card-base flex flex-col group overflow-hidden"
              >
                {/* Card color top strip */}
                <div
                  className="h-1 w-full"
                  style={{ background: `linear-gradient(90deg, ${cat?.color ?? '#00296B'}, ${cat?.color ?? '#00296B'}88)` }}
                />

                <div className="flex flex-col flex-1 p-5">
                  {/* Category badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="badge text-[11px]"
                      style={{
                        backgroundColor: `${cat?.color ?? '#00296B'}15`,
                        color: cat?.color ?? '#00296B',
                      }}
                    >
                      {cat?.name ?? 'Career'}
                    </span>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${DIFFICULTY_COLORS[career.difficulty_level ?? 'intermediate']}15`,
                        color: DIFFICULTY_COLORS[career.difficulty_level ?? 'intermediate'],
                      }}
                    >
                      {DIFFICULTY_LABELS[career.difficulty_level ?? 'intermediate']}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-heading font-bold text-base md:text-lg text-foreground mb-2 group-hover:text-imperial-blue transition-colors leading-snug">
                    {career.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted text-sm leading-relaxed flex-1 mb-4 line-clamp-3">
                    {career.short_description}
                  </p>

                  {/* Meta row */}
                  <div className="flex flex-wrap gap-3 mb-4">
                    {career.duration && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-strong">
                        <Clock className="w-3.5 h-3.5 text-steel-azure" />
                        {career.duration}
                      </div>
                    )}
                    {salaryRange?.display && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-strong">
                        <TrendingUp className="w-3.5 h-3.5 text-steel-azure" />
                        {salaryRange.display}
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-imperial-blue group-hover:gap-2.5 transition-all">
                    View Career Guide
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
