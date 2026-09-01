import { useEffect, useRef, useState } from 'react'
import { Text } from 'react-native'
import type { TextStyle, StyleProp } from 'react-native'

/** Rolls from the previous value to the next one, like the web build. */
export function AnimatedNumber({
  value,
  style,
  suffix = '',
  duration = 480,
}: {
  value: number
  style?: StyleProp<TextStyle>
  suffix?: string
  duration?: number
}) {
  const [shown, setShown] = useState(value)
  const from = useRef(value)
  const frame = useRef<ReturnType<typeof requestAnimationFrame> | null>(null)

  useEffect(() => {
    const origin = from.current
    const distance = value - origin
    if (distance === 0) return
    const start = Date.now()

    const step = () => {
      const t = Math.min(1, (Date.now() - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      const next = origin + distance * eased
      setShown(next)
      if (t < 1) {
        frame.current = requestAnimationFrame(step)
      } else {
        from.current = value
      }
    }

    frame.current = requestAnimationFrame(step)
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current)
    }
  }, [value, duration])

  useEffect(() => {
    from.current = shown
  }, [shown])

  return <Text style={style}>{`${Math.round(shown)}${suffix}`}</Text>
}
