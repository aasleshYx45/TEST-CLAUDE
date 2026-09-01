import type { AppState, ClassSlot, LogEntry, LogKind, MarkStatus, Settings, Subject } from '../types'
import { uid } from '../lib/id'

export const STORAGE_KEY = 'attendly.state.v1'
const VERSION = 1

export const emptyState = (): AppState => ({
  version: VERSION,
  subjects: [],
  slots: [],
  marks: {},
  log: [],
  settings: {
    defaultRequirement: 75,
    weekStartsMonday: true,
    accent: 'lime',
    reduceGlow: false,
  },
  updatedAt: Date.now(),
})

export type Action =
  | { type: 'subject/add'; payload: Omit<Subject, 'id' | 'createdAt'> }
  | { type: 'subject/edit'; id: string; patch: Partial<Subject> }
  | { type: 'subject/delete'; id: string }
  | { type: 'subject/adjust'; id: string; field: 'attended' | 'missed'; delta: number }
  | { type: 'slot/add'; payload: Omit<ClassSlot, 'id'> }
  | { type: 'slot/edit'; id: string; patch: Partial<ClassSlot> }
  | { type: 'slot/delete'; id: string }
  | { type: 'mark/set'; slotId: string; date: string; status: MarkStatus }
  | { type: 'mark/clear'; slotId: string; date: string }
  | { type: 'log/undo'; id: string }
  | { type: 'log/clear' }
  | { type: 'settings/update'; patch: Partial<Settings> }
  | { type: 'state/replace'; state: AppState }
  | { type: 'state/reset' }

const clamp0 = (n: number) => (Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0)

function withLog(state: AppState, entry: Omit<LogEntry, 'id' | 'ts'>): LogEntry[] {
  const full: LogEntry = { ...entry, id: uid('log'), ts: Date.now() }
  return [full, ...state.log].slice(0, 200)
}

function applyDelta(subjects: Subject[], id: string, delta: { attended: number; missed: number }) {
  return subjects.map((s) =>
    s.id === id
      ? { ...s, attended: clamp0(s.attended + delta.attended), missed: clamp0(s.missed + delta.missed) }
      : s,
  )
}

const deltaFor = (status: MarkStatus) =>
  status === 'present'
    ? { attended: 1, missed: 0 }
    : status === 'absent'
      ? { attended: 0, missed: 1 }
      : { attended: 0, missed: 0 }

const statusLabel: Record<MarkStatus, string> = {
  present: 'Marked present',
  absent: 'Marked absent',
  cancelled: 'Class cancelled',
}

