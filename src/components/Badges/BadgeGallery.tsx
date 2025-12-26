import React, { useMemo, useState } from 'react';
import { useBadgeCatalog } from '../../badges/catalog';
import { useEarnedBadges } from '../../badges/award';
import { Badge } from '../../badges/types';
import { getBadgeUrl } from '../../badges/share';
import BadgeShareModal from './BadgeShareModal';

interface BadgeGalleryProps {
  onClose: () => void;
}

const BadgeGallery: React.FC<BadgeGalleryProps> = ({ onClose }) => {
  const { badges, loading, error } = useBadgeCatalog();
  const earned = useEarnedBadges();
  const [filter, setFilter] = useState<'earned' | 'all'>('earned');
  const [selected, setSelected] = useState<Badge | null>(null);

  const earnedIds = useMemo(() => new Set(earned.map((badge) => badge.badgeId)), [earned]);

  const filtered = useMemo(() => {
    if (filter === 'all') return badges;
    return badges.filter((badge) => earnedIds.has(badge.id));
  }, [badges, earnedIds, filter]);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
      <div className="bg-[#121212] border border-white/10 rounded-3xl p-6 max-w-2xl w-full space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Badges</h2>
          <button onClick={onClose} className="text-sm text-white/60">Close</button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('earned')}
            className={`px-3 py-1 rounded-full text-xs ${filter === 'earned' ? 'bg-white text-black' : 'bg-white/10'}`}
          >
            Earned
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-xs ${filter === 'all' ? 'bg-white text-black' : 'bg-white/10'}`}
          >
            All
          </button>
        </div>
        {loading && <p className="text-xs text-white/50">Loading badges…</p>}
        {error && <p className="text-xs text-red-300">{error}</p>}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[60vh] overflow-auto">
          {filtered.map((badge) => (
            <button
              key={badge.id}
              onClick={() => setSelected(badge)}
              className="bg-white/5 border border-white/10 rounded-2xl p-3 text-left"
            >
              <div className="w-full aspect-square bg-white/10 rounded-xl overflow-hidden flex items-center justify-center">
                <img src={getBadgeUrl(badge, 512)} alt={badge.title} className="object-contain" />
              </div>
              <p className="text-sm font-semibold mt-2">{badge.title}</p>
              <p className="text-xs text-white/50">{badge.subtitle ?? 'Achievement badge'}</p>
            </button>
          ))}
        </div>
      </div>
      {selected && (
        <BadgeShareModal badge={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
};

export default BadgeGallery;
