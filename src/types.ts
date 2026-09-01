export type AccentKey = 'lime' | 'cyan' | 'violet' | 'amber' | 'rose'

export type Subject = {
  id: string
  name: string
  code: string
  accent: AccentKey
  attended: number
  missed: number
  requirement: number // 0-100
  createdAt: number
}

/** A recurring class on the weekly timetable. day: 0 = Sunday … 6 = Saturday */
export type ClassSlot = {
  id: string
  subjectId: string
  day: number
  start: string // "09:00"
  end: string // "10:00"
  room: string
}

export type MarkStatus = 'present' | 'absent' | 'cancelled'

/** Marks keyed by `${isoDate}|${slotId}` so a day's timetable knows what is already logged. */
export type MarkMap = Record<string, MarkStatus>

export type LogKind =
  | 'present'
  | 'absent'
  | 'cancelled'
  | 'adjust'
  | 'create'
  | 'delete'
  | 'edit'

export type LogEntry = {
  id: string
  ts: number
  kind: LogKind
  subjectId: string
  subjectName: string
  label: string
  /** How this entry changed the counters, so it can be reverted. */
  delta: { attended: number; missed: number }
  markKey?: string
  undone?: boolean
}

export type Settings = {
  defaultRequirement: number
  weekStartsMonday: boolean
  accent: AccentKey
  reduceGlow: boolean
}

export type AppState = {
  version: number
  subjects: Subject[]
  slots: ClassSlot[]
  marks: MarkMap
  log: LogEntry[]
  settings: Settings
  updatedAt: number
}
