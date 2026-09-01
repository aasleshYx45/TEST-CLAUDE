import { useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { Subject } from '../../../shared/types'
import { overall, percent, total } from '../../../shared/attendance'
import { formatHeaderDate, formatUpdated } from '../../../shared/date'
import { useStore } from '../store/StoreContext'
import { accentTheme, colors, glow, radius } from '../theme'
import { tap } from '../haptics'
import { SubjectCard } from '../components/SubjectCard'
import { EmptyState } from '../components/EmptyState'
import { AnimatedNumber } from '../components/AnimatedNumber'
import { Button } from '../components/Button'
import { useToast } from '../components/Toast'
import { Cap, Gear, History, Plus } from '../components/Icon'

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
  const insets = useSafeAreaInsets()
  const [filter, setFilter] = useState<Filter>('all')
  const theme = accentTheme(state.settings.accent)
  const lit = !state.settings.reduceGlow

  const stats = useMemo(() => overall(state.subjects), [state.subjects])

  const visible = useMemo(() => {
    if (filter === 'risk') {
      return state.subjects.filter((s) => total(s) > 0 && percent(s) + 1e-9 < s.requirement)
    }
    if (filter === 'safe') {
      return state.subjects.filter((s) => total(s) === 0 || percent(s) + 1e-9 >= s.requirement)
    }
    return state.subjects
  }, [state.subjects, filter])

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <View style={styles.headerRow}>
          <Text style={styles.eyebrow}>{formatHeaderDate()}</Text>
          <View style={styles.actions}>
            <IconButton label="History" onPress={onOpenHistory}>
              <History color={colors.inkSoft} />
            </IconButton>
            <IconButton label="Settings" onPress={onOpenSettings}>
              <Gear color={colors.inkSoft} />
            </IconButton>
            <IconButton label="Add subject" onPress={onAddSubject}>
              <Plus color={theme.color} />
            </IconButton>
          </View>
        </View>

        <Text style={styles.title}>Your attendance</Text>
        <Text style={styles.sub}>
          {state.subjects.length === 0
            ? 'Add a subject to start tracking'
            : `Updated ${formatUpdated(state.updatedAt)}`}
        </Text>

        <View style={styles.rail}>
          <LinearGradient
            colors={[...theme.gradient]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.railFill, { width: `${Math.max(2, stats.percent)}%` }, glow(theme.color, 8, 0.7, lit)]}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summary}>
          <Tile value={stats.attended} label="Attended" />
          <Tile value={stats.missed} label="Missed" color={stats.missed > 0 ? colors.warn : undefined} />
          <Tile value={Math.round(stats.percent)} suffix="%" label="Overall" color={theme.color} />
        </View>

        {state.subjects.length === 0 ? (
          <EmptyState
            glyph={<Cap size={30} color={theme.color} />}
            title="No subjects yet"
            text="Add your first subject and Attendly will track how many classes you can afford to miss."
            action={
              <Button
                label="Add a subject"
                onPress={onAddSubject}
                variant="primary"
                gradient={theme.gradient}
                onAccent={theme.onAccent}
                icon={<Plus size={18} color={theme.onAccent} />}
                style={{ paddingHorizontal: 22 }}
              />
            }
          />
        ) : (
          <>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Subjects</Text>
              <Text style={styles.sectionMeta}>
                {stats.atRisk > 0 ? `${stats.atRisk} below requirement` : 'All above requirement'}
              </Text>
            </View>

            {state.subjects.length >= 3 ? (
              <View style={styles.segmented}>
                {(['all', 'risk', 'safe'] as Filter[]).map((key) => (
                  <Pressable
                    key={key}
                    onPress={() => {
                      tap()
                      setFilter(key)
                    }}
                    style={[styles.segment, filter === key && styles.segmentOn]}
                  >
                    <Text style={[styles.segmentText, filter === key && styles.segmentTextOn]}>
                      {key === 'all' ? 'All' : key === 'risk' ? 'At risk' : 'On track'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            {visible.length === 0 ? (
              <Text style={styles.note}>Nothing in this filter right now.</Text>
            ) : (
              <View style={styles.stack}>
                {visible.map((subject) => (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    dim={!lit}
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
              </View>
            )}

            <Text style={styles.note}>
              {stats.total === 0
                ? 'Tap + on a subject, or mark classes straight from your timetable.'
                : `${stats.total} classes logged across ${state.subjects.length} subject${state.subjects.length === 1 ? '' : 's'}.`}
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  )
}

function IconButton({
  label,
  onPress,
  children,
}: {
  label: string
  onPress: () => void
  children: React.ReactNode
}) {
  return (
    <Pressable
      onPress={() => {
        tap()
        onPress()
      }}
      accessibilityLabel={label}
      style={({ pressed }) => [styles.iconBtn, pressed && { transform: [{ scale: 0.9 }] }]}
    >
      {children}
    </Pressable>
  )
}

function Tile({
  value,
  label,
  suffix = '',
  color,
}: {
  value: number
  label: string
  suffix?: string
  color?: string
}) {
  return (
    <View style={styles.tile}>
      <AnimatedNumber value={value} suffix={suffix} style={[styles.tileValue, color ? { color } : null]} />
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 18, paddingBottom: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 42 },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: colors.inkMuted,
    textTransform: 'uppercase',
  },
  actions: { flexDirection: 'row', gap: 9 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 32, fontWeight: '800', color: colors.ink, letterSpacing: -1.2, marginTop: 6 },
  sub: { fontSize: 12.5, color: colors.inkMuted, marginTop: 5 },
  rail: { height: 5, borderRadius: radius.pill, backgroundColor: colors.surface2, marginTop: 16, overflow: 'hidden' },
  railFill: { height: '100%', borderRadius: radius.pill },
  scroll: { paddingHorizontal: 18 },
  summary: { flexDirection: 'row', gap: 10, marginTop: 18 },
  tile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 13,
    borderRadius: radius.md,
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.line,
  },
  tileValue: { fontSize: 26, fontWeight: '800', color: colors.ink, letterSpacing: -1 },
  tileLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: colors.inkMuted,
    marginTop: 3,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 26,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.inkMuted,
  },
  sectionMeta: { fontSize: 12.5, color: colors.inkFaint },
  segmented: {
    flexDirection: 'row',
    gap: 3,
    padding: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 14,
  },
  segment: { flex: 1, height: 34, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  segmentOn: { backgroundColor: colors.surface3 },
  segmentText: { fontSize: 13, fontWeight: '700', color: colors.inkMuted },
  segmentTextOn: { color: colors.ink },
  stack: { gap: 13 },
  note: { textAlign: 'center', fontSize: 12.5, color: colors.inkFaint, paddingHorizontal: 20, paddingTop: 22, lineHeight: 19 },
})
