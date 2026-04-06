import Layout from '../components/Layout'

const CALENDLY_URL = 'https://calendly.com/clarte-expat/echange-expatriation-thailande'

export default function Plan() {
  const prenom = sessionStorage.getItem('clarte-expat-prenom') || ''

  return (
    <Layout>
      <div className="container animate-in text-center" style={{ paddingTop: 120, paddingBottom: 120 }}>

        {/* Success icon */}
        <div
          className="flex items-center justify-center"
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: 'rgba(0,217,163,0.12)',
            border: '2px solid rgba(0,217,163,0.3)',
            margin: '0 auto 32px',
            fontSize: 36,
          }}
        >
          ✅
        </div>

        {/* Title */}
        <h1
          className="font-heading font-bold"
          style={{ fontSize: 40, color: 'var(--text-primary)', marginBottom: 16 }}
        >
          Ton plan est en route !
        </h1>

        {/* Prenom touch */}
        {prenom && (
          <p className="font-body" style={{ fontSize: 17, color: 'var(--accent)', marginBottom: 8 }}>
            Merci {prenom}
          </p>
        )}

        {/* Description */}
        <p
          className="font-body"
          style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 460, margin: '0 auto', marginBottom: 8 }}
        >
          Vérifie ta boîte mail — nous t'avons envoyé ton plan d'expatriation
          personnalisé en PDF.
        </p>

        {/* Email sender mention */}
        <p className="font-body" style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 48 }}>
          Envoyé depuis gregoire@performiance.fr
        </p>

        {/* Separator */}
        <div style={{ borderTop: '1px solid var(--border)', maxWidth: 200, margin: '0 auto 48px' }} />

        {/* CTA text */}
        <h3
          className="font-heading font-semibold"
          style={{ fontSize: 20, color: 'var(--text-primary)', marginBottom: 24 }}
        >
          Tu veux qu'on applique ce plan ensemble à ta situation précise ?
        </h3>

        {/* CTA Calendly */}
        <a
          href={CALENDLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-body font-bold inline-block"
          style={{
            fontSize: 16,
            backgroundColor: 'var(--accent)',
            color: '#121823',
            padding: '18px 48px',
            borderRadius: 100,
            textDecoration: 'none',
            boxShadow: '0 8px 40px rgba(0,217,163,0.25)',
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
          Réserver mon appel découverte gratuit — 20 min →
        </a>

        {/* Guide button — hidden */}
        <div className="hidden" style={{ marginTop: 16 }}>
          <a
            href="#"
            className="font-body font-bold inline-block"
            style={{
              fontSize: 15,
              color: 'var(--accent)',
              border: '2px solid var(--accent)',
              padding: '14px 36px',
              borderRadius: 100,
              textDecoration: 'none',
            }}
          >
            Obtenir le guide complet — 57€
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 639px) {
          .container { padding-top: 60px !important; padding-bottom: 60px !important; }
          h1 { font-size: 28px !important; }
        }
      `}</style>
    </Layout>
  )
}
