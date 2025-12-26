import React from 'react';
import { formatNaira } from '../fx/format';
import { TableWarState } from '../fx/useGameState';

interface TableWarPanelProps {
  state: TableWarState;
}

const TableWarPanel: React.FC<TableWarPanelProps> = ({ state }) => {
  if (state.status === 'idle') {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white/60">
        Table Wars ready when heat rises.
      </div>
    );
  }

  if (state.status === 'cooldown') {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white/60">
        Table Wars cooling down...
      </div>
    );
  }

  const scoreA = state.scores[state.tableA ?? ''] ?? 0;
  const scoreB = state.scores[state.tableB ?? ''] ?? 0;
  const total = Math.max(scoreA + scoreB, 1);
  const progressA = Math.round((scoreA / total) * 100);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
      <div className="text-xs uppercase tracking-[0.2em] text-white/60">Table War</div>
      <div className="flex items-center justify-between text-sm font-semibold">
        <span>{state.tableA}</span>
        <span>VS</span>
        <span>{state.tableB}</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full bg-purple-400" style={{ width: `${progressA}%` }} />
      </div>
      <div className="flex items-center justify-between text-xs text-white/70">
        <span>{formatNaira(scoreA)}</span>
        <span>{formatNaira(scoreB)}</span>
      </div>
      {state.status === 'resolved' && state.winner && (
        <div className="text-xs text-yellow-300">{state.winner} WINS! 🔥</div>
      )}
    </div>
  );
};

export default TableWarPanel;
