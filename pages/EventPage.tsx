
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// Fix: Added PartyPopper to imports
import { MapPin, Calendar, Users, Trophy, Tv, AlertCircle, PartyPopper } from 'lucide-react';
import { Recipient, RecipientType, Event, EventStatus, PayoutMode } from '../types';
import RecipientCard from '../components/RecipientCard';
import SprayModal from '../components/SprayModal';
import { callEdgeFunction } from '../lib/supabase';

// Mock Data
const MOCK_EVENT: Event = {
  id: 'event-123',
  title: 'Segun & Funke 2024: The Union',
  venue: 'Oriental Hotel, Grand Ballroom',
  starts_at: '2024-12-15T16:00:00Z',
  status: EventStatus.LIVE,
  payout_mode: PayoutMode.HOLD,
  theme: 'classic',
  created_at: '2024-11-01T10:00:00Z'
};

const MOCK_RECIPIENTS: Recipient[] = [
  { id: 'r1', event_id: 'event-123', label: 'The Celebrants', type: RecipientType.CELEBRANT, is_active: true },
  { id: 'r2', event_id: 'event-123', label: 'DJ Jimmy Jatt', type: RecipientType.DJ, is_active: true },
  { id: 'r3', event_id: 'event-123', label: 'MC Galaxy', type: RecipientType.MC, is_active: true },
  { id: 'r4', event_id: 'event-123', label: 'Family Table', type: RecipientType.TABLE, table_no: 1, is_active: true },
  { id: 'r5', event_id: 'event-123', label: 'Parents of the Groom', type: RecipientType.PARENT, is_active: true },
  { id: 'r6', event_id: 'event-123', label: 'Bride Friends', type: RecipientType.TABLE, table_no: 5, is_active: true },
];

const EventPage: React.FC = () => {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(MOCK_EVENT);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);

  const handleSpray = async (amount: number, burst: number, vibe: string) => {
    if (!selectedRecipient) return;
    
    // Fix: callEdgeFunction now has proper return type
    const { error } = await callEdgeFunction('spray', {
      event_id: id,
      recipient_id: selectedRecipient.id,
      amount,
      burst_count: burst,
      vibe_pack: vibe,
      idempotency_key: crypto.randomUUID()
    });

    if (error) throw error;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 pb-32">
      {/* Event Header */}
      <div className="relative p-8 rounded-3xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5">
           <PartyPopper className="w-32 h-32" />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live Now
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold">{event?.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-400 font-medium">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {event?.venue}
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Today, 4:00 PM
              </div>
            </div>
          </div>
          <Link 
            to={`/screen/${id}`}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-sm font-bold border border-white/10 transition-colors"
          >
            <Tv className="w-4 h-4" />
            Watch Screen Mode
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
             <h2 className="text-xl font-bold flex items-center gap-2">
               <Users className="w-5 h-5 text-purple-500" />
               Select Recipient
             </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {MOCK_RECIPIENTS.map((r) => (
              <RecipientCard 
                key={r.id} 
                recipient={r} 
                onClick={() => setSelectedRecipient(r)} 
              />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-6">
            <h3 className="font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Top Sprayers
            </h3>
            <div className="space-y-4">
              {[
                { name: 'Chief Adeleke', amount: 50000 },
                { name: 'Hajia B.', amount: 35000 },
                { name: 'Dr. Kunle', amount: 28000 },
                { name: 'You', amount: 0, isMe: true },
              ].map((entry, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-500">#{i+1}</span>
                    <span className={entry.isMe ? 'text-purple-400 font-bold' : 'font-medium'}>{entry.name}</span>
                  </div>
                  <span className="font-bold">₦{entry.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-3xl">
            <div className="flex gap-4">
              <AlertCircle className="w-6 h-6 text-blue-400 shrink-0" />
              <div>
                <h4 className="font-bold text-sm mb-1">Instant Payouts</h4>
                <p className="text-xs text-gray-400 leading-relaxed">Your money reaches recipients instantly. Track all your sprays in your wallet history.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedRecipient && (
        <SprayModal 
          recipient={selectedRecipient} 
          onClose={() => setSelectedRecipient(null)}
          onSpray={handleSpray}
        />
      )}
    </div>
  );
};

export default EventPage;