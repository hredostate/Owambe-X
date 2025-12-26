import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import '../fx/fx.css';
import { formatNaira } from '../fx/format';
import { useFxBudget } from '../fx/useFxBudget';
import { useSprayQueue } from '../fx/useSprayQueue';
import { useGameState } from '../fx/useGameState';
import CanvasFX from '../fx/CanvasFX';
import DomFX from '../fx/DomFX';
import { SprayEvent } from '../fx/types';
import { useOwambeRealtimeMock } from '../hooks/useOwambeRealtimeMock';
import HeatMeter from '../components/HeatMeter';
import ComboHUD from '../components/ComboHUD';
import BossBar from '../components/BossBar';
import TableWarPanel from '../components/TableWarPanel';
import HypeBanner from '../components/HypeBanner';
import Leaderboard from '../components/Leaderboard';
import LiveFeed from '../components/LiveFeed';
import Toggles from '../components/Toggles';
import Nudges from '../components/Nudges';
import BadgesLauncher from '../components/Badges/BadgesLauncher';
import { awardBadge } from '../badges/award';
import { useSfx } from '../audio/useSfx';
import SoundUnlockOverlay from '../components/SoundUnlockOverlay';
import SoundToggle from '../components/SoundToggle';

/**
 * Performance strategy:
 * - Animation triggers are immediate; UI summaries are throttled via interval.
 * - FX budget clamps particle counts and switches to Canvas on low-end or FPS drops.
 * - DOM FX uses pooled nodes + CSS keyframes only (transform/opacity).
 * - Canvas FX uses a fixed timestep and capped particle count.
 */

