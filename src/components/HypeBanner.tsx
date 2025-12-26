import React from 'react';

interface HypeBannerProps {
  active: boolean;
  tier: string;
}

const HypeBanner: React.FC<HypeBannerProps> = ({ active, tier }) => {
  if (!active) return null;

  return (
    <div className="ow-hype-banner text-center text-2xl md:text-4xl font-black uppercase tracking-[0.3em] text-white bg-purple-500/40 px-6 py-3 rounded-full border border-purple-300/40">
      HYPE MOMENT • {tier}
    </div>
  );
};

export default HypeBanner;
