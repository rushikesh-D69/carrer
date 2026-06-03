import Link from 'next/link'
import { Calendar, Clock, MapPin, Video, Award, ChevronRight, Home, ShieldAlert } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 3600 // Cache for 1 hour

const EVENT_TYPE_COLORS: Record<string, string> = {
  webinar: '#3B82F6',
  seminar: '#00296B',
  workshop: '#F59E0B',
  exam: '#EF4444',
  other: '#6B7280',
}

const FALLBACK_EVENTS: any[] = []

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function EventsPage({ params }: PageProps) {
  const { locale } = await params
  let events = FALLBACK_EVENTS

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('published', true)
      .gt('start_date', new Date().toISOString())
      .order('start_date', { ascending: true })

    if (data && data.length > 0) {
      events = data as any
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
            <Video className="w-3.5 h-3.5" />
            Live Interactions
          </div>
          <h1 className="font-heading font-extrabold text-3xl md:text-5xl text-white tracking-tight leading-tight mb-4">
            Webinars, Seminars & Workshops
          </h1>
          <p className="text-white/80 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Join live training sessions led by the professor, career guides, and industry leaders.
          </p>
        </div>
      </section>

      {/* Events Listing */}
      <section className="container-base py-12 max-w-5xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-8">
          <Link href={localePath('/')} className="hover:text-imperial-blue flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-700">Events</span>
        </div>

        {events.length > 0 ? (
          <div className="space-y-6">
            {events.map((event) => {
              const startDate = new Date(event.start_date)
              const formattedDate = startDate.toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })
              const formattedTime = startDate.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit'
              })

              const typeColor = EVENT_TYPE_COLORS[event.event_type] || '#00296B'

              return (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-all"
                >
                  {/* Left Color Sidebar Strip */}
                  <div
                    className="w-full md:w-3 h-3 md:h-auto flex-shrink-0"
                    style={{ backgroundColor: typeColor }}
                  />

                  {/* Main Event Content Card */}
                  <div className="p-6 md:p-8 flex-1 flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-4 flex-1">
                      {/* Badge / Type */}
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md"
                          style={{
                            backgroundColor: `${typeColor}15`,
                            color: typeColor
                          }}
                        >
                          {event.event_type}
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                          {event.is_free ? (
                            <span className="text-emerald-600">Free Admission</span>
                          ) : (
                            <span className="text-amber-600">Paid: ₹{event.price}</span>
                          )}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-heading font-extrabold text-lg md:text-xl text-slate-900 leading-snug">
                        {event.title}
                      </h3>

                      {/* Description */}
                      <p className="text-slate-600 text-sm leading-relaxed max-w-2xl">
                        {event.description}
                      </p>

                      {/* Info Metadata */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span>{formattedTime} onwards</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium sm:col-span-2">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Side: Registration button */}
                    <div className="flex flex-col justify-center items-stretch md:items-end md:w-48 gap-3 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                      <div className="text-center md:text-right hidden md:block">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Admission</span>
                        <span className="text-sm font-extrabold text-slate-800">
                          {event.is_free ? 'No Tickets Required' : `₹${event.price}`}
                        </span>
                      </div>
                      <a
                        href={event.registration_link || '#'}
                        className="btn-primary w-full justify-center text-sm font-bold text-center py-2.5 h-auto"
                      >
                        Register Now
                        <ChevronRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto shadow-sm">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 text-slate-500 mb-4 border border-slate-100">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">No Upcoming Events</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              There are no seminars or webinars scheduled at the moment. Keep checking back or subscribe to our newsletter to receive notifications on new event launches.
            </p>
            <Link
              href={localePath('/')}
              className="btn-primary text-sm px-6"
            >
              Return Home
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
