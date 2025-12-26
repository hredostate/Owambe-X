import React, { useEffect, useState } from 'react';
import { formatNaira } from '../lib/money';

interface FlightFXProps {
  burstCount: number;
  amountKobo: number;
  vibePack: string;
  lowEnd: boolean;
  triggerKey: number;
}

interface NoteParticle {
  id: string;
  left: number;
  drift: number;
  duration: number;
  delay: number;
  size: number;
}

const FlightFX: React.FC<FlightFXProps> = ({ burstCount, amountKobo, vibePack, lowEnd, triggerKey }) => {
  const [particles, setParticles] = useState<NoteParticle[]>([]);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!triggerKey) return;
    const maxNotes = lowEnd ? 10 : 30;
    const count = Math.min(maxNotes, Math.max(8, Math.round(burstCount * 1.2)));
    const notes = Array.from({ length: count }).map(() => ({
      id: crypto.randomUUID(),
      left: 50 + (Math.random() * 40 - 20),
      drift: Math.random() * 20 - 10,
      duration: 0.45 + Math.random() * 0.4,
      delay: Math.random() * 0.05,
      size: 14 + Math.random() * 10,
    }));
    setParticles(notes);
    setPulse(true);
    const timer = window.setTimeout(() => setPulse(false), 300);
    return () => window.clearTimeout(timer);
  }, [burstCount, lowEnd, triggerKey]);

  return (
    <div className="pointer-events-none absolute inset-0">
      <div className={`ow-portal ${pulse ? 'animate-pulse' : ''}`}>
        <span className="text-xs text-white/70">Screen</span>
      </div>
      {!lowEnd && triggerKey > 0 && (
        <div className="ow-fly-trail" />
      )}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="ow-fly-note"
          style={{
            left: `calc(50% + ${particle.left}px)`,
            transform: `translate3d(${particle.drift}px, 0, 0)`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
            fontSize: `${particle.size}px`,
          }}
        >
          {vibePack === 'gold' ? '💛' : '💸'}
        </div>
      ))}
      {triggerKey > 0 && (
        <div className="absolute left-1/2 top-[30%] -translate-x-1/2 text-xs text-white/70">
          Sent {formatNaira(amountKobo)} to screen ✅
        </div>
      )}
    </div>
  );
};

export default FlightFX;
