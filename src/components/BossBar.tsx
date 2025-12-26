import React from 'react';

interface BossBarProps {
  progress: number;
  activeUntil: number | null;
  cooldownUntil: number | null;
}

const BossBar: React.FC<BossBarProps> = ({ progress, activeUntil, cooldownUntil }) => {
  const now = Date.now();
  const active = activeUntil && activeUntil > now;
  const cooling = cooldownUntil && cooldownUntil > now;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="uppercase tracking-[0.2em] text-white/60">Boss Bar</span>
        <span className="font-bold">MEGA STORM</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-rose-500 via-orange-400 to-yellow-300 transition-all"
          style={{ width: `${Math.min(100, Math.round(progress * 100))}%` }}
        />
      </div>
      <div className="text-xs text-white/60">
        {active && 'MEGA STORM ACTIVE'}
        {!active && !cooling && progress >= 0.85 && 'Almost there—push!'}
        {cooling && 'Cooling down...'}
      </div>
    </div>
  );
};

export default BossBar;
