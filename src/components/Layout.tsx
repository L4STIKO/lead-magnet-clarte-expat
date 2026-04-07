import type { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-6"
        style={{
          height: 64,
          backgroundColor: 'rgba(18,24,35,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center" style={{ gap: 10 }}>
          <img
            src="/logo.png"
            alt="Clarté Expat"
            style={{ height: 32, width: 'auto', objectFit: 'contain' }}
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
          <span className="font-heading font-bold" style={{ fontSize: 18, color: 'var(--accent)' }}>
            Clarté Expat
          </span>
        </div>
      </header>
      <main style={{ paddingTop: 64 }}>
        {children}
      </main>
    </div>
  )
}
