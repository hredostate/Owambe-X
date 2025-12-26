import React from 'react';
import { Trophy } from 'lucide-react';
import { LeaderboardEntry } from '../types';

interface LeaderboardPanelProps {
  title: string;
  entries: LeaderboardEntry[];
  accent?: string;
}

const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({ title, entries, accent = 'text-yellow-500' }) => {
  return (
    <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2">
          <Trophy className={`w-5 h-5 ${accent}`} />
          {title}
        </h3>
      </div>
      <div className="space-y-4">
        {entries.map((entry, index) => (
          <div key={`${entry.name}-${index}`} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-500">#{index + 1}</span>
              <span className="font-medium">{entry.name}</span>
            </div>
            <span className="font-bold">₦{(entry.total_sprayed / 100).toLocaleString()}</span>
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-sm text-gray-500">No sprays yet.</p>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPanel;
