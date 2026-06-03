'use server'

import { createClient } from '@/lib/supabase/server'
import { logError } from '@/lib/logger'

export type PublicQuestion = {
  id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  sort_order: number
}

export type TestSubmitResult =
  | {
      success: true
      attempt_id: string
      score: number
      percentage: number
      correct_count: number
      wrong_count: number
      skipped_count: number
      total_marks: number
    }
  | { success: false; error: string }

export async function fetchTestQuestions(
  testId: string
): Promise<{ questions: PublicQuestion[]; error?: string }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_test_questions', {
      p_test_id: testId,
    } as never)

    if (error) {
      logError('fetchTestQuestions', error)
      return { questions: [], error: error.message }
    }

    return { questions: (data ?? []) as PublicQuestion[] }
  } catch (err) {
    logError('fetchTestQuestions', err)
    return { questions: [], error: 'Failed to load questions' }
  }
}

export async function submitTestAttempt(
  testId: string,
  answers: Record<string, string>,
  timeTaken: number
): Promise<TestSubmitResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'You must be logged in to submit a test.' }
    }

    const { data, error } = await supabase.rpc('submit_test_attempt', {
      p_test_id: testId,
      p_answers: answers,
      p_time_taken: timeTaken,
    } as never)

    if (error) {
      logError('submitTestAttempt', error)
      return { success: false, error: error.message }
    }

    const result = data as Record<string, unknown>
    return {
      success: true,
      attempt_id: String(result.attempt_id),
      score: Number(result.score),
      percentage: Number(result.percentage),
      correct_count: Number(result.correct_count),
      wrong_count: Number(result.wrong_count),
      skipped_count: Number(result.skipped_count),
      total_marks: Number(result.total_marks),
    }
  } catch (err) {
    logError('submitTestAttempt', err)
    return { success: false, error: 'Failed to submit test. Please try again.' }
  }
}
