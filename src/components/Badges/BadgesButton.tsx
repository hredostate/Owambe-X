import React from 'react';

interface BadgesButtonProps {
  onClick: () => void;
}

const BadgesButton: React.FC<BadgesButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/30 border border-purple-400/40 hover:bg-purple-500/50"
    >
      Badges
    </button>
  );
};

export default BadgesButton;
