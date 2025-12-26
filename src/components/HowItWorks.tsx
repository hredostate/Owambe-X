import React from 'react';

interface HowItWorksProps {
  onClose: () => void;
}

const HowItWorks: React.FC<HowItWorksProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
      <div className="bg-[#121212] border border-white/10 rounded-3xl p-6 max-w-sm w-full space-y-4">
        <h2 className="text-xl font-bold">How it works</h2>
        <ol className="space-y-3 text-sm text-white/70">
          <li>1. Pick a recipient.</li>
          <li>2. Pick an amount.</li>
          <li>3. Tap SPRAY to send notes to the screen.</li>
          <li>4. Combos unlock FX (visual only).</li>
        </ol>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-white text-black font-bold"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default HowItWorks;
