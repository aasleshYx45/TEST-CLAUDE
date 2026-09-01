import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { Sheet } from '../components/Sheet'
import { ACCENTS } from '../../shared/accents'
import { DAY_SHORT, addMinutes, toMinutes, weekOrder } from '../../shared/date'
import { tap } from '../lib/haptics'
import { useStore } from '../store/StoreContext'
import { useToast } from '../components/Toast'
import type { ClassSlot } from '../../shared/types'
import { Trash } from '../components/icons'

type Props = {
  open: boolean
  slot: ClassSlot | null
  defaultDay: number
  onClose: () => void
}

export function ClassSheet({ open, slot, defaultDay, onClose }: Props) {
  const { state, dispatch } = useStore()
  const toast = useToast()
  const editing = slot !== null

  const [subjectId, setSubjectId] = useState('')
  const [day, setDay] = useState(defaultDay)
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('10:00')
  const [room, setRoom] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!open) return
    setSubjectId(slot?.subjectId ?? state.subjects[0]?.id ?? '')
    setDay(slot?.day ?? defaultDay)
    setStart(slot?.start ?? '09:00')
    setEnd(slot?.end ?? '10:00')
    setRoom(slot?.room ?? '')
    setConfirmDelete(false)
  }, [open, slot, defaultDay, state.subjects])

  // Keep the end time after the start time as the user edits.
  const onStartChange = (next: string) => {
    setStart(next)
    if (toMinutes(next) >= toMinutes(end)) setEnd(addMinutes(next, 60))
  }

  const valid = subjectId !== '' && toMinutes(end) > toMinutes(start)

  const save = () => {
    if (!valid) return
    tap(12)
    if (editing && slot) {
      dispatch({ type: 'slot/edit', id: slot.id, patch: { subjectId, day, start, end, room: room.trim() } })
      toast({ message: 'Class updated' })
    } else {
      dispatch({ type: 'slot/add', payload: { subjectId, day, start, end, room: room.trim() } })
      toast({ message: `Added to ${DAY_SHORT[day]}` })
    }
    onClose()
  }

  const remove = () => {
    if (!slot) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    tap([10, 40, 10])
    dispatch({ type: 'slot/delete', id: slot.id })
    toast({ message: 'Class removed' })
    onClose()
  }

  return (
    <Sheet open={open} title={editing ? 'Edit class' : 'New class'} onClose={onClose}>
      <div className="field">
        <span className="field__label">Subject</span>
        <div className="chips">
          {state.subjects.map((s) => (
            <button
              key={s.id}
              className="chip"
              data-on={subjectId === s.id}
              style={{ '--tone': ACCENTS[s.accent].color } as CSSProperties}
              onClick={() => {
                tap()
                setSubjectId(s.id)
              }}
              aria-pressed={subjectId === s.id}
            >
              <span className="chip__dot" />
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <span className="field__label">Day</span>
        <div className="days">
          {weekOrder(state.settings.weekStartsMonday).map((d) => (
            <button
              key={d}
              className="day"
              data-active={day === d}
              onClick={() => {
                tap()
                setDay(d)
              }}
              aria-pressed={day === d}
            >
              <span className="day__initial">{DAY_SHORT[d].slice(0, 2)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="field__row">
        <div className="field">
          <label className="field__label" htmlFor="class-start">
            Starts
          </label>
          <input
            id="class-start"
            type="time"
            className="field__input tnum"
            value={start}
            onChange={(e) => onStartChange(e.target.value)}
          />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="class-end">
            Ends
          </label>
          <input
            id="class-end"
            type="time"
            className="field__input tnum"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="class-room">
          Room <span style={{ textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
        </label>
        <input
          id="class-room"
          className="field__input"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="e.g. Lab 2"
          autoComplete="off"
          maxLength={20}
        />
      </div>

      <button className="btn btn--primary btn--block" onClick={save} disabled={!valid}>
        {editing ? 'Save changes' : 'Add class'}
      </button>

      {!valid && subjectId !== '' ? (
        <p className="center-note">The end time needs to be after the start time.</p>
      ) : null}

      {editing ? (
        <button className="btn btn--danger btn--block" style={{ marginTop: 10 }} onClick={remove}>
          <Trash size={17} />
          {confirmDelete ? 'Tap again to confirm' : 'Remove class'}
        </button>
      ) : null}
    </Sheet>
  )
}
