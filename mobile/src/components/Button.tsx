import { Pressable, StyleSheet, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import type { ReactNode } from 'react'
import { colors, radius } from '../theme'

type Props = {
  label: string
  onPress: () => void
  variant?: 'primary' | 'plain' | 'danger'
  gradient?: readonly [string, string]
  onAccent?: string
  disabled?: boolean
  icon?: ReactNode
  style?: object
}

export function Button({
  label,
  onPress,
  variant = 'plain',
  gradient,
  onAccent = '#061109',
  disabled,
  icon,
  style,
}: Props) {
  const tint =
    variant === 'primary' ? onAccent : variant === 'danger' ? colors.danger : colors.ink

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        variant === 'plain' && styles.plain,
        variant === 'danger' && styles.danger,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {variant === 'primary' && gradient ? (
        <LinearGradient
          colors={[...gradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View style={styles.row}>
        {icon}
        <Text style={[styles.label, { color: tint }]}>{label}</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    height: 50,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  plain: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.line },
  danger: { backgroundColor: 'rgba(255,95,107,0.13)', borderWidth: 1, borderColor: 'rgba(255,95,107,0.3)' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.42 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontSize: 15.5, fontWeight: '700', letterSpacing: -0.2 },
})
