export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const DAY_INITIAL = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function isoDate(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Day indices in display order, respecting the week-start preference. */
export function weekOrder(mondayFirst: boolean): number[] {
  return mondayFirst ? [1, 2, 3, 4, 5, 6, 0] : [0, 1, 2, 3, 4, 5, 6]
}

export function formatHeaderDate(d: Date = new Date()): string {
  return `${d.getDate()} ${d.toLocaleString('en-US', { month: 'short' }).toUpperCase()} ${d.getFullYear()}`
}

export function formatUpdated(ts: number): string {
  const d = new Date(ts)
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const today = isoDate() === isoDate(d)
  if (today) return `Today at ${time}`
  return `${d.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })} at ${time}`
}

export function formatRelative(ts: number): string {
  const diff = Date.now() - ts
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day === 1) return 'yesterday'
  if (day < 7) return `${day}d ago`
  return new Date(ts).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
}

/** "09:00" -> "9:00 AM" */
export function prettyTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`
}

export const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/** Adds minutes to "HH:MM", clamped inside a single day. */
export function addMinutes(hhmm: string, delta: number): string {
  const mins = Math.max(0, Math.min(23 * 60 + 55, toMinutes(hhmm) + delta))
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`
}

export function durationLabel(start: string, end: string): string {
  const mins = Math.max(0, toMinutes(end) - toMinutes(start))
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m === 0 ? `${h} hr` : `${h}h ${m}m`
}
