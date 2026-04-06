import type { Answer } from './questions'

// ── Phrases personnalisées Q7 ──
export const q7Phrases: Record<Answer, string> = {
  A: "Tu veux t'assurer que ta situation fiscale est propre et que tu ne paies plus d'impôts en France sans le savoir.",
  B: "Tu veux avoir une vision claire des démarches à faire et savoir exactement par où commencer.",
  C: "Tu veux éviter les erreurs sur les sujets clés — visa, fiscalité, structure — pour ne pas te retrouver dans une situation compliquée.",
  D: "Tu veux partir avec un système complet et cohérent pour ne pas avoir de mauvaises surprises plus tard.",
}

// ── Phrases personnalisées Q8 ──
export const q8Phrases: Record<Answer, string> = {
  A: "Tu veux un plan clair avec les bonnes étapes dans le bon ordre pour ne pas te tromper.",
  B: "Tu veux quitter la France fiscalement, ne plus payer d'impôts là-bas et t'installer sereinement en Thaïlande.",
  C: "Tu veux une vie simple, bien structurée et en règle depuis la Thaïlande.",
  D: "Tu veux un système complet et cohérent pour te concentrer sur ton business sans penser à la fiscalité.",
}

// ── Phrases intro par pilier selon le niveau de score ──
type Level = 'low' | 'mid' | 'high'

export const pillarIntros: Record<1 | 2 | 3, Record<Level, string>> = {
  1: {
    low: "Ton installation en Thaïlande est encore à construire — ce plan va t'aider à poser les bonnes bases.",
    mid: "Tu as avancé sur les aspects pratiques — voici ce qu'il reste à mettre en place.",
    high: "Ton installation est bien engagée — assure-toi que tout est cohérent avec ton activité et ta fiscalité.",
  },
  2: {
    low: "Ton activité n'est pas encore organisée pour fonctionner depuis l'étranger — ce plan te donne le cadre pour avancer.",
    mid: "Tu as commencé à organiser ton activité — voici les prochaines étapes pour que tout soit bien en place.",
    high: "Ton activité est bien organisée — quelques points méritent d'être vérifiés pour que tout soit solide.",
  },
  3: {
    low: "Ta résidence fiscale française n'est pas encore travaillée — ce plan te donne les clés pour comprendre ce qu'il faut faire.",
    mid: "Tu as commencé à agir sur ta résidence fiscale — voici ce qu'il reste à finaliser pour être dans une situation propre.",
    high: "Tu es bien avancé sur ta résidence fiscale — vérifie que tout est bien documenté pour être serein sur le long terme.",
  },
}

export function getLevel(score: number): Level {
  if (score <= 33) return 'low'
  if (score <= 66) return 'mid'
  return 'high'
}

export function getLevelLabel(score: number): { label: string; color: string } {
  if (score <= 33) return { label: 'À construire', color: '#ef4444' }   // rouge
  if (score <= 66) return { label: 'En cours', color: '#f59e0b' }       // orange
  return { label: 'Solide', color: '#00d9a3' }                          // vert accent
}
