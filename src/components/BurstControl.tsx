import React from 'react';

interface BurstControlProps {
  burstCount: number;
  maxBurst: number;
}

const BurstControl: React.FC<BurstControlProps> = ({ burstCount, maxBurst }) => {
  return (
    <div className="flex items-center justify-between text-xs text-white/60">
      <span>Notes: x{burstCount}</span>
      <span>Max {maxBurst}</span>
    </div>
  );
};

export default BurstControl;
