import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Landmark, Briefcase, Store, Rocket, TrendingUp, Clock, AlertCircle, Calendar, ChevronRight, FileText, Download, Play, HelpCircle, Compass, Share2, Bookmark } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { FALLBACK_CAREERS } from '@/lib/fallback-data'
import { FALLBACK_CAREER_DETAILS } from '@/lib/fallback-career-details'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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

const COMPETITION_LABELS: Record<string, string> = {
  low: 'Low Competition',
  medium: 'Medium Competition',
  high: 'High Competition',
  very_high: 'Very High Competition',
}

const CATEGORY_ICONS: Record<string, any> = {
  'government': Landmark,
  'private': Briefcase,
  'self-employment': Store,
  'entrepreneurship': Rocket,
  'economic-literacy': TrendingUp,
}

interface PageProps {
  params: Promise<{ locale: string; slug: string }>
}

export default async function CareerDetailPage({ params }: PageProps) {
  const { locale, slug } = await params

  let career = FALLBACK_CAREERS.find(c => c.slug === slug) as any
  let sections = FALLBACK_CAREER_DETAILS[slug] || []
  let resources: any[] = []

  try {
    const supabase = await createClient()

    // Query career
    const { data: dbCareer } = await supabase
      .from('careers')
      .select('*, career_categories(*)')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (dbCareer) {
      career = dbCareer
      
      // Query sections
      const { data: dbSections } = await supabase
        .from('career_sections')
        .select('*')
        .eq('career_id', career.id)
        .eq('is_visible', true)
        .order('sort_order', { ascending: true })

      if (dbSections && dbSections.length > 0) {
        sections = dbSections as any
      }

      // Query resources
      const { data: dbResources } = await supabase
        .from('career_resources')
        .select('*')
        .eq('career_id', career.id)
        .order('sort_order', { ascending: true })

      if (dbResources) {
        resources = dbResources
      }
    }
  } catch (err) {
    // Graceful fallback to static details when db not configured
  }

  // If not found in static either, return 404
  if (!career) {
    notFound()
  }

  const cat = career.career_categories as any
  const salaryRange = career.salary_range as any
  const Icon = CATEGORY_ICONS[cat?.slug || 'government'] || Landmark
  const localePath = (path: string) => `/${locale}${path}`

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Premium Course-Style Header */}
      <header className="bg-imperial-blue text-white py-12 md:py-16 relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-french-blue/30 rounded-full blur-3xl pointer-events-none" />
        
        <div className="container-base relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-semibold text-white/70">
            <Link href={localePath('/')} className="hover:text-school-bus-yellow transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 text-white/40" />
            <Link href={localePath('/careers')} className="hover:text-school-bus-yellow transition-colors">Careers</Link>
            <ChevronRight className="w-3 h-3 text-white/40" />
            <span className="text-school-bus-yellow">{career.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-4">
              <span
                className="badge text-[11px] font-bold"
                style={{
                  backgroundColor: `${cat?.color || '#00296B'}25`,
                  color: '#FFD500', // Gold color for dark headers
                  border: `1px solid ${cat?.color || '#00296B'}40`
                }}
              >
                {cat?.name || 'Career Path'}
              </span>
              <h1 className="font-heading font-extrabold text-3xl md:text-5xl text-white tracking-tight leading-tight">
                {career.title}
              </h1>
              <p className="text-white/80 text-sm md:text-base max-w-2xl leading-relaxed">
                {career.short_description}
              </p>

              {/* Badges row */}
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-xs text-white/80 bg-white/10 px-3 py-1.5 rounded-full border border-white/5">
                  <Clock className="w-3.5 h-3.5 text-school-bus-yellow" />
                  <span>Duration: <strong>{career.duration}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-white/80 bg-white/10 px-3 py-1.5 rounded-full border border-white/5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: DIFFICULTY_COLORS[career.difficulty_level] }}
                  />
                  <span>Difficulty: <strong>{DIFFICULTY_LABELS[career.difficulty_level]}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-white/80 bg-white/10 px-3 py-1.5 rounded-full border border-white/5">
                  <span className="text-school-bus-yellow font-bold">★</span>
                  <span>{COMPETITION_LABELS[career.competition_level] || 'Medium Competition'}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 text-white space-y-4">
              <div>
                <span className="text-white/60 text-xs font-semibold uppercase tracking-wider block">Average Starting Salary</span>
                <span className="text-2xl md:text-3xl font-extrabold text-school-bus-yellow block">
                  {salaryRange?.display || '₹3.5L - ₹7L / yr'}
                </span>
              </div>
              <div className="divider bg-white/10" />
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                <button className="btn-cta w-full text-sm font-bold justify-center">
                  <Bookmark className="w-4 h-4" />
                  Save to My Library
                </button>
                <a
                  href="#enquiry-form"
                  className="btn-primary bg-white hover:bg-slate-100 text-imperial-blue w-full text-sm font-bold justify-center"
                >
                  Request Counseling
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="container-base py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column: Sticky Section Navigation */}
          <aside className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-20 bg-white rounded-2xl border border-slate-200 p-4 space-y-1 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 block">
                Guide Contents
              </span>
              {sections.map((section) => (
                <a
                  key={section.section_type}
                  href={`#${section.section_type}`}
                  className="flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 hover:text-imperial-blue hover:bg-slate-50 rounded-xl transition-all group"
                >
                  <span>{section.title}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
              {resources.length > 0 && (
                <a
                  href="#resources"
                  className="flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 hover:text-imperial-blue hover:bg-slate-50 rounded-xl transition-all group"
                >
                  <span>Study Resources</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              )}
              <a
                href="#enquiry-form"
                className="flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 hover:text-imperial-blue hover:bg-slate-50 rounded-xl transition-all group"
              >
                <span>Ask a Mentor</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </aside>

          {/* Right Column: Sections content */}
          <div className="lg:col-span-3 space-y-8">
            {sections.map((section) => (
              <div
                key={section.section_type}
                id={section.section_type}
                className="scroll-mt-24 bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-4"
              >
                <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-imperial-blue flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h2 className="font-heading font-extrabold text-xl md:text-2xl text-slate-900 leading-none">
                    {section.title}
                  </h2>
                </div>

                {/* Render Roadmap with custom visual step-by-step layout */}
                {section.section_type === 'roadmap' && section.content_json ? (
                  <div className="relative pl-6 border-l-2 border-slate-100 space-y-8 my-6">
                    {section.content_json.map((step: any, idx: number) => (
                      <div key={idx} className="relative group">
                        {/* Bullet circle */}
                        <div className="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full bg-white border-2 border-imperial-blue flex items-center justify-center group-hover:bg-imperial-blue transition-all">
                          <div className="w-1.5 h-1.5 rounded-full bg-imperial-blue group-hover:bg-white" />
                        </div>
                        <h4 className="font-heading font-bold text-base text-slate-900 mb-1">
                          {step.phase}
                        </h4>
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : section.section_type === 'faq' && section.content_json ? (
                  /* Render FAQ with accordion list */
                  <div className="space-y-4 pt-2">
                    {section.content_json.map((faqItem: any, idx: number) => (
                      <details
                        key={idx}
                        className="group border border-slate-200 rounded-xl p-4 bg-slate-50/50 [&_summary::-webkit-details-marker]:hidden"
                      >
                        <summary className="flex items-center justify-between cursor-pointer focus:outline-none">
                          <h4 className="font-heading font-bold text-sm md:text-base text-slate-800 flex items-center gap-2">
                            <HelpCircle className="w-4.5 h-4.5 text-steel-azure flex-shrink-0" />
                            {faqItem.q}
                          </h4>
                          <span className="transition group-open:-rotate-180">
                            <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                          </span>
                        </summary>
                        <p className="mt-3 text-slate-600 text-sm leading-relaxed pl-6 border-l border-slate-200">
                          {faqItem.a}
                        </p>
                      </details>
                    ))}
                  </div>
                ) : (
                  /* Standard Markdown rendering */
                  <div className="markdown-content prose max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {section.content_md || ''}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            ))}

            {/* Study Resources section if DB files exist */}
            {resources.length > 0 && (
              <div
                id="resources"
                className="scroll-mt-24 bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-4"
              >
                <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-imperial-blue flex items-center justify-center flex-shrink-0">
                    <Compass className="w-4 h-4" />
                  </div>
                  <h2 className="font-heading font-extrabold text-xl md:text-2xl text-slate-900 leading-none">
                    Study Resources & Videos
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {resources.map((res) => (
                    <div
                      key={res.id}
                      className="border border-slate-100 bg-slate-50/50 rounded-xl p-4 flex gap-4 items-start hover:border-slate-200 transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center flex-shrink-0">
                        {res.resource_type === 'youtube' ? (
                          <Play className="w-5 h-5 text-red-500 fill-red-500" />
                        ) : (
                          <Download className="w-5 h-5 text-steel-azure" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-heading font-bold text-sm text-slate-800 leading-snug">
                          {res.title}
                        </h4>
                        <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                          {res.description || 'Access and download study resources for your exam preparation.'}
                        </p>
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-imperial-blue hover:text-steel-azure pt-1"
                        >
                          {res.resource_type === 'youtube' ? 'Watch Video' : 'Download Resource'}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Counseling / Enquiry Form */}
            <div
              id="enquiry-form"
              className="scroll-mt-24 bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6"
            >
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-heading font-extrabold text-xl text-slate-900 mb-1">
                  Ask a Career Advisor
                </h3>
                <p className="text-slate-500 text-xs md:text-sm">
                  Have doubts about the {career.title} path? Submit your query and get guided by the professor.
                </p>
              </div>

              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Your Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh"
                      className="input-base text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Your Email</label>
                    <input
                      type="email"
                      placeholder="e.g. name@email.com"
                      className="input-base text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      className="input-base text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Preferred Language</label>
                    <select className="input-base text-sm bg-white" defaultValue={locale}>
                      <option value="en">English</option>
                      <option value="te">తెలుగు (Telugu)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Your Question</label>
                  <textarea
                    placeholder={`Write your specific doubts regarding ${career.title} exam pattern, prep strategies, or study material...`}
                    className="input-base text-sm"
                    rows={4}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full md:w-auto px-6 h-11 text-sm font-bold justify-center"
                >
                  Submit Query
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
