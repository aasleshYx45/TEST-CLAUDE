import type { AccentKey } from '../../shared/types'
import { ACCENTS } from '../../shared/accents'

/** Mirrors shared/styles tokens from the web app so both look like one product. */
export const colors = {
  void: '#050608',
  base: '#0a0b0e',
  surface1: 'rgba(255,255,255,0.04)',
  surface2: 'rgba(255,255,255,0.07)',
  surface3: 'rgba(255,255,255,0.10)',
  line: 'rgba(255,255,255,0.09)',
  lineStrong: 'rgba(255,255,255,0.15)',
  ink: '#f4f6f8',
  inkSoft: '#b6bcc6',
  inkMuted: '#7d848f',
  inkFaint: '#4e545e',
  warn: '#ffc24b',
  danger: '#ff5f6b',
} as const

export const radius = { sm: 12, md: 18, lg: 24, xl: 30, pill: 999 } as const

export const space = (n: number) => n * 4

/** Second stop of the accent gradient, matching the web build. */
const GRADIENT_END: Record<AccentKey, string> = {
  lime: '#b4ff5a',
  cyan: '#79f0d5',
  violet: '#e08bff',
  amber: '#ffe07a',
  rose: '#ffa87a',
}

/** Ink colour that stays legible on top of each accent. */
const ON_ACCENT: Record<AccentKey, string> = {
  lime: '#061109',
  cyan: '#03151a',
  violet: '#100729',
  amber: '#1d1002',
  rose: '#200510',
}

export function accentTheme(key: AccentKey) {
  return {
    color: ACCENTS[key].color,
    gradient: [ACCENTS[key].color, GRADIENT_END[key]] as const,
    onAccent: ON_ACCENT[key],
    glow: ACCENTS[key].glow,
  }
}

/** A soft coloured glow, expressed the way each platform understands it.
    Shadows follow a view's rectangular bounds, so only apply this to a view
    that has its own background and matching border radius. */
export function glow(color: string, radius = 16, opacity = 0.55, enabled = true) {
  if (!enabled) return {}
  return {
    shadowColor: color,
    shadowOpacity: opacity,
    shadowRadius: radius,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  }
}

export const type = {
  display: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -1 },
  title: { fontSize: 21, fontWeight: '700' as const, letterSpacing: -0.5 },
  body: { fontSize: 15, fontWeight: '500' as const },
  label: {
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 1.1,
    textTransform: 'uppercase' as const,
  },
  caption: { fontSize: 12.5, fontWeight: '500' as const },
}
