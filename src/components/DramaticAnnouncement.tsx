import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Crown, Flame, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export const DramaticAnnouncement: React.FC = () => {
  const { state, dismissAnnouncement } = useGame();
  const { lastAnnouncement, announcementDismissed } = state;

  useEffect(() => {
    if (!announcementDismissed && lastAnnouncement) {
      if (lastAnnouncement === 'OVERTHROW') {
        // Red, ember, and dark gold confetti burst
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#dc2626', '#ea580c', '#d4af37', '#7f1d1d', '#fef08a'],
        });
      } else if (lastAnnouncement === 'RECLAIM') {
        // Regal gold & amber confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#d4af37', '#fef08a', '#eab308', '#ffffff'],
        });
      }
    }
  }, [lastAnnouncement, announcementDismissed]);

  if (announcementDismissed || !lastAnnouncement) {
    return null;
  }

  const isOverthrow = lastAnnouncement === 'OVERTHROW';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn">
      {/* Background vignette glow */}
      <div
        className={`absolute inset-0 pointer-events-none opacity-40 ${
          isOverthrow
            ? 'bg-radial-gradient from-blood-600 via-blood-950 to-transparent'
            : 'bg-radial-gradient from-amber-500 via-gold-950 to-transparent'
        }`}
      />

      <div
        className={`relative max-w-2xl w-full text-center p-8 sm:p-12 rounded-3xl border-2 shadow-2xl transition-all ${
          isOverthrow
            ? 'bg-gradient-to-b from-[#22070e] via-[#140509] to-[#0a0305] border-rose-500 shadow-rose-950'
            : 'bg-gradient-to-b from-[#1f170c] via-[#120e07] to-[#0a0804] border-gold-400 shadow-amber-950'
        }`}
      >
        {/* Dismiss Button */}
        <button
          onClick={dismissAnnouncement}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title="Dismiss Announcement"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Dramatic Animated Icon */}
        <div className="mb-6 flex justify-center">
          <div
            className={`p-5 rounded-full border-2 shadow-xl ${
              isOverthrow
                ? 'bg-blood-900 border-rose-400 text-rose-300 animate-bounce'
                : 'bg-gold-950 border-gold-400 text-gold-300 animate-pulse'
            }`}
          >
            {isOverthrow ? (
              <Flame className="w-16 h-16 text-rose-400 animate-pulse" />
            ) : (
              <Crown className="w-16 h-16 text-gold-400 animate-pulse" />
            )}
          </div>
        </div>

        {/* Big Gothic Headings */}
        {isOverthrow ? (
          <>
            <div className="text-xs sm:text-sm font-cinzel font-black tracking-[0.3em] uppercase text-rose-400 mb-2">
              ⚡ LIVE OVERTHROW EVENT ⚡
            </div>
            <h2 className="text-3xl sm:text-5xl font-black font-cinzel tracking-wider text-rose-400 drop-shadow-[0_4px_20px_rgba(244,63,94,0.8)] leading-tight mb-3">
              THE THRONE HAS FALLEN
            </h2>
            <h3 className="text-2xl sm:text-4xl font-black font-cinzel tracking-wider text-amber-200 drop-shadow-[0_2px_15px_rgba(251,191,36,0.6)]">
              THE WORKERS HAVE RISEN
            </h3>
            <p className="mt-4 text-xs sm:text-sm text-zinc-300 max-w-md mx-auto font-sans leading-relaxed">
              The Workers' collective treasury has officially eclipsed the Rulers. The kingdom’s
              order is broken.
            </p>
          </>
        ) : (
          <>
            <div className="text-xs sm:text-sm font-cinzel font-black tracking-[0.3em] uppercase text-gold-400 mb-2">
              👑 ROYAL RESTORATION 👑
            </div>
            <h2 className="text-3xl sm:text-5xl font-black font-cinzel tracking-wider text-gold-300 drop-shadow-[0_4px_20px_rgba(212,175,55,0.8)] leading-tight mb-3">
              THE CROWN HAS BEEN RECLAIMED
            </h2>
            <h3 className="text-xl sm:text-3xl font-black font-cinzel tracking-wider text-amber-100">
              THE RULERS REIGN SUPREME
            </h3>
            <p className="mt-4 text-xs sm:text-sm text-zinc-300 max-w-md mx-auto font-sans leading-relaxed">
              The Rulers have surged forward, restoring their financial supremacy over the rebellion.
            </p>
          </>
        )}

        {/* Action Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={dismissAnnouncement}
            className={`px-8 py-3 rounded-xl text-sm font-bold font-cinzel tracking-widest uppercase transition-all shadow-xl hover:scale-105 ${
              isOverthrow
                ? 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-400'
                : 'bg-gold-500 hover:bg-gold-400 text-black border border-gold-300'
            }`}
          >
            CONTINUE EVENT
          </button>
        </div>
      </div>
    </div>
  );
};
