import Layout from '../components/Layout'

const CALENDLY_URL = 'https://calendly.com/clarte-expat/echange-expatriation-thailande'

export default function Plan() {
  const prenom = sessionStorage.getItem('clarte-expat-prenom') || ''

  return (
    <Layout>
      <div className="max-w-[720px] mx-auto pt-20 md:pt-32 text-center">
        <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-light mb-6">
          Ton plan est en route ! ✅
        </h1>

        {prenom && (
          <p className="font-body text-accent text-lg mb-4">
            Merci {prenom}
          </p>
        )}

        <p className="font-body text-light/70 text-lg md:text-xl mb-3 max-w-md mx-auto">
          Vérifie ta boîte mail — nous t'avons envoyé ton plan d'expatriation
          personnalisé en PDF.
        </p>

        <p className="font-body text-light/40 text-sm mb-12">
          Le lien est valable 30 jours.
        </p>

        <a
          href={CALENDLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-8 py-4 bg-accent text-dark font-heading font-bold text-lg
                     rounded-xl hover:bg-accent/90 transition-colors"
        >
          Réserver mon appel découverte gratuit — 20 min →
        </a>
      </div>
    </Layout>
  )
}
