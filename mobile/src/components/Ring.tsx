import { View, Text, StyleSheet } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { colors } from '../theme'

type Props = { value: number; tone: string; caption?: string; size?: number; stroke?: number; dim?: boolean }

/** Circular percentage gauge, matching the web build's ring. */
export function Ring({ value, tone, caption, size = 104, stroke = 9, dim = false }: Props) {
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <View style={[{ width: size, height: size }, styles.wrap]}>
      {dim ? null : (
        <View
          style={[
            styles.halo,
            { width: size - stroke, height: size - stroke, borderRadius: size, backgroundColor: `${tone}14` },
          ]}
        />
      )}
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,255,255,0.09)"
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={tone}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - clamped / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text style={styles.pct}>{Math.round(clamped)}%</Text>
        {caption ? <Text style={styles.cap}>{caption}</Text> : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute' },
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  pct: { fontSize: 22, fontWeight: '800', color: colors.ink, letterSpacing: -1 },
  cap: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: colors.inkFaint,
    marginTop: 1,
  },
})
