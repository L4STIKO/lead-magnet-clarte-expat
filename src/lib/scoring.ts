import { questions, type Answer } from '../config/questions'

export interface Scores {
  p1: number
  p2: number
  p3: number
  global: number
}

export function computeScores(answers: Record<number, Answer>): Scores {
  const pillarScores: Record<1 | 2 | 3, number> = { 1: 0, 2: 0, 3: 0 }

  for (const q of questions) {
    if (q.pillar === null) continue
    const answer = answers[q.id]
    if (!answer) continue

    const option = q.options.find(o => o.key === answer)
    if (!option) continue

    pillarScores[q.pillar] += option.score * q.weightInPillar
  }

  const p1 = Math.round(pillarScores[1])
  const p2 = Math.round(pillarScores[2])
  const p3 = Math.round(pillarScores[3])
  const global = Math.round((p1 + p2 + p3) / 3)

  return { p1, p2, p3, global }
}
