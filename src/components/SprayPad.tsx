import React from 'react';

interface SprayPadProps {
  onTap: () => void;
  onHoldStart: () => void;
  onHoldEnd: () => void;
  disabled: boolean;
}

const SprayPad: React.FC<SprayPadProps> = ({ onTap, onHoldStart, onHoldEnd, disabled }) => {
  return (
    <button
      onClick={onTap}
      onMouseDown={onHoldStart}
      onMouseUp={onHoldEnd}
      onMouseLeave={onHoldEnd}
      onTouchStart={onHoldStart}
      onTouchEnd={onHoldEnd}
      disabled={disabled}
      className="relative w-full py-6 rounded-3xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-2xl font-black shadow-lg active:scale-[0.98] transition-transform disabled:opacity-60"
    >
      SPRAY
    </button>
  );
};

export default SprayPad;
