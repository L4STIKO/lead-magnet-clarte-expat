import type { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center px-6"
        style={{
          height: 64,
          backgroundColor: 'rgba(18,24,35,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <span className="font-heading font-bold text-lg" style={{ color: 'var(--accent)' }}>
          🧭 Clarté Expat
        </span>
      </header>
      <main style={{ paddingTop: 64 }}>
        {children}
      </main>
    </div>
  )
}
