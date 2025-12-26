import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LayoutDashboard, Plus, Edit, Trash, ToggleRight, Share2, QrCode } from 'lucide-react';
import { RecipientType } from '../types';

const HostDashboard: React.FC = () => {
  const { id } = useParams();
  const [eventStatus, setEventStatus] = useState<'draft' | 'live' | 'ended'>('live');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-purple-500" />
            Host Dashboard
          </h1>
          <p className="text-gray-400">Managing: Segun & Funke 2024</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl font-bold border border-white/10">
            <Share2 className="w-4 h-4" />
            Share Link
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl font-bold border border-white/10">
            <QrCode className="w-4 h-4" />
            Event QR
          </button>
          <Link
            to={`/owambe/screen/${id}`}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold transition-all"
          >
            Launch Screen Mode
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-white/5 border border-white/10 rounded-3xl">
          <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">Gross Sprayed</p>
          <h3 className="text-4xl font-black">₦2.45M</h3>
          <div className="mt-4 flex items-center gap-2 text-green-400 text-sm font-bold">
            <span>+12% in last 10m</span>
          </div>
        </div>
        <div className="p-8 bg-white/5 border border-white/10 rounded-3xl">
          <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">Total Guests</p>
          <h3 className="text-4xl font-black">342</h3>
          <div className="mt-4 flex items-center gap-2 text-purple-400 text-sm font-bold">
            <span>124 active sprayers</span>
          </div>
        </div>
        <div className="p-8 bg-white/5 border border-white/10 rounded-3xl">
          <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">Event Status</p>
          <div className="flex items-center gap-3 mt-1">
            <h3 className="text-4xl font-black capitalize">{eventStatus}</h3>
            <button
              onClick={() => setEventStatus(prev => prev === 'live' ? 'ended' : 'live')}
              className="p-1 hover:bg-white/10 rounded-lg"
            >
              <ToggleRight className={`w-10 h-10 ${eventStatus === 'live' ? 'text-green-500' : 'text-gray-500'}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Recipients</h2>
            <button className="flex items-center gap-2 text-purple-400 hover:text-purple-300 font-bold text-sm">
              <Plus className="w-4 h-4" />
              Add Recipient
            </button>
          </div>
          <div className="space-y-3">
            {[
              { label: 'The Celebrants', type: RecipientType.CELEBRANT, collected: 1800000 },
              { label: 'DJ Jimmy Jatt', type: RecipientType.DJ, collected: 250000 },
              { label: 'Family Table 1', type: RecipientType.TABLE, collected: 120000 },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl">
                <div>
                  <h4 className="font-bold">{r.label}</h4>
                  <p className="text-xs text-gray-500 uppercase tracking-widest">{r.type}</p>
                </div>
                <div className="text-right flex items-center gap-6">
                  <div>
                    <p className="text-xs text-gray-500 font-bold">Collected</p>
                    <p className="font-black">₦{r.collected.toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-white/10 rounded-lg"><Edit className="w-4 h-4 text-gray-400" /></button>
                    <button className="p-2 hover:bg-red-500/10 rounded-lg"><Trash className="w-4 h-4 text-red-500" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold">Recent Audit Logs</h2>
          <div className="space-y-2">
            {[
              { action: 'SPRAY_CREATED', user: 'Banky W.', meta: 'Sprayed ₦50k to Celebrants', time: '2m ago' },
              { action: 'MEMBER_JOINED', user: 'Simi', meta: 'Joined as Guest', time: '5m ago' },
              { action: 'EVENT_LIVE', user: 'You', meta: 'Toggled event to LIVE', time: '1h ago' },
            ].map((log, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl text-sm">
                <div className="flex gap-4">
                  <div className="w-1 h-8 bg-purple-600 rounded-full"></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs uppercase text-purple-400">{log.action}</span>
                      <span className="text-gray-500 text-[10px]">• {log.time}</span>
                    </div>
                    <p className="text-gray-300"><span className="font-bold">{log.user}:</span> {log.meta}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostDashboard;
