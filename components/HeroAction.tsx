'use client';

/**
 * Hero Action Component
 * 
 * Primary entry point for the entire app.
 * Large, prominent CTA to declare intent to play.
 */
export default function HeroAction({ onStartPlay }: { onStartPlay: () => void }) {
  return (
    <div className="glass-card card-shadow p-8 md:p-10 text-center mb-6">
      <h2 className="text-3xl md:text-4xl font-heading font-bold text-neutral mb-3">
        Ready to play padel?
      </h2>
      <p className="text-gray-400 text-lg mb-6">
        Find players near you in minutes
      </p>
      <button
        onClick={onStartPlay}
        className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-3 mx-auto"
      >
        <span className="text-2xl">🎾</span>
        <span>I WANT TO PLAY</span>
      </button>
    </div>
  );
}


