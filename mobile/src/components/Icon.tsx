import Svg, { Circle, Path, Rect } from 'react-native-svg'

type Props = { size?: number; color?: string; strokeWidth?: number }

const wrap = (size: number) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none' })
const line = (color: string, strokeWidth: number) => ({
  stroke: color,
  strokeWidth,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
})

export const Plus = ({ size = 20, color = '#fff', strokeWidth = 2.2 }: Props) => (
  <Svg {...wrap(size)}>
    <Path d="M12 5v14M5 12h14" {...line(color, strokeWidth)} />
  </Svg>
)

export const Minus = ({ size = 20, color = '#fff', strokeWidth = 2.2 }: Props) => (
  <Svg {...wrap(size)}>
    <Path d="M5 12h14" {...line(color, strokeWidth)} />
  </Svg>
)

export const ChevronUp = ({ size = 18, color = '#fff', strokeWidth = 2.4 }: Props) => (
  <Svg {...wrap(size)}>
    <Path d="m6 15 6-6 6 6" {...line(color, strokeWidth)} />
  </Svg>
)

export const ChevronDown = ({ size = 18, color = '#fff', strokeWidth = 2.4 }: Props) => (
  <Svg {...wrap(size)}>
    <Path d="m6 9 6 6 6-6" {...line(color, strokeWidth)} />
  </Svg>
)

export const Check = ({ size = 18, color = '#fff', strokeWidth = 2.6 }: Props) => (
  <Svg {...wrap(size)}>
    <Path d="m4.5 12.5 5 5 10-11" {...line(color, strokeWidth)} />
  </Svg>
)

export const Close = ({ size = 20, color = '#fff', strokeWidth = 2.2 }: Props) => (
  <Svg {...wrap(size)}>
    <Path d="M6 6l12 12M18 6L6 18" {...line(color, strokeWidth)} />
  </Svg>
)

export const Gear = ({ size = 20, color = '#fff', strokeWidth = 1.9 }: Props) => (
  <Svg {...wrap(size)}>
    <Circle cx="12" cy="12" r="3.2" {...line(color, strokeWidth)} />
    <Path
      d="M19.4 14.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5v.2a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1h.2a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"
      {...line(color, strokeWidth)}
    />
  </Svg>
)

export const Cap = ({ size = 20, color = '#fff', strokeWidth = 1.9 }: Props) => (
  <Svg {...wrap(size)}>
    <Path d="M12 4 2.5 8.5 12 13l9.5-4.5L12 4Z" {...line(color, strokeWidth)} />
    <Path d="M6.5 10.8v4.4c0 1.6 2.5 2.9 5.5 2.9s5.5-1.3 5.5-2.9v-4.4M21.5 8.5v5" {...line(color, strokeWidth)} />
  </Svg>
)

export const Grid = ({ size = 20, color = '#fff', strokeWidth = 1.9 }: Props) => (
  <Svg {...wrap(size)}>
    <Rect x="3" y="4.5" width="18" height="16" rx="3" {...line(color, strokeWidth)} />
    <Path d="M3 9.5h18M8 3v3M16 3v3" {...line(color, strokeWidth)} />
    <Circle cx="8.5" cy="13.5" r="1" fill={color} />
    <Circle cx="12" cy="13.5" r="1" fill={color} />
    <Circle cx="15.5" cy="13.5" r="1" fill={color} />
    <Circle cx="8.5" cy="17" r="1" fill={color} />
    <Circle cx="12" cy="17" r="1" fill={color} />
  </Svg>
)

export const Clock = ({ size = 14, color = '#fff', strokeWidth = 2 }: Props) => (
  <Svg {...wrap(size)}>
    <Circle cx="12" cy="12" r="9" {...line(color, strokeWidth)} />
    <Path d="M12 7.5V12l3 2" {...line(color, strokeWidth)} />
  </Svg>
)

export const Pin = ({ size = 14, color = '#fff', strokeWidth = 2 }: Props) => (
  <Svg {...wrap(size)}>
    <Path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" {...line(color, strokeWidth)} />
    <Circle cx="12" cy="10" r="2.5" {...line(color, strokeWidth)} />
  </Svg>
)

export const Trash = ({ size = 18, color = '#fff', strokeWidth = 2 }: Props) => (
  <Svg {...wrap(size)}>
    <Path d="M4 7h16M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7" {...line(color, strokeWidth)} />
    <Path d="M6.5 7l.8 12a2 2 0 0 0 2 1.9h5.4a2 2 0 0 0 2-1.9l.8-12" {...line(color, strokeWidth)} />
  </Svg>
)

export const Pencil = ({ size = 16, color = '#fff', strokeWidth = 2 }: Props) => (
  <Svg {...wrap(size)}>
    <Path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3Z" {...line(color, strokeWidth)} />
  </Svg>
)

export const History = ({ size = 18, color = '#fff', strokeWidth = 2 }: Props) => (
  <Svg {...wrap(size)}>
    <Path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" {...line(color, strokeWidth)} />
    <Path d="M3 4.5V9h4.5M12 7.5V12l3.2 1.9" {...line(color, strokeWidth)} />
  </Svg>
)

export const Undo = ({ size = 16, color = '#fff', strokeWidth = 2.2 }: Props) => (
  <Svg {...wrap(size)}>
    <Path d="M4 9h10a5.5 5.5 0 0 1 0 11h-3" {...line(color, strokeWidth)} />
    <Path d="M7.5 5.5 4 9l3.5 3.5" {...line(color, strokeWidth)} />
  </Svg>
)

export const Ban = ({ size = 14, color = '#fff', strokeWidth = 2.2 }: Props) => (
  <Svg {...wrap(size)}>
    <Circle cx="12" cy="12" r="8.5" {...line(color, strokeWidth)} />
    <Path d="m6.5 6.5 11 11" {...line(color, strokeWidth)} />
  </Svg>
)
