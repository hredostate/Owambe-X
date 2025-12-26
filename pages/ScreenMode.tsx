
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
// Fix: Added PartyPopper to imports
import { Trophy, Flame, Coins, Zap, PartyPopper } from 'lucide-react';
import { Spray } from '../types';

interface Particle {
  id: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  duration: number;
}

const ScreenMode: React.FC = () => {
  const { id } = useParams();
  const [sprays, setSprays] = useState<Spray[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [heat, setHeat] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sound triggers
  useEffect(() => {
    audioRef.current = new Audio('https://www.soundjay.com/buttons/button-42.mp3');
  }, []);

  const triggerAnimation = useCallback((count: number) => {
    const newParticles: Particle[] = Array.from({ length: Math.min(count, 30) }).map(() => ({
      id: Math.random().toString(36),
      x: Math.random() * 100,
      y: 110,
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 1,
      duration: 2 + Math.random() * 2
    }));

    setParticles(prev => [...prev, ...newParticles]);
    setHeat(prev => Math.min(prev + count, 100));

    // Cleanup after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 4000);

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, []);

  // Simulated Realtime
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const mockSpray: Spray = {
          id: Math.random().toString(),
          event_id: id || '',
          sender_name: ['Tunde', 'Chioma', 'Alhaji', 'Banky', 'Yinka'][Math.floor(Math.random() * 5)],
          recipient_label: 'The Celebrant',
          amount: 50000,
          burst_count: Math.floor(Math.random() * 20) + 1,
          vibe_pack: 'classic',
          created_at: new Date().toISOString()
        };
        setSprays(prev => [mockSpray, ...prev].slice(0, 10));
        triggerAnimation(mockSpray.burst_count);
      }
    }, 3000);

    // Heat decay
    const decay = setInterval(() => {
      setHeat(prev => Math.max(0, prev - 1));
    }, 500);

    return () => {
      clearInterval(interval);
      clearInterval(decay);
    };
  }, [id, triggerAnimation]);

  return (
    <div className="fixed inset-0 bg-black z-[1000] overflow-hidden flex flex-col font-sans select-none">
      {/* Background Particles Overlay */}
      {particles.map(p => (
        <div 
          key={p.id}
          className="money-particle"
          style={{
            left: `${p.x}%`,
            fontSize: `${24 * p.scale}px`,
            animationDuration: `${p.duration}s`
          }}
        >
          {['💵', '💸', '💰', '✨'][Math.floor(Math.random() * 4)]}
        </div>
      ))}

      {/* Top Banner */}
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
        
        <div className="flex items-center gap-12">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 text-yellow-500">
               <Flame className={`w-6 h-6 ${heat > 50 ? 'animate-bounce' : ''}`} />
               <span className="text-2xl font-black">{heat}°C</span>
            </div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Party Heat Index</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-white">₦2,450,000</div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Total Sprayed Today</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-8 p-8 relative z-10 overflow-hidden">
        {/* Left Side: Feed */}
        <div className="flex-1 flex flex-col gap-4">
          {sprays.map((s, i) => (
            <div 
              key={s.id}
              className={`flex items-center gap-6 p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl animate-in slide-in-from-left duration-500 ${i === 0 ? 'scale-105 border-purple-500/50 shadow-2xl shadow-purple-900/20 bg-white/10' : 'opacity-60 scale-95'}`}
            >
              <div className={`p-4 rounded-2xl ${i === 0 ? 'bg-purple-600' : 'bg-white/10'}`}>
                <Zap className="w-8 h-8" />
              </div>
              <div className="flex-1">
                 <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Incoming Spray</p>
                 <h2 className="text-3xl font-black">
                   <span className="text-purple-400">{s.sender_name}</span> sprayed <span className="text-white">{s.recipient_label}</span>
                 </h2>
              </div>
              <div className="text-4xl font-black text-white">
                ₦{(s.amount/100).toLocaleString()}
              </div>
            </div>
          ))}
          {sprays.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-30">
              <PartyPopper className="w-32 h-32" />
              <h2 className="text-3xl font-bold uppercase tracking-tighter">Waiting for the first vibe...</h2>
              <p className="text-lg uppercase tracking-widest">Scan QR to join the spraying team</p>
            </div>
          )}
        </div>

        {/* Right Side: Leaderboard */}
        <div className="w-[450px] flex flex-col gap-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 flex-1 space-y-8 overflow-hidden relative">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-500" />
                Table of Honor
              </h3>
            </div>

            <div className="space-y-6">
              {[
                { name: 'Chief Adeleke', total: 450000, rank: 1, color: 'text-yellow-400' },
                { name: 'Alhaji G.', total: 320000, rank: 2, color: 'text-gray-300' },
                { name: 'Princess Funmi', total: 280000, rank: 3, color: 'text-amber-600' },
                { name: 'Dr. Kunle', total: 150000, rank: 4, color: 'text-white' },
                { name: 'Engr. Segun', total: 120000, rank: 5, color: 'text-white' },
                { name: 'Mrs. Balogun', total: 95000, rank: 6, color: 'text-white' },
              ].map((entry) => (
                <div key={entry.rank} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <span className={`text-2xl font-black w-8 ${entry.color}`}>#{entry.rank}</span>
                    <span className="text-2xl font-bold group-hover:text-purple-400 transition-colors">{entry.name}</span>
                  </div>
                  <div className="text-2xl font-black text-white">
                    ₦{entry.total.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Event Info Card */}
            <div className="absolute bottom-8 left-8 right-8 p-6 bg-purple-600/20 border border-purple-500/30 rounded-3xl">
              <p className="text-xs font-black uppercase tracking-widest text-purple-400 mb-2">Connect to Spray</p>
              <div className="flex items-center gap-4">
                <div className="bg-white p-2 rounded-xl">
                  {/* Mock QR */}
                  <div className="w-16 h-16 bg-black flex items-center justify-center text-[10px] text-white p-1 text-center font-bold">
                    OWAMBE SCAN
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-lg leading-tight">Party ID: {id?.slice(0, 6).toUpperCase()}</h4>
                  <p className="text-xs text-gray-500">owambe.party/join</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Live Activity Marquee */}
      <div className="h-16 bg-white/5 flex items-center border-t border-white/5 overflow-hidden">
        <div className="whitespace-nowrap animate-marquee flex gap-12 text-sm font-black uppercase tracking-[0.2em] text-gray-500">
          <span>• NEW SPRAY FROM TUNDE • CHIOMA JOINED THE PARTY • LEADERBOARD UPDATED • CELEBRANT CAKE CUTTING COMMENCING SOON • NEW SPRAY FROM TUNDE • CHIOMA JOINED THE PARTY • LEADERBOARD UPDATED</span>
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