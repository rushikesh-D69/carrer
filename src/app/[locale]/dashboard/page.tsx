'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { ClipboardList, BookMarked, CheckCircle2, ArrowRight, Sparkles, Calendar, BookOpen, Clock, AlertCircle, User, Award } from 'lucide-react'
import { logError } from '@/lib/logger'

type Activity = {
  id: string
  type: string
  title: string
  detail: string
  time: string
  icon: typeof ClipboardList
  color: string
}

export default function DashboardOverviewPage() {
  const t = useTranslations()
  const locale = useLocale()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    testsCount: 0,
    savedCount: 0,
    assessmentsCount: 0,
  })
  const [profile, setProfile] = useState<{ fullName: string; isPremium: boolean } | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [featuredEvent, setFeaturedEvent] = useState<{
    title: string
    speaker: string
    time: string
    type: string
  } | null>(null)
  const [announcements, setAnnouncements] = useState<
    Array<{ title: string; content: string }>
  >([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setLoading(false)
          return
        }

        const { data: rawProfileData } = await supabase
          .from('profiles')
          .select('full_name, is_premium')
          .eq('id', user.id)
          .single()

        const profileData = rawProfileData as { full_name: string | null; is_premium: boolean } | null

        if (profileData) {
          setProfile({
            fullName: profileData.full_name || user.email?.split('@')[0] || 'Student',
            isPremium: profileData.is_premium || false,
          })
        }

        const [testsRes, savedRes, assessmentsRes, attemptsRes, eventsRes, annRes] =
          await Promise.all([
            supabase.from('test_attempts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
            supabase.from('user_library').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
            supabase.from('assessment_results').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
            supabase
              .from('test_attempts')
              .select('id, score, percentage, submitted_at, tests(title)')
              .eq('user_id', user.id)
              .order('submitted_at', { ascending: false })
              .limit(5),
            supabase
              .from('events')
              .select('title, start_date, event_type, location')
              .eq('published', true)
              .gte('start_date', new Date().toISOString())
              .order('start_date', { ascending: true })
              .limit(1),
            supabase
              .from('announcements')
              .select('title, content')
              .eq('is_active', true)
              .order('created_at', { ascending: false })
              .limit(3),
          ])

        setStats({
          testsCount: testsRes.count ?? 0,
          savedCount: savedRes.count ?? 0,
          assessmentsCount: assessmentsRes.count ?? 0,
        })

        const attempts = (attemptsRes.data || []) as Array<{
          id: string
          score: number
          percentage: number
          submitted_at: string
          tests: { title: string } | null
        }>

        if (attempts.length > 0) {
          setActivities(
            attempts.map((attempt) => ({
              id: attempt.id,
              type: 'test',
              title: attempt.tests?.title || 'Practice Test',
              detail: `Scored ${attempt.percentage}% • ${attempt.score} marks`,
              time: new Date(attempt.submitted_at).toLocaleDateString(),
              icon: ClipboardList,
              color: 'bg-emerald-50 text-emerald-600',
            }))
          )
        }

        const event = eventsRes.data?.[0] as {
          title: string
          start_date: string
          event_type: string
          location: string | null
        } | undefined

        if (event) {
          setFeaturedEvent({
            title: event.title,
            speaker: event.location || 'Ramanujonomics',
            time: new Date(event.start_date).toLocaleString(),
            type: event.event_type,
          })
        }

        if (annRes.data?.length) {
          setAnnouncements(annRes.data as Array<{ title: string; content: string }>)
        }
      } catch (err) {
        logError('dashboard.overview', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } },
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-hero-gradient rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-card"
      >
        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-white/5 blur-2xl" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm mb-4">
            <Sparkles className="w-3.5 h-3.5 text-school-bus-yellow" />
            <span>Learning Dashboard</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight">
            {t('dashboard.welcome')}, {profile?.fullName || 'Student'}!
          </h1>
          <p className="text-white/80 font-medium text-sm sm:text-base mt-2 leading-relaxed">
            Track tests, saved careers, and assessments from your live account data.
          </p>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          { label: t('dashboard.tests_taken'), value: stats.testsCount, icon: ClipboardList, color: 'bg-blue-50 text-imperial-blue' },
          { label: t('dashboard.careers_saved'), value: stats.savedCount, icon: BookMarked, color: 'bg-amber-50 text-amber-600' },
          { label: 'Assessments', value: stats.assessmentsCount, icon: CheckCircle2, color: 'bg-purple-50 text-purple-600' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <h3 className="font-heading font-extrabold text-2xl text-slate-800 mt-0.5">
                {loading ? '—' : stat.value}
              </h3>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h3 className="font-heading font-bold text-slate-800 text-lg">{t('dashboard.recent_activity')}</h3>
            </div>

            {activities.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                <ClipboardList className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p>No test attempts yet.</p>
                <Link href={`/${locale}/dashboard/tests`} className="text-imperial-blue font-semibold hover:underline mt-2 inline-block">
                  Take your first practice test →
                </Link>
              </div>
            ) : (
              <div className="relative border-l border-slate-100 pl-6 ml-3 space-y-6">
                {activities.map((activity) => {
                  const Icon = activity.icon
                  return (
                    <div key={activity.id} className="relative">
                      <div className={`absolute -left-[38px] top-0 w-8 h-8 rounded-full border-4 border-white ${activity.color} flex items-center justify-center shadow-sm`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-heading font-bold text-slate-800 text-sm">{activity.title}</h4>
                          <span className="text-[10px] font-semibold text-slate-400">{activity.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-1">{activity.detail}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href={`/${locale}/dashboard/tests`} className="bg-white hover:bg-slate-50 border border-slate-200/80 p-5 rounded-xl shadow-sm transition-all flex justify-between items-center group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-slate-800 text-sm">Practice Hub</h4>
                  <p className="text-xs text-slate-400 font-medium">Take syllabus tests</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href={`/${locale}/dashboard/assessments`} className="bg-white hover:bg-slate-50 border border-slate-200/80 p-5 rounded-xl shadow-sm transition-all flex justify-between items-center group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-slate-800 text-sm">Career Assessment</h4>
                  <p className="text-xs text-slate-400 font-medium">Find your best path</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          {featuredEvent ? (
            <div className="bg-gradient-to-br from-french-blue to-imperial-blue text-white rounded-2xl p-6 shadow-sm border border-slate-700/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Calendar className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <span className="inline-block bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-4 uppercase tracking-wider">
                  Upcoming {featuredEvent.type}
                </span>
                <h4 className="font-heading font-bold text-base leading-snug">{featuredEvent.title}</h4>
                <p className="text-xs text-white/80 font-medium mt-2 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-school-bus-yellow" />
                  <span>{featuredEvent.speaker}</span>
                </p>
                <div className="divider bg-white/10 my-4" />
                <div className="flex items-center gap-2 text-xs text-white/95 font-semibold">
                  <Clock className="w-4 h-4 text-school-bus-yellow" />
                  <span>{featuredEvent.time}</span>
                </div>
                <Link href={`/${locale}/events`} className="btn-cta w-full text-xs h-9 mt-4 bg-school-bus-yellow text-imperial-blue shadow-md font-bold justify-center">
                  View Events
                </Link>
              </div>
            </div>
          ) : null}

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <h4 className="font-heading font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Recent Announcements
            </h4>
            {announcements.length === 0 ? (
              <p className="text-xs text-slate-500">No announcements right now. Check back soon.</p>
            ) : (
              <div className="space-y-3">
                {announcements.map((ann, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-lg text-xs">
                    <span className="font-bold text-slate-700 block mb-0.5">{ann.title}</span>
                    <span className="text-slate-500 leading-relaxed font-medium">{ann.content}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
