import { useMemo, useState } from 'react'
import { useStore } from '../store/StoreContext'
import { overall, percent, total } from '../lib/attendance'
import { formatHeaderDate, formatUpdated } from '../lib/date'
import { tap } from '../lib/haptics'
import { SubjectCard } from '../components/SubjectCard'
import { EmptyState } from '../components/EmptyState'
import { AnimatedNumber } from '../components/AnimatedNumber'
import { useToast } from '../components/Toast'
import { Cap, Gear, History, Plus } from '../components/icons'
import type { Subject } from '../types'

type Filter = 'all' | 'risk' | 'safe'

type Props = {
  onAddSubject: () => void
  onEditSubject: (subject: Subject) => void
  onOpenSettings: () => void
  onOpenHistory: () => void
}

export function AttendanceScreen({ onAddSubject, onEditSubject, onOpenSettings, onOpenHistory }: Props) {
  const { state, dispatch } = useStore()
  const toast = useToast()
  const [filter, setFilter] = useState<Filter>('all')

  const stats = useMemo(() => overall(state.subjects), [state.subjects])

  const visible = useMemo(() => {
    const list = [...state.subjects]
    if (filter === 'risk') {
      return list.filter((s) => total(s) > 0 && percent(s) + 1e-9 < s.requirement)
    }
    if (filter === 'safe') {
      return list.filter((s) => total(s) === 0 || percent(s) + 1e-9 >= s.requirement)
    }
    return list
  }, [state.subjects, filter])

  return (
    <div className="screen">
      <header className="appbar">
        <div className="appbar__row">
          <div className="appbar__eyebrow">{formatHeaderDate()}</div>
          <div className="appbar__actions">
            <button className="icon-btn icon-btn--ghost" onClick={onOpenHistory} aria-label="History">
              <History />
            </button>
            <button className="icon-btn icon-btn--ghost" onClick={onOpenSettings} aria-label="Settings">
              <Gear />
            </button>
            <button className="icon-btn" onClick={onAddSubject} aria-label="Add subject">
              <Plus />
            </button>
          </div>
        </div>
        <h1 className="appbar__title">Your attendance</h1>
        <div className="appbar__sub">
          {state.subjects.length === 0
            ? 'Add a subject to start tracking'
            : `Updated ${formatUpdated(state.updatedAt)}`}
        </div>
      </header>

      <div className="rail" aria-hidden>
        <div className="rail__fill" style={{ width: `${Math.max(2, stats.percent)}%` }} />
      </div>

      <div className="shell__scroll">
        <section className="summary" aria-label="Overall totals">
          <div className="tile">
            <div className="tile__value tnum">
              <AnimatedNumber value={stats.attended} />
            </div>
            <div className="tile__label">Attended</div>
          </div>
          <div className={`tile ${stats.missed > 0 ? 'tile--warn' : ''}`}>
            <div className="tile__value tnum">
              <AnimatedNumber value={stats.missed} />
            </div>
            <div className="tile__label">Missed</div>
          </div>
          <div className="tile tile--accent">
            <div className="tile__value tnum">
              <AnimatedNumber value={Math.round(stats.percent)} />%
            </div>
            <div className="tile__label">Overall</div>
          </div>
        </section>

        {state.subjects.length === 0 ? (
          <EmptyState
            glyph={<Cap size={30} />}
            title="No subjects yet"
            text="Add your first subject and Attendly will track how many classes you can afford to miss."
            action={
              <button className="btn btn--primary" onClick={onAddSubject}>
                <Plus size={18} /> Add a subject
              </button>
            }
          />
        ) : (
          <>
            <div className="section-head">
              <h2 className="section-head__title">Subjects</h2>
              <span className="section-head__meta">
                {stats.atRisk > 0 ? `${stats.atRisk} below requirement` : 'All above requirement'}
              </span>
            </div>

            {state.subjects.length >= 3 ? (
              <div className="segmented" style={{ marginBottom: 14 }} role="tablist">
                {(['all', 'risk', 'safe'] as Filter[]).map((key) => (
                  <button
                    key={key}
                    role="tab"
                    aria-selected={filter === key}
                    className="segmented__item"
                    data-on={filter === key}
                    onClick={() => {
                      tap()
                      setFilter(key)
                    }}
                  >
                    {key === 'all' ? 'All' : key === 'risk' ? 'At risk' : 'On track'}
                  </button>
                ))}
              </div>
            ) : null}

            {visible.length === 0 ? (
              <p className="center-note">Nothing in this filter right now.</p>
            ) : (
              <div className="stack">
                {visible.map((subject, i) => (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    index={i}
                    onEdit={() => onEditSubject(subject)}
                    onAdjust={(field, delta) => {
                      dispatch({ type: 'subject/adjust', id: subject.id, field, delta })
                      if (delta > 0) {
                        toast({
                          message: `${field === 'attended' ? 'Attended' : 'Missed'} +1 · ${subject.name}`,
                          actionLabel: 'Undo',
                          onAction: () =>
                            dispatch({ type: 'subject/adjust', id: subject.id, field, delta: -1 }),
                        })
                      }
                    }}
                  />
                ))}
              </div>
            )}

            <p className="center-note">
              {stats.total === 0
                ? 'Tap + on a subject, or mark classes straight from your timetable.'
                : `${stats.total} classes logged across ${state.subjects.length} subject${state.subjects.length === 1 ? '' : 's'}.`}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
