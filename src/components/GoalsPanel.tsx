import React from 'react';
import { formatNaira } from '../fx/format';

interface GoalsPanelProps {
  rollingVolume: number;
  sprayCount: number;
  comboChain: number;
  unlockLabel: string;
  unlockEndsAt: number | null;
}

const GoalsPanel: React.FC<GoalsPanelProps> = ({
  rollingVolume,
  sprayCount,
  comboChain,
  unlockLabel,
  unlockEndsAt,
}) => {
  const volumeTarget = 5_000_000;
  const sprayTarget = 10;
  const comboTarget = 5;

  const volumeProgress = Math.min(100, Math.round((rollingVolume / volumeTarget) * 100));
  const sprayProgress = Math.min(100, Math.round((sprayCount / sprayTarget) * 100));
  const comboProgress = Math.min(100, Math.round((comboChain / comboTarget) * 100));

  const unlockTime = unlockEndsAt ? Math.max(0, Math.round((unlockEndsAt - Date.now()) / 1000)) : 0;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
      <h3 className="text-sm uppercase tracking-[0.2em] text-white/70">Goals & Unlocks</h3>
      <div className="space-y-2">
        <div>
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>₦50,000 in 60s</span>
            <span>{formatNaira(rollingVolume)}</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-purple-400" style={{ width: `${volumeProgress}%` }} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>10 sprays in 20s</span>
            <span>{sprayCount}/{sprayTarget}</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-pink-400" style={{ width: `${sprayProgress}%` }} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>Combo x5</span>
            <span>x{comboChain}</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-yellow-400" style={{ width: `${comboProgress}%` }} />
          </div>
        </div>
      </div>
      <div className="text-xs text-white/60">
        <span className="font-semibold">Active Unlock:</span> {unlockLabel}
        {unlockEndsAt && <span className="ml-2">({unlockTime}s left)</span>}
      </div>
    </div>
  );
};

export default GoalsPanel;
