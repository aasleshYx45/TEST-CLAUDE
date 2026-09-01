import { tap } from '../lib/haptics'

type Props = { checked: boolean; onChange: (next: boolean) => void; label: string }

export function Switch({ checked, onChange, label }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className="switch"
      data-on={checked}
      onClick={() => {
        tap()
        onChange(!checked)
      }}
    >
      <span className="switch__knob" />
    </button>
  )
}
