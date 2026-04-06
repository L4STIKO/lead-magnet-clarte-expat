export type Answer = 'A' | 'B' | 'C' | 'D'

export interface Question {
  id: number
  pillar: 1 | 2 | 3 | null // null = Q7/Q8 (pas de scoring)
  weightInPillar: number     // poids dans le pilier (0 si pas de scoring)
  text: string
  options: { key: Answer; label: string; score: number }[]
}

export const questions: Question[] = [
  // ── Pilier 1 — Ton projet en Thaïlande ──
  {
    id: 1,
    pillar: 1,
    weightInPillar: 0.4,
    text: "Où en es-tu dans ton projet d'installation en Thaïlande ?",
    options: [
      { key: 'A', label: "C'est une idée qui me trotte dans la tête mais je n'ai pas encore commencé à me renseigner", score: 10 },
      { key: 'B', label: "Je me renseigne activement — je regarde les visas, le coût de la vie, les groupes expats", score: 30 },
      { key: 'C', label: "C'est décidé — j'ai une date de départ et je prépare concrètement mon installation", score: 70 },
      { key: 'D', label: "Je suis en train de partir ou je viens d'arriver en Thaïlande", score: 90 },
    ],
  },
  {
    id: 2,
    pillar: 1,
    weightInPillar: 0.6,
    text: "Où en es-tu sur les aspects pratiques de ton installation ?",
    options: [
      { key: 'A', label: "Je n'ai pas encore regardé les visas ni le logement", score: 5 },
      { key: 'B', label: "J'ai commencé à me renseigner sur les visas mais rien de concret", score: 30 },
      { key: 'C', label: "J'ai identifié le bon visa et je cherche un logement", score: 65 },
      { key: 'D', label: "Mon visa est en ordre et j'ai un logement à mon nom", score: 90 },
    ],
  },

  // ── Pilier 2 — Ton activité ──
  {
    id: 3,
    pillar: 2,
    weightInPillar: 0.5,
    text: "Quelle est ta situation professionnelle actuelle ?",
    options: [
      { key: 'A', label: "Je suis salarié en France et je veux partir en gardant mon activité à distance ou en lançant quelque chose", score: 15 },
      { key: 'B', label: "J'ai une activité en France — micro-entreprise ou société — et je veux la faire évoluer depuis l'étranger", score: 35 },
      { key: 'C', label: "J'ai déjà une activité à distance et je génère des revenus en ligne", score: 65 },
      { key: 'D', label: "J'ai déjà une structure à l'étranger et je facture depuis celle-ci", score: 65 },
    ],
  },
  {
    id: 4,
    pillar: 2,
    weightInPillar: 0.5,
    text: "Où en es-tu sur la structuration de ton activité à l'étranger ?",
    options: [
      { key: 'A', label: "Je ne sais pas encore comment structurer mon activité depuis l'étranger", score: 10 },
      { key: 'B', label: "Je sais qu'il faut une structure mais je ne sais pas laquelle choisir", score: 25 },
      { key: 'C', label: "J'ai commencé à me renseigner sur les structures offshore — LLC, OÜ estonienne, etc.", score: 45 },
      { key: 'D', label: "J'ai déjà créé une structure à l'étranger", score: 70 },
    ],
  },

  // ── Pilier 3 — Ta résidence fiscale ──
  {
    id: 5,
    pillar: 3,
    weightInPillar: 0.6,
    text: "Où en es-tu sur la compréhension de ta résidence fiscale française ?",
    options: [
      { key: 'A', label: "Je ne sais pas vraiment ce que c'est ni comment ça fonctionne", score: 5 },
      { key: 'B', label: "Je sais que je dois changer de résidence fiscale mais je ne comprends pas les critères", score: 15 },
      { key: 'C', label: "Je connais les critères de l'article 4B mais je ne sais pas exactement comment m'en sortir", score: 45 },
      { key: 'D', label: "Je maîtrise le sujet et j'ai déjà commencé les démarches", score: 85 },
    ],
  },
  {
    id: 6,
    pillar: 3,
    weightInPillar: 0.4,
    text: "Qu'est-ce que tu as déjà fait concrètement pour ta résidence fiscale ?",
    options: [
      { key: 'A', label: "Rien du tout pour l'instant", score: 10 },
      { key: 'B', label: "J'ai commencé à me renseigner mais je n'ai pas encore agi", score: 30 },
      { key: 'C', label: "J'ai commencé à régler certains liens avec la France mais ce n'est pas encore complet", score: 60 },
      { key: 'D', label: "Tout est planifié et en cours — je sais exactement ce que je dois faire et quand", score: 90 },
    ],
  },

  // ── Q7 & Q8 — Personnalisation uniquement ──
  {
    id: 7,
    pillar: null,
    weightInPillar: 0,
    text: "Quelle est ta plus grande crainte dans ce projet ?",
    options: [
      { key: 'A', label: "Mal structurer mon activité et continuer à payer des impôts en France sans le savoir", score: 0 },
      { key: 'B', label: "Me perdre dans toutes les démarches et ne pas savoir par où commencer", score: 0 },
      { key: 'C', label: "Faire des erreurs sur le visa, la fiscalité ou la structure et me retrouver dans une situation compliquée", score: 0 },
      { key: 'D', label: "Partir sans que tout soit vraiment carré et avoir de mauvaises surprises plus tard", score: 0 },
    ],
  },
  {
    id: 8,
    pillar: null,
    weightInPillar: 0,
    text: "Quel est ton objectif final ?",
    options: [
      { key: 'A', label: "Comprendre exactement quoi faire et dans quel ordre pour ne pas me tromper", score: 0 },
      { key: 'B', label: "Partir proprement de France, ne plus payer d'impôts là-bas et m'installer sereinement en Thaïlande", score: 0 },
      { key: 'C', label: "Avoir une vie simple, bien structurée et en règle depuis la Thaïlande", score: 0 },
      { key: 'D', label: "Avoir un système complet et cohérent pour me concentrer sur mon business sans penser à la fiscalité", score: 0 },
    ],
  },
]

export const pillarNames = {
  1: 'Ton projet en Thaïlande',
  2: 'Ton activité',
  3: 'Ta résidence fiscale',
} as const
