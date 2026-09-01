import { isoDate } from './date'

/** The calendar date of `day` (0=Sun…6=Sat) inside the week that contains `ref`. */
export function dateOfDayThisWeek(day: number, mondayFirst: boolean, ref: Date = new Date()): Date {
  const base = new Date(ref)
  base.setHours(0, 0, 0, 0)
  const startOffset = mondayFirst ? (base.getDay() + 6) % 7 : base.getDay()
  const weekStart = new Date(base)
  weekStart.setDate(base.getDate() - startOffset)
  const dayOffset = mondayFirst ? (day + 6) % 7 : day
  const result = new Date(weekStart)
  result.setDate(weekStart.getDate() + dayOffset)
  return result
}

export const isFuture = (d: Date): boolean => isoDate(d) > isoDate()
export const isToday = (d: Date): boolean => isoDate(d) === isoDate()
