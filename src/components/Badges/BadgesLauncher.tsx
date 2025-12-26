import React, { useState } from 'react';
import BadgeGallery from './BadgeGallery';

const BadgesLauncher: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/30 border border-purple-400/40 hover:bg-purple-500/50"
      >
        Badges
      </button>
      {open && <BadgeGallery onClose={() => setOpen(false)} />}
    </>
  );
};

export default BadgesLauncher;
