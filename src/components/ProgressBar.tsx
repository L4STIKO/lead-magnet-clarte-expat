export default function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100)

  return (
    <div className="w-full max-w-xl mx-auto mb-8">
      <div className="flex justify-between text-sm text-light/60 mb-2">
        <span>Question {current} / {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 bg-light/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
