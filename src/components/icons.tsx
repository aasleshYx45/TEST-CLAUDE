type IconProps = { size?: number; strokeWidth?: number; className?: string }

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
})

export const Plus = ({ size = 20, strokeWidth = 2.2 }: IconProps) => (
  <svg {...base(size)} strokeWidth={strokeWidth}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const Minus = ({ size = 20, strokeWidth = 2.2 }: IconProps) => (
  <svg {...base(size)} strokeWidth={strokeWidth}>
    <path d="M5 12h14" />
  </svg>
)

export const ChevronUp = ({ size = 18, strokeWidth = 2.4 }: IconProps) => (
  <svg {...base(size)} strokeWidth={strokeWidth}>
    <path d="m6 15 6-6 6 6" />
  </svg>
)

export const ChevronDown = ({ size = 18, strokeWidth = 2.4 }: IconProps) => (
  <svg {...base(size)} strokeWidth={strokeWidth}>
    <path d="m6 9 6 6 6-6" />
  </svg>
)

export const ChevronRight = ({ size = 18, strokeWidth = 2.2 }: IconProps) => (
  <svg {...base(size)} strokeWidth={strokeWidth}>
    <path d="m9 6 6 6-6 6" />
  </svg>
)

export const Check = ({ size = 18, strokeWidth = 2.6 }: IconProps) => (
  <svg {...base(size)} strokeWidth={strokeWidth}>
    <path d="m4.5 12.5 5 5 10-11" />
  </svg>
)

export const Close = ({ size = 20, strokeWidth = 2.2 }: IconProps) => (
  <svg {...base(size)} strokeWidth={strokeWidth}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

export const Gear = ({ size = 20, strokeWidth = 1.9 }: IconProps) => (
  <svg {...base(size)} strokeWidth={strokeWidth}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M19.4 14.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5v.2a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1h.2a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" />
  </svg>
)

export const Cap = ({ size = 20, strokeWidth = 1.9 }: IconProps) => (
  <svg {...base(size)} strokeWidth={strokeWidth}>
    <path d="M12 4 2.5 8.5 12 13l9.5-4.5L12 4Z" />
    <path d="M6.5 10.8v4.4c0 1.6 2.5 2.9 5.5 2.9s5.5-1.3 5.5-2.9v-4.4M21.5 8.5v5" />
  </svg>
)

export const Grid = ({ size = 20, strokeWidth = 1.9 }: IconProps) => (
  <svg {...base(size)} strokeWidth={strokeWidth}>
    <rect x="3" y="4.5" width="18" height="16" rx="3" />
    <path d="M3 9.5h18M8 3v3M16 3v3" />
    <circle cx="8.5" cy="13.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="13.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="15.5" cy="13.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="8.5" cy="17" r="1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
  </svg>
)

export const Clock = ({ size = 14, strokeWidth = 2 }: IconProps) => (
  <svg {...base(size)} strokeWidth={strokeWidth}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5V12l3 2" />
  </svg>
)

export const Pin = ({ size = 14, strokeWidth = 2 }: IconProps) => (
  <svg {...base(size)} strokeWidth={strokeWidth}>
    <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
)

export const Trash = ({ size = 18, strokeWidth = 2 }: IconProps) => (
  <svg {...base(size)} strokeWidth={strokeWidth}>
    <path d="M4 7h16M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7" />
    <path d="M6.5 7l.8 12a2 2 0 0 0 2 1.9h5.4a2 2 0 0 0 2-1.9l.8-12" />
  </svg>
)

export const Pencil = ({ size = 18, strokeWidth = 2 }: IconProps) => (
  <svg {...base(size)} strokeWidth={strokeWidth}>
    <path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
  </svg>
)

export const History = ({ size = 18, strokeWidth = 2 }: IconProps) => (
  <svg {...base(size)} strokeWidth={strokeWidth}>
    <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" />
    <path d="M3 4.5V9h4.5M12 7.5V12l3.2 1.9" />
  </svg>
)

export const Undo = ({ size = 16, strokeWidth = 2.2 }: IconProps) => (
  <svg {...base(size)} strokeWidth={strokeWidth}>
    <path d="M4 9h10a5.5 5.5 0 0 1 0 11h-3" />
    <path d="M7.5 5.5 4 9l3.5 3.5" />
  </svg>
)

export const Moon = ({ size = 26, strokeWidth = 1.8 }: IconProps) => (
  <svg {...base(size)} strokeWidth={strokeWidth}>
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
  </svg>
)

export const Spark = ({ size = 26, strokeWidth = 1.8 }: IconProps) => (
  <svg {...base(size)} strokeWidth={strokeWidth}>
    <path d="M12 3.5 13.9 9l5.6 1.9-5.6 1.9L12 18.5 10.1 12.8 4.5 10.9 10.1 9 12 3.5Z" />
  </svg>
)

export const Ban = ({ size = 14, strokeWidth = 2.2 }: IconProps) => (
  <svg {...base(size)} strokeWidth={strokeWidth}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m6.5 6.5 11 11" />
  </svg>
)

export const Download = ({ size = 18, strokeWidth = 2 }: IconProps) => (
  <svg {...base(size)} strokeWidth={strokeWidth}>
    <path d="M12 3.5v11M7.5 10.5 12 15l4.5-4.5M4.5 19.5h15" />
  </svg>
)

export const Upload = ({ size = 18, strokeWidth = 2 }: IconProps) => (
  <svg {...base(size)} strokeWidth={strokeWidth}>
    <path d="M12 15.5v-11M7.5 9 12 4.5 16.5 9M4.5 19.5h15" />
  </svg>
)
