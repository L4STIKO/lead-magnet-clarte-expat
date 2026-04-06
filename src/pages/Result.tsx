import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import ScoreGauge from '../components/ScoreGauge'
import BlurredContent from '../components/BlurredContent'
import LeadForm from '../components/LeadForm'
import { getAnswers } from '../lib/storage'
import { computeScores } from '../lib/scoring'
import { generatePdf } from '../lib/pdf'
import { uploadPdf, submitLead } from '../lib/supabase-api'
import { pillarNames } from '../config/questions'
import { getLevelLabel } from '../config/personalization'

export default function Result() {
  const navigate = useNavigate()
  const formRef = useRef<HTMLDivElement>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const answers = useMemo(() => getAnswers(), [])
  const scores = useMemo(() => computeScores(answers), [answers])

  useEffect(() => {
    if (Object.keys(answers).length < 8) {
      navigate('/')
    }
  }, [answers, navigate])

  function scrollToForm() {
    setShowForm(true)
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  async function handleSubmit(prenom: string, email: string) {
    setLoading(true)
    setError(null)

    try {
      // 1. Générer le PDF
      console.log('[Result] Étape 1 — Génération PDF...')
      const pdfBlob = generatePdf(prenom, answers, scores)
      console.log('[Result] PDF généré:', pdfBlob.size, 'octets')

      // 2. Upload dans Supabase Storage
      console.log('[Result] Étape 2 — Upload PDF...')
      const { signedUrl } = await uploadPdf(pdfBlob)
      console.log('[Result] Upload OK, URL signée obtenue')

      // 3. Edge Function: insert contact + envoi email
      console.log('[Result] Étape 3 — Appel Edge Function...')
      await submitLead({
        prenom,
        email,
        answers,
        scores,
        pdfUrl: signedUrl,
      })
      console.log('[Result] Edge Function OK')

      // 4. Stocker les infos pour la page plan
      sessionStorage.setItem('clarte-expat-prenom', prenom)
      sessionStorage.setItem('clarte-expat-email', email)
      sessionStorage.setItem('clarte-expat-pdf-url', signedUrl)

      // 5. Redirect vers le plan
      console.log('[Result] Redirect vers /plan')
      navigate('/plan')
    } catch (err) {
      console.error('[Result] ERREUR:', err)
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(`Erreur : ${message}`)
      setLoading(false)
    }
  }

  const { label: globalLabel, color: globalColor } = getLevelLabel(scores.global)

  return (
    <Layout>
      <div className="max-w-[720px] mx-auto pt-8 md:pt-16">
        {/* Score global */}
        <div className="text-center mb-12">
          <p className="font-body text-light/60 text-sm uppercase tracking-wider mb-2">
            Ton score global
          </p>
          <div className="text-6xl md:text-7xl font-heading font-extrabold mb-2" style={{ color: globalColor }}>
            {scores.global}%
          </div>
          <p className="font-heading font-bold text-xl" style={{ color: globalColor }}>
            {globalLabel}
          </p>
        </div>

        {/* CTA 1 */}
        <div className="text-center mb-12">
          <button
            onClick={scrollToForm}
            className="px-8 py-4 bg-accent text-dark font-heading font-bold text-lg rounded-xl
                       hover:bg-accent/90 transition-colors cursor-pointer"
          >
            Télécharger mon plan d'expatriation personnalisé →
          </button>
        </div>

        {/* Scores piliers */}
        <div className="space-y-6 mb-12">
          <ScoreGauge label={pillarNames[1]} score={scores.p1} />
          <ScoreGauge label={pillarNames[2]} score={scores.p2} />
          <ScoreGauge label={pillarNames[3]} score={scores.p3} />
        </div>

        {/* CTA 2 */}
        <div className="text-center mb-8">
          <p className="font-heading font-semibold text-light text-lg mb-4">
            Reçois ton plan d'action personnalisé
          </p>
          <button
            onClick={scrollToForm}
            className="px-6 py-3 bg-accent text-dark font-heading font-bold rounded-xl
                       hover:bg-accent/90 transition-colors cursor-pointer"
          >
            Débloquer mon plan →
          </button>
        </div>

        {/* Contenu flouté */}
        <BlurredContent onUnlock={scrollToForm} />

        {/* Formulaire */}
        <div ref={formRef} className={`mt-12 transition-all duration-500 ${showForm ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <h3 className="font-heading font-bold text-2xl text-light text-center mb-6">
            Reçois ton plan personnalisé
          </h3>
          <LeadForm onSubmit={handleSubmit} loading={loading} />
          {error && (
            <p className="text-red-400 text-center text-sm mt-4">{error}</p>
          )}
        </div>
      </div>
    </Layout>
  )
}
