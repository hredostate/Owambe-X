import React, { useEffect, useMemo, useRef } from 'react';
import { SprayCombo } from './types';
import { FxBudget } from './useFxBudget';

interface CanvasFXProps {
  combo: SprayCombo | null;
  budget: FxBudget;
  boostLevel: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  color: string;
  type: 'note' | 'confetti' | 'firework';
}

const COLORS = ['#facc15', '#f472b6', '#a855f7', '#38bdf8', '#f97316'];
const FIXED_STEP = 1000 / 60;

const CanvasFX: React.FC<CanvasFXProps> = ({ combo, budget, boostLevel }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastTime = useRef<number>(performance.now());
  const accumulator = useRef<number>(0);

  const particleBudget = useMemo(() => budget.maxParticles, [budget.maxParticles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * ratio;
      canvas.height = window.innerHeight * ratio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const update = () => {
      const now = performance.now();
      accumulator.current += now - lastTime.current;
      lastTime.current = now;

      while (accumulator.current >= FIXED_STEP) {
        particlesRef.current = particlesRef.current
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + (p.type === 'firework' ? 0.02 : 0.06),
            life: p.life - 1,
          }))
          .filter((p) => p.life > 0 && p.y < window.innerHeight + 40);
        accumulator.current -= FIXED_STEP;
      }

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      particlesRef.current.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life / 120);
        ctx.fillStyle = p.color;
        if (p.type === 'note') {
          ctx.fillRect(p.x, p.y, p.size, p.size * 1.4);
        } else if (p.type === 'confetti') {
          ctx.fillRect(p.x, p.y, p.size, p.size);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(update);
    };

    animationRef.current = requestAnimationFrame(update);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resize);
    };
  }, []);

  useEffect(() => {
    if (!combo) return;

    const particles = particlesRef.current;
    const target = Math.min(budget.targetParticles + boostLevel, particleBudget);
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight * 0.3;

    const addParticle = (type: Particle['type'], count: number) => {
      for (let i = 0; i < count; i += 1) {
        if (particles.length >= particleBudget) return;
        const angle = Math.random() * Math.PI * 2;
        const speed = type === 'firework' ? 2 + Math.random() * 2 : 0.5 + Math.random() * 1.2;
        particles.push({
          x: type === 'firework' ? centerX : Math.random() * window.innerWidth,
          y: type === 'firework' ? centerY : -20,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: type === 'confetti' ? 4 + Math.random() * 4 : 6 + Math.random() * 6,
          life: type === 'firework' ? 90 : 160,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          type,
        });
      }
    };

    addParticle('note', Math.round(target * 0.5));
    addParticle('confetti', Math.round(target * 0.4));
    if (!budget.reducedMotion) {
      addParticle('firework', Math.round(target * 0.1));
    }
  }, [boostLevel, budget.reducedMotion, budget.targetParticles, combo, particleBudget]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-10"
    />
  );
};

export default CanvasFX;
