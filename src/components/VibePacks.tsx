import React from 'react';

interface VibePack {
  id: string;
  label: string;
  description: string;
  unlocked: boolean;
  active: boolean;
}

interface VibePacksProps {
  packs: VibePack[];
  onSelect: (id: string) => void;
}

const VibePacks: React.FC<VibePacksProps> = ({ packs, onSelect }) => {
  return (
    <div className="space-y-2">
      <h3 className="text-xs uppercase tracking-[0.2em] text-white/60">Vibe packs</h3>
      <div className="grid grid-cols-3 gap-2">
        {packs.map((pack) => (
          <button
            key={pack.id}
            onClick={() => pack.unlocked && onSelect(pack.id)}
            className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
              pack.active
                ? 'bg-purple-500 text-white border-purple-400'
                : 'bg-white/5 border-white/10 text-white/80'
            } ${!pack.unlocked ? 'opacity-50' : ''}`}
          >
            <div className="flex items-center justify-between">
              <span>{pack.label}</span>
              {!pack.unlocked && <span>🔒</span>}
            </div>
            <p className="text-[10px] text-white/60 mt-1">{pack.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default VibePacks;
