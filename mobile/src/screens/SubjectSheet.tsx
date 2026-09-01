import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import type { AccentKey, Subject } from '../../../shared/types'
import { ACCENTS, ACCENT_KEYS } from '../../../shared/accents'
import { useStore } from '../store/StoreContext'
import { accentTheme, colors, glow, radius } from '../theme'
import { success, tap, warn } from '../haptics'
import { Sheet } from '../components/Sheet'
import { Stepper } from '../components/Stepper'
import { Button } from '../components/Button'
import { useToast } from '../components/Toast'
import { Trash } from '../components/Icon'

type Props = { open: boolean; subject: Subject | null; onClose: () => void }

export function SubjectSheet({ open, subject, onClose }: Props) {
  const { state, dispatch } = useStore()
  const toast = useToast()
  const theme = accentTheme(state.settings.accent)
  const editing = subject !== null

  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [accent, setAccent] = useState<AccentKey>('lime')
  const [attended, setAttended] = useState(0)
  const [missed, setMissed] = useState(0)
  const [requirement, setRequirement] = useState(75)
  const [confirmDelete, setConfirmDelete] = useState(false)

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

  const save = () => {
    if (!trimmed) return
    success()
    const payload = { name: trimmed, code: code.trim(), accent, attended, missed, requirement }
    if (editing && subject) {
      dispatch({ type: 'subject/edit', id: subject.id, patch: payload })
      toast({ message: `${trimmed} updated` })
    } else {
      dispatch({ type: 'subject/add', payload })
      toast({ message: `${trimmed} added` })
    }
    onClose()
  }

  const remove = () => {
    if (!subject) return
    if (!confirmDelete) {
      warn()
      setConfirmDelete(true)
      return
    }
    dispatch({ type: 'subject/delete', id: subject.id })
    toast({ message: `${subject.name} removed` })
    onClose()
  }

  return (
    <Sheet open={open} title={editing ? 'Edit subject' : 'New subject'} onClose={onClose}>
      <View style={styles.field}>
        <Text style={styles.label}>Subject name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Operating Systems"
          placeholderTextColor={colors.inkFaint}
          maxLength={40}
          returnKeyType="done"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Short code (optional)</Text>
        <TextInput
          style={styles.input}
          value={code}
          onChangeText={setCode}
          placeholder="e.g. CS-204"
          placeholderTextColor={colors.inkFaint}
          maxLength={12}
          autoCapitalize="characters"
          returnKeyType="done"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Colour</Text>
        <View style={styles.swatches}>
          {ACCENT_KEYS.map((key) => (
            <Pressable
              key={key}
              onPress={() => {
                tap()
                setAccent(key)
              }}
              accessibilityLabel={ACCENTS[key].label}
              style={[styles.swatch, accent === key && { borderColor: ACCENTS[key].color }]}
            >
              <View
                style={[styles.swatchDot, { backgroundColor: ACCENTS[key].color }, glow(ACCENTS[key].color, 8, 0.8, !state.settings.reduceGlow)]}
              />
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Starting counts</Text>
        <View style={styles.steppers}>
          <Stepper label="Attended" value={attended} onChange={setAttended} accent={theme.color} />
          <Stepper label="Missed" value={missed} onChange={setMissed} accent={theme.color} />
          <Stepper
            label="Required"
            value={requirement}
            display={`${requirement}%`}
            step={5}
            max={100}
            accent={theme.color}
            onChange={setRequirement}
          />
        </View>
      </View>

      <Button
        label={editing ? 'Save changes' : 'Add subject'}
        onPress={save}
        variant="primary"
        gradient={theme.gradient}
        onAccent={theme.onAccent}
        disabled={!trimmed}
      />

      {editing ? (
        <Button
          label={confirmDelete ? 'Tap again to confirm' : 'Delete subject'}
          onPress={remove}
          variant="danger"
          icon={<Trash size={17} color={colors.danger} />}
          style={{ marginTop: 10 }}
        />
      ) : null}

      {editing ? <Text style={styles.note}>Deleting a subject also removes its timetable classes.</Text> : null}
    </Sheet>
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
  swatches: { flexDirection: 'row', gap: 10 },
  swatch: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchDot: { width: 24, height: 24, borderRadius: 12 },
  steppers: { flexDirection: 'row', gap: 10 },
  note: { textAlign: 'center', fontSize: 12.5, color: colors.inkFaint, paddingTop: 18, lineHeight: 19 },
})
