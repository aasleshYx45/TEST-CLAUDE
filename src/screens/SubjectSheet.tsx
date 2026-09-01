import { useEffect, useState } from 'react'
import { Sheet } from '../components/Sheet'
import { Stepper } from '../components/Stepper'
import { ACCENTS, ACCENT_KEYS } from '../../shared/accents'
import { tap } from '../lib/haptics'
import { useStore } from '../store/StoreContext'
import { useToast } from '../components/Toast'
import type { AccentKey, Subject } from '../../shared/types'
import { Trash } from '../components/icons'

type Props = { open: boolean; subject: Subject | null; onClose: () => void }

export function SubjectSheet({ open, subject, onClose }: Props) {
  const { state, dispatch } = useStore()
  const toast = useToast()
  const editing = subject !== null

  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [accent, setAccent] = useState<AccentKey>('lime')
  const [attended, setAttended] = useState(0)
  const [missed, setMissed] = useState(0)
  const [requirement, setRequirement] = useState(75)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Reload the form whenever the sheet is opened for a different subject.
  useEffect(() => {
    if (!open) return
    setName(subject?.name ?? '')
    setCode(subject?.code ?? '')
    setAccent(subject?.accent ?? state.settings.accent)
    setAttended(subject?.attended ?? 0)
    setMissed(subject?.missed ?? 0)
    setRequirement(subject?.requirement ?? state.settings.defaultRequirement)
    setConfirmDelete(false)
  }, [open, subject, state.settings.accent, state.settings.defaultRequirement])

  const trimmed = name.trim()
  const canSave = trimmed.length > 0

  const save = () => {
    if (!canSave) return
    tap(12)
    if (editing && subject) {
      dispatch({
        type: 'subject/edit',
        id: subject.id,
        patch: { name: trimmed, code: code.trim(), accent, attended, missed, requirement },
      })
      toast({ message: `${trimmed} updated` })
    } else {
      dispatch({
        type: 'subject/add',
        payload: { name: trimmed, code: code.trim(), accent, attended, missed, requirement },
      })
      toast({ message: `${trimmed} added` })
    }
    onClose()
  }

  const remove = () => {
    if (!subject) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    tap([10, 40, 10])
    dispatch({ type: 'subject/delete', id: subject.id })
    toast({ message: `${subject.name} removed` })
    onClose()
  }

  return (
    <Sheet open={open} title={editing ? 'Edit subject' : 'New subject'} onClose={onClose}>
      <div className="field">
        <label className="field__label" htmlFor="subject-name">
          Subject name
        </label>
        <input
          id="subject-name"
          className="field__input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Operating Systems"
          autoComplete="off"
          maxLength={40}
        />
      </div>

      <div className="field">
        <label className="field__label" htmlFor="subject-code">
          Short code <span style={{ textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
        </label>
        <input
          id="subject-code"
          className="field__input"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. CS-204"
          autoComplete="off"
          maxLength={12}
        />
      </div>

      <div className="field">
        <span className="field__label">Colour</span>
        <div className="swatches">
          {ACCENT_KEYS.map((key) => (
            <button
              key={key}
              className="swatch"
              data-on={accent === key}
              style={{ color: ACCENTS[key].color }}
              onClick={() => {
                tap()
                setAccent(key)
              }}
              aria-label={ACCENTS[key].label}
              aria-pressed={accent === key}
            >
              <span
                className="swatch__dot"
                style={{ background: ACCENTS[key].color, boxShadow: `0 0 14px ${ACCENTS[key].glow}` }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <span className="field__label">Starting counts</span>
        <div className="steppers">
          <Stepper label="Attended" value={attended} onChange={setAttended} max={999} />
          <Stepper label="Missed" value={missed} onChange={setMissed} max={999} />
          <Stepper
            label="Required"
            value={requirement}
            display={`${requirement}%`}
            min={0}
            max={100}
            step={5}
            onChange={setRequirement}
          />
        </div>
      </div>

      <button className="btn btn--primary btn--block" onClick={save} disabled={!canSave}>
        {editing ? 'Save changes' : 'Add subject'}
      </button>

      {editing ? (
        <button className="btn btn--danger btn--block" style={{ marginTop: 10 }} onClick={remove}>
          <Trash size={17} />
          {confirmDelete ? 'Tap again to confirm' : 'Delete subject'}
        </button>
      ) : null}

      {editing ? (
        <p className="center-note">Deleting a subject also removes its timetable classes.</p>
      ) : null}
    </Sheet>
  )
}
