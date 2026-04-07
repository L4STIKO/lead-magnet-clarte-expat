import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
      const eased = 1 - Math.pow(1 - t, 4)
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

function getScoreText(score: number): string {
  if (score <= 33)
    return "Bonne nouvelle — tu es exactement au bon endroit. Ton plan personnalisé te donne les étapes dans le bon ordre pour construire ton expatriation sur des bases solides dès le départ."
  if (score <= 66)
    return "Tu as les bonnes intuitions — il reste à aligner les pièces entre elles. Ton plan personnalisé identifie exactement les zones à clarifier pour que tout soit cohérent."
  return "Tu es bien avancé — l'enjeu maintenant c'est de valider que tout tient ensemble. Ton plan personnalisé te montre exactement ce qu'il reste à sécuriser."
}

const PILLAR_EMOJIS = { 1: '🇹🇭', 2: '💼', 3: '📋' } as const

// Fake plan data for blurred preview
const FAKE_ROWS = [
  {
    pillar: 'PILIER 1 — TON INSTALLATION EN THAÏLANDE',
    rows: [
      ['Choisir ton lieu de vie', 'Compare les villes selon ton style de vie et tes objectifs business', 'Chaque ville a un impact direct sur ton quotidien'],
      ['Identifier le bon visa', 'Analyse les options DTV, LTR ou Non-Imm B selon ton profil', 'Le mauvais visa peut bloquer ton installation'],
      ['Anticiper ton budget réel', 'Estime tes dépenses mensuelles selon ton style de vie cible', 'Beaucoup sous-estiment leur budget les premiers mois'],
      ['Trouver un logement', 'Cherche un appartement avec bail de 6 à 12 mois à ton nom', 'Bien choisir ton quartier est essentiel pour t\'intégrer'],
    ],
  },
  {
    pillar: 'PILIER 2 — TON ACTIVITÉ',
    rows: [
      ['Structurer ton activité', 'Définis la structure juridique adaptée à ton profil et tes clients', 'Le mauvais choix coûte cher à corriger après coup'],
      ['Organiser ta facturation', 'Mets en place un système clair entre compte pro et perso', 'Mélanger pro et perso affaiblit ta substance économique'],
      ['Documenter ta substance', 'Contrats signés au nom de ta structure, compte bancaire pro actif', 'Sans substance économique tu risques la requalification'],
    ],
  },
  {
    pillar: 'PILIER 3 — TA RÉSIDENCE FISCALE',
    rows: [
      ['Comprendre les 3 critères', 'Informe-toi sur l\'article 4B du CGI et ses implications concrètes', 'Un seul critère suffit pour rester résident fiscal français'],
      ['Planifier ta sortie', 'Définis la date et la séquence de tes démarches administratives', 'L\'ordre et le timing sont cruciaux pour une sortie propre'],
      ['Préparer tes déclarations', 'Renseigne-toi sur les formulaires de sortie officielle', 'Deux logiques fiscales différentes à bien distinguer'],
    ],
  },
]

