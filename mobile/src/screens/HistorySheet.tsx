import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { LogEntry } from '../../../shared/types'
import { formatRelative } from '../../../shared/date'
import { DANGER, WARN } from '../../../shared/accents'
import { useStore } from '../store/StoreContext'
import { accentTheme, colors, radius } from '../theme'
import { tap } from '../haptics'
import { Sheet } from '../components/Sheet'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { useToast } from '../components/Toast'
import { Ban, Check, Close, Pencil, Plus, Trash, Undo } from '../components/Icon'

export function HistorySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch } = useStore()
  const toast = useToast()
  const theme = accentTheme(state.settings.accent)

  const toneOf = (entry: LogEntry) => {
    if (entry.kind === 'absent' || entry.kind === 'delete') return DANGER.color
    if (entry.kind === 'cancelled') return WARN.color
    if (entry.kind === 'present') return theme.color
    return colors.inkSoft
  }

  const glyphOf = (entry: LogEntry, color: string) => {
    switch (entry.kind) {
      case 'present':
        return <Check size={16} color={color} />
      case 'absent':
        return <Close size={16} color={color} />
      case 'cancelled':
        return <Ban size={15} color={color} />
      case 'create':
        return <Plus size={16} color={color} />
      case 'delete':
        return <Trash size={15} color={color} />
      case 'edit':
        return <Pencil size={15} color={color} />
      default:
        return <Undo size={15} color={color} />
    }
  }

  const moved = (entry: LogEntry) => entry.delta.attended !== 0 || entry.delta.missed !== 0

  return (
    <Sheet open={open} title="History" onClose={onClose}>
      {state.log.length === 0 ? (
        <EmptyState
          glyph={<Undo size={26} color={theme.color} />}
          title="Nothing logged yet"
          text="Every change you make shows up here, and anything that moved your numbers can be undone."
        />
      ) : (
        <>
          <View style={styles.list}>
            {state.log.map((entry, i) => {
              const tone = toneOf(entry)
              return (
                <View
                  key={entry.id}
                  style={[styles.item, i > 0 && styles.divided, entry.undone && styles.undone]}
                >
                  <View style={styles.glyph}>{glyphOf(entry, tone)}</View>
                  <View style={styles.body}>
                    <Text style={styles.title} numberOfLines={1}>
                      {entry.label} · {entry.subjectName}
                    </Text>
                    <Text style={styles.sub}>
                      {formatRelative(entry.ts)}
                      {entry.undone ? ' · undone' : ''}
                    </Text>
                  </View>
                  {moved(entry) && !entry.undone ? (
                    <Pressable
                      onPress={() => {
                        tap()
                        dispatch({ type: 'log/undo', id: entry.id })
                        toast({ message: `Reverted · ${entry.subjectName}` })
                      }}
                      style={[styles.undo, { backgroundColor: `${theme.color}22` }]}
                    >
                      <Text style={[styles.undoText, { color: theme.color }]}>Undo</Text>
                    </Pressable>
                  ) : null}
                </View>
              )
            })}
          </View>

          <Button
            label="Clear history"
            onPress={() => {
              dispatch({ type: 'log/clear' })
              toast({ message: 'History cleared' })
            }}
            style={{ marginTop: 14 }}
          />
          <Text style={styles.note}>
            Clearing history only removes this list — your attendance numbers stay as they are.
          </Text>
        </>
      )}
    </Sheet>
  )
}

const styles = StyleSheet.create({
  list: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  divided: { borderTopWidth: 1, borderTopColor: colors.line },
  undone: { opacity: 0.45 },
  glyph: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  title: { fontSize: 14, fontWeight: '600', color: colors.ink, letterSpacing: -0.2 },
  sub: { fontSize: 12, color: colors.inkMuted, marginTop: 1 },
  undo: { paddingHorizontal: 11, paddingVertical: 6, borderRadius: radius.pill },
  undoText: { fontSize: 12.5, fontWeight: '700' },
  note: { textAlign: 'center', fontSize: 12.5, color: colors.inkFaint, paddingTop: 18, lineHeight: 19 },
})
