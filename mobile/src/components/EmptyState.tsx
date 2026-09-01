import { StyleSheet, Text, View } from 'react-native'
import type { ReactNode } from 'react'
import { colors } from '../theme'

type Props = { glyph: ReactNode; title: string; text: string; action?: ReactNode }

export function EmptyState({ glyph, title, text, action }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.glyph}>{glyph}</View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
      {action ? <View style={{ marginTop: 14 }}>{action}</View> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 50, paddingHorizontal: 24, gap: 8 },
  glyph: {
    width: 74,
    height: 74,
    borderRadius: 26,
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  title: { fontSize: 17, fontWeight: '700', color: colors.ink, letterSpacing: -0.4 },
  text: { fontSize: 13.5, color: colors.inkMuted, textAlign: 'center', lineHeight: 20, maxWidth: 280 },
})
