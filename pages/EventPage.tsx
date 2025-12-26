import React, { useCallback, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Users, Tv, AlertCircle, PartyPopper } from 'lucide-react';
import { Event, EventStatus, LeaderboardEntry, PayoutMode, Recipient, RecipientType, SprayCreatedPayload } from '../types';
import RecipientCard from '../components/RecipientCard';
import SprayModal from '../components/SprayModal';
import LeaderboardPanel from '../components/LeaderboardPanel';
import { callEdgeFunction } from '../lib/supabase';
import { useEventRealtime } from '../hooks/useEventRealtime';

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
  const [event] = useState<Event | null>(MOCK_EVENT);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [recentSprays, setRecentSprays] = useState<SprayCreatedPayload[]>([]);

  const handleSpray = async (amount: number, burst: number, vibe: string) => {
    if (!selectedRecipient) return;

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

  const onSprayCreated = useCallback((payload: SprayCreatedPayload) => {
    setRecentSprays((prev) => [payload, ...prev].slice(0, 15));
  }, []);

  useEventRealtime(id, onSprayCreated);

  const leaderboard = useMemo<LeaderboardEntry[]>(() => {
    const totals = new Map<string, number>();
    recentSprays.forEach((spray) => {
      totals.set(spray.sender_name, (totals.get(spray.sender_name) ?? 0) + spray.amount);
    });

    return Array.from(totals.entries())
      .map(([name, total_sprayed]) => ({ name, total_sprayed }))
      .sort((a, b) => b.total_sprayed - a.total_sprayed)
      .slice(0, 5);
  }, [recentSprays]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 pb-32">
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
            to={`/owambe/screen/${id}`}
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
          <LeaderboardPanel title="Top Sprayers" entries={leaderboard} />

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
