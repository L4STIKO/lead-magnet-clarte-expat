import { getLevelLabel } from '../config/personalization'

interface Props {
  label: string
  score: number
}

export default function ScoreGauge({ label, score }: Props) {
  const { label: levelLabel, color } = getLevelLabel(score)

  return (
    <div className="w-full">
      <div className="flex justify-between items-baseline mb-2">
        <span className="font-heading font-semibold text-light text-sm">{label}</span>
        <span className="text-sm font-semibold" style={{ color }}>
          {score}% — {levelLabel}
        </span>
      </div>
      <div className="h-3 bg-light/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