const OwambeScreenMode: React.FC = () => {
  const { events, demoMode, setDemoMode, spawnSpray } = useOwambeRealtimeMock();
  const { enqueueSpray, consumeGameQueue, currentCombo, feed, leaderboard } = useSprayQueue();
  const game = useGameState(demoMode);

  const [performanceMode, setPerformanceMode] = useState(false);
  const [screenSafe, setScreenSafe] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [throttleTick, setThrottleTick] = useState(0);
  const [badgeToast, setBadgeToast] = useState('');

  const { enabled, unlockAudio, setEnabled, play } = useSfx();
  const bigSfxRef = useRef(0);

  const vibePack = currentCombo?.vibe_pack ?? 'classic';
  const budget = useFxBudget(vibePack, currentCombo?.burst_count ?? 1, performanceMode);

  const handleEvent = useCallback((event: SprayEvent) => {
    enqueueSpray(event);
    setLastActivity(Date.now());
  }, [enqueueSpray]);

  useEffect(() => {
    events.forEach(handleEvent);
  }, [events, handleEvent]);

  useEffect(() => {
    const queue = consumeGameQueue();
    queue.forEach((spray) => game.ingestSpray(spray));
  }, [consumeGameQueue, game]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setThrottleTick((prev) => prev + 1);
      const idle = Date.now() - lastActivity > 5000;
      setScreenSafe(idle);
    }, 150);
    return () => window.clearInterval(timer);
  }, [lastActivity]);

  const playBig = useCallback((name: 'hype' | 'firework') => {
    const now = Date.now();
    if (now - bigSfxRef.current < 900) return;
    bigSfxRef.current = now;
    play(name, { volume: 0.9 });
  }, [play]);

  useEffect(() => {
    if (game.hype.active) {
      playBig('hype');
    }
  }, [game.hype.active, playBig]);

  useEffect(() => {
    if (game.boss.activeUntil) {
      playBig('firework');
      const result = awardBadge('MEGA_STORM', { source: 'boss_bar' });
      if (result.awarded) {
        setBadgeToast(`Badge unlocked 🎉 ${result.earned.badgeId}`);
      }
    }
  }, [game.boss.activeUntil, playBig]);

  useEffect(() => {
    if (game.tableWar.status === 'resolved' && game.tableWar.winner) {
      playBig('firework');
      const result = awardBadge('TABLE_WAR_VICTOR', { source: 'table_war' });
      if (result.awarded) {
        setBadgeToast(`Badge unlocked 🎉 ${result.earned.badgeId}`);
      }
    }
  }, [game.tableWar.status, game.tableWar.winner, playBig]);

  useEffect(() => {
    if (game.combo.level >= 5) {
      const result = awardBadge('SPRAY_CHAMPION', { source: 'combo' });
      if (result.awarded) {
        setBadgeToast(`Badge unlocked 🎉 ${result.earned.badgeId}`);
      }
    }
  }, [game.combo.level]);

  useEffect(() => {
    if (game.spraysLast60s >= 10) {
      const result = awardBadge('OWAMBE_LEGEND', { source: 'streak' });
      if (result.awarded) {
        setBadgeToast(`Badge unlocked 🎉 ${result.earned.badgeId}`);
      }
    }
  }, [game.spraysLast60s]);

  useEffect(() => {
    if (!badgeToast) return;
    const timer = window.setTimeout(() => setBadgeToast(''), 1800);
    return () => window.clearTimeout(timer);
  }, [badgeToast]);

  const totalSprayed = useMemo(() => leaderboard.topSprayers.reduce((sum, entry) => sum + entry.total_kobo, 0), [leaderboard.topSprayers]);

  const boostLevel = game.hype.active ? 40 : game.boss.activeUntil ? 60 : 0;

  const saveItBanner = game.combo.saveItTriggered && game.comboTimeLeft > 0;

  const fastHandsEntries = useMemo(() => game.fastHands.map((entry) => ({
    name: entry.name,
    total_kobo: entry.count * 100,
  })), [game.fastHands, throttleTick]);

  return (
    <div className={`fixed inset-0 bg-black text-white overflow-hidden ${game.hype.active ? 'ow-shake-subtle' : ''}`}>
      <SoundUnlockOverlay enabled={enabled} unlockAudio={unlockAudio} setEnabled={setEnabled} />

      {budget.useCanvas ? (
        <CanvasFX combo={currentCombo} budget={budget} boostLevel={boostLevel} />
      ) : (
        <DomFX combo={currentCombo} budget={budget} comboLevel={game.combo.level} boostLevel={boostLevel} />
      )}

      <HypeBanner active={game.hype.active} tier={game.hype.tier} />
      {saveItBanner && (
        <div className="ow-saveit text-white text-xl font-black uppercase">SAVE IT!</div>
      )}

      <div className={`relative z-20 p-6 md:p-8 h-full flex flex-col ${screenSafe ? 'opacity-20' : 'opacity-100'} transition-opacity duration-500`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-4xl font-black tracking-tight">Owambe Mode</h1>
              <span className="px-2 py-1 text-xs font-bold bg-green-500/20 text-green-300 rounded-full">LIVE</span>
            </div>
            <p className="text-sm text-white/60">Aso Villa Ballroom • Live Sprays</p>
            <p className="text-xs text-purple-200 mt-2">FX Quality: {budget.qualityLabel}</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <HeatMeter heatKobo={game.heatKobo} tier={game.heatTier} />
            <ComboHUD level={game.combo.level} timeLeftMs={game.comboTimeLeft} ended={game.combo.ended} />
            <div className="flex gap-2">
              <BadgesLauncher />
              <SoundToggle enabled={enabled} unlockAudio={unlockAudio} setEnabled={setEnabled} />
              <Toggles
                soundOn={enabled}
                onSoundToggle={() => setEnabled(!enabled)}
                performanceMode={performanceMode}
                onPerformanceToggle={() => setPerformanceMode((prev) => !prev)}
                demoMode={demoMode}
                onDemoToggle={() => setDemoMode((prev) => !prev)}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 mt-8">
          <div className="flex flex-col justify-between">
            <div className="space-y-4">
              <div className="text-white/60 text-sm uppercase tracking-[0.3em]">Total Sprayed</div>
              <div className="text-4xl md:text-6xl font-black">{formatNaira(totalSprayed)}</div>
              {currentCombo && (
                <div className="text-sm text-white/70">Burst x{currentCombo.burst_count} • {currentCombo.vibe_pack.toUpperCase()} vibe</div>
              )}
              <Nudges message={game.nudge} />
            </div>
            <div className="mt-8 max-w-md space-y-3">
              <LiveFeed items={feed} />
              <BossBar progress={game.boss.progress} activeUntil={game.boss.activeUntil} cooldownUntil={game.boss.cooldownUntil} />
              <TableWarPanel state={game.tableWar} />
              <button
                onClick={spawnSpray}
                className="w-full py-2 rounded-xl bg-white/10 border border-white/10 text-sm font-semibold hover:bg-white/20"
              >
                Trigger Sample Spray
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <Leaderboard title="Top Sprayers (All-Time)" entries={leaderboard.topSprayers} />
            <Leaderboard title="Top Sprayers (10 mins)" entries={leaderboard.topSprayers10m} />
            <Leaderboard title="Fastest Hands (2 mins)" entries={fastHandsEntries} showAmount={false} />
            <Leaderboard title="Top Recipients" entries={leaderboard.topRecipients} />
          </div>
        </div>
      </div>

      {badgeToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-2 rounded-full text-sm font-semibold z-50">
          {badgeToast}
        </div>
      )}
    </div>
  );
};

export default OwambeScreenMode;
