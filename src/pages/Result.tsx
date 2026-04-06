import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import LeadForm from '../components/LeadForm'
import { getAnswers } from '../lib/storage'
import { computeScores } from '../lib/scoring'
import { generatePdf } from '../lib/pdf'
import { uploadPdf, submitLead } from '../lib/supabase-api'
import { pillarNames } from '../config/questions'
import { getLevelLabel } from '../config/personalization'

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const start = performance.now()
    function tick(now: number) {
      const elapsed = now - start
      const t = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - t, 4) // easeOutQuart
      setValue(Math.round(eased * target))
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])
  return value
}

function scoreColorVar(score: number) {
  if (score <= 33) return 'var(--red)'
  if (score <= 66) return 'var(--orange)'
  return 'var(--green)'
}

const PILLAR_EMOJIS = { 1: '🇹🇭', 2: '💼', 3: '📋' } as const

export default function Result() {
  const navigate = useNavigate()
  const formRef = useRef<HTMLDivElement>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [barsVisible, setBarsVisible] = useState(false)

  const answers = useMemo(() => getAnswers(), [])
  const scores = useMemo(() => computeScores(answers), [answers])
  const animatedGlobal = useCountUp(scores.global)

  useEffect(() => {
    if (Object.keys(answers).length < 8) {
      navigate('/')
      return
    }
    const timer = setTimeout(() => setBarsVisible(true), 300)
    return () => clearTimeout(timer)
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
      console.log('[Result] Étape 1 — Génération PDF...')
      const pdfBlob = generatePdf(prenom, answers, scores)
      console.log('[Result] PDF généré:', pdfBlob.size, 'octets')

      console.log('[Result] Étape 2 — Upload PDF...')
      const { signedUrl } = await uploadPdf(pdfBlob)
      console.log('[Result] Upload OK')

      console.log('[Result] Étape 3 — Appel Edge Function...')
      await submitLead({ prenom, email, answers, scores, pdfUrl: signedUrl })
      console.log('[Result] Edge Function OK')

      sessionStorage.setItem('clarte-expat-prenom', prenom)
      sessionStorage.setItem('clarte-expat-email', email)
      sessionStorage.setItem('clarte-expat-pdf-url', signedUrl)

      navigate('/plan')
    } catch (err) {
      console.error('[Result] ERREUR:', err)
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(`Erreur : ${message}`)
      setLoading(false)
    }
  }

  const { label: globalLabel } = getLevelLabel(scores.global)
  const globalColor = scoreColorVar(scores.global)

  return (
    <Layout>
      {/* Score global section */}
      <section className="container animate-in text-center" style={{ padding: '80px 24px 0' }}>
        <p
          className="font-body font-medium"
          style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.2em', marginBottom: 16, textTransform: 'uppercase' }}
        >
          TON SCORE GLOBAL
        </p>

        <div className="font-heading font-extrabold" style={{ fontSize: 96, color: globalColor, lineHeight: 1 }}>
          {animatedGlobal}%
        </div>

        {/* Global bar */}
        <div style={{ height: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 100, maxWidth: 400, margin: '20px auto' }}>
          <div style={{
            height: '100%',
            width: barsVisible ? `${scores.global}%` : '0%',
            backgroundColor: globalColor,
            borderRadius: 100,
            transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
          }} />
        </div>

        <h2 className="font-heading font-bold" style={{ fontSize: 22, color: 'var(--text-primary)', margin: '20px 0 32px' }}>
          {globalLabel}
        </h2>

        {/* Explanatory text card */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: 32,
          maxWidth: 580,
          margin: '0 auto 40px',
        }}>
          <p className="font-body" style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            Ce score reflète ta préparation sur les 3 piliers clés de ton expatriation en Thaïlande.
            Plus ton score est élevé, plus tu es prêt à partir sereinement.
          </p>
        </div>

        {/* CTA 1 */}
        <button
          onClick={scrollToForm}
          className="font-body font-bold cursor-pointer"
          style={{
            fontSize: 17,
            backgroundColor: 'var(--accent)',
            color: '#121823',
            padding: '18px 52px',
            borderRadius: 100,
            border: 'none',
            boxShadow: '0 8px 40px rgba(0,217,163,0.3)',
            marginBottom: 56,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent-dark)'
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          Télécharger mon plan d'expatriation personnalisé →
        </button>
      </section>

      {/* Pillar detail section */}
      <section className="container" style={{ paddingBottom: 48 }}>
        <p
          className="font-body font-medium"
          style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 20 }}
        >
          DÉTAIL PAR PILIER
        </p>

        {([1, 2, 3] as const).map((pillar) => {
          const score = pillar === 1 ? scores.p1 : pillar === 2 ? scores.p2 : scores.p3
          const color = scoreColorVar(score)
          const { label } = getLevelLabel(score)
          const badgeBg = score <= 33 ? 'rgba(239,68,68,0.12)' : score <= 66 ? 'rgba(249,115,22,0.12)' : 'rgba(0,217,163,0.12)'

          return (
            <div
              key={pillar}
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '20px 24px',
                marginBottom: 10,
              }}
            >
              <div className="flex items-center justify-between flex-wrap" style={{ gap: 12 }}>
                <span className="font-body font-semibold" style={{ fontSize: 15, color: 'var(--text-primary)' }}>
                  {PILLAR_EMOJIS[pillar]} {pillarNames[pillar]}
                </span>
                <div className="flex items-center" style={{ gap: 10 }}>
                  <span className="font-heading font-bold" style={{ fontSize: 20, color }}>{score}%</span>
                  <span
                    className="font-body font-semibold"
                    style={{ fontSize: 11, padding: '4px 10px', borderRadius: 100, backgroundColor: badgeBg, color }}
                  >
                    {label}
                  </span>
                </div>
              </div>
              <div style={{ height: 5, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 100, marginTop: 14 }}>
                <div style={{
                  height: '100%',
                  width: barsVisible ? `${score}%` : '0%',
                  backgroundColor: color,
                  borderRadius: 100,
                  transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
                }} />
              </div>
            </div>
          )
        })}

        {/* CTA 2 */}
        <div className="text-center" style={{ marginTop: 48 }}>
          <h3 className="font-heading font-bold" style={{ fontSize: 22, marginBottom: 12, color: 'var(--text-primary)' }}>
            Reçois ton plan d'action personnalisé
          </h3>
          <button
            onClick={scrollToForm}
            className="font-body font-bold cursor-pointer"
            style={{
              fontSize: 15,
              color: 'var(--accent)',
              backgroundColor: 'transparent',
              border: '2px solid var(--accent)',
              padding: '14px 36px',
              borderRadius: 100,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,217,163,0.08)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            Débloquer mon plan →
          </button>
        </div>
      </section>

      {/* Blurred content */}
      <section className="container" style={{ position: 'relative', overflow: 'hidden', marginBottom: 0 }}>
        <div style={{ filter: 'blur(5px)', opacity: 0.35, pointerEvents: 'none', padding: '32px 0' }}>
          <div style={{ height: 18, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 8, width: '75%', marginBottom: 12 }} />
          <div style={{ height: 14, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 8, width: '100%', marginBottom: 10 }} />
          <div style={{ height: 14, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 8, width: '90%', marginBottom: 10 }} />
          <div style={{ height: 18, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 8, width: '65%', marginTop: 24, marginBottom: 12 }} />
          <div style={{ height: 14, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 8, width: '100%', marginBottom: 10 }} />
          <div style={{ height: 14, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 8, width: '85%' }} />
        </div>
        <div
          className="flex flex-col items-center justify-center text-center"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(18,24,35,0.85)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderRadius: 'var(--radius-lg)',
            padding: '36px 48px',
          }}
        >
          <span style={{ fontSize: 36, marginBottom: 16 }}>🔒</span>
          <p className="font-body" style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
            Saisis ton email pour débloquer ton plan d'action personnalisé
          </p>
        </div>
      </section>

      {/* Lead form */}
      <section className="container">
        <div
          ref={formRef}
          style={{
            opacity: showForm ? 1 : 0,
            pointerEvents: showForm ? 'auto' : 'none',
            transition: 'opacity 0.5s ease',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-accent)',
            borderRadius: 'var(--radius-xl)',
            padding: 40,
            maxWidth: 460,
            margin: '48px auto 80px',
          }}
        >
          <h3 className="font-heading font-bold text-center" style={{ fontSize: 22, marginBottom: 8, color: 'var(--text-primary)' }}>
            Reçois ton plan personnalisé
          </h3>
          <p className="font-body text-center" style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>
            Ton prénom et ton email — c'est tout ce qu'il nous faut.
          </p>
          <LeadForm onSubmit={handleSubmit} loading={loading} />
          {error && (
            <p className="text-center" style={{ color: 'var(--red)', fontSize: 13, marginTop: 12 }}>{error}</p>
          )}
          <p className="font-body text-center" style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
            Aucun spam. Tu reçois uniquement ton plan.
          </p>
        </div>
      </section>

      <style>{`
        @media (max-width: 639px) {
          .container { padding-left: 20px !important; padding-right: 20px !important; }
          section:first-of-type { padding-top: 48px !important; }
        }
      `}</style>
    </Layout>
  )
}
