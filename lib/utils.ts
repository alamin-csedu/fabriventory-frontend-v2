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

/** Non-negative quantity, optional upper cap, rounded to `decimals` (default 2). */
export function clampQuantity(value: unknown, max = Number.POSITIVE_INFINITY, decimals = 2): number {
  const d = 10 ** decimals
  let n = typeof value === 'number' ? value : parseFloat(String(value))
  if (!Number.isFinite(n)) n = 0
  if (n < 0) n = 0
  const cap = Number.isFinite(max) && max >= 0 ? max : Number.POSITIVE_INFINITY
  if (n > cap) n = cap
  return Math.round(n * d) / d
}

/** Display quantity with fixed decimal places (default 2). */
export function formatQuantity(value: unknown, decimals = 2): string {
  const n = Number(value)
  if (!Number.isFinite(n)) return (0).toFixed(decimals)
  return n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}
