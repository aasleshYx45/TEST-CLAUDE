/** Best-effort tactile feedback; silently ignored where unsupported. */
export function tap(pattern: number | number[] = 8) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern)
    } catch {
      /* no-op */
    }
  }
}
