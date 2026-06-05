'use server'

import { createClient } from '@/lib/supabase/server'
import { contactLeadSchema, type ContactLeadInput } from '@/lib/validations'
import { logError } from '@/lib/logger'
import { enforceFormSecurity } from '@/app/actions/security'
import type { Lead } from '@/types/database'

type LeadInsert = Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'assigned_to' | 'notes'> & {
  status?: Lead['status']
  source?: Lead['source']
}

export type ContactActionResult =
  | { success: true }
  | { success: false; error: string }

export async function submitContactLead(
  input: ContactLeadInput
): Promise<ContactActionResult> {
  const parsed = contactLeadSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid form data' }
  }

  if (parsed.data.honeypot) {
    return { success: true }
  }

  const security = await enforceFormSecurity('contact', parsed.data.turnstileToken)
  if (!security.ok) {
    return { success: false, error: security.error }
  }

  try {
    const supabase = await createClient()
    const row: LeadInsert = {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      phone: parsed.data.phone || null,
      career_interest: parsed.data.career_interest || null,
      message: parsed.data.message,
      source: 'contact_form',
      status: 'new',
      metadata: { channel: 'website' },
    }
    const { error } = await supabase.from('leads').insert(row as never)

    if (error) {
      logError('submitContactLead', error)
      return { success: false, error: 'Could not submit your message. Please try again.' }
    }

    return { success: true }
  } catch (err) {
    logError('submitContactLead', err)
    return { success: false, error: 'Something went wrong. Please try again later.' }
  }
}
