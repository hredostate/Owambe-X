import React, { useMemo } from 'react';

const STORAGE_ENABLED = 'owambe.sound.enabled';
const STORAGE_DISMISSED = 'owambe.sound.dismissed';

interface SoundUnlockOverlayProps {
  enabled: boolean;
  unlockAudio: () => Promise<void>;
  setEnabled: (value: boolean) => void;
}

const SoundUnlockOverlay: React.FC<SoundUnlockOverlayProps> = ({ enabled, unlockAudio, setEnabled }) => {
  const dismissed = useMemo(() => localStorage.getItem(STORAGE_DISMISSED) === '1', []);

  if (enabled || dismissed) return null;

  const handleEnable = async () => {
    await unlockAudio();
    setEnabled(true);
    localStorage.setItem(STORAGE_ENABLED, '1');
    localStorage.setItem(STORAGE_DISMISSED, '0');
  };

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_ENABLED, '0');
    localStorage.setItem(STORAGE_DISMISSED, '1');
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
      <div className="bg-[#141414] border border-white/10 rounded-3xl p-6 max-w-sm w-full space-y-4 text-center">
        <h2 className="text-lg font-bold">Enable party sounds?</h2>
        <p className="text-xs text-white/60">iPhone blocks audio until you tap once. Tap below to enable.</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={handleEnable}
            className="w-full py-2 rounded-xl bg-white text-black font-semibold"
          >
            Enable 🔊
          </button>
          <button
            onClick={handleDismiss}
            className="w-full py-2 rounded-xl bg-white/10"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
};

export default SoundUnlockOverlay;
