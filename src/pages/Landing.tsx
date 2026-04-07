import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <Layout>
      <section className="container" style={{ padding: '140px 24px 120px' }}>
        <div className="animate-in flex flex-col items-center text-center">

          {/* Badge pill */}
          <span
            className="font-body font-medium mb-7"
            style={{
              fontSize: 13,
              color: 'var(--accent)',
              background: 'rgba(0,217,163,0.1)',
              border: '1px solid var(--border-accent)',
              padding: '6px 16px',
              borderRadius: 100,
            }}
          >
            🇹🇭 Plan d'expatriation gratuit
          </span>

          {/* H1 */}
          <h1
            className="font-heading font-extrabold"
            style={{ fontSize: 72, lineHeight: 1.1, marginBottom: 28, maxWidth: 900 }}
          >
            <span style={{ color: 'var(--text-primary)' }}>Télécharge ton plan</span>
            <br />
            <span style={{ color: 'var(--accent)' }}>d'expatriation en Thaïlande</span>
          </h1>

          {/* Subtitle */}
          <p
            className="font-body"
            style={{
              fontSize: 19,
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              maxWidth: 780,
              marginBottom: 32,
            }}
          >
            Changer de résidence fiscale · Structurer son activité à l'étranger · S'installer en Thaïlande
          </p>

          {/* Stats line */}
          <p
            className="font-body font-medium"
            style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 40 }}
          >
            8 questions · 3 min · 100% gratuit
          </p>

          {/* CTA */}
          <button
            onClick={() => navigate('/quiz')}
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
            Obtenir mon plan gratuit →
          </button>

          {/* Mention */}
          <p className="font-body" style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 16 }}>
            Déjà utilisé par des entrepreneurs français installés en Thaïlande 🇹🇭
          </p>
        </div>
      </section>

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 639px) {
          section.container { padding: 80px 20px 60px !important; }
          h1 { font-size: 36px !important; }
        }
        @media (min-width: 640px) and (max-width: 1024px) {
          h1 { font-size: 52px !important; }
        }
      `}</style>
    </Layout>
  )
}
