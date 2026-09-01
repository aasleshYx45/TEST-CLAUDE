import type { Subject } from './types'

export const total = (s: Subject) => s.attended + s.missed

export function percent(s: Subject): number {
  const t = total(s)
  if (t === 0) return 0
  return (s.attended / t) * 100
}

/** Classes that may still be skipped while staying at or above the requirement. */
export function canSkip(s: Subject): number {
  const req = s.requirement / 100
  if (req <= 0) return Infinity
  const t = total(s)
  if (t === 0) return 0
  return Math.max(0, Math.floor(s.attended / req - t))
}

/** Consecutive classes that must be attended to climb back to the requirement. */
export function mustAttend(s: Subject): number {
  const req = s.requirement / 100
  if (req >= 1) return total(s) === s.attended ? 0 : Infinity
  const need = (req * total(s) - s.attended) / (1 - req)
  return Math.max(0, Math.ceil(need - 1e-9))
}

export type Standing = {
  /** 'safe' comfortably above, 'edge' meeting it with no room, 'risk' below. */
  tone: 'safe' | 'edge' | 'risk' | 'empty'
  headline: string
  detail: string
}

export function standing(s: Subject): Standing {
  if (total(s) === 0) {
    return { tone: 'empty', headline: 'No classes logged', detail: 'Mark your first class to start tracking' }
  }
  const pct = percent(s)
  if (pct + 1e-9 < s.requirement) {
    const n = mustAttend(s)
    return {
      tone: 'risk',
      headline: n === Infinity ? 'Cannot recover' : `Attend next ${n}`,
      detail: n === Infinity ? 'Requirement is 100%' : `${n} in a row to reach ${s.requirement}%`,
    }
  }
  const skip = canSkip(s)
  if (skip === 0) {
    return { tone: 'edge', headline: 'Cannot skip', detail: `Exactly at the ${s.requirement}% line` }
  }
  return {
    tone: 'safe',
    headline: `Can skip ${skip}`,
    detail: `${skip} class${skip === 1 ? '' : 'es'} of room above ${s.requirement}%`,
  }
}

export function overall(subjects: Subject[]) {
  const attended = subjects.reduce((n, s) => n + s.attended, 0)
  const missed = subjects.reduce((n, s) => n + s.missed, 0)
  const t = attended + missed
  return {
    attended,
    missed,
    total: t,
    percent: t === 0 ? 0 : (attended / t) * 100,
    atRisk: subjects.filter((s) => total(s) > 0 && percent(s) + 1e-9 < s.requirement).length,
  }
}
