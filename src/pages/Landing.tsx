import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <Layout>
      <div className="max-w-[720px] mx-auto text-center pt-16 md:pt-24">
        <h1 className="font-heading font-extrabold text-4xl md:text-5xl lg:text-6xl leading-tight mb-6">
          <span className="text-light">Ne pars pas de France sans ce plan</span>
          <br />
          <span className="text-accent">Expatriation Thaïlande</span>
        </h1>

        <p className="font-body text-lg md:text-xl text-light/70 mb-4 max-w-xl mx-auto">
          Réponds à 8 questions et reçois ton plan personnalisé pour sortir proprement
          de France, ne plus payer d'impôts là-bas et t'installer en Thaïlande — gratuitement.
        </p>

        <p className="font-body text-sm text-light/40 mb-10">
          8 questions · 3 minutes · 100% gratuit
        </p>

        <button
          onClick={() => navigate('/quiz')}
          className="inline-block px-10 py-4 bg-accent text-dark font-heading font-bold text-lg
                     rounded-xl hover:bg-accent/90 transition-colors cursor-pointer"
        >
          Obtenir mon plan gratuit →
        </button>
      </div>
    </Layout>
  )
}
