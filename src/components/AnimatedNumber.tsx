import { useEffect, useRef, useState } from 'react'

/** Rolls from the previous value to the next one so counters feel alive. */
export function AnimatedNumber({ value, duration = 520 }: { value: number; duration?: number }) {
  const [shown, setShown] = useState(value)
  const from = useRef(value)
  const frame = useRef(0)

  useEffect(() => {
    const start = performance.now()
    const origin = from.current
    const distance = value - origin
    if (distance === 0) return

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setShown(origin + distance * eased)
      if (t < 1) {
        frame.current = requestAnimationFrame(step)
      } else {
        from.current = value
      }
    }

    frame.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame.current)
  }, [value, duration])

  useEffect(() => {
    from.current = shown
  }, [shown])

  return <>{Math.round(shown)}</>
}
