import React from 'react';

interface TogglesProps {
  soundOn: boolean;
  onSoundToggle: () => void;
  performanceMode: boolean;
  onPerformanceToggle: () => void;
  demoMode: boolean;
  onDemoToggle: () => void;
}

const Toggles: React.FC<TogglesProps> = ({
  soundOn,
  onSoundToggle,
  performanceMode,
  onPerformanceToggle,
  demoMode,
  onDemoToggle,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={onSoundToggle}
        className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 border border-white/10 hover:bg-white/20"
      >
        {soundOn ? 'Sound On' : 'Sound Off'}
      </button>
      <button
        onClick={onPerformanceToggle}
        className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 border border-white/10 hover:bg-white/20"
      >
        {performanceMode ? 'Performance Mode' : 'Cinematic Mode'}
      </button>
      <button
        onClick={onDemoToggle}
        className="px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-500/30 border border-purple-400/40 hover:bg-purple-500/50"
      >
        {demoMode ? 'Stop Demo' : 'Demo Mode'}
      </button>
    </div>
  );
};

export default Toggles;
