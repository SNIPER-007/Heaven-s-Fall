import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { formatINR } from '../utils/formatters';
import {
  Crown,
  Flame,
  ArrowLeft,
  ShieldAlert,
  Scale,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { DramaticAnnouncement } from './DramaticAnnouncement';

interface ProjectorModeProps {
  onExit: () => void;
}

export const ProjectorMode: React.FC<ProjectorModeProps> = ({ onExit }) => {
  const { state, toggleSound } = useGame();
  const { rulersTreasury, workersTreasury, rulersPlayerCount, workersPlayerCount } = state;

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  const combined = rulersTreasury + workersTreasury;
  const rulersPercent = combined > 0 ? (rulersTreasury / combined) * 100 : 50;
  const workersPercent = combined > 0 ? (workersTreasury / combined) * 100 : 50;
  const difference = Math.abs(rulersTreasury - workersTreasury);

  const isWorkersLeading = workersTreasury > rulersTreasury;
  const isRulersLeading = rulersTreasury > workersTreasury;
  const isTied = rulersTreasury === workersTreasury;

  return (
    <div className="fixed inset-0 z-50 bg-[#060408] text-slate-100 flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blood-900/40 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-gold-700/30 rounded-full blur-[140px]" />
      </div>

      {/* TOP BAR: Branding, Clock, Fullscreen & Exit */}
      <div className="relative z-10 flex items-center justify-between pb-4 border-b border-zinc-800/80">
        {/* Branding & Logo */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-b from-[#201422] to-[#0d070e] border-2 border-gold-500/60 shadow-lg shadow-black/80">
            <span className="text-xs font-black font-cinzel text-gold-400">RCMG</span>
            <span className="text-[7px] text-zinc-400 uppercase font-semibold">Ghatkopar</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-4xl font-black font-cinzel tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-gold-400 to-amber-500 drop-shadow-[0_2px_15px_rgba(212,175,55,0.4)]">
              HEAVEN'S FALL
            </h1>
            <div className="flex items-center gap-3 text-xs sm:text-sm font-cinzel text-zinc-400 tracking-wider">
              <span className="text-gold-400 font-bold">RISE & FALL</span>
              <span>•</span>
              <span className="text-rose-400 font-bold">HALLOWEEN EDITION</span>
              <span>•</span>
              <span className="text-zinc-500">ROTARACT CLUB OF MUMBAI GHATKOPAR</span>
            </div>
          </div>
        </div>

        {/* Clock & Controls */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-mono text-zinc-300 font-bold">{currentTime}</div>
            <div className="text-[10px] text-emerald-400 tracking-widest uppercase font-cinzel">
              ● LIVE SCOREBOARD
            </div>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition-colors"
            title="Toggle Sound"
          >
            {state.soundEnabled ? <Volume2 className="w-5 h-5 text-amber-400" /> : <VolumeX className="w-5 h-5 text-zinc-500" />}
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          {/* Exit Projector Mode */}
          <button
            onClick={onExit}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-zinc-900 hover:bg-rose-950/70 border border-zinc-700 hover:border-rose-600 text-zinc-300 hover:text-white transition-all shadow-md font-cinzel"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>EXIT PROJECTOR</span>
          </button>
        </div>
      </div>

      {/* CENTRE: LIVE RISE & FALL STATUS DISPLAY */}
      <div className="relative z-10 my-4 text-center">
        <div
          className={`inline-block px-8 py-3 rounded-2xl border-2 transition-all duration-700 shadow-2xl ${
            isWorkersLeading
              ? 'bg-gradient-to-r from-blood-950 via-[#330710] to-blood-950 border-rose-500 shadow-rose-950/80 animate-pulse'
              : isRulersLeading
              ? 'bg-gradient-to-r from-[#1c140a] via-[#2c1f10] to-[#1c140a] border-gold-500 shadow-amber-950/60'
              : 'bg-zinc-950/90 border-purple-700 shadow-purple-950/40'
          }`}
        >
          <div className="flex items-center justify-center gap-3">
            {isWorkersLeading ? (
              <ShieldAlert className="w-8 h-8 text-rose-400" />
            ) : isRulersLeading ? (
              <Crown className="w-8 h-8 text-gold-400" />
            ) : (
              <Scale className="w-8 h-8 text-purple-400" />
            )}

            <div className="text-center">
              <h2
                className={`text-2xl sm:text-4xl lg:text-5xl font-black font-cinzel tracking-widest ${
                  isWorkersLeading
                    ? 'text-rose-400 drop-shadow-[0_0_20px_rgba(244,63,94,0.7)]'
                    : isRulersLeading
                    ? 'text-gold-300 drop-shadow-[0_0_20px_rgba(212,175,55,0.6)]'
                    : 'text-purple-300'
                }`}
              >
                {isWorkersLeading && 'THE WORKERS ARE RISING'}
                {isRulersLeading && 'THE RULERS HOLD THE THRONE'}
                {isTied && 'THE KINGDOM IS IN BALANCE'}
              </h2>
              {isWorkersLeading && (
                <div className="text-sm sm:text-base font-bold font-cinzel text-rose-300 tracking-wider mt-1">
                  THE THRONE IS UNDER THREAT
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN DUAL TREASURY SCOREBOARD */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-center my-auto">
        {/* LEFT SCOREBOARD: THE RULERS */}
        <div className="md:col-span-5 rounded-3xl border-2 border-gold-600/60 bg-gradient-to-b from-[#1c1208]/95 via-[#100a05]/95 to-[#070503] p-8 lg:p-12 shadow-2xl shadow-black text-center flex flex-col justify-center min-h-[300px]">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-gold-400" />
            <h3 className="text-2xl sm:text-4xl font-black font-cinzel tracking-widest text-gold-300">
              THE RULERS
            </h3>
          </div>

          <div className="inline-block px-4 py-1 rounded-full text-xs sm:text-sm font-bold font-mono tracking-widest bg-gold-950/80 text-gold-300 border border-gold-600/50 mx-auto mb-6">
            {rulersPlayerCount} PLAYERS
          </div>

          <div className="text-5xl sm:text-7xl lg:text-8xl font-black font-mono tracking-tight text-white drop-shadow-[0_6px_25px_rgba(212,175,55,0.5)] my-2">
            {formatINR(rulersTreasury)}
          </div>

          <div className="text-sm sm:text-base font-mono text-zinc-400 mt-2">
            {rulersPercent.toFixed(1)}% Share
          </div>
        </div>

        {/* CENTRE: DIFFERENCE & LEADER */}
        <div className="md:col-span-2 text-center flex flex-col items-center justify-center py-4">
          <div className="text-xs uppercase font-cinzel tracking-widest text-zinc-400 mb-2">
            MARGIN
          </div>

          <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono text-white tracking-tight drop-shadow-md mb-2">
            {formatINR(difference)}
          </div>

          <div className="my-2">
            {isWorkersLeading && (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black font-cinzel bg-rose-950 text-rose-300 border border-rose-500 shadow-md animate-bounce">
                WORKERS LEAD
              </span>
            )}
            {isRulersLeading && (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black font-cinzel bg-amber-950 text-gold-300 border border-gold-500 shadow-md">
                RULERS LEAD
              </span>
            )}
            {isTied && (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black font-cinzel bg-zinc-900 text-purple-300 border border-purple-500">
                DEAD TIED
              </span>
            )}
          </div>

          <div className="text-xs text-zinc-400 font-cinzel mt-2 max-w-[160px]">
            {isWorkersLeading && `Rulers need ${formatINR(difference + 1)} to reclaim`}
            {isRulersLeading && `Workers need ${formatINR(difference + 1)} to overthrow`}
            {isTied && 'Needs ₹1 to take throne'}
          </div>
        </div>

        {/* RIGHT SCOREBOARD: THE WORKERS */}
        <div className="md:col-span-5 rounded-3xl border-2 border-blood-600/60 bg-gradient-to-b from-[#220a10]/95 via-[#14060a]/95 to-[#080204] p-8 lg:p-12 shadow-2xl shadow-black text-center flex flex-col justify-center min-h-[300px]">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Flame className="w-8 h-8 sm:w-10 sm:h-10 text-rose-400" />
            <h3 className="text-2xl sm:text-4xl font-black font-cinzel tracking-widest text-rose-300">
              THE WORKERS
            </h3>
          </div>

          <div className="inline-block px-4 py-1 rounded-full text-xs sm:text-sm font-bold font-mono tracking-widest bg-blood-950/80 text-rose-300 border border-blood-600/50 mx-auto mb-6">
            {workersPlayerCount} PLAYERS
          </div>

          <div className="text-5xl sm:text-7xl lg:text-8xl font-black font-mono tracking-tight text-white drop-shadow-[0_6px_25px_rgba(225,29,72,0.5)] my-2">
            {formatINR(workersTreasury)}
          </div>

          <div className="text-sm sm:text-base font-mono text-zinc-400 mt-2">
            {workersPercent.toFixed(1)}% Share
          </div>
        </div>
      </div>

      {/* BOTTOM: FULL-WIDTH WEALTH COMPARISON BAR */}
      <div className="relative z-10 mt-6 pt-4 border-t border-zinc-800/80 space-y-2">
        <div className="flex justify-between items-center text-xs sm:text-sm font-mono">
          <span className="text-gold-400 font-bold font-cinzel">
            THE RULERS: {rulersPercent.toFixed(1)}%
          </span>
          <span className="text-zinc-500 font-cinzel uppercase text-xs">
            Combined Kingdom Wealth: {formatINR(combined)}
          </span>
          <span className="text-rose-400 font-bold font-cinzel">
            THE WORKERS: {workersPercent.toFixed(1)}%
          </span>
        </div>

        <div className="w-full h-4 sm:h-5 rounded-full bg-zinc-950 border border-zinc-800 overflow-hidden flex shadow-2xl">
          <div
            style={{ width: `${rulersPercent}%` }}
            className="h-full bg-gradient-to-r from-gold-600 via-amber-400 to-gold-500 transition-all duration-700 shadow-md"
          />
          <div
            style={{ width: `${workersPercent}%` }}
            className="h-full bg-gradient-to-r from-blood-700 via-rose-500 to-rose-600 transition-all duration-700 shadow-md"
          />
        </div>
      </div>

      {/* DRAMATIC ANNOUNCEMENT OVERLAY */}
      <DramaticAnnouncement />
    </div>
  );
};
