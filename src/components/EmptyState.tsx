import type { ReactNode } from 'react'

type Props = { glyph: ReactNode; title: string; text: string; action?: ReactNode }

export function EmptyState({ glyph, title, text, action }: Props) {
  return (
    <div className="empty">
      <div className="empty__glyph">{glyph}</div>
      <h3 className="empty__title">{title}</h3>
      <p className="empty__text">{text}</p>
      {action ? <div style={{ marginTop: 14 }}>{action}</div> : null}
    </div>
  )
}
