type Props = {
  value: number
  size?: number
  stroke?: number
  caption?: string
}

/** Circular percentage gauge. Colour comes from the --tone var set by the parent. */
export function Ring({ value, size = 104, stroke = 9, caption = 'attended' }: Props) {
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, value))
  const offset = circumference * (1 - clamped / 100)

  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle className="ring__track" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} fill="none" />
        <circle
          className="ring__value"
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="ring__center">
        <div className="ring__pct tnum">{Math.round(clamped)}%</div>
        {caption ? <div className="ring__cap">{caption}</div> : null}
      </div>
    </div>
  )
}
