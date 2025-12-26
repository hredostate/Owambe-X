import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, PlusCircle, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { callEdgeFunction } from '../lib/supabase';

const LandingPage: React.FC = () => {
  const [eventId, setEventId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (eventId.trim()) {
      navigate(`/owambe/event/${eventId}`);
    }
  };

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const { data, error } = await callEdgeFunction<{ event: { id: string } }>('create_event', {
        title: 'My Owambe Party',
        venue: 'Main Hall',
        starts_at: new Date().toISOString(),
        payout_mode: 'hold',
        theme: 'classic'
      });

      if (error || !data?.event?.id) {
        throw error ?? new Error('Failed to create event');
      }

      toast.success('Event created!');
      navigate(`/owambe/host/${data.event.id}`);
    } catch (err) {
      toast.error('Could not create event. Please sign in.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 lg:py-24">
      <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-semibold">
            <Zap className="w-4 h-4 fill-current" />
            <span>The Future of Owambe is here</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
            Turn your party into <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-400">digital gold.</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl">
            Spray money in real-time with stunning animations. Create events, manage recipients, and watch the leaderboard heat up.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
            <button
              onClick={handleCreate}
              disabled={isCreating}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-500 rounded-2xl font-bold text-lg transition-all active:scale-95 shadow-xl shadow-purple-600/20 disabled:opacity-60"
            >
              <PlusCircle className="w-5 h-5" />
              {isCreating ? 'Creating...' : 'Create Event'}
            </button>
            <form onSubmit={handleJoin} className="flex-1 max-w-sm flex items-center p-1 bg-white/5 border border-white/10 rounded-2xl focus-within:border-purple-500 transition-colors">
              <input
                type="text"
                placeholder="Enter Event ID..."
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="flex-1 bg-transparent px-4 py-3 focus:outline-none font-medium"
              />
              <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        <div className="flex-1 relative w-full aspect-square max-w-md lg:max-w-none">
          <div className="absolute inset-0 bg-purple-600/20 rounded-full blur-[100px] animate-pulse"></div>
          <div className="relative grid grid-cols-2 gap-4">
            <div className="space-y-4 translate-y-8">
              <div className="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h4 className="font-bold mb-1">Realtime Spraying</h4>
                <p className="text-xs text-gray-500">Every spray triggers a celebration overlay.</p>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
                <div className="w-12 h-12 bg-pink-500/20 rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🏆</span>
                </div>
                <h4 className="font-bold mb-1">Leaderboards</h4>
                <p className="text-xs text-gray-500">Compete to be the top sprayer of the night.</p>
              </div>
            </div>
            <div className="space-y-4 -translate-y-8">
              <div className="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-2xl">📺</span>
                </div>
                <h4 className="font-bold mb-1">Screen Mode</h4>
                <p className="text-xs text-gray-500">Project the vibes on the big screens.</p>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
                <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🔐</span>
                </div>
                <h4 className="font-bold mb-1">Secure Ledger</h4>
                <p className="text-xs text-gray-500">Bank-grade double-entry transactions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-24 pt-24 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div>
          <div className="text-3xl font-bold mb-1">₦250M+</div>
          <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold">Total Sprayed</p>
        </div>
        <div>
          <div className="text-3xl font-bold mb-1">1,200+</div>
          <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold">Active Parties</p>
        </div>
        <div>
          <div className="text-3xl font-bold mb-1">50k+</div>
          <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold">Vibe Makers</p>
        </div>
        <div>
          <div className="text-3xl font-bold mb-1">99.9%</div>
          <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold">Ledger Uptime</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
