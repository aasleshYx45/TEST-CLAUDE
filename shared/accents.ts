import type { AccentKey } from './types'

export const ACCENTS: Record<AccentKey, { color: string; glow: string; label: string }> = {
  lime: { color: '#4ce97f', glow: 'rgba(76, 233, 127, 0.30)', label: 'Lime' },
  cyan: { color: '#3ad7f5', glow: 'rgba(58, 215, 245, 0.30)', label: 'Cyan' },
  violet: { color: '#a084ff', glow: 'rgba(160, 132, 255, 0.32)', label: 'Violet' },
  amber: { color: '#ffb340', glow: 'rgba(255, 179, 64, 0.30)', label: 'Amber' },
  rose: { color: '#ff6b8a', glow: 'rgba(255, 107, 138, 0.30)', label: 'Rose' },
}

export const ACCENT_KEYS = Object.keys(ACCENTS) as AccentKey[]

export const WARN = { color: '#ffc24b', glow: 'rgba(255, 194, 75, 0.26)' }
export const DANGER = { color: '#ff5f6b', glow: 'rgba(255, 95, 107, 0.26)' }

/** Cards colour themselves by how the subject is doing, falling back to its own accent. */
export function toneFor(tone: 'safe' | 'edge' | 'risk' | 'empty', accent: AccentKey) {
  if (tone === 'risk') return DANGER
  if (tone === 'edge') return WARN
  if (tone === 'empty') return { color: '#7d848f', glow: 'rgba(125, 132, 143, 0.18)' }
  return ACCENTS[accent]
}

/** Two uppercase letters for a subject with no explicit code. */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '—'
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}
