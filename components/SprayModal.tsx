import React, { useState } from 'react';
import { X, Flame, Sparkles, Music } from 'lucide-react';
import { Recipient } from '../types';
import toast from 'react-hot-toast';

interface SprayModalProps {
  recipient: Recipient;
  onClose: () => void;
  onSpray: (amount: number, burst: number, vibe: string) => void;
}

const PRESETS = [200, 500, 1000, 2000, 5000, 10000];
const VIBES = [
  { id: 'classic', label: 'Classic', icon: Sparkles, color: 'text-blue-400' },
  { id: 'gold', label: 'Gold Rush', icon: Flame, color: 'text-yellow-400' },
  { id: 'amapiano', label: 'Amapiano', icon: Music, color: 'text-purple-400' },
];

const SprayModal: React.FC<SprayModalProps> = ({ recipient, onClose, onSpray }) => {
  const [amount, setAmount] = useState(1000);
  const [burst, setBurst] = useState(10);
  const [vibe, setVibe] = useState('classic');
  const [isSpraying, setIsSpraying] = useState(false);

  const handleSpray = async () => {
    setIsSpraying(true);
    try {
      await onSpray(amount * 100, burst, vibe);
      toast.success(`Sprayed ₦${amount.toLocaleString()}!`);
      onClose();
    } catch (e) {
      toast.error('Spray failed. Check your wallet.');
    } finally {
      setIsSpraying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] w-full max-w-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Spray {recipient.label}</h2>
            <p className="text-xs text-gray-400">Select amount and rhythm</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <div className="space-y-3">
            <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Presets (₦)</label>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => setAmount(p)}
                  className={`py-3 rounded-xl border transition-all font-bold ${amount === p ? 'bg-purple-600 border-purple-400 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}`}
                >
                  {p.toLocaleString()}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="Custom amount..."
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Burst Count</label>
              <span className="text-purple-400 font-bold">{burst} Notes</span>
            </div>
            <input
              type="range" min="1" max="50"
              value={burst}
              onChange={(e) => setBurst(Number(e.target.value))}
              className="w-full accent-purple-600 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Vibe Pack</label>
            <div className="grid grid-cols-3 gap-3">
              {VIBES.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVibe(v.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${vibe === v.id ? 'bg-white/10 border-white/30' : 'bg-transparent border-transparent grayscale opacity-50'}`}
                >
                  <v.icon className={`w-6 h-6 ${v.color}`} />
                  <span className="text-xs font-medium">{v.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 pt-0">
          <button
            disabled={isSpraying}
            onClick={handleSpray}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-purple-900/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSpraying ? 'PROCESSING...' : 'SPRAY NOW'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SprayModal;
