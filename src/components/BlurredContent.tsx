interface Props {
  onUnlock: () => void
}

export default function BlurredContent({ onUnlock }: Props) {
  return (
    <div className="relative mt-12">
      {/* Contenu flouté simulé */}
      <div className="blur-sm select-none pointer-events-none space-y-4 px-6 py-8 bg-light/5 rounded-2xl">
        <div className="h-5 bg-light/10 rounded w-3/4" />
        <div className="h-4 bg-light/10 rounded w-full" />
        <div className="h-4 bg-light/10 rounded w-5/6" />
        <div className="h-5 bg-light/10 rounded w-2/3 mt-6" />
        <div className="h-4 bg-light/10 rounded w-full" />
        <div className="h-4 bg-light/10 rounded w-4/5" />
      </div>

      {/* Overlay avec cadenas */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark/60 rounded-2xl">
        <span className="text-5xl mb-4">🔒</span>
        <p className="font-heading font-bold text-light text-lg mb-4 text-center px-4">
          Saisis ton email pour débloquer ce contenu
        </p>
        <button
          onClick={onUnlock}
          className="px-6 py-3 bg-accent text-dark font-heading font-bold rounded-xl
                     hover:bg-accent/90 transition-colors cursor-pointer"
        >
          Débloquer mon plan →
        </button>
      </div>
    </div>
  )
}
