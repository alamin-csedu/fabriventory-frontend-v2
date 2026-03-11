import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs))
}

/** Returns first n words of text (default 3); use for truncated display with full text on hover. */
export function getFirstNWords(text: string | undefined | null, n = 3): string {
  if (text == null || text.trim() === '') return ''
  const words = text.trim().split(/\s+/)
  if (words.length <= n) return text.trim()
  return words.slice(0, n).join(' ')
}

/** Returns first n segments of a path split by " -> " (e.g. storage hierarchy). Use for truncated storage path with full on hover. */
export function getFirstNStoragePathSegments(text: string | undefined | null, n = 3): string {
  if (text == null || text.trim() === '') return ''
  const sep = ' -> '
  const segments = text.trim().split(sep).map((s) => s.trim()).filter(Boolean)
  if (segments.length <= n) return text.trim()
  return segments.slice(0, n).join(sep)
}
