import React, { useEffect, useMemo, useRef, useState } from 'react';
import { formatNaira } from './format';
import { SprayCombo } from './types';
import { FxBudget } from './useFxBudget';

interface DomFXProps {
  combo: SprayCombo | null;
  budget: FxBudget;
  comboLevel: number;
  boostLevel: number;
}

interface FxNode {
  id: string;
  active: boolean;
  left: number;
  delay: number;
  duration: number;
  size: number;
  type: 'note' | 'confetti' | 'firework';
}

const POOL_SIZE = 90;

const createPool = (): FxNode[] =>
  Array.from({ length: POOL_SIZE }).map((_, index) => ({
    id: `fx-${index}`,
    active: false,
    left: 50,
    delay: 0,
    duration: 2,
    size: 20,
    type: 'note',
  }));

const DomFX: React.FC<DomFXProps> = ({ combo, budget, comboLevel, boostLevel }) => {
  const [nodes, setNodes] = useState<FxNode[]>(createPool);
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [amountLabel, setAmountLabel] = useState('');
  const rafRef = useRef<number | null>(null);

  const spotlightText = useMemo(() => {
    if (!combo) return '';
    const sender = combo.sender_names.length > 1
      ? `${combo.sender_names[0]} + ${combo.sender_names.length - 1} more`
      : combo.sender_names[0];
    return `${sender} → ${combo.recipient_label}`;
  }, [combo]);

  useEffect(() => {
    if (!combo) return;

    setShowSpotlight(true);
    setAmountLabel(formatNaira(combo.amount_kobo));

    const target = Math.min(budget.targetParticles + boostLevel, POOL_SIZE - 10);
    const confettiCount = Math.round(target * 0.4);
    const noteCount = target - confettiCount;
    const fireworkCount = budget.reducedMotion ? 0 : Math.round(target * 0.12);

    rafRef.current = requestAnimationFrame(() => {
      setNodes((prev) => {
        const next = prev.map((node) => ({ ...node, active: false }));
        let cursor = 0;

        const spawn = (count: number, type: FxNode['type']) => {
          for (let i = 0; i < count; i += 1) {
            if (cursor >= next.length) return;
            const node = next[cursor];
            node.active = true;
            node.type = type;
            node.left = Math.random() * 100;
            node.delay = Math.random() * 0.3;
            node.duration = 1.8 + Math.random() * 1.5;
            node.size = type === 'firework' ? 36 : 14 + Math.random() * 18;
            cursor += 1;
          }
        };

        spawn(noteCount, 'note');
        spawn(confettiCount, 'confetti');
        spawn(fireworkCount, 'firework');

        return next;
      });
    });

    const hideTimer = window.setTimeout(() => {
      setShowSpotlight(false);
      setAmountLabel('');
    }, 2000);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      window.clearTimeout(hideTimer);
    };
  }, [boostLevel, budget, combo]);

  if (!combo) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className={`ow-spotlight ${showSpotlight ? 'opacity-100' : 'opacity-0'}`}>
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-white/70">Spray Alert</p>
          <h2 className="text-4xl md:text-6xl font-black text-white drop-shadow-lg">{spotlightText}</h2>
        </div>
      </div>
      {amountLabel && (
        <div className="ow-amount text-white text-4xl md:text-6xl font-black">{amountLabel}</div>
      )}
      {comboLevel > 1 && (
        <div className="ow-combo-pop text-white text-3xl md:text-5xl font-black">COMBO x{comboLevel}</div>
      )}
      {nodes.map((node) => (
        <div
          key={node.id}
          className={`${node.active ? 'block' : 'hidden'} ${
            node.type === 'confetti'
              ? 'ow-confetti'
              : node.type === 'firework'
                ? 'ow-firework'
                : 'ow-note'
          }`}
          style={{
            left: `${node.left}%`,
            animationDelay: `${node.delay}s`,
            animationDuration: `${node.duration}s`,
            fontSize: `${node.size}px`,
          }}
        >
          {node.type === 'note' && '💵'}
          {node.type === 'confetti' && '✦'}
          {node.type === 'firework' && '🎆'}
        </div>
      ))}
    </div>
  );
};

export default DomFX;
