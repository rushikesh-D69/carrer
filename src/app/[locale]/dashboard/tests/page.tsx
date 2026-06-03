'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { ClipboardList, Clock, Award, Play, CheckCircle2, ChevronRight, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export default function TestsPage() {
  const t = useTranslations()
  const locale = useLocale()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [tests, setTests] = useState<any[]>([])
  const [attempts, setAttempts] = useState<Record<string, any>>({})
  const [activeTab, setActiveTab] = useState<'all' | 'free' | 'premium'>('all')

  // Mock Fallback Tests
  const mockTests = [
    {
      id: 'test-upsc-1',
      title: 'UPSC Civil Services - General Studies (Mock 1)',
      description: 'Comprehensive practice covering Indian Polity, History, Economy, Geography, and Current Affairs.',
      duration: 60, // minutes
      total_marks: 100,
      negative_marking: '0.33',
      category: 'upsc',
      difficulty: 'hard',
      is_premium: false,
      questions_count: 50,
    },
    {
      id: 'test-ssc-1',
      title: 'SSC CGL - Quantitative Aptitude (Algebra & Geometry)',
      description: 'Practice questions on Core Algebra, Geometry, Trigonometry, and Mensuration designed for Group B posts.',
      duration: 30,
      total_marks: 50,
      negative_marking: '0.50',
      category: 'ssc',
      difficulty: 'medium',
      is_premium: false,
      questions_count: 25,
    },
    {
      id: 'test-banking-1',
      title: 'SBI PO - Reasoning Ability Practice Hub',
      description: 'High-level Syllogisms, Seating Arrangements, Coding-Decoding, and Blood Relations questions.',
      duration: 45,
      total_marks: 80,
      negative_marking: '0.25',
      category: 'banking',
      difficulty: 'medium',
      is_premium: true,
      questions_count: 40,
    },
    {
      id: 'test-econ-1',
      title: 'Entrepreneurship & Basic Economic Literacy',
      description: 'Essential check for micro-business operations, cashflow concepts, legal constructs, and tax rules.',
      duration: 20,
      total_marks: 40,
      negative_marking: '0.00',
      category: 'economics',
      difficulty: 'easy',
      is_premium: true,
      questions_count: 20,
    },
  ]

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        // Fetch tests from DB
        const { data: dbTestsData } = await supabase
          .from('tests')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false })

        const dbTests = (dbTestsData || []) as any[]

        // Fetch attempts
        let dbAttempts: any[] = []
        if (user) {
          const { data: attemptsData } = await supabase
            .from('test_attempts')
            .select('test_id, score, percentage, is_completed')
            .eq('user_id', user.id)
          dbAttempts = attemptsData || []
        }

        const attemptsMap = dbAttempts.reduce((acc, attempt) => {
          // Keep the best attempt
          if (!acc[attempt.test_id] || acc[attempt.test_id].percentage < attempt.percentage) {
            acc[attempt.test_id] = attempt
          }
          return acc;
        }, {} as Record<string, any>)

        setAttempts(attemptsMap)

        if (dbTests && dbTests.length > 0) {
          // Count questions for each test
          const testsWithCounts = await Promise.all(
            dbTests.map(async (test) => {
              const { count } = await supabase
                .from('test_questions')
                .select('*', { count: 'exact', head: true })
                .eq('test_id', test.id)
              return {
                ...test,
                questions_count: count || 0,
              }
            })
          )
          setTests(testsWithCounts)
        } else {
          setTests(mockTests)
        }
      } catch (err) {
        console.error('Error fetching tests:', err)
        setTests(mockTests)
      } finally {
        setLoading(false)
      }
    }

    fetchTests()
  }, [])

  const filteredTests = tests.filter(test => {
    if (activeTab === 'free') return !test.is_premium
    if (activeTab === 'premium') return test.is_premium
    return true
  })

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-emerald-50 text-emerald-700 border-emerald-100'
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-100'
      case 'hard': return 'bg-rose-50 text-rose-700 border-rose-100'
      default: return 'bg-slate-50 text-slate-700 border-slate-100'
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-800 tracking-tight">
          {t('tests.title') || 'Practice Test Center'}
        </h1>
        <p className="text-slate-500 font-medium text-sm sm:text-base mt-1">
          {t('tests.subtitle') || 'Simulate actual exam scenarios, check details, explanations, and track your metrics.'}
        </p>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 font-heading font-semibold text-sm transition-all duration-200 border-b-2 cursor-pointer ${
            activeTab === 'all'
              ? 'border-imperial-blue text-imperial-blue'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          All Practice Exams
        </button>
        <button
          onClick={() => setActiveTab('free')}
          className={`pb-3 font-heading font-semibold text-sm transition-all duration-200 border-b-2 cursor-pointer ${
            activeTab === 'free'
              ? 'border-imperial-blue text-imperial-blue'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Free Tests
        </button>
        <button
          onClick={() => setActiveTab('premium')}
          className={`pb-3 font-heading font-semibold text-sm transition-all duration-200 border-b-2 cursor-pointer ${
            activeTab === 'premium'
              ? 'border-imperial-blue text-imperial-blue'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Premium Tests
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div className="h-6 w-2/3 skeleton" />
              <div className="h-12 w-full skeleton" />
              <div className="flex gap-4">
                <div className="h-5 w-20 skeleton" />
                <div className="h-5 w-20 skeleton" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-heading font-bold text-slate-700 text-lg">No Tests Found</h3>
          <p className="text-slate-400 text-sm mt-1">There are no practice tests matching your filters currently.</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {filteredTests.map((test) => {
            const bestAttempt = attempts[test.id]
            const isCompleted = bestAttempt?.is_completed
            const isLocked = test.is_premium // Wait, we can toggle based on user's premium status, but for mock, let's allow starting anyway or prompt upgrade.

            return (
              <motion.div
                key={test.id}
                variants={cardVariants}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between overflow-hidden relative group"
              >
                {/* Upper container */}
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="badge badge-primary">
                      {test.category?.toUpperCase() || 'GENERAL'}
                    </span>
                    <div className="flex gap-1.5">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${getDifficultyColor(test.difficulty)}`}>
                        {test.difficulty}
                      </span>
                      {test.is_premium ? (
                        <span className="badge badge-premium flex items-center gap-0.5 text-[9px] font-bold">
                          <Crown className="w-2.5 h-2.5" />
                          PRO
                        </span>
                      ) : (
                        <span className="badge badge-free text-[9px]">
                          FREE
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-heading font-extrabold text-slate-800 text-lg group-hover:text-imperial-blue transition-colors">
                      {test.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2.5 line-clamp-2">
                      {test.description}
                    </p>
                  </div>

                  {/* Meta items */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-300" />
                      <span>{test.duration} {t('common.cancel') ? 'Mins' : 'Minutes'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-slate-300" />
                      <span>{test.total_marks} Marks</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ClipboardList className="w-4 h-4 text-slate-300" />
                      <span>{test.questions_count} Questions</span>
                    </div>
                  </div>
                </div>

                {/* Footer action container */}
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                  {bestAttempt ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-700">
                        Best Score: {bestAttempt.percentage}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 font-bold">
                      Not attempted yet
                    </span>
                  )}

                  <Link
                    href={`/${locale}/dashboard/tests/${test.id}`}
                    className={`inline-flex items-center gap-1.5 font-heading font-bold text-xs h-9 px-4 rounded-lg shadow-sm border transition-all ${
                      isCompleted
                        ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                        : 'bg-imperial-blue hover:bg-french-blue text-white border-transparent'
                    }`}
                  >
                    <span>{isCompleted ? t('tests.retake') || 'Retake' : t('tests.start') || 'Start Exam'}</span>
                    <Play className="w-3 h-3 fill-current" />
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}

// Inline Icon fallback for Crown
function Crown({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
      <path d="M5 20h14" />
    </svg>
  )
}
