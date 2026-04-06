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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 18px',
    fontSize: 15,
    fontFamily: "'Poppins', sans-serif",
    color: 'var(--text-primary)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    outline: 'none',
    marginBottom: 12,
    transition: 'border-color 0.15s',
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Ton prénom"
        value={prenom}
        onChange={(e) => setPrenom(e.target.value)}
        required
        style={inputStyle}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)' }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
      />
      <input
        type="email"
        placeholder="Ton email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={inputStyle}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)' }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
      />
      <button
        type="submit"
        disabled={loading}
        className="font-body font-bold cursor-pointer"
        style={{
          width: '100%',
          padding: 16,
          fontSize: 16,
          backgroundColor: 'var(--accent)',
          color: '#121823',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          opacity: loading ? 0.5 : 1,
          transition: 'background-color 0.15s',
        }}
        onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--accent-dark)' }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent)' }}
      >
        {loading ? 'Envoi en cours...' : 'Recevoir mon plan gratuit →'}
      </button>
    </form>
  )
}
