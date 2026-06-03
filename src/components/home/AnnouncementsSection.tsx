import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Bell, ChevronRight, AlertCircle, Info, AlertTriangle, Megaphone } from 'lucide-react'

const PRIORITY_CONFIG = {
  urgent:  { icon: AlertCircle,   color: '#EF4444', bg: '#FEF2F2',  border: '#FECACA', label: 'Urgent' },
  high:    { icon: AlertTriangle, color: '#F59E0B', bg: '#FFFBEB',  border: '#FDE68A', label: 'Important' },
  normal:  { icon: Info,          color: '#3B82F6', bg: '#EFF6FF',  border: '#BFDBFE', label: 'Notice' },
  low:     { icon: Megaphone,     color: '#6B7280', bg: '#F9FAFB',  border: '#E5E7EB', label: 'Info' },
}

const FALLBACK = [
  {
    id: '1',
    title: 'Welcome to Ramanujonomics! 🎉',
    content: 'We are launching India\'s most comprehensive career guidance platform. Explore 50+ career paths, take free assessments, and start your journey to wealth and success today!',
    priority: 'high' as const,
    created_at: new Date().toISOString(),
  },
]

export default async function AnnouncementsSection() {
  let announcements = FALLBACK

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('announcements')
      .select('id, title, content, priority, created_at')
      .eq('is_active', true)
      .or('expiry_date.is.null,expiry_date.gt.now()')
      .order('created_at', { ascending: false })
      .limit(4)

    if (data && data.length > 0) {
      announcements = data as any
    }
  } catch {}

  return (
    <section className="section bg-surface-2">
      <div className="container-base">
        <div className="flex items-center justify-between mb-8 md:mb-10">
          <div>
            <div className="divider-gold mb-3 mx-0" />
            <h2 className="section-title text-left mb-0">Announcements</h2>
          </div>
          <Link href="/en/announcements" className="flex items-center gap-1 text-sm font-semibold text-imperial-blue hover:text-french-blue transition-colors">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile: accordion-style stack | Desktop: grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {announcements.map((ann) => {
            const cfg = PRIORITY_CONFIG[ann.priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.normal
            const Icon = cfg.icon
            const date = new Date(ann.created_at).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
            })

            return (
              <div
                key={ann.id}
                className="flex gap-3 p-4 rounded-xl border"
                style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: `${cfg.color}20` }}
                >
                  <Icon className="w-4.5 h-4.5" style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: cfg.color }}
                    >
                      {cfg.label}
                    </span>
                    <span className="text-muted text-[11px]">{date}</span>
                  </div>
                  <h4 className="font-heading font-semibold text-sm text-foreground mb-1 leading-snug">
                    {ann.title}
                  </h4>
                  {ann.content && (
                    <p className="text-muted text-xs leading-relaxed line-clamp-2">
                      {ann.content}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
