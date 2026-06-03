import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Bell, ChevronRight, AlertCircle, Info, AlertTriangle, Megaphone, Home } from 'lucide-react'

export const revalidate = 3600 // Cache for 1 hour

const PRIORITY_CONFIG = {
  urgent:  { icon: AlertCircle,   color: '#EF4444', bg: '#FEF2F2',  border: '#FECACA', label: 'Urgent Notice' },
  high:    { icon: AlertTriangle, color: '#F59E0B', bg: '#FFFBEB',  border: '#FDE68A', label: 'Important Update' },
  normal:  { icon: Info,          color: '#3B82F6', bg: '#EFF6FF',  border: '#BFDBFE', label: 'Notice' },
  low:     { icon: Megaphone,     color: '#6B7280', bg: '#F9FAFB',  border: '#E5E7EB', label: 'General Info' },
}

const FALLBACK = [
  {
    id: '1',
    title: 'Welcome to Ramanujonomics! 🎉',
    content: 'We are launching India\'s most comprehensive career guidance platform. Explore 50+ career paths, take free assessments, and start your journey to wealth and success today!',
    priority: 'high',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Telugu Language Support Active 🌐',
    content: 'The platform now fully supports the Telugu language. Switch languages at any time via the language toggle in the top navigation bar to read career guides and view exam updates.',
    priority: 'normal',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  }
]

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function AnnouncementsPage({ params }: PageProps) {
  const { locale } = await params
  let announcements = FALLBACK

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('announcements')
      .select('id, title, content, priority, created_at')
      .eq('is_active', true)
      .or('expiry_date.is.null,expiry_date.gt.now()')
      .order('created_at', { ascending: false })

    if (data && data.length > 0) {
      announcements = data as any
    }
  } catch (error) {
    // Graceful fallback to static list
  }

  const localePath = (path: string) => `/${locale}${path}`

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Header Banner */}
      <section className="bg-imperial-blue text-white py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container-base relative z-10 text-center max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-school-bus-yellow text-xs font-semibold uppercase tracking-wider mb-4 border border-white/5">
            <Bell className="w-3.5 h-3.5 animate-bounce" />
            Bulletins & Updates
          </div>
          <h1 className="font-heading font-extrabold text-3xl md:text-5xl text-white tracking-tight leading-tight mb-4">
            Platform Announcements
          </h1>
          <p className="text-white/80 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Stay informed with the latest updates, event schedules, and competitive exam notices.
          </p>
        </div>
      </section>

      {/* Announcements Timeline List */}
      <section className="container-base py-12 max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-8">
          <Link href={localePath('/')} className="hover:text-imperial-blue flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-700">Announcements</span>
        </div>

        <div className="space-y-6">
          {announcements.map((ann) => {
            const cfg = PRIORITY_CONFIG[ann.priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.normal
            const Icon = cfg.icon
            const formattedDate = new Date(ann.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })

            return (
              <div
                key={ann.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-all relative overflow-hidden"
              >
                {/* Visual Priority Accent Strip */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5"
                  style={{ backgroundColor: cfg.color }}
                />

                {/* Left Side: Badge and Icon */}
                <div className="md:w-44 flex-shrink-0 flex md:flex-col items-start gap-3 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-6">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${cfg.color}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: cfg.color }} />
                  </div>
                  <div>
                    <span
                      className="text-xs font-extrabold uppercase tracking-wide block"
                      style={{ color: cfg.color }}
                    >
                      {cfg.label}
                    </span>
                    <span className="text-slate-400 text-[11px] block mt-0.5">
                      {formattedDate}
                    </span>
                  </div>
                </div>

                {/* Right Side: Message content */}
                <div className="flex-1 space-y-2">
                  <h3 className="font-heading font-extrabold text-base md:text-lg text-slate-900 leading-snug">
                    {ann.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                    {ann.content}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
