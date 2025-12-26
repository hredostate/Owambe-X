import React from 'react';
import { formatNaira } from '../fx/format';
import { LeaderEntry } from '../fx/types';

interface LeaderboardProps {
  title: string;
  entries: LeaderEntry[];
  showAmount?: boolean;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ title, entries, showAmount = true }) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
      <h3 className="text-sm uppercase tracking-[0.2em] text-white/70">{title}</h3>
      <div className="space-y-2">
        {entries.map((entry, index) => (
          <div key={`${entry.name}-${index}`} className="flex items-center justify-between text-sm">
            <span className="font-semibold">#{index + 1} {entry.name}</span>
            {showAmount && <span className="font-bold">{formatNaira(entry.total_kobo)}</span>}
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-xs text-white/40">Waiting for first spray...</p>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
