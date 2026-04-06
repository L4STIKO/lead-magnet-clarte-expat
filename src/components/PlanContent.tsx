import { useState } from 'react'
import { steps, checklist, type Step } from '../config/plan-data'

const CALENDLY_URL = 'https://calendly.com/clarte-expat/echange-expatriation-thailande'

// ── Components ──

function StepSection({ step }: { step: Step }) {
  return (
    <section className="mb-16">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/20 text-accent font-heading font-bold text-lg flex items-center justify-center">
            {step.number}
          </span>
          <h3 className="font-heading font-bold text-xl md:text-2xl text-light">
            {step.title}
          </h3>
        </div>
        <p className="text-light/60 font-body ml-[52px]">
          {step.subtitle}
          {step.milestone && (
            <span className="ml-2 text-accent font-semibold">— {step.milestone}</span>
          )}
        </p>
      </div>

      {/* Tableau */}
      <div className="space-y-4">
        {step.rows.map((row, i) => (
          <div key={i} className="bg-light/5 border border-light/10 rounded-xl p-5">
            <h4 className="font-heading font-semibold text-accent text-base mb-3">
              {row.action}
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-light/40 mb-1 font-body">Comment le faire</p>
                <p className="text-light/80 font-body text-sm leading-relaxed">{row.how}</p>
              </div>
              {row.why && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-light/40 mb-1 font-body">Pourquoi c'est important</p>
                  <p className="text-light/80 font-body text-sm leading-relaxed">{row.why}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Résultat */}
      <div className="mt-6 p-4 bg-accent/10 border border-accent/20 rounded-xl">
        <p className="font-body text-accent text-sm">
          <span className="font-semibold">Résultat :</span> {step.result}
        </p>
      </div>
    </section>
  )
}

function ChecklistSection() {
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  function toggle(key: string) {
    setChecked(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <section className="mb-16">
      <h3 className="font-heading font-bold text-2xl md:text-3xl text-light mb-8 text-center">
        Ta checklist complète
      </h3>
      <div className="space-y-8">
        {checklist.map((cat) => (
          <div key={cat.title}>
            <h4 className="font-heading font-semibold text-lg text-light mb-4">
              {cat.emoji} {cat.title}
            </h4>
            <div className="space-y-2">
              {cat.items.map((item) => {
                const key = `${cat.title}-${item}`
                const isChecked = checked[key] || false
                return (
                  <label
                    key={key}
                    className="flex items-start gap-3 p-3 bg-light/5 rounded-lg border border-light/10
                               hover:border-accent/30 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggle(key)}
                      className="mt-0.5 w-5 h-5 rounded border-light/20 text-accent accent-[#00d9a3] cursor-pointer flex-shrink-0"
                    />
                    <span className={`font-body text-sm ${isChecked ? 'text-light/40 line-through' : 'text-light/80'}`}>
                      {item}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Main ──

export default function PlanContent() {
  return (
    <div>
      {/* Titre */}
      <h2 className="font-heading font-extrabold text-2xl md:text-3xl text-light mb-2 text-center">
        Ton plan d'action en 6 étapes
      </h2>
      <p className="font-body text-light/50 text-center mb-12">
        Suis ces étapes dans l'ordre pour une expatriation propre et sereine.
      </p>

      {/* Étapes */}
      {steps.map((step) => (
        <StepSection key={step.number} step={step} />
      ))}

      {/* Séparateur */}
      <div className="border-t border-light/10 my-12" />

      {/* Checklist */}
      <ChecklistSection />

      {/* Séparateur */}
      <div className="border-t border-light/10 my-12" />

      {/* CTA final */}
      <div className="text-center p-8 bg-light/5 rounded-2xl border border-light/10">
        <p className="font-body text-light/70 text-lg mb-6">
          Ce plan d'action te donne le cadre complet. Tu veux qu'on l'applique ensemble à ta situation précise ?
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

        {/* Bouton guide — hidden pour l'instant */}
        <div className="hidden mt-4">
          <a
            href="#"
            className="inline-block px-8 py-4 bg-light/10 text-light font-heading font-bold text-lg
                       rounded-xl border border-accent hover:bg-accent/10 transition-colors"
          >
            Obtenir le guide complet — 57€
          </a>
        </div>
      </div>
    </div>
  )
}
