import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { Close } from './icons'

type Props = {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export function Sheet({ open, title, onClose, children }: Props) {
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    // Move focus into the sheet so keyboard and screen-reader users land here.
    panel.current?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={panel}
      >
        <div className="sheet__grabber" />
        <header className="sheet__head">
          <h2 className="sheet__title">{title}</h2>
          <button className="icon-btn icon-btn--ghost" onClick={onClose} aria-label="Close">
            <Close />
          </button>
        </header>
        <div className="sheet__body">{children}</div>
      </div>
    </>
  )
}
