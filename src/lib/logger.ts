/** Log in development only — avoids noisy production logs */
export function logError(context: string, error: unknown) {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]`, error)
  }
}
