import type { CSSProperties } from 'react'
import type { Subject } from '../../shared/types'
import { percent, standing, total } from '../../shared/attendance'
import { ACCENTS, DANGER, toneFor } from '../../shared/accents'
import { tap } from '../lib/haptics'
import { AnimatedNumber } from './AnimatedNumber'
import { Ring } from './Ring'
import { Minus, Pencil, Plus } from './icons'

type Props = {
  subject: Subject
  index: number
  onAdjust: (field: 'attended' | 'missed', delta: number) => void
  onEdit: () => void
}

export function SubjectCard({ subject, index, onAdjust, onEdit }: Props) {
  const info = standing(subject)
  const tone = toneFor(info.tone, subject.accent)
  const style = {
    '--tone': tone.color,
    '--tone-glow': tone.glow,
    animationDelay: `${Math.min(index, 8) * 45}ms`,
  } as CSSProperties

  return (
    <article className="card" style={style}>
      <div className="card__top">
        <div>
          <button className="card__nameBtn" onClick={onEdit} aria-label={`Edit ${subject.name}`}>
            <h3 className="card__name">{subject.name}</h3>
            <Pencil size={14} />
          </button>
          {subject.code ? <span className="card__code">{subject.code}</span> : null}

          <div className="card__counts">
            <span className="count">
              <span className="count__n tnum">
                <AnimatedNumber value={subject.attended} />
              </span>
              <span className="count__l">attended</span>
            </span>
            <span className="count">
              <span className="count__n tnum">
                <AnimatedNumber value={subject.missed} />
              </span>
              <span className="count__l">missed</span>
            </span>
            <span className="count">
              <span className="count__n tnum">{total(subject)}</span>
              <span className="count__l">total</span>
            </span>
          </div>

          <div className="card__standing">
            <div>
              <div className="card__headline">{info.headline}</div>
              <div className="card__detail">{info.detail}</div>
            </div>
          </div>
        </div>

        <Ring value={percent(subject)} caption={`of ${subject.requirement}%`} />
      </div>

      <div className="card__actions">
        <Counter
          label="Attended"
          value={subject.attended}
          tint={ACCENTS[subject.accent].color}
          onStep={(delta) => {
            tap()
            onAdjust('attended', delta)
          }}
        />
        <Counter
          label="Missed"
          value={subject.missed}
          tint={DANGER.color}
          onStep={(delta) => {
            tap()
            onAdjust('missed', delta)
          }}
        />
      </div>
    </article>
  )
}

function Counter({
  label,
  value,
  tint,
  onStep,
}: {
  label: string
  value: number
  tint: string
  onStep: (delta: number) => void
}) {
  return (
    <div className="marker" style={{ '--plus-tone': tint } as CSSProperties}>
      <button
        className="marker__btn"
        onClick={() => onStep(-1)}
        disabled={value === 0}
        aria-label={`Remove one ${label.toLowerCase()}`}
      >
        <Minus size={16} />
      </button>
      <span className="marker__label">{label}</span>
      <button
        className="marker__btn marker__btn--plus"
        onClick={() => onStep(1)}
        aria-label={`Add one ${label.toLowerCase()}`}
      >
        <Plus size={16} />
      </button>
    </div>
  )
}
