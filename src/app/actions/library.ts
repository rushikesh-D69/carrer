'use server'

import { createClient } from '@/lib/supabase/server'
import { logError } from '@/lib/logger'

export type LibraryItemType = 'career' | 'blog' | 'resource' | 'test' | 'event'

export type LibraryActionResult =
  | { success: true }
  | { success: false; error: string }

export async function saveToLibrary(
  itemId: string,
  itemType: LibraryItemType
): Promise<LibraryActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Please log in to save items to your library.' }
    }

    const { data: existing } = await supabase
      .from('user_library')
      .select('id')
      .eq('user_id', user.id)
      .eq('item_id', itemId)
      .eq('item_type', itemType)
      .maybeSingle()

    if (existing) {
      return { success: true }
    }

    const { error } = await supabase.from('user_library').insert({
      user_id: user.id,
      item_id: itemId,
      item_type: itemType,
    } as never)

    if (error) {
      logError('saveToLibrary', error)
      return { success: false, error: 'Could not save to library.' }
    }

    return { success: true }
  } catch (err) {
    logError('saveToLibrary', err)
    return { success: false, error: 'Something went wrong.' }
  }
}
