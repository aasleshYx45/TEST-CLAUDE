import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import type { ClassSlot } from '../../../shared/types'
import { ACCENTS } from '../../../shared/accents'
import { DAY_SHORT, addMinutes, prettyTime, toMinutes, weekOrder } from '../../../shared/date'
import { useStore } from '../store/StoreContext'
import { accentTheme, colors, radius } from '../theme'
import { success, tap, warn } from '../haptics'
import { Sheet } from '../components/Sheet'
import { Button } from '../components/Button'
import { useToast } from '../components/Toast'
import { ChevronDown, ChevronUp, Trash } from '../components/Icon'

type Props = { open: boolean; slot: ClassSlot | null; defaultDay: number; onClose: () => void }

const STEP_MINUTES = 15

export function ClassSheet({ open, slot, defaultDay, onClose }: Props) {
  const { state, dispatch } = useStore()
  const toast = useToast()
  const theme = accentTheme(state.settings.accent)
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

  const shiftStart = (delta: number) => {
    tap()
    const next = addMinutes(start, delta)
    setStart(next)
    // Keep the end after the start as the user nudges it.
    if (toMinutes(next) >= toMinutes(end)) setEnd(addMinutes(next, 60))
  }

  const shiftEnd = (delta: number) => {
    tap()
    const next = addMinutes(end, delta)
    if (toMinutes(next) <= toMinutes(start)) return
    setEnd(next)
  }

  const valid = subjectId !== '' && toMinutes(end) > toMinutes(start)

  const save = () => {
    if (!valid) return
    success()
    const payload = { subjectId, day, start, end, room: room.trim() }
    if (editing && slot) {
      dispatch({ type: 'slot/edit', id: slot.id, patch: payload })
      toast({ message: 'Class updated' })
    } else {
      dispatch({ type: 'slot/add', payload })
      toast({ message: `Added to ${DAY_SHORT[day]}` })
    }
    onClose()
  }

  const remove = () => {
    if (!slot) return
    if (!confirmDelete) {
      warn()
      setConfirmDelete(true)
      return
    }
    dispatch({ type: 'slot/delete', id: slot.id })
    toast({ message: 'Class removed' })
    onClose()
  }

  return (
    <Sheet open={open} title={editing ? 'Edit class' : 'New class'} onClose={onClose}>
      <View style={styles.field}>
        <Text style={styles.label}>Subject</Text>
        {state.subjects.length === 0 ? (
          <Text style={styles.hint}>
            You have no subjects yet. Add one on the Attendance tab first — every class belongs to a
            subject.
          </Text>
        ) : null}
        <View style={styles.chips}>
          {state.subjects.map((s) => {
            const on = subjectId === s.id
            const tint = ACCENTS[s.accent].color
            return (
              <Pressable
                key={s.id}
                onPress={() => {
                  tap()
                  setSubjectId(s.id)
                }}
                style={[styles.chip, on && { backgroundColor: `${tint}29`, borderColor: `${tint}73` }]}
              >
                <View style={[styles.chipDot, { backgroundColor: tint }]} />
                <Text style={[styles.chipText, on && { color: colors.ink }]}>{s.name}</Text>
              </Pressable>
            )
          })}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Day</Text>
        <View style={styles.days}>
          {weekOrder(state.settings.weekStartsMonday).map((d) => {
            const on = day === d
            return (
              <Pressable
                key={d}
                onPress={() => {
                  tap()
                  setDay(d)
                }}
                style={styles.day}
              >
                {on ? (
                  <LinearGradient
                    colors={[...theme.gradient]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[StyleSheet.absoluteFill, { borderRadius: radius.md }]}
                  />
                ) : null}
                <Text style={[styles.dayText, on && { color: theme.onAccent }]}>{DAY_SHORT[d].slice(0, 2)}</Text>
              </Pressable>
            )
          })}
        </View>
      </View>

      <View style={styles.times}>
        <TimeField label="Starts" value={start} accent={theme.color} onShift={shiftStart} />
        <TimeField label="Ends" value={end} accent={theme.color} onShift={shiftEnd} />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Room (optional)</Text>
        <TextInput
          style={styles.input}
          value={room}
          onChangeText={setRoom}
          placeholder="e.g. Lab 2"
          placeholderTextColor={colors.inkFaint}
          maxLength={20}
          returnKeyType="done"
        />
      </View>

      <Button
        label={editing ? 'Save changes' : 'Add class'}
        onPress={save}
        variant="primary"
        gradient={theme.gradient}
        onAccent={theme.onAccent}
        disabled={!valid}
      />

      {editing ? (
        <Button
          label={confirmDelete ? 'Tap again to confirm' : 'Remove class'}
          onPress={remove}
          variant="danger"
          icon={<Trash size={17} color={colors.danger} />}
          style={{ marginTop: 10 }}
        />
      ) : null}
    </Sheet>
  )
}

function TimeField({
  label,
  value,
  accent,
  onShift,
}: {
  label: string
  value: string
  accent: string
  onShift: (delta: number) => void
}) {
  return (
    <View style={styles.timeField}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.timeBox}>
        <Pressable
          onPress={() => onShift(-STEP_MINUTES)}
          style={({ pressed }) => [styles.timeBtn, pressed && { transform: [{ scale: 0.9 }] }]}
          accessibilityLabel={`${label} earlier`}
        >
          <ChevronDown color={accent} />
        </Pressable>
        <Text style={styles.timeValue}>{prettyTime(value)}</Text>
        <Pressable
          onPress={() => onShift(STEP_MINUTES)}
          style={({ pressed }) => [styles.timeBtn, pressed && { transform: [{ scale: 0.9 }] }]}
          accessibilityLabel={`${label} later`}
        >
          <ChevronUp color={accent} />
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  field: { marginBottom: 18, gap: 7 },
  label: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.inkMuted,
  },
  input: {
    height: 50,
    paddingHorizontal: 15,
    borderRadius: radius.md,
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.line,
    color: colors.ink,
    fontSize: 16,
    fontWeight: '600',
  },
  hint: { fontSize: 12.5, color: colors.inkMuted, lineHeight: 18 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  chipText: { fontSize: 13.5, fontWeight: '600', color: colors.inkSoft },
  days: { flexDirection: 'row', gap: 6 },
  day: {
    flex: 1,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.surface1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  dayText: { fontSize: 12, fontWeight: '700', color: colors.inkMuted },
  times: { flexDirection: 'row', gap: 12, marginBottom: 18 },
  timeField: { flex: 1, gap: 7 },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    paddingHorizontal: 6,
    borderRadius: radius.md,
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.line,
  },
  timeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeValue: { fontSize: 15, fontWeight: '700', color: colors.ink, letterSpacing: -0.3 },
})
