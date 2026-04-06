import { useMemo } from 'react'
import Layout from '../components/Layout'
import ScoreGauge from '../components/ScoreGauge'
import PlanContent from '../components/PlanContent'
import { getAnswers } from '../lib/storage'
import { computeScores } from '../lib/scoring'
import { q7Phrases, q8Phrases, pillarIntros, getLevel } from '../config/personalization'
import { pillarNames, type Answer } from '../config/questions'

export default function Plan() {
  const prenom = sessionStorage.getItem('clarte-expat-prenom') || 'Ami'
  const pdfUrl = sessionStorage.getItem('clarte-expat-pdf-url')
  const answers = useMemo(() => getAnswers(), [])
  const scores = useMemo(() => computeScores(answers), [answers])

  const q7 = (answers[7] || 'A') as Answer
  const q8 = (answers[8] || 'A') as Answer

  return (
    <Layout>
      <div className="max-w-3xl mx-auto pt-8 md:pt-16">
        {/* Scores piliers — compact */}
        <div className="space-y-4 mb-10">
          <ScoreGauge label={pillarNames[1]} score={scores.p1} />
          <ScoreGauge label={pillarNames[2]} score={scores.p2} />
          <ScoreGauge label={pillarNames[3]} score={scores.p3} />
        </div>

        {/* En-tête personnalisé */}
        <div className="mb-12">
          <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-light mb-4">
            Bonjour {prenom} 👋
          </h1>
          <p className="font-body text-light/70 text-lg mb-2">{q7Phrases[q7]}</p>
          <p className="font-body text-light/70 text-lg">{q8Phrases[q8]}</p>
        </div>

        {/* Bouton télécharger PDF */}
        {pdfUrl && (
          <div className="text-center mb-12">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 bg-accent text-dark font-heading font-bold text-lg
                         rounded-xl hover:bg-accent/90 transition-colors"
            >
              Télécharger mon plan en PDF →
            </a>
          </div>
        )}

        {/* Intros par pilier */}
        <div className="space-y-6 mb-12">
          {([1, 2, 3] as const).map((pillar) => {
            const score = pillar === 1 ? scores.p1 : pillar === 2 ? scores.p2 : scores.p3
            const level = getLevel(score)
            return (
              <div key={pillar} className="p-6 bg-light/5 rounded-2xl border border-light/10">
                <h3 className="font-heading font-bold text-accent text-lg mb-2">
                  {pillarNames[pillar]}
                </h3>
                <p className="font-body text-light/70">
                  {pillarIntros[pillar][level]}
                </p>
              </div>
            )
          })}
        </div>

        {/* Séparateur */}
        <div className="border-t border-light/10 my-12" />

        {/* Plan d'action complet */}
        <PlanContent />
      </div>
    </Layout>
  )
}
