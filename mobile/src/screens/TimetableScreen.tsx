import { useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { ClassSlot, MarkStatus } from '../../../shared/types'
import {
  DAY_INITIAL,
  DAY_NAMES,
  durationLabel,
  isoDate,
  prettyTime,
  toMinutes,
  weekOrder,
} from '../../../shared/date'
import { dateOfDayThisWeek, isFuture, isToday } from '../../../shared/week'
import { ACCENTS } from '../../../shared/accents'
import { useStore } from '../store/StoreContext'
import { accentTheme, colors, glow, radius } from '../theme'
import { tap } from '../haptics'
import { EmptyState } from '../components/EmptyState'
import { Button } from '../components/Button'
import { useToast } from '../components/Toast'
import { Ban, Check, Clock, Close, Grid, Pin, Plus } from '../components/Icon'

type Props = {
  onAddClass: (day: number) => void
  onAddSubject: () => void
  onEditClass: (slot: ClassSlot) => void
}

export function TimetableScreen({ onAddClass, onAddSubject, onEditClass }: Props) {
  const { state, dispatch } = useStore()
  const toast = useToast()
  const insets = useSafeAreaInsets()
  const [day, setDay] = useState(() => new Date().getDay())
  const theme = accentTheme(state.settings.accent)
  const lit = !state.settings.reduceGlow

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
    tap()
    if (state.marks[`${dateKey}|${slot.id}`] === status) {
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
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <View style={styles.headerRow}>
          <Text style={styles.eyebrow}>
            {date
              .toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
              .toUpperCase()}
          </Text>
          <Pressable
            onPress={() => {
              tap()
              onAddClass(day)
            }}
            accessibilityLabel="Add class"
            style={({ pressed }) => [styles.iconBtn, pressed && { transform: [{ scale: 0.9 }] }]}
          >
            <Plus color={theme.color} />
          </Pressable>
        </View>

        <Text style={styles.title}>{DAY_NAMES[day]}</Text>
        <Text style={styles.sub}>
          {lessons.length === 0
            ? 'Nothing scheduled'
            : `${lessons.length} class${lessons.length === 1 ? '' : 'es'}${isToday(date) ? ' today' : ''}`}
        </Text>

        <View style={styles.days}>
          {order.map((d) => {
            const active = d === day
            const dayDate = dateOfDayThisWeek(d, state.settings.weekStartsMonday)
            const has = (byDay.get(d) ?? []).length > 0
            return (
              <Pressable
                key={d}
                onPress={() => {
                  tap()
                  setDay(d)
                }}
                accessibilityLabel={DAY_NAMES[d]}
                style={[styles.day, isToday(dayDate) && styles.dayToday]}
              >
                {active ? (
                  <LinearGradient
                    colors={[...theme.gradient]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[StyleSheet.absoluteFill, { borderRadius: radius.md }]}
                  />
                ) : null}
                <Text style={[styles.dayText, active && { color: theme.onAccent }]}>{DAY_INITIAL[d]}</Text>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: has ? theme.color : colors.inkFaint },
                    active && { backgroundColor: `${theme.onAccent}99` },
                  ]}
                />
              </Pressable>
            )
          })}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {state.subjects.length === 0 ? (
          <EmptyState
            glyph={<Grid size={30} color={theme.color} />}
            title="Add a subject first"
            text="Your timetable is built from your subjects, so start by creating one."
            action={
              <Button
                label="Add a subject"
                onPress={onAddSubject}
                variant="primary"
                gradient={theme.gradient}
                onAccent={theme.onAccent}
                icon={<Plus size={16} color={theme.onAccent} />}
                style={{ paddingHorizontal: 20, height: 44 }}
              />
            }
          />
        ) : lessons.length === 0 ? (
          <EmptyState
            glyph={<Clock size={30} color={theme.color} />}
            title={`No classes on ${DAY_NAMES[day]}`}
            text="Schedule a class and you can mark attendance for it with a single tap."
            action={
              <Button
                label="Add a class"
                onPress={() => onAddClass(day)}
                variant="primary"
                gradient={theme.gradient}
                onAccent={theme.onAccent}
                icon={<Plus size={16} color={theme.onAccent} />}
                style={{ paddingHorizontal: 20, height: 44 }}
              />
            }
          />
        ) : (
          <View style={{ gap: 13 }}>
            {lessons.map((slot) => {
              const subject = subjectOf(slot.subjectId)
              if (!subject) return null
              const accent = ACCENTS[subject.accent]
              const mark = state.marks[`${dateKey}|${slot.id}`]

              return (
                <View key={slot.id} style={styles.lesson}>
                  <View style={styles.time}>
                    <Text style={styles.timeStart}>{prettyTime(slot.start)}</Text>
                    <Text style={styles.timeEnd}>{prettyTime(slot.end)}</Text>
                  </View>

                  <View style={styles.body}>
                    <View style={[styles.spine, { backgroundColor: accent.color }, glow(accent.color, 8, 0.8, lit)]} />
                    <Pressable onPress={() => onEditClass(slot)} accessibilityLabel={`Edit ${subject.name} class`}>
                      <Text style={styles.lessonTitle}>{subject.name}</Text>
                    </Pressable>
                    <View style={styles.meta}>
                      <Text style={styles.metaText}>{durationLabel(slot.start, slot.end)}</Text>
                      {slot.room ? (
                        <>
                          <View style={styles.metaDot} />
                          <Pin size={12} color={colors.inkMuted} />
                          <Text style={styles.metaText}>{slot.room}</Text>
                        </>
                      ) : null}
                    </View>

                    {upcoming ? (
                      <Text style={styles.locked}>Upcoming — you can mark this on the day.</Text>
                    ) : (
                      <View style={styles.marks}>
                        <MarkButton
                          label="Present"
                          on={mark === 'present'}
                          tint={theme.color}
                          icon={<Check size={14} color={mark === 'present' ? theme.color : colors.inkSoft} />}
                          onPress={() => setMark(slot, 'present')}
                        />
                        <MarkButton
                          label="Absent"
                          on={mark === 'absent'}
                          tint={colors.danger}
                          icon={<Close size={14} color={mark === 'absent' ? colors.danger : colors.inkSoft} />}
                          onPress={() => setMark(slot, 'absent')}
                        />
                        <MarkButton
                          label="Off"
                          on={mark === 'cancelled'}
                          tint={colors.warn}
                          icon={<Ban size={13} color={mark === 'cancelled' ? colors.warn : colors.inkSoft} />}
                          onPress={() => setMark(slot, 'cancelled')}
                        />
                      </View>
                    )}
                  </View>
                </View>
              )
            })}
            <Text style={styles.note}>
              Tap a class name to edit or remove it. “Off” records a cancelled class without touching your
              percentage.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

function MarkButton({
  label,
  on,
  tint,
  icon,
  onPress,
}: {
  label: string
  on: boolean
  tint: string
  icon: React.ReactNode
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.markBtn,
        on && { backgroundColor: `${tint}2e`, borderColor: `${tint}6b` },
        pressed && { transform: [{ scale: 0.95 }] },
      ]}
    >
      {icon}
      <Text style={[styles.markText, on && { color: tint }]}>{label}</Text>
    </Pressable>
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
  days: { flexDirection: 'row', gap: 6, marginTop: 16 },
  day: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: 9,
    borderRadius: radius.md,
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  dayToday: { borderColor: colors.lineStrong },
  dayText: { fontSize: 12, fontWeight: '700', color: colors.inkMuted },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
  scroll: { paddingHorizontal: 18, paddingTop: 18 },
  lesson: { flexDirection: 'row', gap: 12 },
  time: { width: 68, alignItems: 'flex-end', paddingTop: 15 },
  timeStart: { fontSize: 13.5, fontWeight: '700', color: colors.ink, letterSpacing: -0.4 },
  timeEnd: { fontSize: 11.5, color: colors.inkFaint, marginTop: 1 },
  body: {
    flex: 1,
    borderRadius: radius.lg,
    paddingVertical: 14,
    paddingRight: 15,
    paddingLeft: 25,
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  spine: { position: 'absolute', left: 0, top: 12, bottom: 12, width: 3, borderRadius: radius.pill },
  lessonTitle: { fontSize: 16.5, fontWeight: '700', color: colors.ink, letterSpacing: -0.4 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  metaText: { fontSize: 12, color: colors.inkMuted },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.inkFaint },
  marks: { flexDirection: 'row', gap: 7, marginTop: 13 },
  markBtn: {
    flex: 1,
    height: 38,
    borderRadius: radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.line,
  },
  markText: { fontSize: 12.5, fontWeight: '700', color: colors.inkSoft },
  locked: { marginTop: 10, fontSize: 12, color: colors.inkFaint },
  note: { textAlign: 'center', fontSize: 12.5, color: colors.inkFaint, paddingHorizontal: 12, paddingTop: 18, lineHeight: 19 },
})
