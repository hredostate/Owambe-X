import React from 'react';

interface SoundToggleProps {
  enabled: boolean;
  unlockAudio: () => Promise<void>;
  setEnabled: (value: boolean) => void;
}

const SoundToggle: React.FC<SoundToggleProps> = ({ enabled, unlockAudio, setEnabled }) => {
  const handleToggle = async () => {
    if (!enabled) {
      await unlockAudio();
      setEnabled(true);
      return;
    }
    setEnabled(false);
  };

  return (
    <button
      onClick={handleToggle}
      className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/10 hover:bg-white/20"
    >
      Sound {enabled ? 'On' : 'Off'}
    </button>
  );
};

export default SoundToggle;
