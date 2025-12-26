import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Coins, PartyPopper, Volume2, VolumeX } from 'lucide-react';
import { LeaderboardEntry, Spray, SprayCreatedPayload } from '../types';
import { useEventRealtime } from '../hooks/useEventRealtime';
import ScreenOverlayAnimator from '../components/ScreenOverlayAnimator';
import LeaderboardPanel from '../components/LeaderboardPanel';
import HeatMeter from '../components/HeatMeter';

const ScreenMode: React.FC = () => {
  const { id } = useParams();
  const [sprays, setSprays] = useState<Spray[]>([]);
  const [history, setHistory] = useState<Spray[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [now, setNow] = useState(Date.now());

  const handleSprayCreated = useCallback((payload: SprayCreatedPayload) => {
    const spray: Spray = {
      id: payload.spray_id,
      event_id: id ?? '',
      sender_name: payload.sender_name,
      recipient_label: payload.recipient_label,
      amount: payload.amount,
      burst_count: payload.burst_count,
      vibe_pack: payload.vibe_pack,
      created_at: payload.created_at,
    };

    setSprays((prev) => [spray, ...prev].slice(0, 8));
    setHistory((prev) => [spray, ...prev].slice(0, 200));
  }, [id]);

  const { connected } = useEventRealtime(id, handleSprayCreated);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const totalsLastMinute = useMemo(() => {
    const cutoff = now - 60_000;
    return history.reduce((sum, spray) => {
      if (new Date(spray.created_at).getTime() >= cutoff) {
        return sum + spray.amount;
      }
      return sum;
    }, 0);
  }, [history, now]);

  const heat = Math.min(100, Math.round(totalsLastMinute / 100000));

  const topSprayers = useMemo<LeaderboardEntry[]>(() => {
    const totals = new Map<string, number>();
    history.forEach((spray) => {
      totals.set(spray.sender_name, (totals.get(spray.sender_name) ?? 0) + spray.amount);
    });
    return Array.from(totals.entries())
      .map(([name, total_sprayed]) => ({ name, total_sprayed }))
      .sort((a, b) => b.total_sprayed - a.total_sprayed)
      .slice(0, 6);
  }, [history]);

  const topRecipients = useMemo<LeaderboardEntry[]>(() => {
    const totals = new Map<string, number>();
    history.forEach((spray) => {
      totals.set(spray.recipient_label, (totals.get(spray.recipient_label) ?? 0) + spray.amount);
    });
    return Array.from(totals.entries())
      .map(([name, total_sprayed]) => ({ name, total_sprayed }))
      .sort((a, b) => b.total_sprayed - a.total_sprayed)
      .slice(0, 6);
  }, [history]);

  return (
    <div className="fixed inset-0 bg-black z-[1000] overflow-hidden flex flex-col font-sans select-none">
      <ScreenOverlayAnimator sprays={sprays} soundEnabled={soundEnabled} />

      <div className="h-24 bg-gradient-to-b from-purple-900/40 to-transparent flex items-center justify-between px-12 border-b border-white/5 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-600 rounded-2xl">
            <Coins className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Owambe Mode</h1>
            <p className="text-purple-400 font-bold text-sm tracking-widest uppercase">Live Celebration Feed</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-3xl font-black text-white">₦{(history.reduce((sum, spray) => sum + spray.amount, 0) / 100).toLocaleString()}</div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Total Sprayed</p>
          </div>
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 text-sm font-bold"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            {soundEnabled ? 'Sound On' : 'Sound Off'}
          </button>
          <span className={`text-xs uppercase tracking-widest ${connected ? 'text-green-400' : 'text-gray-500'}`}>
            {connected ? 'Live' : 'Connecting'}
          </span>
        </div>
      </div>

      <div className="flex-1 flex gap-8 p-8 relative z-10 overflow-hidden">
        <div className="flex-1 flex flex-col gap-4">
          {sprays.map((s, i) => (
            <div
              key={s.id}
              className={`flex items-center gap-6 p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl animate-in slide-in-from-left duration-500 ${i === 0 ? 'scale-105 border-purple-500/50 shadow-2xl shadow-purple-900/20 bg-white/10' : 'opacity-70 scale-95'}`}
            >
              <div className={`p-4 rounded-2xl ${i === 0 ? 'bg-purple-600' : 'bg-white/10'}`}>
                <PartyPopper className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Incoming Spray</p>
                <h2 className="text-3xl font-black">
                  <span className="text-purple-400">{s.sender_name}</span> sprayed <span className="text-white">{s.recipient_label}</span>
                </h2>
              </div>
              <div className="text-4xl font-black text-white">
                ₦{(s.amount / 100).toLocaleString()}
              </div>
            </div>
          ))}
          {sprays.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-30">
              <PartyPopper className="w-32 h-32" />
              <h2 className="text-3xl font-bold uppercase tracking-tighter">Waiting for the first vibe...</h2>
              <p className="text-lg uppercase tracking-widest">Share the event code to start spraying</p>
            </div>
          )}
        </div>

        <div className="w-[420px] flex flex-col gap-6">
          <HeatMeter heat={heat} totalLastMinute={totalsLastMinute} />
          <LeaderboardPanel title="Top Sprayers" entries={topSprayers} />
          <LeaderboardPanel title="Top Recipients" entries={topRecipients} accent="text-purple-400" />
          <div className="bg-purple-600/20 border border-purple-500/30 rounded-3xl p-6 space-y-2">
            <p className="text-xs font-black uppercase tracking-widest text-purple-300">Connect to Spray</p>
            <h4 className="font-bold text-lg leading-tight">Party ID: {id?.slice(0, 6).toUpperCase()}</h4>
            <p className="text-xs text-gray-300">owambe.party/join</p>
          </div>
        </div>
      </div>

      <div className="h-16 bg-white/5 flex items-center border-t border-white/5 overflow-hidden">
        <div className="whitespace-nowrap animate-marquee flex gap-12 text-sm font-black uppercase tracking-[0.2em] text-gray-500">
          <span>• NEW SPRAY ALERT • LEADERBOARD UPDATED • KEEP THE VIBES GOING • NEW SPRAY ALERT • LEADERBOARD UPDATED • KEEP THE VIBES GOING</span>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ScreenMode;
