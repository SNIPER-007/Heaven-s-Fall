import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { formatINR } from '../utils/formatters';
import {
  Crown,
  Flame,
  ShieldAlert,
  Scale,
  Sparkles,
  History,
  PlusCircle,
  MinusCircle,
} from 'lucide-react';
import type { Team } from '../types/game';

interface TreasuryDashboardProps {
  onOpenTransactionModal: (preselectedTeam?: Team, preselectedType?: 'ADD' | 'DEDUCT') => void;
}

export const TreasuryDashboard: React.FC<TreasuryDashboardProps> = ({
  onOpenTransactionModal,
}) => {
  const { state, confirmRoleReversal } = useGame();
  const [showReversalModal, setShowReversalModal] = useState(false);
  const [reversalNotes, setReversalNotes] = useState('');

  const { rulersTreasury, workersTreasury, transactions, roleReversals } = state;

  // Latest transactions for each team
  const rulersTxList = transactions.filter((t) => t.team === 'rulers' && !t.isReversed);
  const workersTxList = transactions.filter((t) => t.team === 'workers' && !t.isReversed);

  const latestRulersTx = rulersTxList[0];
  const latestWorkersTx = workersTxList[0];

  // Calculations
  const combinedTotal = rulersTreasury + workersTreasury;
  const rulersPercentage = combinedTotal > 0 ? (rulersTreasury / combinedTotal) * 100 : 50;
  const workersPercentage = combinedTotal > 0 ? (workersTreasury / combinedTotal) * 100 : 50;

  const difference = Math.abs(rulersTreasury - workersTreasury);
  const isWorkersLeading = workersTreasury > rulersTreasury;
  const isRulersLeading = rulersTreasury > workersTreasury;
  const isTied = rulersTreasury === workersTreasury;

  // Trailing team amount needed to exceed leader:
  // Strictly exceed requires leader - trailing + 1
  let neededToExceedText = '';
  if (isRulersLeading) {
    const needed = rulersTreasury - workersTreasury + 1;
    neededToExceedText = `Workers need ${formatINR(needed)} to overthrow`;
  } else if (isWorkersLeading) {
    const needed = workersTreasury - rulersTreasury + 1;
    neededToExceedText = `Rulers need ${formatINR(needed)} to reclaim`;
  } else {
    neededToExceedText = `Either team needs ${formatINR(1)} to lead`;
  }

  const handleConfirmRoleReversal = () => {
    confirmRoleReversal(reversalNotes.trim() || undefined);
    setShowReversalModal(false);
    setReversalNotes('');
  };

  return (
    <div className="space-y-6">
      {/* LIVE RISE & FALL STATUS BANNER */}
      <div
        className={`relative overflow-hidden rounded-xl border p-4 sm:p-5 transition-all duration-500 shadow-2xl ${
          isWorkersLeading
            ? 'bg-gradient-to-r from-blood-950 via-[#26050b] to-blood-950 border-rose-600/70 shadow-rose-950/50'
            : isRulersLeading
            ? 'bg-gradient-to-r from-[#171108] via-[#241a0d] to-[#171108] border-gold-600/50 shadow-amber-950/30'
            : 'bg-gradient-to-r from-zinc-950 via-[#18131d] to-zinc-950 border-purple-800/40 shadow-purple-950/30'
        }`}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3.5">
            <div
              className={`p-3 rounded-full border shadow-inner ${
                isWorkersLeading
                  ? 'bg-blood-900/80 border-rose-500 text-rose-300 animate-bounce'
                  : isRulersLeading
                  ? 'bg-gold-950/80 border-gold-500 text-gold-300'
                  : 'bg-zinc-900 border-zinc-700 text-purple-300'
              }`}
            >
              {isWorkersLeading ? (
                <ShieldAlert className="w-7 h-7 text-rose-400" />
              ) : isRulersLeading ? (
                <Crown className="w-7 h-7 text-gold-400" />
              ) : (
                <Scale className="w-7 h-7 text-purple-400" />
              )}
            </div>

            <div>
              <div className="text-[11px] font-semibold tracking-widest uppercase text-zinc-400 font-cinzel">
                Live Kingdom Status
              </div>
              <h2
                className={`text-lg sm:text-2xl font-black font-cinzel tracking-wider ${
                  isWorkersLeading
                    ? 'text-rose-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.6)]'
                    : isRulersLeading
                    ? 'text-gold-300 drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                    : 'text-purple-300'
                }`}
              >
                {isWorkersLeading && 'THE WORKERS ARE RISING'}
                {isRulersLeading && 'THE RULERS HOLD THE THRONE'}
                {isTied && 'THE KINGDOM IS IN BALANCE'}
              </h2>
              {isWorkersLeading && (
                <p className="text-xs sm:text-sm font-semibold tracking-wide text-rose-300/90 font-cinzel mt-0.5">
                  THE THRONE IS UNDER THREAT — OVERTHROW IN EFFECT
                </p>
              )}
            </div>
          </div>

          {/* Role Reversal Confirmation Button & Stats */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {roleReversals.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/50 border border-zinc-800 text-xs text-zinc-300">
                <History className="w-3.5 h-3.5 text-amber-400" />
                <span>Reversals Recorded:</span>
                <strong className="text-gold-400 font-mono">{roleReversals.length}</strong>
              </div>
            )}

            <button
              onClick={() => setShowReversalModal(true)}
              disabled={!isWorkersLeading}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold font-cinzel tracking-wider uppercase transition-all duration-300 shadow-lg ${
                isWorkersLeading
                  ? 'bg-gradient-to-r from-rose-700 via-blood-600 to-rose-700 hover:from-rose-600 hover:to-blood-500 text-white border-2 border-rose-400 shadow-rose-950/80 animate-pulse hover:scale-105 cursor-pointer'
                  : 'bg-zinc-900/60 text-zinc-600 border border-zinc-800 cursor-not-allowed opacity-60'
              }`}
              title={
                isWorkersLeading
                  ? 'Click to officially ratify the role reversal'
                  : 'Role reversal can only be ratified when Workers treasury strictly exceeds Rulers'
              }
            >
              <Sparkles className="w-4 h-4" />
              CONFIRM ROLE REVERSAL
            </button>
          </div>
        </div>
      </div>

      {/* DUAL TREASURY PANELS & CENTRE COMPARISON */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* LEFT PANEL: THE RULERS */}
        <div className="lg:col-span-5 relative group overflow-hidden rounded-2xl border-2 border-gold-600/40 bg-gradient-to-b from-[#18110b] via-[#100b08] to-[#0a0705] p-5 sm:p-7 shadow-xl shadow-black/80 hover:border-gold-500/70 transition-all flex flex-col justify-between">
          {/* Subtle gold crown watermark background */}
          <div className="absolute -top-10 -right-10 w-44 h-44 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
            <Crown className="w-full h-full text-gold-500" />
          </div>

          <div>
            {/* Header info */}
            <div className="flex items-center justify-between pb-3 border-b border-gold-700/30">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-gold-950/80 border border-gold-600/50 text-gold-400 shadow-md">
                  <Crown className="w-6 h-6 text-gold-400" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black font-cinzel tracking-wider text-gold-300">
                    THE RULERS
                  </h3>
                  <div className="text-xs text-amber-200/60 font-semibold tracking-wide">
                    ROYALTY • DEFENDERS OF THE CROWN
                  </div>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider bg-gold-950/90 text-gold-300 border border-gold-600/50 shadow-inner">
                {state.rulersPlayerCount} PLAYERS
              </span>
            </div>

            {/* Huge Rupee Treasury Number */}
            <div className="my-6">
              <div className="text-xs uppercase tracking-widest text-zinc-400 font-cinzel mb-1">
                Total Treasury
              </div>
              <div className="text-4xl sm:text-5xl lg:text-6xl font-black font-mono tracking-tight text-white drop-shadow-[0_4px_12px_rgba(212,175,55,0.35)]">
                {formatINR(rulersTreasury)}
              </div>
              <div className="text-xs text-zinc-500 mt-1 font-mono">
                {rulersPercentage.toFixed(1)}% of total kingdom wealth
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 mb-5">
              <div>
                <span className="text-[11px] text-zinc-400 block font-medium">Transactions</span>
                <span className="text-lg font-bold font-mono text-zinc-200">
                  {rulersTxList.length}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-zinc-400 block font-medium">Latest Activity</span>
                {latestRulersTx ? (
                  <span
                    className={`text-sm font-bold font-mono ${
                      latestRulersTx.type === 'ADD' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {latestRulersTx.type === 'ADD' ? '+' : '-'}
                    {formatINR(latestRulersTx.amount)}
                  </span>
                ) : (
                  <span className="text-xs text-zinc-500 font-mono">None yet</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Button for Rulers */}
          <div className="pt-2 flex gap-2">
            <button
              onClick={() => onOpenTransactionModal('rulers', 'ADD')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-amber-200 bg-gold-950/70 hover:bg-gold-900/80 border border-gold-600/50 hover:border-gold-400 transition-all shadow-md"
            >
              <PlusCircle className="w-3.5 h-3.5 text-gold-400" />
              ADD REWARD
            </button>
            <button
              onClick={() => onOpenTransactionModal('rulers', 'DEDUCT')}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold text-rose-300 bg-zinc-900/80 hover:bg-rose-950/40 border border-zinc-800 hover:border-rose-700/50 transition-all"
              title="Apply Penalty / Deduct from Rulers"
            >
              <MinusCircle className="w-3.5 h-3.5 text-rose-400" />
              PENALTY
            </button>
          </div>
        </div>

        {/* CENTRE COMPARISON PANEL */}
        <div className="lg:col-span-2 flex flex-col justify-between rounded-2xl border border-zinc-800 bg-[#0d0910] p-4 sm:p-5 shadow-xl text-center">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 font-cinzel mb-2">
              BATTLE OF TREASURIES
            </div>

            {/* Current Leader Badge */}
            <div className="my-2">
              {isWorkersLeading && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-950/80 text-rose-300 border border-rose-500/60 shadow-sm animate-pulse">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  WORKERS LEAD
                </div>
              )}
              {isRulersLeading && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-950/80 text-gold-300 border border-gold-500/60 shadow-sm">
                  <Crown className="w-3.5 h-3.5 text-gold-400" />
                  RULERS LEAD
                </div>
              )}
              {isTied && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-zinc-900 text-purple-300 border border-purple-500/50">
                  <Scale className="w-3.5 h-3.5 text-purple-400" />
                  DEAD TIED
                </div>
              )}
            </div>

            {/* Money Difference */}
            <div className="my-4 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
              <span className="text-[10px] uppercase tracking-widest text-zinc-400 block font-cinzel">
                Difference
              </span>
              <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                {formatINR(difference)}
              </span>
            </div>

            {/* Exceed Target Text */}
            <div className="text-xs text-zinc-400 font-medium leading-relaxed mb-4">
              {neededToExceedText}
            </div>
          </div>

          {/* Visual comparison bar */}
          <div className="mt-2 space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono text-zinc-400">
              <span className="text-gold-400 font-semibold">{rulersPercentage.toFixed(0)}%</span>
              <span className="text-rose-400 font-semibold">{workersPercentage.toFixed(0)}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${rulersPercentage}%` }}
                className="h-full bg-gradient-to-r from-gold-600 to-amber-400 transition-all duration-500 shadow-sm"
                title={`Rulers: ${rulersPercentage.toFixed(1)}%`}
              />
              <div
                style={{ width: `${workersPercentage}%` }}
                className="h-full bg-gradient-to-r from-blood-600 to-rose-500 transition-all duration-500 shadow-sm"
                title={`Workers: ${workersPercentage.toFixed(1)}%`}
              />
            </div>
            <div className="text-[10px] text-zinc-400 font-cinzel uppercase">
              Combined: {formatINR(combinedTotal)}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: THE WORKERS */}
        <div className="lg:col-span-5 relative group overflow-hidden rounded-2xl border-2 border-blood-600/40 bg-gradient-to-b from-[#1a0c10] via-[#12080c] to-[#0a0407] p-5 sm:p-7 shadow-xl shadow-black/80 hover:border-blood-500/70 transition-all flex flex-col justify-between">
          {/* Subtle rebellion / flame watermark */}
          <div className="absolute -top-10 -right-10 w-44 h-44 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
            <Flame className="w-full h-full text-blood-500" />
          </div>

          <div>
            {/* Header info */}
            <div className="flex items-center justify-between pb-3 border-b border-blood-700/30">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-blood-950/80 border border-blood-600/50 text-rose-400 shadow-md">
                  <Flame className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black font-cinzel tracking-wider text-rose-300">
                    THE WORKERS
                  </h3>
                  <div className="text-xs text-rose-200/60 font-semibold tracking-wide">
                    REBELLION • SEEKERS OF THE OVERTHROW
                  </div>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider bg-blood-950/90 text-rose-300 border border-blood-600/50 shadow-inner">
                {state.workersPlayerCount} PLAYERS
              </span>
            </div>

            {/* Huge Rupee Treasury Number */}
            <div className="my-6">
              <div className="text-xs uppercase tracking-widest text-zinc-400 font-cinzel mb-1">
                Total Treasury
              </div>
              <div className="text-4xl sm:text-5xl lg:text-6xl font-black font-mono tracking-tight text-white drop-shadow-[0_4px_12px_rgba(225,29,72,0.35)]">
                {formatINR(workersTreasury)}
              </div>
              <div className="text-xs text-zinc-500 mt-1 font-mono">
                {workersPercentage.toFixed(1)}% of total kingdom wealth
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 mb-5">
              <div>
                <span className="text-[11px] text-zinc-400 block font-medium">Transactions</span>
                <span className="text-lg font-bold font-mono text-zinc-200">
                  {workersTxList.length}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-zinc-400 block font-medium">Latest Activity</span>
                {latestWorkersTx ? (
                  <span
                    className={`text-sm font-bold font-mono ${
                      latestWorkersTx.type === 'ADD' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {latestWorkersTx.type === 'ADD' ? '+' : '-'}
                    {formatINR(latestWorkersTx.amount)}
                  </span>
                ) : (
                  <span className="text-xs text-zinc-500 font-mono">None yet</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Button for Workers */}
          <div className="pt-2 flex gap-2">
            <button
              onClick={() => onOpenTransactionModal('workers', 'ADD')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-rose-200 bg-blood-950/70 hover:bg-blood-900/80 border border-blood-600/50 hover:border-blood-400 transition-all shadow-md"
            >
              <PlusCircle className="w-3.5 h-3.5 text-rose-400" />
              ADD REWARD
            </button>
            <button
              onClick={() => onOpenTransactionModal('workers', 'DEDUCT')}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold text-rose-300 bg-zinc-900/80 hover:bg-rose-950/40 border border-zinc-800 hover:border-rose-700/50 transition-all"
              title="Apply Penalty / Deduct from Workers"
            >
              <MinusCircle className="w-3.5 h-3.5 text-rose-400" />
              PENALTY
            </button>
          </div>
        </div>
      </div>

      {/* CONFIRM ROLE REVERSAL MODAL */}
      {showReversalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#14080e] border-2 border-rose-500 rounded-2xl max-w-lg w-full p-6 shadow-2xl shadow-rose-950 text-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-blood-900 text-rose-400 border border-rose-500">
                <Flame className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-cinzel font-black text-rose-300">
                  OFFICIAL ROLE REVERSAL CONFIRMATION
                </h3>
                <p className="text-xs text-zinc-400 font-cinzel">
                  Ratify the historical overthrow of the throne
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 mb-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Workers Treasury:</span>
                <span className="font-mono font-bold text-rose-400">{formatINR(workersTreasury)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Rulers Treasury:</span>
                <span className="font-mono font-bold text-gold-400">{formatINR(rulersTreasury)}</span>
              </div>
              <div className="w-full h-[1px] bg-zinc-800 my-1" />
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-zinc-300">Workers Lead By:</span>
                <span className="font-mono font-black text-emerald-400">
                  +{formatINR(workersTreasury - rulersTreasury)}
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-300 mb-4 leading-relaxed">
              <strong>Confirmation Rule:</strong> Confirming this action will officially log a{' '}
              <span className="text-rose-400 font-bold">Role Reversal Event</span> into the permanent
              game history and announce the overthrow across all screens.
              <em> No player roles or treasury numbers are altered automatically.</em>
            </p>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Game Master Event Notes (Optional):
              </label>
              <textarea
                value={reversalNotes}
                onChange={(e) => setReversalNotes(e.target.value)}
                placeholder="e.g. Overthrow ratified after completion of The Haunted Charades task"
                rows={2}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowReversalModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-700"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleConfirmRoleReversal}
                className="px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-rose-700 to-blood-600 hover:from-rose-600 hover:to-blood-500 border border-rose-400 shadow-lg font-cinzel"
              >
                RATIFY ROLE REVERSAL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
