import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { questions, type Answer } from '../config/questions'
import { saveAnswer } from '../lib/storage'

export default function Quiz() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [direction, setDirection] = useState<'in' | 'out'>('in')
  const [selectedKey, setSelectedKey] = useState<Answer | null>(null)
  const navigate = useNavigate()

  const question = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100

  const goTo = useCallback((nextIndex: number, nav?: string) => {
    setDirection('out')
    setAnimating(true)

    setTimeout(() => {
      if (nav) {
        navigate(nav)
        return
      }
      setCurrentIndex(nextIndex)
      setSelectedKey(null)
      setDirection('in')
      setTimeout(() => setAnimating(false), 150)
    }, 140)
  }, [navigate])

  function handleAnswer(answer: Answer) {
    if (animating) return
    setSelectedKey(answer)
    saveAnswer(question.id, answer)

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        goTo(currentIndex + 1)
      } else {
        goTo(0, '/resultat')
      }
    }, 150)
  }

  function handleBack() {
    if (animating) return
    if (currentIndex > 0) {
      goTo(currentIndex - 1)
    } else {
      navigate('/')
    }
  }

  return (
    <Layout>
      {/* Sticky progress bar */}
      <div
        className="fixed left-0 right-0 z-40"
        style={{ top: 64, height: 3, backgroundColor: 'rgba(255,255,255,0.08)' }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            backgroundColor: 'var(--accent)',
            borderRadius: 100,
            transition: 'width 0.4s ease',
          }}
        />
      </div>

      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        {/* Header row */}
        <div className="flex justify-between items-center" style={{ marginBottom: 32 }}>
          <button
            onClick={handleBack}
            className="font-body cursor-pointer"
            style={{
              fontSize: 14,
              color: 'var(--text-muted)',
              background: 'none',
              border: 'none',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            ← Retour
          </button>
          <span className="font-body font-medium" style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Question {currentIndex + 1} / {questions.length}
          </span>
        </div>

        {/* Question + Options */}
        <div
          className={direction === 'out' ? 'slide-out' : 'slide-in'}
          style={{ opacity: direction === 'in' && !animating ? 1 : undefined }}
        >
          {/* Question text */}
          <h2
            className="font-heading font-bold text-center"
            style={{
              fontSize: 30,
              lineHeight: 1.4,
              maxWidth: 580,
              margin: '48px auto 40px',
              color: 'var(--text-primary)',
            }}
          >
            {question.text}
          </h2>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 580, margin: '0 auto' }}>
            {question.options.map((option, i) => {
              const isSelected = selectedKey === option.key
              return (
                <button
                  key={option.key}
                  onClick={() => handleAnswer(option.key)}
                  className={`animate-in stagger-${i + 1}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '18px 22px',
                    backgroundColor: isSelected ? 'rgba(0,217,163,0.08)' : 'var(--bg-card)',
                    border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 14,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                    width: '100%',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'rgba(0,217,163,0.4)'
                      e.currentTarget.style.backgroundColor = 'rgba(0,217,163,0.04)'
                      const badge = e.currentTarget.querySelector('[data-badge]') as HTMLElement
                      if (badge) {
                        badge.style.backgroundColor = 'rgba(0,217,163,0.15)'
                        badge.style.color = 'var(--accent)'
                      }
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.backgroundColor = 'var(--bg-card)'
                      const badge = e.currentTarget.querySelector('[data-badge]') as HTMLElement
                      if (badge) {
                        badge.style.backgroundColor = 'rgba(255,255,255,0.07)'
                        badge.style.color = 'var(--text-muted)'
                      }
                    }
                  }}
                >
                  {/* Badge letter */}
                  <span
                    data-badge
                    className="font-body font-bold flex-shrink-0 flex items-center justify-center"
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      fontSize: 13,
                      backgroundColor: isSelected ? 'var(--accent)' : 'rgba(255,255,255,0.07)',
                      color: isSelected ? '#121823' : 'var(--text-muted)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {option.key}
                  </span>
                  {/* Option text */}
                  <span
                    className="font-body"
                    style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.5 }}
                  >
                    {option.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 639px) {
          h2 { font-size: 22px !important; margin: 32px auto 28px !important; }
        }
      `}</style>
    </Layout>
  )
}