function FakeTable({ pillar, rows }: { pillar: string; rows: string[][] }) {
  const headerStyle: React.CSSProperties = {
    padding: '8px 10px',
    fontSize: 11,
    color: 'var(--accent)',
    fontWeight: 700,
    fontFamily: "'Poppins', sans-serif",
    borderBottom: '1px solid var(--accent)',
  }
  const cellStyle = (col: number, ri: number): React.CSSProperties => ({
    padding: '10px 10px',
    fontSize: 12,
    fontFamily: "'Poppins', sans-serif",
    color: col === 0 ? 'var(--text-primary)' : col === 1 ? 'var(--text-secondary)' : 'var(--text-muted)',
    fontWeight: col === 0 ? 600 : 400,
    fontStyle: col === 2 ? 'italic' : 'normal',
    backgroundColor: ri % 2 === 0 ? 'var(--bg-card)' : 'rgba(22,30,42,0.8)',
    borderBottom: '1px solid rgba(42,54,74,0.6)',
  })

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        backgroundColor: 'rgba(35,47,66,0.8)',
        padding: '8px 12px',
        borderRadius: '8px 8px 0 0',
        borderLeft: '3px solid var(--accent)',
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', fontFamily: "'Poppins', sans-serif" }}>
          {pillar}
        </span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid rgba(42,54,74,0.6)' }}>
        <thead>
          <tr style={{ backgroundColor: 'rgba(35,47,66,0.9)' }}>
            <th style={{ ...headerStyle, width: '24%', textAlign: 'left' }}>CE QUE TU FAIS</th>
            <th style={{ ...headerStyle, width: '44%', textAlign: 'left' }}>COMMENT LE FAIRE</th>
            <th style={{ ...headerStyle, width: '32%', textAlign: 'left' }}>POURQUOI</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} style={cellStyle(ci, ri)}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function InlineForm({
  formRef,
  showForm,
  onSubmit,
  loading,
  error,
  progress,
  progressLabel,
}: {
  formRef: React.RefObject<HTMLDivElement | null>
  showForm: boolean
  onSubmit: (prenom: string, email: string) => void
  loading: boolean
  error: string | null
  progress: number
  progressLabel: string
}) {
  if (!showForm) return null
  return (
    <div
      ref={formRef}
      className="animate-in"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-accent)',
        borderRadius: 'var(--radius-xl)',
        padding: 32,
        maxWidth: 420,
        margin: '24px auto 0',
      }}
    >
      {loading ? (
        <div className="text-center" style={{ padding: '16px 0' }}>
          {/* Circular progress */}
          <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 20px' }}>
            <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke="var(--accent)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 42}
                strokeDashoffset={2 * Math.PI * 42 * (1 - progress / 100)}
                style={{ transition: 'stroke-dashoffset 0.2s ease-out' }}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="font-heading font-bold" style={{ fontSize: 24, color: 'var(--accent)' }}>
                {progress}%
              </span>
            </div>
          </div>
          {/* Label */}
          <p className="font-body font-semibold" style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 6 }}>
            {progressLabel}
          </p>
          {/* Thin bar */}
          <div style={{ height: 3, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 100, maxWidth: 200, margin: '0 auto', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              backgroundColor: 'var(--accent)',
              borderRadius: 100,
              transition: 'width 0.15s ease-out',
            }} />
          </div>
        </div>
      ) : (
        <>
          <h3 className="font-heading font-bold text-center" style={{ fontSize: 20, marginBottom: 20, color: 'var(--text-primary)' }}>
            Reçois ton plan personnalisé
          </h3>
          <LeadForm onSubmit={onSubmit} loading={loading} />
          {error && (
            <p className="text-center" style={{ color: 'var(--red)', fontSize: 13, marginTop: 12 }}>{error}</p>
          )}
        </>
      )}
    </div>
  )
}

