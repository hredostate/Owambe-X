import React, { useEffect, useMemo, useRef, useState } from 'react';
import '../styles/ui.css';
import { formatNaira, toKobo } from '../lib/money';
import { mockSprayApi } from '../lib/mockApi';
import { useHaptics } from '../hooks/useHaptics';
import { useLowEndDevice } from '../hooks/useLowEndDevice';
import { useSprayInput } from '../hooks/useSprayInput';
import RecipientPicker from '../components/RecipientPicker';
import AmountChips from '../components/AmountChips';
import SprayPad from '../components/SprayPad';
import BurstControl from '../components/BurstControl';
import VibePacks from '../components/VibePacks';
import FlightFX from '../components/FlightFX';
import HowItWorks from '../components/HowItWorks';
import BadgesLauncher from '../components/Badges/BadgesLauncher';
import { useSfx } from '../audio/useSfx';
import SoundUnlockOverlay from '../components/SoundUnlockOverlay';
import SoundToggle from '../components/SoundToggle';

const RECIPIENTS = [
  { id: 'celebrant', label: 'Celebrant' },
  { id: 'mc', label: 'MC' },
  { id: 'dj', label: 'DJ' },
  { id: 'parents', label: 'Parents' },
  ...Array.from({ length: 10 }).map((_, i) => ({ id: `table-${i + 1}`, label: `Table ${i + 1}` })),
];

const AMOUNTS = [200, 500, 1000, 2000, 5000, 10000];

const UNLOCK_DURATION_MS = 10 * 60 * 1000;

