import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { useStore } from '../store/StoreContext'
import type { ClassSlot, MarkStatus } from '../../shared/types'
import { DAY_INITIAL, DAY_NAMES, durationLabel, isoDate, prettyTime, toMinutes, weekOrder } from '../../shared/date'
import { dateOfDayThisWeek, isFuture, isToday } from '../../shared/week'
import { ACCENTS } from '../../shared/accents'
import { tap } from '../lib/haptics'
import { EmptyState } from '../components/EmptyState'
import { useToast } from '../components/Toast'
import { Ban, Check, Clock, Close, Grid, Pin, Plus } from '../components/icons'

type Props = {
  onAddClass: (day: number) => void
  onAddSubject: () => void
  onEditClass: (slot: ClassSlot) => void
}

export function TimetableScreen({ onAddClass, onAddSubject, onEditClass }: Props) {
  const { state, dispatch } = useStore()
  const toast = useToast()
  const [day, setDay] = useState(() => new Date().getDay())

  const order = weekOrder(state.settings.weekStartsMonday)
  const date = useMemo(
    () => dateOfDayThisWeek(day, state.settings.weekStartsMonday),
    [day, state.settings.weekStartsMonday],
  )
  const dateKey = isoDate(date)
  const upcoming = isFuture(date)

  const byDay = useMemo(() => {
    const map = new Map<number, ClassSlot[]>()
    for (const slot of state.slots) {
      const list = map.get(slot.day) ?? []
      list.push(slot)
      map.set(slot.day, list)
    }
    for (const list of map.values()) list.sort((a, b) => toMinutes(a.start) - toMinutes(b.start))
    return map
  }, [state.slots])

  const lessons = byDay.get(day) ?? []
  const subjectOf = (id: string) => state.subjects.find((s) => s.id === id)

  const setMark = (slot: ClassSlot, status: MarkStatus) => {
    const key = `${dateKey}|${slot.id}`
    tap()
    if (state.marks[key] === status) {
      dispatch({ type: 'mark/clear', slotId: slot.id, date: dateKey })
      return
    }
    dispatch({ type: 'mark/set', slotId: slot.id, date: dateKey, status })
    const name = subjectOf(slot.subjectId)?.name ?? 'Class'
    toast({
      message:
        status === 'present'
          ? `${name} marked present`
          : status === 'absent'
            ? `${name} marked absent`
            : `${name} cancelled — no effect on your %`,
      actionLabel: 'Undo',
      onAction: () => dispatch({ type: 'mark/clear', slotId: slot.id, date: dateKey }),
    })
  }

  return (
    <div className="screen">
      <header className="appbar">
        <div className="appbar__row">
          <div className="appbar__eyebrow">
            {date
              .toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
              .toUpperCase()}
          </div>
          <div className="appbar__actions">
            <button className="icon-btn" onClick={() => onAddClass(day)} aria-label="Add class">
              <Plus />
            </button>
          </div>
        </div>
        <h1 className="appbar__title">{DAY_NAMES[day]}</h1>
        <div className="appbar__sub">
          {lessons.length === 0
            ? 'Nothing scheduled'
            : `${lessons.length} class${lessons.length === 1 ? '' : 'es'}${isToday(date) ? ' today' : ''}`}
        </div>
      </header>

      <nav className="days" style={{ margin: '0 18px' }} aria-label="Day of week">
        {order.map((d) => {
          const dayDate = dateOfDayThisWeek(d, state.settings.weekStartsMonday)
          return (
            <button
              key={d}
              className="day"
              data-active={d === day}
              data-today={isToday(dayDate)}
              data-has={(byDay.get(d) ?? []).length > 0}
              onClick={() => {
                tap()
                setDay(d)
              }}
              aria-label={DAY_NAMES[d]}
              aria-current={d === day ? 'true' : undefined}
            >
              <span className="day__initial">{DAY_INITIAL[d]}</span>
              <span className="day__count" />
            </button>
          )
        })}
      </nav>

      <div className="shell__scroll" style={{ paddingTop: 18 }}>
        {state.subjects.length === 0 ? (
          <EmptyState
            glyph={<Grid size={30} />}
            title="Add a subject first"
            text="Your timetable is built from your subjects, so start by creating one."
            action={
              <button className="btn btn--primary btn--sm" onClick={onAddSubject}>
                <Plus size={16} /> Add a subject
              </button>
            }
          />
        ) : lessons.length === 0 ? (
          <EmptyState
            glyph={<Clock size={30} />}
            title={`No classes on ${DAY_NAMES[day]}`}
            text="Schedule a class and you can mark attendance for it with a single tap."
            action={
              <button className="btn btn--primary btn--sm" onClick={() => onAddClass(day)}>
                <Plus size={16} /> Add a class
              </button>
            }
          />
        ) : (
          <div className="stack">
            {lessons.map((slot, i) => {
              const subject = subjectOf(slot.subjectId)
              if (!subject) return null
              const accent = ACCENTS[subject.accent]
              const mark = state.marks[`${dateKey}|${slot.id}`]
              const style = {
                '--tone': accent.color,
                '--tone-glow': accent.glow,
                animationDelay: `${Math.min(i, 8) * 40}ms`,
              } as CSSProperties

              return (
                <div className="lesson" key={slot.id} style={style}>
                  <div className="lesson__time">
                    <div className="lesson__start tnum">{prettyTime(slot.start)}</div>
                    <div className="lesson__end tnum">{prettyTime(slot.end)}</div>
                  </div>

                  <div className="lesson__body">
                    <button
                      className="lesson__titleBtn"
                      onClick={() => onEditClass(slot)}
                      aria-label={`Edit ${subject.name} class`}
                    >
                      <span className="lesson__title">{subject.name}</span>
                    </button>
                    <div className="lesson__meta">
                      <span>{durationLabel(slot.start, slot.end)}</span>
                      {slot.room ? (
                        <>
                          <span className="lesson__dot" />
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Pin size={12} /> {slot.room}
                          </span>
                        </>
                      ) : null}
                    </div>

                    {upcoming ? (
                      <p className="lesson__locked">Upcoming — you can mark this on the day.</p>
                    ) : (
                      <div className="lesson__marks">
                        <button
                          className="mark-btn"
                          data-on={mark === 'present' ? 'present' : undefined}
                          onClick={() => setMark(slot, 'present')}
                        >
                          <Check size={14} /> Present
                        </button>
                        <button
                          className="mark-btn"
                          data-on={mark === 'absent' ? 'absent' : undefined}
                          onClick={() => setMark(slot, 'absent')}
                        >
                          <Close size={14} /> Absent
                        </button>
                        <button
                          className="mark-btn"
                          data-on={mark === 'cancelled' ? 'cancelled' : undefined}
                          onClick={() => setMark(slot, 'cancelled')}
                        >
                          <Ban size={13} /> Off
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            <p className="center-note">
              Tapping a class name lets you edit or remove it. “Off” records a cancelled class without
              touching your percentage.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