export default function Result() {
  const navigate = useNavigate()
  const formRef1 = useRef<HTMLDivElement>(null)
  const formRef2 = useRef<HTMLDivElement>(null)
  const [showForm1, setShowForm1] = useState(false)
  const [showForm2, setShowForm2] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [barsVisible, setBarsVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)

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

  function openForm1() {
    setShowForm1(true)
    setTimeout(() => formRef1.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100)
  }

  function openForm2() {
    setShowForm2(true)
    setTimeout(() => formRef2.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100)
  }

  const animateTo = useCallback((target: number, label: string) => {
    setProgressLabel(label)
    if (progressRef.current) clearInterval(progressRef.current)
    return new Promise<void>((resolve) => {
      progressRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= target) {
            if (progressRef.current) clearInterval(progressRef.current)
            resolve()
            return target
          }
          return prev + 1
        })
      }, 40)
    })
  }, [])

  async function handleSubmit(prenom: string, email: string) {
    setLoading(true)
    setError(null)
    setProgress(0)

    try {
      await animateTo(25, 'Création de ton plan personnalisé...')

      console.log('[Result] Étape 1 — Génération PDF...')
      const pdfBlob = generatePdf(prenom, answers, scores)
      console.log('[Result] PDF généré:', pdfBlob.size, 'octets')

      await animateTo(55, 'Génération de ton PDF...')

      console.log('[Result] Étape 2 — Upload PDF...')
      const { signedUrl } = await uploadPdf(pdfBlob)
      console.log('[Result] Upload OK')

      await animateTo(80, 'Envoi par email...')

      console.log('[Result] Étape 3 — Appel Edge Function...')
      await submitLead({ prenom, email, answers, scores, pdfUrl: signedUrl })
      console.log('[Result] Edge Function OK')

      await animateTo(100, 'C\'est prêt !')

      sessionStorage.setItem('clarte-expat-prenom', prenom)
      sessionStorage.setItem('clarte-expat-email', email)
      sessionStorage.setItem('clarte-expat-pdf-url', signedUrl)

      setTimeout(() => navigate('/plan'), 600)
    } catch (err) {
      console.error('[Result] ERREUR:', err)
      if (progressRef.current) clearInterval(progressRef.current)
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(`Erreur : ${message}`)
      setLoading(false)
      setProgress(0)
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

        <h2 className="font-heading font-bold" style={{ fontSize: 22, color: 'var(--text-primary)', margin: '20px 0 24px' }}>
          {globalLabel}
        </h2>

        {/* Personalized text based on score */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 28px',
          maxWidth: 580,
          margin: '0 auto 32px',
        }}>
          <p className="font-body" style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.8, textAlign: 'center' }}>
            {getScoreText(scores.global)}
          </p>
        </div>

        {/* CTA 1 */}
        <button
          onClick={openForm1}
          className="font-body font-bold cursor-pointer"
          style={{
            fontSize: 17,
            backgroundColor: 'var(--accent)',
            color: '#121823',
            padding: '18px 52px',
            borderRadius: 100,
            border: 'none',
            boxShadow: '0 8px 40px rgba(0,217,163,0.3)',
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

        {/* Inline form after CTA 1 */}
        <InlineForm formRef={formRef1} showForm={showForm1} onSubmit={handleSubmit} loading={loading} error={error} progress={progress} progressLabel={progressLabel} />

        <div style={{ height: 56 }} />
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
            onClick={openForm2}
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

          {/* Inline form after CTA 2 */}
          <InlineForm formRef={formRef2} showForm={showForm2} onSubmit={handleSubmit} loading={loading} error={error} progress={progress} progressLabel={progressLabel} />

          {/* Blurred fake plan preview — right under CTA 2 */}
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-lg)', marginTop: 32, border: '1px solid var(--border-accent)' }}>
            <div style={{ filter: 'blur(3px)', opacity: 0.75, pointerEvents: 'none', padding: '20px 16px 8px' }}>
              {FAKE_ROWS.map((section, i) => (
                <FakeTable key={i} pillar={section.pillar} rows={section.rows} />
              ))}
            </div>
            {/* Gradient fade at bottom */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '50%',
              background: 'linear-gradient(to bottom, transparent, rgba(18,24,35,0.95))',
              pointerEvents: 'none',
            }} />
            {/* Lock overlay */}
            <div
              className="flex flex-col items-center justify-end text-center"
              style={{
                position: 'absolute',
                inset: 0,
                padding: '0 40px 32px',
              }}
            >
              <span style={{ fontSize: 32, marginBottom: 10 }}>🔒</span>
              <p className="font-body font-medium" style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
                Saisis ton email pour débloquer ton plan complet
              </p>
              <button
                onClick={openForm2}
                className="font-body font-bold cursor-pointer"
                style={{
                  fontSize: 14,
                  backgroundColor: 'var(--accent)',
                  color: '#121823',
                  padding: '12px 32px',
                  borderRadius: 100,
                  border: 'none',
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
                Débloquer mon plan →
              </button>
            </div>
          </div>
        </div>
      </section>

      <div style={{ height: 80 }} />

      <style>{`
        @media (max-width: 639px) {
          .container { padding-left: 20px !important; padding-right: 20px !important; }
          section:first-of-type { padding-top: 48px !important; }
        }
      `}</style>
    </Layout>
  )
}
