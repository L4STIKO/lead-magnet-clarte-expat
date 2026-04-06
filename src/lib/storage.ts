import type { Answer } from '../config/questions'

const STORAGE_KEY = 'clarte-expat-answers'

export function saveAnswer(questionId: number, answer: Answer): void {
  const current = getAnswers()
  current[questionId] = answer
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(current))
}

export function getAnswers(): Record<number, Answer> {
  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return {}
  return JSON.parse(raw)
}

export function clearAnswers(): void {
  sessionStorage.removeItem(STORAGE_KEY)
}
