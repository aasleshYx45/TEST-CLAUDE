import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, radius } from '../theme'
import { tap } from '../haptics'
import { ChevronDown, ChevronUp } from './Icon'

type Props = {
  label: string
  value: number
  display?: string
  min?: number
  max?: number
  step?: number
  accent: string
  onChange: (next: number) => void
}

export function Stepper({ label, value, display, min = 0, max = 999, step = 1, accent, onChange }: Props) {
  const set = (next: number) => {
    const clamped = Math.min(max, Math.max(min, next))
    if (clamped === value) return
    tap()
    onChange(clamped)
  }

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => set(value + step)}
        disabled={value >= max}
        style={({ pressed }) => [styles.btn, pressed && styles.pressed, value >= max && styles.disabled]}
        accessibilityLabel={`Increase ${label}`}
      >
        <ChevronUp color={value >= max ? colors.inkFaint : accent} />
      </Pressable>
      <Text style={styles.value}>{display ?? value}</Text>
      <Pressable
        onPress={() => set(value - step)}
        disabled={value <= min}
        style={({ pressed }) => [styles.btn, pressed && styles.pressed, value <= min && styles.disabled]}
        accessibilityLabel={`Decrease ${label}`}
      >
        <ChevronDown color={value <= min ? colors.inkFaint : accent} />
      </Pressable>
      <Text style={styles.label}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.line,
  },
  btn: {
    width: 38,
    height: 30,
    borderRadius: 10,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { transform: [{ scale: 0.9 }] },
  disabled: { opacity: 0.5 },
  value: { fontSize: 20, fontWeight: '800', color: colors.ink, letterSpacing: -0.6 },
  label: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.inkMuted,
  },
})
