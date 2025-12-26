import React from 'react';
import { formatNaira } from '../fx/format';

interface HeatMeterProps {
  heatKobo: number;
  tier: string;
}

const HeatMeter: React.FC<HeatMeterProps> = ({ heatKobo, tier }) => {
  const intensity = Math.min(100, Math.round(heatKobo / 200000));

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="uppercase tracking-[0.2em] text-white/60">Heat</span>
        <span className="font-bold">{formatNaira(heatKobo)}</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 transition-all"
          style={{ width: `${intensity}%` }}
        />
      </div>
      <p className="text-xs text-white/50">{tier} • Last 60 seconds</p>
    </div>
  );
};

export default HeatMeter;
