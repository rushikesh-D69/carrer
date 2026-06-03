'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, AlertTriangle, ArrowRight, ArrowLeft, Send, CheckCircle2, ChevronRight, Check } from 'lucide-react'
import { toast } from 'sonner'

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

export default function TestEnginePage() {
  const t = useTranslations()
  const locale = useLocale()
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const testId = params.id as string

  const [loading, setLoading] = useState(true)
  const [test, setTest] = useState<any>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeRemaining, setTimeRemaining] = useState(0) // seconds
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [testStarted, setTestStarted] = useState(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Fallback Mock Questions Database
  const mockQuestionsMap: Record<string, Question[]> = {
    'test-upsc-1': [
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
      {
        id: 'q-u1-3',
        question_text: 'Which of the following sectors contributes the most to India\'s Gross Domestic Product (GDP)?',
        option_a: 'Agriculture Sector',
        option_b: 'Industrial Sector',
        option_c: 'Services Sector',
        option_d: 'Manufacturing Sector',
        correct_answer: 'c',
        explanation: 'The Services sector is the largest contributor to India\'s GDP, accounting for more than 53% of its share, followed by Industry and Agriculture.',
      },
    ],
    'test-ssc-1': [
      {
        id: 'q-s1-1',
        question_text: 'If x + 1/x = 5, then the value of x² + 1/x² is:',
        option_a: '25',
        option_b: '23',
        option_c: '27',
        option_d: '20',
        correct_answer: 'b',
        explanation: 'Squaring both sides of (x + 1/x) = 5 gives: (x + 1/x)² = 25 => x² + 2 + 1/x² = 25 => x² + 1/x² = 25 - 2 = 23.',
      },
      {
        id: 'q-s1-2',
        question_text: 'The ratio of the area of a square to that of the square drawn on its diagonal is:',
        option_a: '1 : 2',
        option_b: '1 : 3',
        option_c: '1 : 4',
        option_d: '2 : 3',
        correct_answer: 'a',
        explanation: 'Let side of square be a. Area = a². Diagonal of square = a√2. Area of square drawn on diagonal = (a√2)² = 2a². Ratio = a² : 2a² = 1 : 2.',
      },
    ],
  }

  const defaultMockQuestions: Question[] = [
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
    {
      id: 'q-d-2',
      question_text: 'Which is the primary purpose of NITI Aayog in Indian federalism?',
      option_a: 'Executing direct central budget financial allocations to states.',
      option_b: 'Fostering Cooperative Federalism through structured support initiatives.',
      option_c: 'Serving as a legislative branch for central tax collection.',
      option_d: 'None of the above.',
      correct_answer: 'b',
      explanation: 'NITI Aayog acts as a policy think-tank, fostering Cooperative Federalism through shared state-centre consultation without executive budgeting powers.',
    },
  ]

  useEffect(() => {
    const fetchTestAndQuestions = async () => {
      try {
        const { data: rawDbTest } = await supabase
          .from('tests')
          .select('*')
          .eq('id', testId)
          .single()

        const dbTest = rawDbTest as any

        let questionsData: Question[] = []

        if (dbTest) {
          setTest(dbTest)
          setTimeRemaining(dbTest.duration * 60)

          // Fetch questions through pivot
          const { data: pivotData } = await supabase
            .from('test_questions')
            .select('question_id, question_bank(*)')
            .eq('test_id', testId)
            .order('sort_order', { ascending: true })

          if (pivotData && pivotData.length > 0) {
            questionsData = pivotData.map((item: any) => ({
              id: item.question_bank.id,
              question_text: item.question_bank.question_text,
              option_a: item.question_bank.option_a,
              option_b: item.question_bank.option_b,
              option_c: item.question_bank.option_c,
              option_d: item.question_bank.option_d,
              correct_answer: item.question_bank.correct_answer,
              explanation: item.question_bank.explanation,
            }))
          }
        }

        // Apply fallbacks if needed
        if (!dbTest) {
          // Identify test by ID from mock database
          const activeMockTest =
            testId === 'test-upsc-1'
              ? { id: 'test-upsc-1', title: 'UPSC Civil Services - General Studies (Mock 1)', duration: 60, total_marks: 100 }
              : testId === 'test-ssc-1'
              ? { id: 'test-ssc-1', title: 'SSC CGL - Quantitative Aptitude (Algebra & Geometry)', duration: 30, total_marks: 50 }
              : { id: testId, title: 'Ramanujonomics Practice Exam Hub', duration: 15, total_marks: 30 }

          setTest(activeMockTest)
          setTimeRemaining(activeMockTest.duration * 60)
          questionsData = mockQuestionsMap[testId] || defaultMockQuestions
        }

        setQuestions(questionsData)
      } catch (err) {
        console.error('Error initializing test engine:', err)
        setTest({ id: testId, title: 'Ramanujonomics Practice Exam Hub', duration: 15, total_marks: 30 })
        setTimeRemaining(15 * 60)
        setQuestions(defaultMockQuestions)
      } finally {
        setLoading(false)
      }
    }

    fetchTestAndQuestions()

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [testId])

  // Timer Effect
  useEffect(() => {
    if (testStarted && timeRemaining > 0 && !isSubmitting) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!)
            handleAutoSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [testStarted, timeRemaining, isSubmitting])

  const startTest = () => {
    setTestStarted(true)
  }

  const handleSelectOption = (qId: string, option: string) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: option,
    }))
  }

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60)
    const seconds = secs % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const calculateResults = () => {
    let score = 0
    let correctCount = 0
    let wrongCount = 0
    let skippedCount = 0

    const negMark = parseFloat(test.negative_marking || '0.33')
    const marksPerQ = test.total_marks / questions.length

    questions.forEach(q => {
      const selected = answers[q.id]
      if (!selected) {
        skippedCount++
      } else if (selected === q.correct_answer) {
        correctCount++
        score += marksPerQ
      } else {
        wrongCount++
        score -= marksPerQ * negMark
      }
    })

    score = Math.max(0, score) // No negative score floor
    const percentage = parseFloat(((score / test.total_marks) * 100).toFixed(2))

    return {
      score: parseFloat(score.toFixed(2)),
      percentage,
      correctCount,
      wrongCount,
      skippedCount,
      timeTaken: test.duration * 60 - timeRemaining,
    }
  }

  const handleAutoSubmit = async () => {
    toast.warning('Time expired! Submitting your answers automatically.')
    await submitTest(true)
  }

  const submitTest = async (forceSubmit = false) => {
    if (!forceSubmit && !confirm('Are you sure you want to submit your exam now?')) {
      return
    }

    setIsSubmitting(true)
    const results = calculateResults()

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Record Attempt in database
        const { error } = await supabase.from('test_attempts').insert({
          user_id: user.id,
          test_id: test.id,
          answers: answers,
          score: results.score,
          percentage: results.percentage,
          time_taken: results.timeTaken,
          correct_count: results.correctCount,
          wrong_count: results.wrongCount,
          skipped_count: results.skippedCount,
          is_completed: true,
        } as any)

        if (error) {
          console.error('Error saving attempt:', error)
        }
      }

      // Store results in localStorage to pass to result route (essential for sandbox fallback)
      localStorage.setItem(`test_result_${test.id}`, JSON.stringify({
        testTitle: test.title,
        results,
        answers,
        questions,
      }))

      toast.success('Exam submitted successfully!')
      router.push(`/${locale}/dashboard/tests/${test.id}/result`)
    } catch (err) {
      console.error('Error submitting test:', err)
      toast.error('Failed to submit results. Redirecting to backup dashboard.')
      router.push(`/${locale}/dashboard`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <svg className="animate-spin h-10 w-10 text-imperial-blue mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-slate-500 font-heading font-semibold text-sm">Preparing exam environment...</p>
        </div>
      </div>
    )
  }

  // Pre-test Instructions
  if (!testStarted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-2xl w-full shadow-card space-y-6"
        >
          <div className="text-center">
            <div className="mx-auto w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-imperial-blue mb-4">
              <Clock className="w-8 h-8" />
            </div>
            <h1 className="font-heading font-extrabold text-2xl text-slate-800 tracking-tight leading-tight">
              {test.title}
            </h1>
            <p className="text-slate-400 font-medium text-xs mt-1">Practice Exam Hub</p>
          </div>

          <div className="divider" />

          {/* Test details */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Duration</span>
              <strong className="text-slate-800 text-sm font-heading">{test.duration} Minutes</strong>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Marks</span>
              <strong className="text-slate-800 text-sm font-heading">{test.total_marks} Marks</strong>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Questions</span>
              <strong className="text-slate-800 text-sm font-heading">{questions.length} Items</strong>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-slate-800 text-sm">Standard Instructions:</h4>
            <ul className="text-xs text-slate-500 space-y-2 list-disc pl-5 font-medium leading-relaxed">
              <li>Do not refresh or exit the browser window. Doing so will terminate your attempt.</li>
              <li>Negative marking of <strong className="text-red-500">{test.negative_marking || '0.33'} marks</strong> per incorrect answer applies.</li>
              <li>The exam will auto-submit when the countdown timer hits 0:00.</li>
              <li>Make sure you have a reliable network connection before starting.</li>
            </ul>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              onClick={() => router.back()}
              className="btn-outline flex-1 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={startTest}
              className="btn-primary flex-1 gap-2 cursor-pointer"
            >
              <span>Begin Practice Exam</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Header Info Panel */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div>
          <h2 className="font-heading font-bold text-slate-800 text-base leading-none truncate max-w-[280px] sm:max-w-md">
            {test.title}
          </h2>
          <p className="text-[10px] font-semibold text-slate-400 mt-1">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>

        {/* Timer Panel */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border font-heading font-bold text-sm ${
          timeRemaining < 120
            ? 'bg-red-50 border-red-200 text-red-600 animate-pulse'
            : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}>
          <Clock className="w-4 h-4" />
          <span>{formatTime(timeRemaining)}</span>
        </div>
      </header>

      {/* Main split dashboard content */}
      <main className="container-base py-6 flex-1 flex flex-col lg:flex-row gap-6 items-stretch">
        
        {/* Left Side: Active Question */}
        <div className="flex-1 flex flex-col justify-between bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="space-y-6">
            {/* Index badge */}
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-600 font-heading font-bold text-xs">
                Question #{currentIndex + 1}
              </span>
              {answers[currentQuestion.id] && (
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  <Check className="w-3.5 h-3.5" />
                  Answer Saved
                </span>
              )}
            </div>

            {/* Question Text */}
            <h3 className="font-heading font-bold text-slate-800 text-base sm:text-lg leading-relaxed">
              {currentQuestion.question_text}
            </h3>

            {/* Answer Options list */}
            <div className="space-y-3">
              {[
                { key: 'a', val: currentQuestion.option_a },
                { key: 'b', val: currentQuestion.option_b },
                { key: 'c', val: currentQuestion.option_c },
                { key: 'd', val: currentQuestion.option_d },
              ].map(({ key, val }) => {
                const isSelected = answers[currentQuestion.id] === key
                return (
                  <button
                    key={key}
                    onClick={() => handleSelectOption(currentQuestion.id, key)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-imperial-blue bg-blue-50/50 text-imperial-blue font-semibold shadow-sm'
                        : 'border-slate-100 hover:border-slate-200 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-heading border transition-colors ${
                        isSelected
                          ? 'bg-imperial-blue border-transparent text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}>
                        {key.toUpperCase()}
                      </span>
                      <span className="text-sm font-medium">{val}</span>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-imperial-blue flex items-center justify-center text-white">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="btn-outline h-10 px-4 rounded-lg flex items-center gap-1.5 disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentIndex === questions.length - 1 ? (
              <button
                onClick={() => submitTest(false)}
                disabled={isSubmitting}
                className="btn-cta h-10 px-5 rounded-lg flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md cursor-pointer"
              >
                <span>Submit Exam</span>
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                className="btn-primary h-10 px-4 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Navigation Panel Grid */}
        <aside className="w-full lg:w-72 bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h4 className="font-heading font-bold text-slate-800 text-sm pb-2 border-b border-slate-100">
              Exam Navigator
            </h4>

            {/* Grid of indices */}
            <div className="grid grid-cols-5 gap-2.5">
              {questions.map((q, idx) => {
                const isSelected = currentIndex === idx
                const isAnswered = !!answers[q.id]
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-10 h-10 rounded-lg font-heading font-bold text-xs flex items-center justify-center border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-imperial-blue bg-blue-50/20 text-imperial-blue font-extrabold ring-2 ring-imperial-blue/10'
                        : isAnswered
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold'
                        : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quick Stats Panel */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex justify-between text-xs font-semibold text-slate-500">
              <span>Total Questions:</span>
              <span className="text-slate-800">{questions.length}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-slate-500">
              <span>Answered:</span>
              <span className="text-emerald-600">{Object.keys(answers).length}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-slate-500">
              <span>Remaining:</span>
              <span className="text-amber-600">{questions.length - Object.keys(answers).length}</span>
            </div>

            <button
              onClick={() => submitTest(false)}
              disabled={isSubmitting}
              className="btn-primary w-full h-10 shadow-sm gap-2 cursor-pointer"
            >
              <span>Submit Entire Exam</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      </main>
    </div>
  )
}
