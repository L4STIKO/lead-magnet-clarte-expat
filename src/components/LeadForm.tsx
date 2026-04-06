import { useState, type FormEvent } from 'react'

interface Props {
  onSubmit: (prenom: string, email: string) => void
  loading?: boolean
}

export default function LeadForm({ onSubmit, loading }: Props) {
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!prenom.trim() || !email.trim()) return
    onSubmit(prenom.trim(), email.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <input
        type="text"
        placeholder="Ton prénom"
        value={prenom}
        onChange={(e) => setPrenom(e.target.value)}
        required
        className="w-full px-5 py-3 rounded-xl bg-light/10 border border-light/20 text-light
                   placeholder:text-light/40 font-body focus:outline-none focus:border-accent transition-colors"
      />
      <input
        type="email"
        placeholder="Ton email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full px-5 py-3 rounded-xl bg-light/10 border border-light/20 text-light
                   placeholder:text-light/40 font-body focus:outline-none focus:border-accent transition-colors"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-accent text-dark font-heading font-bold text-lg rounded-xl
                   hover:bg-accent/90 transition-colors cursor-pointer disabled:opacity-50"
      >
        {loading ? 'Envoi en cours...' : 'Recevoir mon plan gratuit →'}
      </button>
    </form>
  )
}
