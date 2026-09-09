import { useEffect, useState } from 'react'
import { AttendanceScreen } from './screens/AttendanceScreen'
import { TimetableScreen } from './screens/TimetableScreen'
import { SubjectSheet } from './screens/SubjectSheet'
import { ClassSheet } from './screens/ClassSheet'
import { SettingsSheet } from './screens/SettingsSheet'
import { HistorySheet } from './screens/HistorySheet'
import { ToastProvider } from './components/Toast'
import { StoreProvider, useStore } from './store/StoreContext'
import { tap } from './lib/haptics'
import { Cap, Grid } from './components/icons'
import type { ClassSlot, Subject } from '../shared/types'

type Tab = 'attendance' | 'timetable'

export default function App() {
  return (
    <StoreProvider>
      <div className="ambient" aria-hidden />
      <div className="shell">
        <ToastProvider>
          <Workspace />
        </ToastProvider>
      </div>
    </StoreProvider>
  )
}

function Workspace() {
  const { state } = useStore()
  const [tab, setTab] = useState<Tab>('attendance')

  const [subjectSheet, setSubjectSheet] = useState<{ open: boolean; subject: Subject | null }>({
    open: false,
    subject: null,
  })
  const [classSheet, setClassSheet] = useState<{ open: boolean; slot: ClassSlot | null; day: number }>({
    open: false,
    slot: null,
    day: new Date().getDay(),
  })
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

  // Theme lives on <html> so the tokens cascade everywhere, browser chrome included.
  useEffect(() => {
    const root = document.documentElement
    root.dataset.accent = state.settings.accent
    root.dataset.glow = state.settings.reduceGlow ? 'off' : 'on'
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0a0b0e')
  }, [state.settings.accent, state.settings.reduceGlow])

  const go = (next: Tab) => {
    if (next === tab) return
    tap()
    setTab(next)
  }

  return (
    <>
      {tab === 'attendance' ? (
        <AttendanceScreen
          onAddSubject={() => setSubjectSheet({ open: true, subject: null })}
          onEditSubject={(subject) => setSubjectSheet({ open: true, subject })}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenHistory={() => setHistoryOpen(true)}
        />
      ) : (
        <TimetableScreen
          onAddClass={(day) => {
            // A class has to belong to a subject, so send first-timers to the
            // subject form rather than a class form with nothing to pick.
            if (state.subjects.length === 0) {
              setSubjectSheet({ open: true, subject: null })
              return
            }
            setClassSheet({ open: true, slot: null, day })
          }}
          onAddSubject={() => setSubjectSheet({ open: true, subject: null })}
          onEditClass={(slot) => setClassSheet({ open: true, slot, day: slot.day })}
        />
      )}

      <nav className="tabbar" aria-label="Sections">
        <button
          className="tabbar__item"
          data-active={tab === 'attendance'}
          onClick={() => go('attendance')}
          aria-current={tab === 'attendance' ? 'page' : undefined}
        >
          <Cap size={19} />
          Attendance
        </button>
        <button
          className="tabbar__item"
          data-active={tab === 'timetable'}
          onClick={() => go('timetable')}
          aria-current={tab === 'timetable' ? 'page' : undefined}
        >
          <Grid size={19} />
          Timetable
        </button>
      </nav>

      <SubjectSheet
        open={subjectSheet.open}
        subject={subjectSheet.subject}
        onClose={() => setSubjectSheet({ open: false, subject: null })}
      />
      <ClassSheet
        open={classSheet.open}
        slot={classSheet.slot}
        defaultDay={classSheet.day}
        onClose={() => setClassSheet((s) => ({ ...s, open: false, slot: null }))}
      />
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <HistorySheet open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </>
  )
}
