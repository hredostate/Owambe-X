import React from 'react';
import { Flame } from 'lucide-react';

interface HeatMeterProps {
  heat: number;
  totalLastMinute: number;
}

const HeatMeter: React.FC<HeatMeterProps> = ({ heat, totalLastMinute }) => {
  return (
    <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className={`w-5 h-5 ${heat > 65 ? 'text-orange-500 animate-pulse' : 'text-orange-300'}`} />
          <h3 className="font-bold">Heat Meter</h3>
        </div>
        <span className="text-sm text-gray-400">Last 60s</span>
      </div>
      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 transition-all"
          style={{ width: `${heat}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">Intensity</span>
        <span className="font-bold">₦{(totalLastMinute / 100).toLocaleString()}</span>
      </div>
    </div>
  );
};

export default HeatMeter;
