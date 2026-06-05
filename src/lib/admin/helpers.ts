export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export async function confirmAndDelete(
  label: string,
  deleteFn: () => PromiseLike<{ error: unknown }>
): Promise<boolean> {
  if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return false
  const { error } = await deleteFn()
  if (error) {
    console.error('Delete failed:', error)
    alert('Delete failed. Check permissions and try again.')
    return false
  }
  return true
}
