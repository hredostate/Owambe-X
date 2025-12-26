import React from 'react';

interface NudgesProps {
  message: string;
}

const Nudges: React.FC<NudgesProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="text-xs text-white/70 bg-white/5 border border-white/10 rounded-full px-3 py-1">
      {message}
    </div>
  );
};

export default Nudges;