export function reducer(state: AppState, action: Action): AppState {
  const stamp = (next: AppState): AppState => ({ ...next, updatedAt: Date.now() })

  switch (action.type) {
    case 'subject/add': {
      const subject: Subject = { ...action.payload, id: uid('sub'), createdAt: Date.now() }
      return stamp({
        ...state,
        subjects: [...state.subjects, subject],
        log: withLog(state, {
          kind: 'create' as LogKind,
          subjectId: subject.id,
          subjectName: subject.name,
          label: 'Subject added',
          delta: { attended: 0, missed: 0 },
        }),
      })
    }

    case 'subject/edit': {
      const subject = state.subjects.find((s) => s.id === action.id)
      if (!subject) return state
      const patch = { ...action.patch }
      if (patch.attended !== undefined) patch.attended = clamp0(patch.attended)
      if (patch.missed !== undefined) patch.missed = clamp0(patch.missed)
      return stamp({
        ...state,
        subjects: state.subjects.map((s) => (s.id === action.id ? { ...s, ...patch } : s)),
        log: withLog(state, {
          kind: 'edit',
          subjectId: subject.id,
          subjectName: patch.name ?? subject.name,
          label: 'Subject updated',
          delta: { attended: 0, missed: 0 },
        }),
      })
    }

    case 'subject/delete': {
      const subject = state.subjects.find((s) => s.id === action.id)
      if (!subject) return state
      const removedSlots = new Set(state.slots.filter((c) => c.subjectId === action.id).map((c) => c.id))
      const marks = Object.fromEntries(
        Object.entries(state.marks).filter(([key]) => !removedSlots.has(key.split('|')[1])),
      )
      return stamp({
        ...state,
        subjects: state.subjects.filter((s) => s.id !== action.id),
        slots: state.slots.filter((c) => c.subjectId !== action.id),
        marks,
        log: withLog(state, {
          kind: 'delete',
          subjectId: subject.id,
          subjectName: subject.name,
          label: 'Subject removed',
          delta: { attended: 0, missed: 0 },
        }),
      })
    }

    case 'subject/adjust': {
      const subject = state.subjects.find((s) => s.id === action.id)
      if (!subject) return state
      // Ignore decrements that would go below zero so the log stays truthful.
      if (action.delta < 0 && subject[action.field] === 0) return state
      const delta =
        action.field === 'attended'
          ? { attended: action.delta, missed: 0 }
          : { attended: 0, missed: action.delta }
      const verb = action.delta > 0 ? 'Added' : 'Removed'
      return stamp({
        ...state,
        subjects: applyDelta(state.subjects, action.id, delta),
        log: withLog(state, {
          kind: 'adjust',
          subjectId: subject.id,
          subjectName: subject.name,
          label: `${verb} 1 ${action.field}`,
          delta,
        }),
      })
    }

    case 'slot/add':
      return stamp({ ...state, slots: [...state.slots, { ...action.payload, id: uid('slot') }] })

    case 'slot/edit':
      return stamp({
        ...state,
        slots: state.slots.map((c) => (c.id === action.id ? { ...c, ...action.patch } : c)),
      })

    case 'slot/delete': {
      const marks = Object.fromEntries(
        Object.entries(state.marks).filter(([key]) => key.split('|')[1] !== action.id),
      )
      return stamp({ ...state, slots: state.slots.filter((c) => c.id !== action.id), marks })
    }

    case 'mark/set': {
      const slot = state.slots.find((c) => c.id === action.slotId)
      if (!slot) return state
      const subject = state.subjects.find((s) => s.id === slot.subjectId)
      if (!subject) return state
      const key = `${action.date}|${action.slotId}`
      const previous = state.marks[key]
      if (previous === action.status) return state

      // Roll back whatever the previous mark contributed before applying the new one.
      const undoPrev = previous
        ? { attended: -deltaFor(previous).attended, missed: -deltaFor(previous).missed }
        : { attended: 0, missed: 0 }
      const next = deltaFor(action.status)
      const delta = { attended: undoPrev.attended + next.attended, missed: undoPrev.missed + next.missed }

      return stamp({
        ...state,
        subjects: applyDelta(state.subjects, subject.id, delta),
        marks: { ...state.marks, [key]: action.status },
        log: withLog(state, {
          kind: action.status,
          subjectId: subject.id,
          subjectName: subject.name,
          label: statusLabel[action.status],
          delta,
          markKey: key,
        }),
      })
    }

    case 'mark/clear': {
      const key = `${action.date}|${action.slotId}`
      const previous = state.marks[key]
      if (!previous) return state
      const slot = state.slots.find((c) => c.id === action.slotId)
      const subject = slot && state.subjects.find((s) => s.id === slot.subjectId)
      const { [key]: _removed, ...marks } = state.marks
      if (!subject) return stamp({ ...state, marks })
      const back = deltaFor(previous)
      const delta = { attended: -back.attended, missed: -back.missed }
      return stamp({
        ...state,
        subjects: applyDelta(state.subjects, subject.id, delta),
        marks,
        log: withLog(state, {
          kind: 'adjust',
          subjectId: subject.id,
          subjectName: subject.name,
          label: 'Mark cleared',
          delta,
        }),
      })
    }

    case 'log/undo': {
      const entry = state.log.find((e) => e.id === action.id)
      if (!entry || entry.undone) return state
      const revert = { attended: -entry.delta.attended, missed: -entry.delta.missed }
      const marks = { ...state.marks }
      if (entry.markKey) delete marks[entry.markKey]
      return stamp({
        ...state,
        subjects: applyDelta(state.subjects, entry.subjectId, revert),
        marks,
        log: state.log.map((e) => (e.id === action.id ? { ...e, undone: true } : e)),
      })
    }

    case 'log/clear':
      return stamp({ ...state, log: [] })

    case 'settings/update':
      return stamp({ ...state, settings: { ...state.settings, ...action.patch } })

    case 'state/replace':
      return stamp({ ...emptyState(), ...action.state, version: VERSION })

    case 'state/reset':
      return emptyState()

    default:
      return state
  }
}

export function loadState(): AppState {
  if (typeof localStorage === 'undefined') return emptyState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    const parsed = JSON.parse(raw) as Partial<AppState>
    const base = emptyState()
    return {
      ...base,
      ...parsed,
      settings: { ...base.settings, ...(parsed.settings ?? {}) },
      subjects: parsed.subjects ?? [],
      slots: parsed.slots ?? [],
      marks: parsed.marks ?? {},
      log: parsed.log ?? [],
    }
  } catch {
    return emptyState()
  }
}

export function saveState(state: AppState) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* storage may be unavailable or full; the session still works in memory */
  }
}
