import { tap } from '../lib/haptics'
import { ChevronDown, ChevronUp } from './icons'

type Props = {
  label: string
  value: number
  display?: string
  min?: number
  max?: number
  step?: number
  onChange: (next: number) => void
}

export function Stepper({ label, value, display, min = 0, max = 999, step = 1, onChange }: Props) {
  const set = (next: number) => {
    const clamped = Math.min(max, Math.max(min, next))
    if (clamped === value) return
    tap()
    onChange(clamped)
  }

  return (
    <div className="stepper">
      <button
        className="stepper__btn"
        onClick={() => set(value + step)}
        disabled={value >= max}
        aria-label={`Increase ${label}`}
      >
        <ChevronUp />
      </button>
      <div>
        <div className="stepper__value tnum">{display ?? value}</div>
      </div>
      <button
        className="stepper__btn"
        onClick={() => set(value - step)}
        disabled={value <= min}
        aria-label={`Decrease ${label}`}
      >
        <ChevronDown />
      </button>
      <div className="stepper__label">{label}</div>
    </div>
  )
}
