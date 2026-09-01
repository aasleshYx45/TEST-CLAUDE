import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { AccentKey } from '../../../shared/types'
import { ACCENTS, ACCENT_KEYS } from '../../../shared/accents'
import { overall } from '../../../shared/attendance'
import { useStore } from '../store/StoreContext'
import { accentTheme, colors, glow, radius } from '../theme'
import { tap, warn } from '../haptics'
import { Sheet } from '../components/Sheet'
import { Switch } from '../components/Switch'
import { Button } from '../components/Button'
import { useToast } from '../components/Toast'
import { Trash } from '../components/Icon'

const REQUIREMENTS = [60, 65, 70, 75, 80, 85]

export function SettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch } = useStore()
  const toast = useToast()
  const theme = accentTheme(state.settings.accent)
  const [confirmReset, setConfirmReset] = useState(false)
  const stats = overall(state.subjects)

  return (
    <Sheet open={open} title="Settings" onClose={onClose}>
      <View style={styles.field}>
        <Text style={styles.label}>Default requirement</Text>
        <View style={styles.segmented}>
          {REQUIREMENTS.map((r) => {
            const on = state.settings.defaultRequirement === r
            return (
              <Pressable
                key={r}
                onPress={() => {
                  tap()
                  dispatch({ type: 'settings/update', patch: { defaultRequirement: r } })
                }}
                style={[styles.segment, on && styles.segmentOn]}
              >
                <Text style={[styles.segmentText, on && styles.segmentTextOn]}>{r}%</Text>
              </Pressable>
            )
          })}
        </View>
        <Text style={styles.sub}>Used for new subjects. Existing subjects keep their own target.</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Accent</Text>
        <View style={styles.swatches}>
          {ACCENT_KEYS.map((key: AccentKey) => (
            <Pressable
              key={key}
              onPress={() => {
                tap()
                dispatch({ type: 'settings/update', patch: { accent: key } })
              }}
              accessibilityLabel={ACCENTS[key].label}
              style={[styles.swatch, state.settings.accent === key && { borderColor: ACCENTS[key].color }]}
            >
              <View
                style={[styles.swatchDot, { backgroundColor: ACCENTS[key].color }, glow(ACCENTS[key].color, 8, 0.8, !state.settings.reduceGlow)]}
              />
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.list}>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Start week on Monday</Text>
            <Text style={styles.sub}>Changes the order of the timetable day picker.</Text>
          </View>
          <Switch
            value={state.settings.weekStartsMonday}
            gradient={theme.gradient}
            onChange={(v) => dispatch({ type: 'settings/update', patch: { weekStartsMonday: v } })}
          />
        </View>
        <View style={[styles.row, styles.rowDivided]}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Reduce glow</Text>
            <Text style={styles.sub}>Dims the soft light bloom behind rings and buttons.</Text>
          </View>
          <Switch
            value={state.settings.reduceGlow}
            gradient={theme.gradient}
            onChange={(v) => dispatch({ type: 'settings/update', patch: { reduceGlow: v } })}
          />
        </View>
      </View>

      <Button
        label={confirmReset ? 'Tap again to erase everything' : 'Reset all data'}
        onPress={() => {
          if (!confirmReset) {
            warn()
            setConfirmReset(true)
            return
          }
          dispatch({ type: 'state/reset' })
          setConfirmReset(false)
          toast({ message: 'Everything cleared' })
          onClose()
        }}
        variant="danger"
        icon={<Trash size={17} color={colors.danger} />}
        style={{ marginTop: 18 }}
      />

      <View style={styles.summary}>
        <Tile value={String(stats.attended)} label="Attended" />
        <Tile value={String(stats.missed)} label="Missed" />
        <Tile value={`${Math.round(stats.percent)}%`} label="Overall" color={theme.color} />
      </View>

      <Text style={styles.note}>Attendly keeps everything on this device. Nothing is uploaded anywhere.</Text>
    </Sheet>
  )
}

function Tile({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <View style={styles.tile}>
      <Text style={[styles.tileValue, color ? { color } : null]}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
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
  sub: { fontSize: 12.5, color: colors.inkMuted, lineHeight: 18 },
  segmented: {
    flexDirection: 'row',
    gap: 3,
    padding: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.line,
  },
  segment: { flex: 1, height: 34, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  segmentOn: { backgroundColor: colors.surface3 },
  segmentText: { fontSize: 13, fontWeight: '700', color: colors.inkMuted },
  segmentTextOn: { color: colors.ink },
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
  list: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 15 },
  rowDivided: { borderTopWidth: 1, borderTopColor: colors.line },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: colors.ink, letterSpacing: -0.2 },
  summary: { flexDirection: 'row', gap: 10, marginTop: 22 },
  tile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 13,
    borderRadius: radius.md,
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.line,
  },
  tileValue: { fontSize: 24, fontWeight: '800', color: colors.ink, letterSpacing: -0.8 },
  tileLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: colors.inkMuted,
    marginTop: 3,
  },
  note: { textAlign: 'center', fontSize: 12.5, color: colors.inkFaint, paddingTop: 20, lineHeight: 19 },
})
