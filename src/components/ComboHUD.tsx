import React from 'react';

interface ComboHUDProps {
  level: number;
  timeLeftMs: number;
  ended: boolean;
}

const ComboHUD: React.FC<ComboHUDProps> = ({ level, timeLeftMs, ended }) => {
  const percent = Math.min(100, Math.round((timeLeftMs / 6000) * 100));

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="uppercase tracking-[0.2em] text-white/60">Combo</span>
        <span className="font-bold">x{level}</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 via-lime-400 to-yellow-400 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      {ended && (
        <p className="text-xs text-white/50">Combo ended</p>
      )}
    </div>
  );
};

export default ComboHUD;
