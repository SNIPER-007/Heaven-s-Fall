import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import {
  Volume2,
  VolumeX,
  Tv,
  Cloud,
  RotateCcw,
  Play,
  Pause,
  Square,
  Coins,
  HelpCircle,
} from 'lucide-react';
import type { GameStatus } from '../types/game';

interface HeaderProps {
  onOpenProjector: () => void;
  onOpenFirebaseModal: () => void;
  onOpenOpeningBalanceModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenProjector,
  onOpenFirebaseModal,
  onOpenOpeningBalanceModal,
}) => {
  const { state, updateGameStatus, resetGame, toggleSound } = useGame();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetPreserveTasks, setResetPreserveTasks] = useState(true);
  const [resetConfirmInput, setResetConfirmInput] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);

  const getStatusBadge = (status: GameStatus) => {
    switch (status) {
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-500/40 shadow-sm animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            LIVE • IN PROGRESS
          </span>
        );
      case 'PAUSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/70 text-amber-400 border border-amber-500/40">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            GAME PAUSED
          </span>
        );
      case 'ENDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blood-950/80 text-rose-300 border border-blood-600/50">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            EVENT CONCLUDED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-900/80 text-zinc-400 border border-zinc-700/60">
            <span className="w-2 h-2 rounded-full bg-zinc-500" />
            NOT STARTED
          </span>
        );
    }
  };

  const handleConfirmReset = () => {
    if (resetConfirmInput.trim().toUpperCase() !== 'RESET') {
      alert("Please type 'RESET' to confirm.");
      return;
    }
    resetGame({ preserveTasks: resetPreserveTasks });
    setShowResetConfirm(false);
    setResetConfirmInput('');
  };

  return (
    <>
      <header className="relative z-20 border-b border-blood-900/40 bg-[#0c080e]/90 backdrop-blur-md px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Branding & RCMG Logo Placeholder */}
          <div className="flex items-center gap-4">
            {/* RCMG Logo Placeholder */}
            <div
              className="relative group cursor-pointer flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-gradient-to-b from-[#1c121d] to-[#0d070e] border border-gold-600/40 shadow-lg shadow-black/60 hover:border-gold-400 transition-all"
              title="Rotaract Club of Mumbai Ghatkopar (RCMG) - Official Club Logo Placeholder"
            >
              <div className="text-[10px] tracking-widest font-black text-gold-400 font-cinzel">RCMG</div>
              <div className="w-7 h-[1px] bg-gold-500/50 my-0.5" />
              <div className="text-[7px] text-zinc-400 tracking-wider font-semibold text-center leading-none">
                GHATKOPAR
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-blood-600 rounded-full border border-black flex items-center justify-center text-[7px] text-white font-bold">
                ★
              </div>
            </div>

            {/* Title & Tagline */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black font-cinzel tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-gold-400 to-amber-500 drop-shadow-[0_2px_8px_rgba(212,175,55,0.3)]">
                  HEAVEN'S FALL
                </h1>
                <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded bg-blood-950/80 border border-blood-700/50 text-rose-300 font-cinzel">
                  HALLOWEEN EDITION
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="text-gold-500/90 font-cinzel font-semibold tracking-wide">
                  RISE & FALL
                </span>
                <span>•</span>
                <span className="text-zinc-400 font-medium">Rotaract Club of Mumbai Ghatkopar</span>
                <span>•</span>
                {getStatusBadge(state.status)}
              </div>
            </div>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 sm:gap-3">
            {/* Game Lifecycle Controls */}
            <div className="flex items-center bg-zinc-900/90 rounded-lg p-1 border border-zinc-800 shadow-inner">
              {state.status === 'NOT_STARTED' && (
                <button
                  onClick={() => updateGameStatus('IN_PROGRESS')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
                  title="Start Game"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  START GAME
                </button>
              )}

              {state.status === 'IN_PROGRESS' && (
                <>
                  <button
                    onClick={() => updateGameStatus('PAUSED')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-colors"
                    title="Pause Game"
                  >
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    PAUSE
                  </button>
                  <button
                    onClick={() => updateGameStatus('ENDED')}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-rose-400 hover:bg-rose-950/50 transition-colors ml-1"
                    title="End Game"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    END
                  </button>
                </>
              )}

              {state.status === 'PAUSED' && (
                <>
                  <button
                    onClick={() => updateGameStatus('IN_PROGRESS')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                    title="Resume Game"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    RESUME
                  </button>
                  <button
                    onClick={() => updateGameStatus('ENDED')}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-rose-400 hover:bg-rose-950/50 transition-colors ml-1"
                    title="End Game"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    END
                  </button>
                </>
              )}

              {state.status === 'ENDED' && (
                <button
                  onClick={() => updateGameStatus('IN_PROGRESS')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-colors"
                  title="Reopen / Resume Game"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  REOPEN GAME
                </button>
              )}
            </div>

            {/* Opening Balance Button */}
            <button
              onClick={onOpenOpeningBalanceModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1a131e] hover:bg-[#251a2b] text-gold-300 border border-gold-600/30 transition-all hover:border-gold-500/60"
              title="Set Opening Treasury Amounts"
            >
              <Coins className="w-3.5 h-3.5 text-gold-400" />
              <span className="hidden sm:inline">Opening</span> Balances
            </button>

            {/* Projector Mode Launch */}
            <button
              onClick={onOpenProjector}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blood-700 to-blood-900 hover:from-blood-600 hover:to-blood-800 text-white border border-blood-500/50 shadow-md shadow-blood-950/60 transition-all hover:scale-[1.02]"
              title="Switch to Full-Screen TV / Projector Scoreboard"
            >
              <Tv className="w-3.5 h-3.5" />
              PROJECTOR MODE
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-lg text-xs border transition-all ${
                state.soundEnabled
                  ? 'bg-amber-950/40 border-amber-600/40 text-amber-300 hover:bg-amber-900/50'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:text-zinc-300'
              }`}
              title={state.soundEnabled ? 'Mute Gothic Sound Effects' : 'Enable Gothic Sound Effects'}
            >
              {state.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Firebase Sync Indicator */}
            <button
              onClick={onOpenFirebaseModal}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 transition-colors"
              title="Configure Multi-Device Cloud Sync"
            >
              <Cloud className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline text-[11px]">Sync</span>
            </button>

            {/* Help / Rules info */}
            <button
              onClick={() => setShowHelpModal(true)}
              className="p-2 rounded-lg text-xs bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
              title="Game Master Guide"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Reset Game */}
            <button
              onClick={() => {
                setResetConfirmInput('');
                setShowResetConfirm(true);
              }}
              className="p-2 rounded-lg text-xs bg-zinc-900 hover:bg-rose-950/60 border border-zinc-800 hover:border-rose-800 text-zinc-400 hover:text-rose-400 transition-colors"
              title="Reset Game"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Strong Reset Game Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#120a14] border-2 border-blood-700 rounded-xl max-w-md w-full p-6 shadow-2xl shadow-blood-950 text-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-blood-900/60 text-rose-400 border border-blood-700">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-cinzel font-bold text-rose-300">CONFIRM GAME RESET</h3>
                <p className="text-xs text-zinc-400">This action requires explicit verification</p>
              </div>
            </div>

            <p className="text-sm text-zinc-300 mb-4 leading-relaxed">
              Resetting will clear both teams' current treasuries to <strong className="text-gold-400">₹0</strong>,
              reset all recorded transactions and role reversals, and return the kingdom to its initial state.
            </p>

            <div className="mb-4 p-3 bg-zinc-950/70 rounded-lg border border-zinc-800">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={resetPreserveTasks}
                  onChange={(e) => setResetPreserveTasks(e.target.checked)}
                  className="rounded border-zinc-700 text-blood-600 focus:ring-blood-500"
                />
                Keep current task names (resets status to UPCOMING & clears amounts)
              </label>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Type <span className="text-rose-400 font-mono font-bold">RESET</span> to confirm:
              </label>
              <input
                type="text"
                value={resetConfirmInput}
                onChange={(e) => setResetConfirmInput(e.target.value)}
                placeholder="RESET"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-rose-500 font-mono uppercase"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 transition-colors"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                disabled={resetConfirmInput.trim().toUpperCase() !== 'RESET'}
                className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-blood-700 hover:bg-blood-600 disabled:opacity-40 disabled:cursor-not-allowed border border-blood-500 shadow-md transition-all"
              >
                CONFIRM FULL RESET
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Master Quick Guide Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#100a13] border border-gold-600/40 rounded-xl max-w-lg w-full p-6 shadow-2xl text-slate-100">
            <h3 className="text-xl font-cinzel font-bold text-gold-400 mb-2">
              GAME MASTER QUICK GUIDE
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              HEAVEN'S FALL — Rise & Fall (Halloween Edition)
            </p>

            <div className="space-y-3 text-xs text-zinc-300 max-h-96 overflow-y-auto pr-2">
              <div className="p-2.5 rounded bg-zinc-900/70 border border-zinc-800">
                <span className="font-bold text-amber-300 block mb-1">👑 THE TEAMS</span>
                • <strong>The Rulers:</strong> 7 Players holding the throne.<br />
                • <strong>The Workers:</strong> 8 Players seeking to overthrow the throne.
              </div>

              <div className="p-2.5 rounded bg-zinc-900/70 border border-zinc-800">
                <span className="font-bold text-rose-300 block mb-1">⚡ OVERTHROW RULE</span>
                • Workers must <strong>strictly exceed</strong> the Rulers' treasury to trigger an overthrow. Ties do not overthrow.<br />
                • When Workers lead, the dramatic announcement is triggered and the <em>"CONFIRM ROLE REVERSAL"</em> button becomes active.<br />
                • Treasury lead changes are tracked separately from official role reversals.
              </div>

              <div className="p-2.5 rounded bg-zinc-900/70 border border-zinc-800">
                <span className="font-bold text-emerald-300 block mb-1">📋 TASKS & REWARDS</span>
                • Task names only are displayed (no rules or predefined points).<br />
                • All amounts are manually entered by you, the Game Master.<br />
                • Duplicate task payments are protected with a confirmation guard.
              </div>

              <div className="p-2.5 rounded bg-zinc-900/70 border border-zinc-800">
                <span className="font-bold text-sky-300 block mb-1">📺 PROJECTOR & CLOUD SYNC</span>
                • Click <strong>PROJECTOR MODE</strong> to display the scoreboard on a TV/screen.<br />
                • Cross-tab real-time sync is always active locally.<br />
                • Connect Firebase Firestore via the <strong>Sync</strong> button for multi-device sync.
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-gold-600 hover:bg-gold-500 text-black font-cinzel"
              >
                GOT IT
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
