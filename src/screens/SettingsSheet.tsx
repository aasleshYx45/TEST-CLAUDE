import { useRef, useState } from 'react'
import { Sheet } from '../components/Sheet'
import { Switch } from '../components/Switch'
import { useStore } from '../store/StoreContext'
import { useToast } from '../components/Toast'
import { ACCENTS, ACCENT_KEYS } from '../lib/accents'
import { overall } from '../lib/attendance'
import { tap } from '../lib/haptics'
import type { AccentKey, AppState } from '../types'
import { Download, Trash, Upload } from '../components/icons'

const REQUIREMENTS = [60, 65, 70, 75, 80, 85]

export function SettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch } = useStore()
  const toast = useToast()
  const fileInput = useRef<HTMLInputElement>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const stats = overall(state.subjects)

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendly-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast({ message: 'Backup downloaded' })
  }

  const importData = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as AppState
      if (!Array.isArray(parsed.subjects)) throw new Error('not an Attendly backup')
      dispatch({ type: 'state/replace', state: parsed })
      toast({ message: `Restored ${parsed.subjects.length} subjects` })
      onClose()
    } catch {
      toast({ message: "That file doesn't look like an Attendly backup" })
    }
  }

  return (
    <Sheet open={open} title="Settings" onClose={onClose}>
      <div className="field">
        <span className="field__label">Default requirement</span>
        <div className="segmented">
          {REQUIREMENTS.map((r) => (
            <button
              key={r}
              className="segmented__item"
              data-on={state.settings.defaultRequirement === r}
              onClick={() => {
                tap()
                dispatch({ type: 'settings/update', patch: { defaultRequirement: r } })
              }}
            >
              {r}%
            </button>
          ))}
        </div>
        <p className="row__sub">Used for new subjects. Existing subjects keep their own target.</p>
      </div>

      <div className="field">
        <span className="field__label">Accent</span>
        <div className="swatches">
          {ACCENT_KEYS.map((key: AccentKey) => (
            <button
              key={key}
              className="swatch"
              data-on={state.settings.accent === key}
              style={{ color: ACCENTS[key].color }}
              aria-label={ACCENTS[key].label}
              aria-pressed={state.settings.accent === key}
              onClick={() => {
                tap()
                dispatch({ type: 'settings/update', patch: { accent: key } })
              }}
            >
              <span
                className="swatch__dot"
                style={{ background: ACCENTS[key].color, boxShadow: `0 0 14px ${ACCENTS[key].glow}` }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="list">
        <div className="row">
          <div>
            <div className="row__title">Start week on Monday</div>
            <div className="row__sub">Changes the order of the timetable day picker.</div>
          </div>
          <Switch
            label="Start week on Monday"
            checked={state.settings.weekStartsMonday}
            onChange={(v) => dispatch({ type: 'settings/update', patch: { weekStartsMonday: v } })}
          />
        </div>
        <div className="row">
          <div>
            <div className="row__title">Reduce glow</div>
            <div className="row__sub">Turns off the soft light bloom behind rings and buttons.</div>
          </div>
          <Switch
            label="Reduce glow"
            checked={state.settings.reduceGlow}
            onChange={(v) => dispatch({ type: 'settings/update', patch: { reduceGlow: v } })}
          />
        </div>
      </div>

      <div className="section-head">
        <h3 className="section-head__title">Your data</h3>
        <span className="section-head__meta">Stored on this device only</span>
      </div>

      <div className="field__row">
        <button className="btn" onClick={exportData}>
          <Download size={17} /> Export
        </button>
        <button className="btn" onClick={() => fileInput.current?.click()}>
          <Upload size={17} /> Import
        </button>
      </div>
      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void importData(file)
          e.target.value = ''
        }}
      />

      <button
        className="btn btn--danger btn--block"
        style={{ marginTop: 10 }}
        onClick={() => {
          if (!confirmReset) {
            setConfirmReset(true)
            return
          }
          dispatch({ type: 'state/reset' })
          setConfirmReset(false)
          toast({ message: 'Everything cleared' })
          onClose()
        }}
      >
        <Trash size={17} />
        {confirmReset ? 'Tap again to erase everything' : 'Reset all data'}
      </button>

      <section className="summary" style={{ marginTop: 22 }}>
        <div className="tile">
          <div className="tile__value tnum">{stats.attended}</div>
          <div className="tile__label">Attended</div>
        </div>
        <div className="tile">
          <div className="tile__value tnum">{stats.missed}</div>
          <div className="tile__label">Missed</div>
        </div>
        <div className="tile tile--accent">
          <div className="tile__value tnum">{Math.round(stats.percent)}%</div>
          <div className="tile__label">Overall</div>
        </div>
      </section>

      <p className="center-note">
        Attendly keeps everything in this browser — nothing is uploaded. Export a backup before clearing
        your browser data.
      </p>
    </Sheet>
  )
}
