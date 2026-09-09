import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import type { ClassSlot, Subject } from '../shared/types'
import { StoreProvider, useStore } from './src/store/StoreContext'
import { ToastProvider } from './src/components/Toast'
import { AttendanceScreen } from './src/screens/AttendanceScreen'
import { TimetableScreen } from './src/screens/TimetableScreen'
import { SubjectSheet } from './src/screens/SubjectSheet'
import { ClassSheet } from './src/screens/ClassSheet'
import { SettingsSheet } from './src/screens/SettingsSheet'
import { HistorySheet } from './src/screens/HistorySheet'
import { accentTheme, colors, glow, radius } from './src/theme'
import { tap } from './src/haptics'
import { Cap, Grid } from './src/components/Icon'

type Tab = 'attendance' | 'timetable'

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <Shell />
      </StoreProvider>
    </SafeAreaProvider>
  )
}

function Shell() {
  const { state } = useStore()
  const theme = accentTheme(state.settings.accent)

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {/* Ambient accent wash behind the whole app, matching the web build. */}
      <LinearGradient
        colors={[`${theme.color}1f`, 'transparent']}
        style={styles.ambient}
        pointerEvents="none"
      />
      <ToastProvider accent={theme.color}>
        <Workspace />
      </ToastProvider>
    </View>
  )
}

function Workspace() {
  const { state } = useStore()
  const insets = useSafeAreaInsets()
  const theme = accentTheme(state.settings.accent)
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

      <View style={[styles.tabbar, { bottom: insets.bottom + 16 }]}>
        <TabButton
          label="Attendance"
          active={tab === 'attendance'}
          theme={theme}
          onPress={() => go('attendance')}
          icon={(color) => <Cap size={19} color={color} />}
        />
        <TabButton
          label="Timetable"
          active={tab === 'timetable'}
          theme={theme}
          onPress={() => go('timetable')}
          icon={(color) => <Grid size={19} color={color} />}
        />
      </View>

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

function TabButton({
  label,
  active,
  theme,
  onPress,
  icon,
}: {
  label: string
  active: boolean
  theme: ReturnType<typeof accentTheme>
  onPress: () => void
  icon: (color: string) => React.ReactNode
}) {
  const tint = active ? theme.onAccent : colors.inkMuted
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [styles.tab, pressed && { transform: [{ scale: 0.96 }] }]}
    >
      {active ? (
        <LinearGradient
          colors={[...theme.gradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: radius.pill }]}
        />
      ) : null}
      {icon(tint)}
      <Text style={[styles.tabLabel, { color: tint }]}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.base },
  ambient: { position: 'absolute', top: 0, left: 0, right: 0, height: 320 },
  tabbar: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 4,
    padding: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(20,22,27,0.94)',
    borderWidth: 1,
    borderColor: colors.lineStrong,
    ...glow('#000', 20, 0.5),
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 46,
    paddingHorizontal: 18,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  tabLabel: { fontSize: 13.5, fontWeight: '700', letterSpacing: -0.2 },
})
