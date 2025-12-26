import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Spray } from '../types';

interface Particle {
  id: string;
  x: number;
  size: number;
  rotation: number;
  duration: number;
  icon: string;
}

interface ScreenOverlayAnimatorProps {
  sprays: Spray[];
  soundEnabled: boolean;
}

const NOTES = ['💵', '💸', '💰', '✨', '🪩'];

const ScreenOverlayAnimator: React.FC<ScreenOverlayAnimatorProps> = ({ sprays, soundEnabled }) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  const latestSpray = useMemo(() => sprays[0], [sprays]);

  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
  }, []);

  useEffect(() => {
    if (!latestSpray) return;

    const burst = Math.min(latestSpray.burst_count, 40);
    const newParticles: Particle[] = Array.from({ length: burst }).map(() => ({
      id: crypto.randomUUID(),
      x: Math.random() * 100,
      size: 18 + Math.random() * 30,
      rotation: Math.random() * 360,
      duration: 2 + Math.random() * 2.5,
      icon: NOTES[Math.floor(Math.random() * NOTES.length)],
    }));

    setParticles((prev) => [...prev, ...newParticles]);

    const timer = window.setTimeout(() => {
      setParticles((prev) => prev.filter((particle) => !newParticles.some((p) => p.id === particle.id)));
    }, 4500);

    if (soundEnabled && audioContextRef.current) {
      const context = audioContextRef.current;
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.value = 520;
      gainNode.gain.value = 0.05;
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.12);
    }

    return () => window.clearTimeout(timer);
  }, [latestSpray, soundEnabled]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-spray-drop"
          style={{
            left: `${particle.x}%`,
            fontSize: `${particle.size}px`,
            transform: `rotate(${particle.rotation}deg)`,
            animationDuration: `${particle.duration}s`,
          }}
        >
          {particle.icon}
        </div>
      ))}
      <style>{`
        @keyframes spray-drop {
          0% { transform: translateY(110vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-20vh) rotate(360deg); opacity: 0; }
        }
        .animate-spray-drop {
          animation: spray-drop linear forwards;
        }
      `}</style>
    </div>
  );
};

export default ScreenOverlayAnimator;
