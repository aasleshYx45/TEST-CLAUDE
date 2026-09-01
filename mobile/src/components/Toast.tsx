import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native'
import type { ReactNode } from 'react'
import { colors, radius } from '../theme'

type ToastPayload = { message: string; actionLabel?: string; onAction?: () => void }
type ToastValue = (payload: ToastPayload) => void

const ToastContext = createContext<ToastValue | null>(null)

export function ToastProvider({ children, accent }: { children: ReactNode; accent: string }) {
  const [toast, setToast] = useState<ToastPayload | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const anim = useRef(new Animated.Value(0)).current

  const show = useCallback<ToastValue>((payload) => {
    if (timer.current) clearTimeout(timer.current)
    setToast(payload)
    timer.current = setTimeout(() => setToast(null), 4000)
  }, [])

  useEffect(() => {
    Animated.spring(anim, {
      toValue: toast ? 1 : 0,
      useNativeDriver: true,
      friction: 10,
      tension: 80,
    }).start()
  }, [toast, anim])

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  const value = useMemo(() => show, [show])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.wrap,
            {
              opacity: anim,
              transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
            },
          ]}
        >
          <View style={styles.toast}>
            <Text style={styles.text} numberOfLines={2}>
              {toast.message}
            </Text>
            {toast.actionLabel ? (
              <Pressable
                onPress={() => {
                  toast.onAction?.()
                  setToast(null)
                }}
                style={[styles.action, { backgroundColor: `${accent}22` }]}
              >
                <Text style={[styles.actionText, { color: accent }]}>{toast.actionLabel}</Text>
              </Pressable>
            ) : null}
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 112, alignItems: 'center', paddingHorizontal: 20 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    maxWidth: '100%',
    paddingVertical: 11,
    paddingLeft: 16,
    paddingRight: 12,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(26,29,35,0.97)',
    borderWidth: 1,
    borderColor: colors.lineStrong,
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  text: { color: colors.ink, fontSize: 13.5, fontWeight: '600', flexShrink: 1 },
  action: { paddingHorizontal: 11, paddingVertical: 5, borderRadius: radius.pill },
  actionText: { fontSize: 13, fontWeight: '800' },
})
