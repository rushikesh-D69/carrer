'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { ClipboardList, Compass, Sparkles, ArrowRight, ArrowLeft, RefreshCw, BarChart2, Star, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface AssessmentQuestion {
  id: string
  question: string
  // Scores added to categories: govt, private, self, startup, economics
  scores: {
    govt: number
    private: number
    self: number
    startup: number
    economics: number
  }
}

export default function AssessmentPage() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<'intro' | 'questions' | 'results'>('intro')
  const [loading, setLoading] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({}) // 1 to 5 scale
  const [resultsData, setResultsData] = useState<any>(null)

  // 10 professionally framed psychometric career fitness questions
  const questions: AssessmentQuestion[] = [
    {
      id: 'aq-1',
      question: 'I prefer long-term career stability and clear, structured progression paths over high-risk, high-reward opportunities.',
      scores: { govt: 4, private: 2, self: 1, startup: 0, economics: 1 }
    },
    {
      id: 'aq-2',
      question: 'I thrive in highly competitive corporate environments where individual merit directly drives promotion and financial reward.',
      scores: { govt: 0, private: 4, self: 1, startup: 2, economics: 2 }
    },
    {
      id: 'aq-3',
      question: 'I dream of launching my own scalable company, pitching to investors, and building a product that impacts millions.',
      scores: { govt: 0, private: 1, self: 1, startup: 5, economics: 2 }
    },
    {
      id: 'aq-4',
      question: 'I value complete control over my working hours, daily client interactions, and localized operations, even if income varies month-to-month.',
      scores: { govt: 0, private: 0, self: 5, startup: 2, economics: 1 }
    },
    {
      id: 'aq-5',
      question: 'I enjoy studying global financial markets, analyzing taxes, planning personal investment budgets, and building compound wealth.',
      scores: { govt: 1, private: 2, self: 1, startup: 2, economics: 5 }
    },
    {
      id: 'aq-6',
      question: 'Serving the general public and contributing to societal welfare at a structural policy level is more important to me than private sector bonuses.',
      scores: { govt: 5, private: 0, self: 0, startup: 0, economics: 1 }
    },
    {
      id: 'aq-7',
      question: 'I enjoy coding, designing, or managing large corporate software/system operations inside multinational organizations.',
      scores: { govt: 1, private: 5, self: 2, startup: 2, economics: 1 }
    },
    {
      id: 'aq-8',
      question: 'I am comfortable with financial uncertainty and would rather invest my savings into a venture I fully own and run myself.',
      scores: { govt: 0, private: 0, self: 4, startup: 5, economics: 2 }
    },
    {
      id: 'aq-9',
      question: 'Understanding how government fiscal policy, national budgets, and inflation affect daily households interest me highly.',
      scores: { govt: 3, private: 1, self: 0, startup: 1, economics: 5 }
    },
    {
      id: 'aq-10',
      question: 'I prefer working under clear legislative frameworks, rules, and procedures rather than navigating ambiguous startup pivots.',
      scores: { govt: 5, private: 2, self: 0, startup: 0, economics: 0 }
    }
  ]

  const options = [
    { value: 1, label: 'Strongly Disagree' },
    { value: 2, label: 'Disagree' },
    { value: 3, label: 'Neutral' },
    { value: 4, label: 'Agree' },
    { value: 5, label: 'Strongly Agree' }
  ]

  const handleSelectOption = (val: number) => {
    const qId = questions[currentIndex].id
    setSelectedAnswers(prev => ({
      ...prev,
      [qId]: val
    }))
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      calculateResults()
    }
  }

  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1))
  }

  const calculateResults = async () => {
    setLoading(true)

    // Initial Category sums
    let scoresSum = {
      govt: 0,
      private: 0,
      self: 0,
      startup: 0,
      economics: 0
    }

    let maxPossible = {
      govt: 0,
      private: 0,
      self: 0,
      startup: 0,
      economics: 0
    }

    questions.forEach(q => {
      const multiplier = selectedAnswers[q.id] || 3 // Default neutral multiplier
      
      scoresSum.govt += q.scores.govt * multiplier
      scoresSum.private += q.scores.private * multiplier
      scoresSum.self += q.scores.self * multiplier
      scoresSum.startup += q.scores.startup * multiplier
      scoresSum.economics += q.scores.economics * multiplier

      maxPossible.govt += q.scores.govt * 5
      maxPossible.private += q.scores.private * 5
      maxPossible.self += q.scores.self * 5
      maxPossible.startup += q.scores.startup * 5
      maxPossible.economics += q.scores.economics * 5
    })

    // Compute final fitness percentages
    const finalResults = {
      government: Math.round((scoresSum.govt / maxPossible.govt) * 100),
      private: Math.round((scoresSum.private / maxPossible.private) * 100),
      self_employment: Math.round((scoresSum.self / maxPossible.self) * 100),
      entrepreneurship: Math.round((scoresSum.startup / maxPossible.startup) * 100),
      economic_literacy: Math.round((scoresSum.economics / maxPossible.economics) * 100)
    }

    // Determine top match
    let topCategory = 'government'
    let topScore = finalResults.government

    Object.entries(finalResults).forEach(([cat, score]) => {
      if (score > topScore) {
        topScore = score
        topCategory = cat
      }
    })

    const resultObj = {
      scores: finalResults,
      topCategory,
      topScore,
      takenAt: new Date().toISOString()
    }

    setResultsData(resultObj)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Save to Supabase DB (ignore failure, fallback to state is fine)
        await supabase.from('assessment_results').insert({
          user_id: user.id,
          assessment_id: 'd8c234a9-467a-4712-ba22-0a1bf6f7bfd0', // Static default assessment ID
          answers: selectedAnswers,
          result_json: resultObj,
        } as any)
      }
    } catch (err) {
      console.error('Error storing results:', err)
    } finally {
      setLoading(false)
      setStep('results')
    }
  }

  const resetAssessment = () => {
    setSelectedAnswers({})
    setCurrentIndex(0)
    setStep('intro')
  }

  const getCategoryDetails = (cat: string) => {
    switch (cat) {
      case 'government':
        return {
          title: 'Government Careers',
          desc: 'You prefer structured work conditions, long-term stability, public policy alignment, and national exams (UPSC, SSC, Banking).',
          slug: 'government',
          color: 'bg-blue-600',
          textColor: 'text-blue-600',
          bgLight: 'bg-blue-50'
        }
      case 'private':
        return {
          title: 'Private/Corporate Careers',
          desc: 'You thrive in competitive environments where individual performance drives promotions and multinational tech/financial growth.',
          slug: 'private',
          color: 'bg-indigo-600',
          textColor: 'text-indigo-600',
          bgLight: 'bg-indigo-50'
        }
      case 'self_employment':
        return {
          title: 'Self Employment',
          desc: 'You value local control, direct client relations, flexible operations, and skill-based independent businesses.',
          slug: 'self-employment',
          color: 'bg-sky-600',
          textColor: 'text-sky-600',
          bgLight: 'bg-sky-50'
        }
      case 'entrepreneurship':
        return {
          title: 'Entrepreneurship & Startups',
          desc: 'You have a high appetite for risk, building proprietary products, pitching to venture funds, and scaling high-impact teams.',
          slug: 'entrepreneurship',
          color: 'bg-amber-500',
          textColor: 'text-amber-600',
          bgLight: 'bg-amber-50'
        }
      case 'economic_literacy':
        return {
          title: 'Economic Literacy & Finance',
          desc: 'You are passionate about financial independence, compound wealth concepts, tax structures, and strategic personal planning.',
          slug: 'economic-literacy',
          color: 'bg-emerald-500',
          textColor: 'text-emerald-600',
          bgLight: 'bg-emerald-50'
        }
      default:
        return {
          title: 'General Fitment',
          desc: 'A mixed profile suitability.',
          slug: 'government',
          color: 'bg-slate-500',
          textColor: 'text-slate-600',
          bgLight: 'bg-slate-50'
        }
    }
  }

  return (
    <div className="space-y-6">
      {/* Step 1: Intro Panel */}
      {step === 'intro' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm text-center max-w-2xl mx-auto space-y-6"
        >
          <div className="mx-auto w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <Compass className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-800 tracking-tight">
              {t('assessment.title') || 'Discover Your Ideal Career Path'}
            </h1>
            <p className="text-slate-500 font-medium text-xs sm:text-sm max-w-md mx-auto">
              Take our psychometric evaluation to test your fitness for UPSC/government exams, corporate corporate positions, startup environments, or economics.
            </p>
          </div>

          <div className="divider" />

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-500 max-w-lg mx-auto">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center">
              <ClipboardList className="w-5 h-5 text-indigo-500 mb-1.5" />
              <span>10 Questions</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center">
              <Sparkles className="w-5 h-5 text-amber-500 mb-1.5" />
              <span>Tailored Roadmap</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center">
              <BarChart2 className="w-5 h-5 text-emerald-500 mb-1.5" />
              <span>5 Pillar Analysis</span>
            </div>
          </div>

          <button
            onClick={() => setStep('questions')}
            className="btn-primary w-full max-w-sm justify-center gap-1.5 cursor-pointer"
          >
            <span>{t('assessment.start') || 'Start Fitment Assessment'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Step 2: Multi-step Questions */}
      {step === 'questions' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm max-w-2xl mx-auto space-y-6">
          {/* Header indicator */}
          <div className="flex justify-between items-center text-xs font-bold text-slate-400">
            <span>Syllabus Suitability Test</span>
            <span>Question {currentIndex + 1} of {questions.length}</span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-imperial-blue transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Active Question Panel */}
          <div className="space-y-6 py-4">
            <h3 className="font-heading font-bold text-slate-800 text-lg sm:text-xl leading-relaxed text-center min-h-[4rem]">
              {questions[currentIndex].question}
            </h3>

            {/* Answer Selector Options (agree to disagree) */}
            <div className="flex flex-col gap-2.5 max-w-md mx-auto">
              {options.map((opt) => {
                const isSelected = selectedAnswers[questions[currentIndex].id] === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelectOption(opt.value)}
                    className={`w-full text-center p-3.5 rounded-xl border font-heading font-bold text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'border-imperial-blue bg-blue-50/20 text-imperial-blue'
                        : 'border-slate-100 bg-slate-50 hover:bg-slate-100/50 text-slate-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="btn-outline text-xs h-9 px-4 rounded-lg gap-1 disabled:opacity-50"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={handleNext}
              disabled={!selectedAnswers[questions[currentIndex].id] || loading}
              className="btn-primary text-xs h-9 px-4 rounded-lg gap-1.5 cursor-pointer"
            >
              {loading ? (
                <span>Evaluating...</span>
              ) : (
                <>
                  <span>{currentIndex === questions.length - 1 ? 'Analyze Results' : 'Next'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Analysis Results Report */}
      {step === 'results' && resultsData && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-3xl mx-auto space-y-6"
        >
          {/* Congrats banner */}
          <div className="bg-gradient-to-r from-imperial-blue to-steel-azure text-white rounded-3xl p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-center gap-6 justify-between relative overflow-hidden">
            <div className="absolute right-[-10px] bottom-[-20px] opacity-10 text-white">
              <Compass className="w-36 h-36" />
            </div>

            <div className="space-y-2 text-center sm:text-left relative z-10">
              <span className="inline-flex items-center gap-1 bg-white/15 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <Star className="w-3 h-3 text-school-bus-yellow fill-current" />
                Result Report
              </span>
              <h2 className="font-heading font-extrabold text-2xl leading-none">
                Top Match: {getCategoryDetails(resultsData.topCategory).title}
              </h2>
              <p className="text-white/80 font-medium text-xs sm:text-sm max-w-md">
                {getCategoryDetails(resultsData.topCategory).desc}
              </p>
            </div>

            <div className="bg-white/10 px-6 py-4 rounded-2xl border border-white/10 backdrop-blur-sm text-center flex-shrink-0 relative z-10">
              <span className="text-[10px] text-white/70 font-semibold uppercase tracking-wider block">Match Fitness</span>
              <strong className="text-white text-3xl sm:text-4xl font-heading font-extrabold">{resultsData.topScore}%</strong>
            </div>
          </div>

          {/* Fitness Bar Chart Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
            <h3 className="font-heading font-bold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-500" />
              Pillar Suitability Breakdown
            </h3>

            <div className="space-y-4">
              {Object.entries(resultsData.scores).map(([cat, score]) => {
                const details = getCategoryDetails(cat)
                const percentage = score as number
                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                      <span>{details.title}</span>
                      <span>{percentage}%</span>
                    </div>
                    {/* Visual Progress bar */}
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${details.color} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Tailored Category Link Banner */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-slate-800 text-sm">Recommended Roadmap: {getCategoryDetails(resultsData.topCategory).title}</h4>
                <p className="text-slate-500 font-medium text-xs leading-relaxed mt-0.5">We have curated complete preparation schedules, books list, and practice syllabi matching this path.</p>
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto justify-end">
              <button
                onClick={resetAssessment}
                className="btn-outline text-xs h-9 px-3.5 rounded-lg gap-1.5 font-bold cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>
              <Link
                href={`/${locale}/careers?category=${getCategoryDetails(resultsData.topCategory).slug}`}
                className="btn-primary text-xs h-9 px-4 rounded-lg gap-1 group whitespace-nowrap"
              >
                <span>View Roadmaps</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
