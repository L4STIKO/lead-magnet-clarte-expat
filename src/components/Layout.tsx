import type { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-dark text-light">
      <header className="px-6 py-4">
        <span className="font-heading font-bold text-accent text-xl">
          🧭 Clarté Expat
        </span>
      </header>
      <main className="px-4 pb-16">
        {children}
      </main>
    </div>
  )
}