const OwambeGuest: React.FC = () => {
  const [selectedRecipient, setSelectedRecipient] = useState(RECIPIENTS[0].id);
  const [selectedAmount, setSelectedAmount] = useState(AMOUNTS[2]);
  const [customAmountOpen, setCustomAmountOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [vibePack, setVibePack] = useState('classic');
  const [showCoach, setShowCoach] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState('');
  const [fxKey, setFxKey] = useState(0);
  const [unlockToast, setUnlockToast] = useState('');
  const [hapticsOn, setHapticsOn] = useState(true);

  const { enabled, unlockAudio, setEnabled, play } = useSfx();
  const { supported, vibrate } = useHaptics();
  const lowEnd = useLowEndDevice();
  const {
    burstCount,
    comboLevel,
    comboTimeLeft,
    comboHint,
    tapCount60s,
    incrementBurst,
    resetBurst,
    startHold,
    endHold,
    registerCommit,
    shouldPreserveComboOnError,
  } = useSprayInput();

  const amountKobo = useMemo(() => toKobo(selectedAmount), [selectedAmount]);
  const tapCommitRef = useRef<number | null>(null);
  const queuedCommitRef = useRef(false);
  const lastComboRef = useRef(comboLevel);

  const [unlockGoldUntil, setUnlockGoldUntil] = useState<number>(() => Number(localStorage.getItem('owambe_gold_unlock') ?? 0));
  const [unlockAmapianoUntil, setUnlockAmapianoUntil] = useState<number>(() => Number(localStorage.getItem('owambe_amapiano_unlock') ?? 0));

  const goldUnlocked = comboLevel >= 3 || unlockGoldUntil > Date.now();
  const amapianoUnlocked = tapCount60s.length >= 10 || unlockAmapianoUntil > Date.now();

  useEffect(() => {
    if (comboLevel >= 3 && lastComboRef.current < 3) {
      play('combo', { volume: 0.8 });
    }
    lastComboRef.current = comboLevel;
  }, [comboLevel, play]);

  useEffect(() => {
    if (comboLevel >= 3) {
      const expires = Date.now() + UNLOCK_DURATION_MS;
      setUnlockGoldUntil(expires);
      localStorage.setItem('owambe_gold_unlock', String(expires));
      play('unlock', { volume: 0.9 });
    }
  }, [comboLevel, play]);

  useEffect(() => {
    if (tapCount60s.length >= 10) {
      const expires = Date.now() + UNLOCK_DURATION_MS;
      setUnlockAmapianoUntil(expires);
      localStorage.setItem('owambe_amapiano_unlock', String(expires));
      play('unlock', { volume: 0.9 });
    }
  }, [tapCount60s.length, play]);

  const packs = [
    { id: 'classic', label: 'Classic', description: 'Always on', unlocked: true, active: vibePack === 'classic' },
    { id: 'gold', label: 'Gold', description: 'Unlock by combo x3', unlocked: goldUnlocked, active: vibePack === 'gold' },
    { id: 'amapiano', label: 'Amapiano', description: '10 sprays in 60s', unlocked: amapianoUnlocked, active: vibePack === 'amapiano' },
  ];

  const showToast = (message: string, duration = 1600) => {
    setToast(message);
    window.setTimeout(() => setToast(''), duration);
  };

  const handleCommit = async () => {
    setIsSending(true);
    const payload = {
      recipient_id: selectedRecipient,
      amount_kobo: amountKobo,
      burst_count: burstCount,
      vibe_pack: vibePack,
      idempotency_key: crypto.randomUUID(),
    };

    try {
      await mockSprayApi(payload);
      setFxKey((prev) => prev + 1);
      registerCommit();
      resetBurst();
      showToast(`Sent: ${formatNaira(amountKobo)} to ${RECIPIENTS.find((r) => r.id === selectedRecipient)?.label}`);
      play('spray', { volume: 0.8 });
      if (hapticsOn) vibrate(30);
    } catch (error) {
      showToast('Network hiccup — try again', 1200);
      if (!shouldPreserveComboOnError()) {
        resetBurst();
      }
    } finally {
      setIsSending(false);
      if (queuedCommitRef.current) {
        queuedCommitRef.current = false;
        handleCommit();
      }
    }
  };

  const scheduleCommit = () => {
    if (tapCommitRef.current) {
      window.clearTimeout(tapCommitRef.current);
    }
    tapCommitRef.current = window.setTimeout(() => {
      tapCommitRef.current = null;
      if (isSending) {
        queuedCommitRef.current = true;
        return;
      }
      handleCommit();
    }, 350);
  };

  const handleTap = () => {
    incrementBurst();
    play('tap', { volume: 0.35 });
    if (hapticsOn) vibrate(12);
    scheduleCommit();
  };

  const handleHoldStart = () => {
    if (tapCommitRef.current) {
      window.clearTimeout(tapCommitRef.current);
      tapCommitRef.current = null;
    }
    startHold();
    if (hapticsOn) vibrate(8);
  };

  const handleHoldEnd = () => {
    endHold();
    if (tapCommitRef.current) {
      window.clearTimeout(tapCommitRef.current);
      tapCommitRef.current = null;
    }
    if (!isSending) {
      handleCommit();
    } else {
      queuedCommitRef.current = true;
    }
  };

  const handleCustomAmount = () => {
    const value = Number(customAmount);
    if (!Number.isFinite(value) || value < 100 || value > 50000) {
      showToast('Enter ₦100 – ₦50,000', 1200);
      return;
    }
    setSelectedAmount(value);
    setCustomAmountOpen(false);
  };

  const handleUnlock = (id: string) => {
    setVibePack(id);
    setUnlockToast('UNLOCKED');
    play('unlock', { volume: 0.9 });
    if (hapticsOn) vibrate([20, 40, 20]);
    window.setTimeout(() => setUnlockToast(''), 1000);
  };

  return (
    <div className="min-h-screen bg-[#0b0b12] text-white p-4 space-y-4">
      <SoundUnlockOverlay enabled={enabled} unlockAudio={unlockAudio} setEnabled={setEnabled} />
      {showCoach && <HowItWorks onClose={() => setShowCoach(false)} />}
      <FlightFX burstCount={burstCount} amountKobo={amountKobo} vibePack={vibePack} lowEnd={lowEnd} triggerKey={fxKey} />

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Segun & Funke 2024</h1>
          <div className="flex items-center gap-2 text-xs text-white/60">
            <span className="w-2 h-2 rounded-full bg-green-400" /> Connected
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <BadgesLauncher />
          <SoundToggle enabled={enabled} unlockAudio={unlockAudio} setEnabled={setEnabled} />
          <button onClick={() => supported && setHapticsOn((prev) => !prev)} className="px-3 py-1 rounded-full bg-white/10">
            Haptics {supported && hapticsOn ? 'On' : 'Off'}
          </button>
        </div>
      </header>

      <RecipientPicker recipients={RECIPIENTS} selectedId={selectedRecipient} onSelect={setSelectedRecipient} />

      <AmountChips
        amounts={AMOUNTS}
        selected={selectedAmount}
        onSelect={setSelectedAmount}
        onCustom={() => setCustomAmountOpen(true)}
      />

      <div className="space-y-3">
        <SprayPad onTap={handleTap} onHoldStart={handleHoldStart} onHoldEnd={handleHoldEnd} disabled={isSending} />
        <BurstControl burstCount={burstCount} maxBurst={lowEnd ? 12 : 20} />
        <div className="flex items-center justify-between text-xs text-white/60">
          <span>Combo x{comboLevel} (visual only)</span>
          <span>{Math.ceil(comboTimeLeft / 1000)}s</span>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full bg-purple-400" style={{ width: `${Math.min(100, (comboTimeLeft / 6000) * 100)}%` }} />
        </div>
        {comboLevel > 1 && comboTimeLeft > 0 && (
          <div className="text-center text-sm font-bold ow-combo-punch">COMBO x{comboLevel}</div>
        )}
        {comboHint && <div className="text-xs text-white/70">{comboHint}</div>}
      </div>

      <VibePacks
        packs={packs}
        onSelect={(id) => {
          if (id === 'gold' && !goldUnlocked) return;
          if (id === 'amapiano' && !amapianoUnlocked) return;
          handleUnlock(id);
        }}
      />

      {customAmountOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50">
          <div className="bg-[#15151f] border border-white/10 rounded-2xl p-4 w-full max-w-xs space-y-3">
            <h3 className="text-sm font-bold">Custom Amount</h3>
            <input
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCustomAmount}
                className="flex-1 py-2 rounded-xl bg-white text-black font-bold"
              >
                Set
              </button>
              <button
                onClick={() => setCustomAmountOpen(false)}
                className="flex-1 py-2 rounded-xl bg-white/10"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-2 rounded-full text-sm font-semibold">
          {toast}
        </div>
      )}

      {unlockToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold ow-unlock-pop">
          {unlockToast}
        </div>
      )}
    </div>
  );
};

export default OwambeGuest;
