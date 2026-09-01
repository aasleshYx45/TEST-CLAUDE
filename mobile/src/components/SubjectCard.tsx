import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { Subject } from '../../../shared/types'
import { percent, standing, total } from '../../../shared/attendance'
import { ACCENTS, toneFor } from '../../../shared/accents'
import { colors, radius } from '../theme'
import { tap } from '../haptics'
import { AnimatedNumber } from './AnimatedNumber'
import { Ring } from './Ring'
import { Minus, Pencil, Plus } from './Icon'

type Props = {
  subject: Subject
  dim: boolean
  onAdjust: (field: 'attended' | 'missed', delta: number) => void
  onEdit: () => void
}

export function SubjectCard({ subject, dim, onAdjust, onEdit }: Props) {
  const info = standing(subject)
  const tone = toneFor(info.tone, subject.accent)

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.left}>
          <Pressable onPress={onEdit} style={styles.nameRow} accessibilityLabel={`Edit ${subject.name}`}>
            <Text style={styles.name} numberOfLines={2}>
              {subject.name}
            </Text>
            <Pencil size={14} color={colors.inkFaint} />
          </Pressable>

          {subject.code ? (
            <View style={[styles.code, { borderColor: `${tone.color}44`, backgroundColor: `${tone.color}22` }]}>
              <Text style={[styles.codeText, { color: tone.color }]}>{subject.code}</Text>
            </View>
          ) : null}

          <View style={styles.counts}>
            <Count value={subject.attended} label="attended" animated />
            <Count value={subject.missed} label="missed" animated />
            <Count value={total(subject)} label="total" />
          </View>

          <Text style={[styles.headline, { color: tone.color }]}>{info.headline}</Text>
          <Text style={styles.detail}>{info.detail}</Text>
        </View>

        <Ring value={percent(subject)} tone={tone.color} caption={`of ${subject.requirement}%`} dim={dim} />
      </View>

      <View style={styles.actions}>
        <Counter
          label="Attended"
          value={subject.attended}
          tint={ACCENTS[subject.accent].color}
          onStep={(delta) => onAdjust('attended', delta)}
        />
        <Counter
          label="Missed"
          value={subject.missed}
          tint={colors.danger}
          onStep={(delta) => onAdjust('missed', delta)}
        />
      </View>
    </View>
  )
}

function Count({ value, label, animated }: { value: number; label: string; animated?: boolean }) {
  return (
    <View style={styles.count}>
      {animated ? (
        <AnimatedNumber value={value} style={styles.countValue} />
      ) : (
        <Text style={styles.countValue}>{value}</Text>
      )}
      <Text style={styles.countLabel}>{label}</Text>
    </View>
  )
}

function Counter({
  label,
  value,
  tint,
  onStep,
}: {
  label: string
  value: number
  tint: string
  onStep: (delta: number) => void
}) {
  return (
    <View style={styles.marker}>
      <Pressable
        onPress={() => {
          tap()
          onStep(-1)
        }}
        disabled={value === 0}
        style={({ pressed }) => [styles.markerBtn, pressed && styles.markerPressed, value === 0 && styles.markerOff]}
        accessibilityLabel={`Remove one ${label.toLowerCase()}`}
      >
        <Minus size={16} color={colors.inkSoft} />
      </Pressable>

      <Text style={styles.markerLabel}>{label}</Text>

      <Pressable
        onPress={() => {
          tap()
          onStep(1)
        }}
        style={({ pressed }) => [
          styles.markerBtn,
          { backgroundColor: `${tint}2b` },
          pressed && styles.markerPressed,
        ]}
        accessibilityLabel={`Add one ${label.toLowerCase()}`}
      >
        <Plus size={16} color={tint} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: 17,
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  left: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { flexShrink: 1, fontSize: 20, fontWeight: '700', color: colors.ink, letterSpacing: -0.6 },
  code: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  codeText: { fontSize: 10.5, fontWeight: '700', letterSpacing: 0.8 },
  counts: { flexDirection: 'row', gap: 14, marginTop: 12, flexWrap: 'wrap' },
  count: { flexDirection: 'row', alignItems: 'baseline', gap: 5 },
  countValue: { fontSize: 17, fontWeight: '700', color: colors.ink, letterSpacing: -0.3 },
  countLabel: { fontSize: 12, color: colors.inkMuted },
  headline: { marginTop: 14, fontSize: 14.5, fontWeight: '700', letterSpacing: -0.2 },
  detail: { fontSize: 12, color: colors.inkFaint, marginTop: 2 },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  marker: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    padding: 4,
  },
  markerBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerPressed: { transform: [{ scale: 0.88 }] },
  markerOff: { opacity: 0.35 },
  markerLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: colors.inkMuted,
  },
})
