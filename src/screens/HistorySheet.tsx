import { Sheet } from '../components/Sheet'
import { useStore } from '../store/StoreContext'
import { useToast } from '../components/Toast'
import { formatRelative } from '../../shared/date'
import { tap } from '../lib/haptics'
import type { CSSProperties } from 'react'
import type { LogEntry } from '../../shared/types'
import { Ban, Check, Close, Pencil, Plus, Trash, Undo } from '../components/icons'
import { DANGER, WARN } from '../../shared/accents'
import { EmptyState } from '../components/EmptyState'

function glyphFor(entry: LogEntry) {
  switch (entry.kind) {
    case 'present':
      return <Check size={16} />
    case 'absent':
      return <Close size={16} />
    case 'cancelled':
      return <Ban size={15} />
    case 'create':
      return <Plus size={16} />
    case 'delete':
      return <Trash size={15} />
    case 'edit':
      return <Pencil size={15} />
    default:
      return <Undo size={15} />
  }
}

function toneFor(entry: LogEntry): string {
  if (entry.kind === 'absent' || entry.kind === 'delete') return DANGER.color
  if (entry.kind === 'cancelled') return WARN.color
  if (entry.kind === 'present') return 'var(--accent)'
  return 'var(--ink-soft)'
}

export function HistorySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch } = useStore()
  const toast = useToast()

  const changed = (entry: LogEntry) => entry.delta.attended !== 0 || entry.delta.missed !== 0

  return (
    <Sheet open={open} title="History" onClose={onClose}>
      {state.log.length === 0 ? (
        <EmptyState
          glyph={<Undo size={26} />}
          title="Nothing logged yet"
          text="Every change you make shows up here, and anything that moved your numbers can be undone."
        />
      ) : (
        <>
          <div className="list">
            {state.log.map((entry) => (
              <div
                className="log-item"
                key={entry.id}
                data-undone={entry.undone ? 'true' : 'false'}
                style={{ '--tone': toneFor(entry) } as CSSProperties}
              >
                <div className="log-item__glyph">{glyphFor(entry)}</div>
                <div>
                  <div className="log-item__title">
                    {entry.label} · {entry.subjectName}
                  </div>
                  <div className="log-item__sub">
                    {formatRelative(entry.ts)}
                    {entry.undone ? ' · undone' : ''}
                  </div>
                </div>
                {changed(entry) && !entry.undone ? (
                  <button
                    className="log-item__undo"
                    onClick={() => {
                      tap()
                      dispatch({ type: 'log/undo', id: entry.id })
                      toast({ message: `Reverted · ${entry.subjectName}` })
                    }}
                  >
                    Undo
                  </button>
                ) : null}
              </div>
            ))}
          </div>

          <button
            className="btn btn--block"
            style={{ marginTop: 14 }}
            onClick={() => {
              dispatch({ type: 'log/clear' })
              toast({ message: 'History cleared' })
            }}
          >
            Clear history
          </button>
          <p className="center-note">
            Clearing history only removes this list — your attendance numbers stay as they are.
          </p>
        </>
      )}
    </Sheet>
  )
}
