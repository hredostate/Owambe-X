import React, { useMemo, useState } from 'react';
import { Badge } from '../../badges/types';
import { getBadgeUrl, shareBadge } from '../../badges/share';

interface BadgeShareModalProps {
  badge: Badge;
  onClose: () => void;
}

const BadgeShareModal: React.FC<BadgeShareModalProps> = ({ badge, onClose }) => {
  const captions = badge.captions.length ? badge.captions : ['Owambe Mode badge unlocked!'];
  const [selectedIndex, setSelectedIndex] = useState<number | 'random'>(0);
  const [status, setStatus] = useState('');

  const caption = useMemo(() => {
    if (selectedIndex === 'random') {
      return captions[Math.floor(Math.random() * captions.length)];
    }
    return captions[selectedIndex] ?? captions[0];
  }, [captions, selectedIndex]);

  const handleShare = async () => {
    const result = await shareBadge(badge, caption);
    setStatus(result.ok ? 'Shared!' : 'Downloaded + caption copied');
    window.setTimeout(() => setStatus(''), 1400);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = getBadgeUrl(badge, 1080);
    link.download = `${badge.id}.png`;
    link.click();
  };

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      setStatus('Caption copied');
      window.setTimeout(() => setStatus(''), 1200);
    } catch {
      setStatus('Copy failed');
      window.setTimeout(() => setStatus(''), 1200);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 max-w-md w-full space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Share Badge</h2>
          <button onClick={onClose} className="text-sm text-white/60">Close</button>
        </div>
        <div className="w-full aspect-square rounded-2xl bg-white/10 overflow-hidden flex items-center justify-center">
          <img src={getBadgeUrl(badge, 512)} alt={badge.title} className="object-contain" />
        </div>
        <div>
          <h3 className="text-base font-semibold">{badge.title}</h3>
          <p className="text-xs text-white/50">{badge.subtitle ?? 'Achievement badge'}</p>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">Caption</p>
          <div className="flex flex-wrap gap-2">
            {captions.map((item, index) => (
              <button
                key={item}
                onClick={() => setSelectedIndex(index)}
                className={`px-3 py-1 rounded-full text-xs ${selectedIndex === index ? 'bg-white text-black' : 'bg-white/10'}`}
              >
                {item}
              </button>
            ))}
            <button
              onClick={() => setSelectedIndex('random')}
              className={`px-3 py-1 rounded-full text-xs ${selectedIndex === 'random' ? 'bg-white text-black' : 'bg-white/10'}`}
            >
              Random
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={handleShare}
            className="w-full py-2 rounded-xl bg-green-500 text-black font-semibold"
          >
            Share / Save
          </button>
          <button
            onClick={handleDownload}
            className="w-full py-2 rounded-xl bg-white/10"
          >
            Download image
          </button>
          <button
            onClick={handleCopyCaption}
            className="w-full py-2 rounded-xl bg-white/10"
          >
            Copy caption
          </button>
        </div>
        <p className="text-[10px] text-white/40">No amounts or personal details.</p>
        {status && <p className="text-xs text-white/60">{status}</p>}
      </div>
    </div>
  );
};

export default BadgeShareModal;
