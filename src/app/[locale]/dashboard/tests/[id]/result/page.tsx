'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, ArrowLeft, ArrowRight, Award, Compass, Landmark } from 'lucide-react'

interface Question {
  id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
  explanation?: string
}

interface TestResult {
  score: number
  percentage: number
  correctCount: number
  wrongCount: number
  skippedCount: number
  timeTaken: number
}

export default function TestResultPage() {
  const t = useTranslations()
  const locale = useLocale()
  const params = useParams()
  const router = useRouter()
  const testId = params.id as string

  const [loading, setLoading] = useState(true)
  const [testTitle, setTestTitle] = useState('')
  const [results, setResults] = useState<TestResult | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [questions, setQuestions] = useState<Question[]>([])

  useEffect(() => {
    // Attempt to load from localStorage first (real-time results)
    const stored = localStorage.getItem(`test_result_${testId}`)

    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setTestTitle(parsed.testTitle)
        setResults(parsed.results)
        setAnswers(parsed.answers)
        setQuestions(parsed.questions)
        setLoading(false)
        return
      } catch (e) {
        console.error('Error parsing stored test results:', e)
      }
    }

    // Default Fallback Mock Result if accessed directly without taking test
    const mockTestTitle =
      testId === 'test-upsc-1'
        ? 'UPSC Civil Services - General Studies (Mock 1)'
        : testId === 'test-ssc-1'
        ? 'SSC CGL - Quantitative Aptitude (Algebra & Geometry)'
        : 'Ramanujonomics Practice Exam Hub'

    const mockQuestionsList =
      testId === 'test-upsc-1'
        ? [
            {
              id: 'q-u1-1',
              question_text: 'Which of the following bodies is NOT established by the Constitution of India?',
              option_a: 'Election Commission',
              option_b: 'NITI Aayog',
              option_c: 'Finance Commission',
              option_d: 'Union Public Service Commission',
              correct_answer: 'b',
              explanation: 'NITI Aayog was established by an executive resolution of the Union Cabinet on January 1, 2015, replacing the Planning Commission. It is a non-constitutional, extra-constitutional, and advisory body. The other three are constitutional bodies.',
            },
            {
              id: 'q-u1-2',
              question_text: 'The power to increase the number of judges in the Supreme Court of India is vested in:',
              option_a: 'The President of India',
              option_b: 'The Parliament',
              option_c: 'The Chief Justice of India',
              option_d: 'The Law Commission',
              correct_answer: 'b',
              explanation: 'According to Article 124 of the Constitution of India, the Parliament has the power to increase the number of judges in the Supreme Court of India through legislation.',
            },
          ]
        : [
            {
              id: 'q-d-1',
              question_text: 'Sovereign wealth of an individual is fundamentally linked to their health because:',
              option_a: 'Physical health reduces recurring clinical out-of-pocket liabilities.',
              option_b: 'Mental clarity enables sustained strategic professional compound decisions.',
              option_c: 'Health allows the individual to enjoy structural productivity and longevity.',
              option_d: 'All of the above.',
              correct_answer: 'd',
              explanation: 'Our platform tagline "Wealth is Health" is rooted in economic productivity. Good health compounds career longevity, active output, and decreases wealth-depleting clinical expenses.',
            },
          ]

    setTestTitle(mockTestTitle)
    setResults({
      score: testId === 'test-upsc-1' ? 84 : 30,
      percentage: testId === 'test-upsc-1' ? 84 : 100,
      correctCount: testId === 'test-upsc-1' ? 2 : 1,
      wrongCount: 0,
      skippedCount: testId === 'test-upsc-1' ? 1 : 0,
      timeTaken: 342,
    })
    setAnswers(testId === 'test-upsc-1' ? { 'q-u1-1': 'b', 'q-u1-2': 'b' } : { 'q-d-1': 'd' })
    setQuestions(mockQuestionsList)
    setLoading(false)
  }, [testId])

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60)
    const seconds = secs % 60
    return `${minutes}m ${seconds}s`
  }

  if (loading || !results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-2">
          <svg className="animate-spin h-8 w-8 text-imperial-blue mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-slate-500 font-semibold text-sm">Compiling exam solutions...</p>
        </div>
      </div>
    )
  }

  const isPassed = results.percentage >= 40 // Passing percentage threshold

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href={`/${locale}/dashboard/tests`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-imperial-blue transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Practice Hub</span>
          </Link>
          <h1 className="font-heading font-extrabold text-2xl text-slate-800 tracking-tight leading-tight">
            Exam Performance Analysis
          </h1>
          <p className="text-slate-400 font-medium text-xs mt-0.5">{testTitle}</p>
        </div>

        <Link
          href={`/${locale}/dashboard/tests/${testId}`}
          className="btn-outline text-xs h-9 px-4 rounded-lg self-start sm:self-center gap-1.5 font-bold cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retake Practice Exam</span>
        </Link>
      </div>

      {/* Main Scorecard Banner */}
      <div className={`rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 ${
        isPassed
          ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
          : 'bg-gradient-to-r from-slate-700 to-slate-800'
      }`}>
        <div className="space-y-3 text-center md:text-left">
          <span className="inline-block bg-white/10 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {isPassed ? 'Passed' : 'Needs Review'}
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl leading-none">
            {isPassed ? 'Congratulations!' : 'Keep Practicing'}
          </h2>
          <p className="text-white/80 font-medium text-xs sm:text-sm max-w-md">
            {isPassed
              ? 'You have cleared the minimum qualification threshold for this subject exam. Review the solutions below to target a 100% score.'
              : 'Syllabus coverage needs strengthening. Revise standard textbooks, reference maps, and attempt again to build speed.'}
          </p>
        </div>

        {/* Score metrics */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-6 w-full sm:w-auto flex-shrink-0">
          <div className="text-center bg-white/10 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border border-white/10 backdrop-blur-sm flex-1 sm:flex-none">
            <span className="text-[10px] text-white/75 font-semibold uppercase tracking-wider block">Percentage</span>
            <strong className="text-white text-3xl sm:text-4xl font-heading font-extrabold">{results.percentage}%</strong>
          </div>
          <div className="text-center bg-white/10 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border border-white/10 backdrop-blur-sm flex-1 sm:flex-none">
            <span className="text-[10px] text-white/75 font-semibold uppercase tracking-wider block">Time Spent</span>
            <strong className="text-white text-base sm:text-lg font-heading font-bold block mt-2">{formatTime(results.timeTaken)}</strong>
          </div>
        </div>
      </div>

      {/* Statistics breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Correct</span>
          <strong className="text-emerald-600 text-xl font-heading font-bold block mt-1">+{results.correctCount}</strong>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Incorrect</span>
          <strong className="text-rose-500 text-xl font-heading font-bold block mt-1">-{results.wrongCount}</strong>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Skipped</span>
          <strong className="text-slate-500 text-xl font-heading font-bold block mt-1">{results.skippedCount}</strong>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Score Obtained</span>
          <strong className="text-slate-800 text-xl font-heading font-bold block mt-1">{results.score}</strong>
        </div>
      </div>

      {/* Career Guidance Promo */}
      <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100/80 flex items-center justify-center text-imperial-blue flex-shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-slate-800 text-sm">Need structured training?</h4>
            <p className="text-slate-500 font-medium text-xs leading-relaxed mt-0.5">Explore standard roadmaps, video lessons, books, and practice tests designed for this exam.</p>
          </div>
        </div>
        <Link
          href={`/${locale}/careers`}
          className="btn-primary text-xs h-9 px-4 rounded-lg flex items-center gap-1 group whitespace-nowrap cursor-pointer"
        >
          <span>Explore Careers</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Solutions / Explanations section */}
      <div className="space-y-4">
        <h3 className="font-heading font-bold text-slate-800 text-lg pb-2 border-b border-slate-200">
          Solutions & Detailed Explanations
        </h3>

        <div className="space-y-6">
          {questions.map((q, idx) => {
            const userAnswer = answers[q.id]
            const isCorrect = userAnswer === q.correct_answer
            const isSkipped = !userAnswer

            return (
              <div
                key={q.id}
                className={`bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4 relative ${
                  isCorrect
                    ? 'border-l-4 border-l-emerald-500'
                    : isSkipped
                    ? 'border-l-4 border-l-slate-400'
                    : 'border-l-4 border-l-rose-500'
                }`}
              >
                {/* Question index badge & correctness */}
                <div className="flex justify-between items-center">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-heading font-bold text-[10px]">
                    Question {idx + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    {isCorrect ? (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        CORRECT
                      </span>
                    ) : isSkipped ? (
                      <span className="flex items-center gap-1 text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-full">
                        <AlertCircle className="w-3.5 h-3.5" />
                        SKIPPED
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full">
                        <XCircle className="w-3.5 h-3.5" />
                        INCORRECT
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Text */}
                <h4 className="font-heading font-bold text-slate-800 text-sm leading-relaxed">
                  {q.question_text}
                </h4>

                {/* Options List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'a', val: q.option_a },
                    { key: 'b', val: q.option_b },
                    { key: 'c', val: q.option_c },
                    { key: 'd', val: q.option_d },
                  ].map(({ key, val }) => {
                    const isUserPick = userAnswer === key
                    const isCorrectOption = q.correct_answer === key
                    return (
                      <div
                        key={key}
                        className={`p-3 rounded-lg border text-xs font-medium flex items-center justify-between ${
                          isCorrectOption
                            ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800 font-semibold'
                            : isUserPick
                            ? 'bg-rose-50/50 border-rose-200 text-rose-800 font-semibold'
                            : 'bg-slate-50/30 border-slate-100 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-5.5 h-5.5 rounded font-heading font-bold flex items-center justify-center border text-[9px] ${
                            isCorrectOption
                              ? 'bg-emerald-500 border-transparent text-white'
                              : isUserPick
                              ? 'bg-rose-500 border-transparent text-white'
                              : 'bg-slate-100 border-slate-200 text-slate-400'
                          }`}>
                            {key.toUpperCase()}
                          </span>
                          <span>{val}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Explanation / Analysis
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
