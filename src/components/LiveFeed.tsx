import React from 'react';
import { FeedItem } from '../fx/types';
import { formatNaira } from '../fx/format';

interface LiveFeedProps {
  items: FeedItem[];
}

const LiveFeed: React.FC<LiveFeedProps> = ({ items }) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
      <h3 className="text-sm uppercase tracking-[0.2em] text-white/70">Live Feed</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="text-xs text-white/70 flex items-center justify-between">
            <span className="truncate">{item.sender_name} → {item.recipient_label}</span>
            <span className="font-semibold">{formatNaira(item.amount_kobo)}</span>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs text-white/40">No sprays yet.</p>
        )}
      </div>
    </div>
  );
};

export default LiveFeed;
