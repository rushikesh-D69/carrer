'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { ClipboardList, BookMarked, Award, CheckCircle2, ArrowRight, Sparkles, Calendar, BookOpen, Clock, AlertCircle, User } from 'lucide-react'
import { toast } from 'sonner'

export default function DashboardOverviewPage() {
  const t = useTranslations()
  const locale = useLocale()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    testsCount: 2,
    savedCount: 2,
    assessmentsCount: 1,
  })
  const [profile, setProfile] = useState<{ fullName: string; isPremium: boolean } | null>(null)
  
  // Recent Activities Fallback Data
  const [activities, setActivities] = useState([
    {
      id: 'act-1',
      type: 'test',
      title: 'SSC CGL - Quantitative Aptitude Test',
      detail: 'Scored 42/50 (84%) • Passed',
      time: '2 days ago',
      icon: ClipboardList,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      id: 'act-2',
      type: 'career',
      title: 'Saved UPSC Civil Services',
      detail: 'Added to your library for preparation roadmap',
      time: '4 days ago',
      icon: BookMarked,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      id: 'act-3',
      type: 'assessment',
      title: 'Completed General Career Fitment Assessment',
      detail: 'Top Match: Government Careers (82%)',
      time: '1 week ago',
      icon: CheckCircle2,
      color: 'bg-purple-50 text-purple-600',
    },
  ])

  // Upcoming Live Event Fallback
  const featuredEvent = {
    title: 'Strategies for APPSC/TSPSC Prep & Mind Mapping',
    speaker: 'Professor Ramanujam',
    time: 'Saturday, June 6th • 4:00 PM (IST)',
    type: 'Webinar',
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setLoading(false)
          return
        }

        // Fetch Profile
        const { data: rawProfileData } = await supabase
          .from('profiles')
          .select('full_name, is_premium')
          .eq('id', user.id)
          .single()

        const profileData = rawProfileData as any

        if (profileData) {
          setProfile({
            fullName: profileData.full_name || user.email?.split('@')[0] || 'Student',
            isPremium: profileData.is_premium || false,
          })
        }

        // Fetch real counts from DB
        const [testsRes, savedRes, assessmentsRes] = await Promise.all([
          supabase.from('test_attempts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('user_library').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('assessment_results').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        ])

        const dbStats = {
          testsCount: testsRes.count !== null ? testsRes.count : 2,
          savedCount: savedRes.count !== null ? savedRes.count : 2,
          assessmentsCount: assessmentsRes.count !== null ? assessmentsRes.count : 1,
        }

        setStats(dbStats)

        // Fetch recent test attempts if they exist
        const { data: attemptsData } = await supabase
          .from('test_attempts')
          .select('id, score, percentage, submitted_at, tests(title)')
          .eq('user_id', user.id)
          .order('submitted_at', { ascending: false })
          .limit(3)

        const attempts = (attemptsData || []) as any[]

        if (attempts && attempts.length > 0) {
          const dbActivities = attempts.map(attempt => ({
            id: attempt.id,
            type: 'test',
            title: (attempt.tests as any)?.title || 'Practice Test',
            detail: `Scored ${attempt.score}% • Completed`,
            time: new Date(attempt.submitted_at).toLocaleDateString(),
            icon: ClipboardList,
            color: 'bg-emerald-50 text-emerald-600',
          }))
          setActivities(dbActivities)
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
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
            Invest in your knowledge. Every test you take and career you explore gets you closer to professional security. Remember: <strong className="text-school-bus-yellow">Wealth is Health</strong>.
          </p>
        </div>
      </motion.div>

      {/* Quick Action Box */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Quick Stats Grid */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-imperial-blue flex-shrink-0">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('dashboard.tests_taken')}</p>
            <h3 className="font-heading font-extrabold text-2xl text-slate-800 mt-0.5">{stats.testsCount}</h3>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
            <BookMarked className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('dashboard.careers_saved')}</p>
            <h3 className="font-heading font-extrabold text-2xl text-slate-800 mt-0.5">{stats.savedCount}</h3>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assessments</p>
            <h3 className="font-heading font-extrabold text-2xl text-slate-800 mt-0.5">{stats.assessmentsCount}</h3>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Grid - Left Info / Right Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Recent Activity Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h3 className="font-heading font-bold text-slate-800 text-lg">
                {t('dashboard.recent_activity')}
              </h3>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Timeline</span>
            </div>

            <div className="relative border-l border-slate-100 pl-6 ml-3 space-y-6">
              {activities.map((activity, index) => {
                const Icon = activity.icon
                return (
                  <div key={activity.id} className="relative">
                    {/* Timeline Node Icon */}
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
          </div>

          {/* Core Modules Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href={`/${locale}/dashboard/tests`}
              className="bg-white hover:bg-slate-50 border border-slate-200/80 p-5 rounded-xl shadow-sm transition-all flex justify-between items-center group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-slate-800 text-sm">Practice Hub</h4>
                  <p className="text-xs text-slate-400 font-medium">Solve syllabus questions</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href={`/${locale}/careers`}
              className="bg-white hover:bg-slate-50 border border-slate-200/80 p-5 rounded-xl shadow-sm transition-all flex justify-between items-center group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-50 text-sky-600 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-slate-800 text-sm">Career Roadmaps</h4>
                  <p className="text-xs text-slate-400 font-medium">Explore government & corporate paths</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Right Column: Event and Upgrades info */}
        <div className="space-y-6">
          {/* Featured Live Session Banner */}
          <div className="bg-gradient-to-br from-french-blue to-imperial-blue text-white rounded-2xl p-6 shadow-sm border border-slate-700/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Calendar className="w-24 h-24" />
            </div>
            <div className="relative z-10">
              <span className="inline-block bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-4 uppercase tracking-wider">
                Live {featuredEvent.type}
              </span>
              <h4 className="font-heading font-bold text-base leading-snug">
                {featuredEvent.title}
              </h4>
              <p className="text-xs text-white/80 font-medium mt-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-school-bus-yellow" />
                <span>By {featuredEvent.speaker}</span>
              </p>
              
              <div className="divider bg-white/10 my-4" />

              <div className="flex items-center gap-2 text-xs text-white/95 font-semibold">
                <Clock className="w-4 h-4 text-school-bus-yellow" />
                <span>{featuredEvent.time}</span>
              </div>

              <button
                onClick={() => toast.success('Registered successfully! Link will be sent to your email.')}
                className="btn-cta w-full text-xs h-9 mt-4 bg-school-bus-yellow text-imperial-blue shadow-md font-bold group cursor-pointer"
              >
                <span>Register Now</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Quick Notice Panel */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <h4 className="font-heading font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Recent Announcements
            </h4>
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg text-xs">
                <span className="font-bold text-slate-700 block mb-0.5">UPSC CSE Notification 2026</span>
                <span className="text-slate-500 leading-relaxed font-medium">Syllabus structure and key dates have been updated in the exam repository.</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg text-xs">
                <span className="font-bold text-slate-700 block mb-0.5">Telugu Language Support Live!</span>
                <span className="text-slate-500 leading-relaxed font-medium">You can now view roadmaps and take mock tests in Telugu using the language switcher.</span>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  )
}
