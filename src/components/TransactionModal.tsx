import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { formatINR } from '../utils/formatters';
import type { Team, TransactionCategory, TransactionType } from '../types/game';
import {
  Coins,
  PlusCircle,
  MinusCircle,
  AlertCircle,
  ArrowRight,
  Shield,
  Flame,
  Check,
} from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedTeam?: Team;
  preselectedType?: TransactionType;
}

const CATEGORIES: TransactionCategory[] = [
  'Task Reward',
  'Bonus',
  'Penalty',
  'Manual Adjustment',
  'Correction',
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  preselectedTeam = 'rulers',
  preselectedType = 'ADD',
}) => {
  const { state, addTransaction } = useGame();

  const [team, setTeam] = useState<Team>(preselectedTeam);
  const [type, setType] = useState<TransactionType>(preselectedType);
  const [category, setCategory] = useState<TransactionCategory>('Task Reward');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [amountInput, setAmountInput] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Confirmation step
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTeam(preselectedTeam);
      setType(preselectedType);
      setCategory(preselectedType === 'DEDUCT' ? 'Penalty' : 'Task Reward');
      setSelectedTaskId('');
      setCustomReason('');
      setAmountInput('');
      setNotes('');
      setIsConfirming(false);
      setIsSubmitting(false);
      setErrorMessage(null);
    }
  }, [isOpen, preselectedTeam, preselectedType]);

  if (!isOpen) return null;

  const currentRulersTreasury = state.rulersTreasury;
  const currentWorkersTreasury = state.workersTreasury;
  const currentTeamTreasury = team === 'rulers' ? currentRulersTreasury : currentWorkersTreasury;

  const parsedAmount = parseFloat(amountInput);
  const isValidAmount = !isNaN(parsedAmount) && parsedAmount > 0;

  // New balance preview
  const balanceAfter = isValidAmount
    ? type === 'ADD'
      ? currentTeamTreasury + parsedAmount
      : currentTeamTreasury - parsedAmount
    : currentTeamTreasury;

  const willFallBelowZero = type === 'DEDUCT' && isValidAmount && currentTeamTreasury - parsedAmount < 0;

  // Tasks belonging to the chosen team
  const availableTasks = state.tasks.filter((t) => t.team === team);

  const handleValidateAndProceed = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isValidAmount) {
      setErrorMessage('Please enter a valid amount greater than 0.');
      return;
    }

    if (willFallBelowZero) {
      setErrorMessage(
        `Treasury cannot fall below ₹0. Current ${team} balance is ${formatINR(
          currentTeamTreasury
        )}, cannot deduct ${formatINR(parsedAmount)}.`
      );
      return;
    }

    if (category === 'Task Reward' && !selectedTaskId && !customReason.trim()) {
      setErrorMessage('Please select a task or enter a custom reason.');
      return;
    }

    setIsConfirming(true);
  };

  const handleExecuteTransaction = () => {
    if (isSubmitting) return; // Prevent duplicate rapid clicks
    setIsSubmitting(true);
    setErrorMessage(null);

    const taskObj = state.tasks.find((t) => t.id === selectedTaskId);
    const finalReason = customReason.trim() || taskObj?.name || category;

    const result = addTransaction({
      team,
      category,
      type,
      amount: parsedAmount,
      taskId: selectedTaskId || undefined,
      taskName: taskObj?.name || undefined,
      reason: finalReason,
      notes: notes.trim() || undefined,
      allowDuplicateTaskPayment: true, // If explicitly confirmed in transaction modal
    });

    if (result.success) {
      setIsSubmitting(false);
      onClose();
    } else {
      setIsSubmitting(false);
      setIsConfirming(false);
      setErrorMessage(result.error || 'Failed to apply transaction.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#120b16] border-2 border-gold-600/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gold-950 border border-gold-600/40 text-gold-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-cinzel font-bold text-white tracking-wide">
                GAME MASTER TRANSACTION
              </h3>
              <p className="text-xs text-zinc-400">Manual Entry Administration Control</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 text-lg font-bold p-1"
          >
            ✕
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 mb-4 rounded-xl bg-rose-950/80 border border-rose-600 text-xs text-rose-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {!isConfirming ? (
          <form onSubmit={handleValidateAndProceed} className="space-y-4">
            {/* Team Selection */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Target Team <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTeam('rulers');
                    setSelectedTaskId('');
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold font-cinzel border transition-all ${
                    team === 'rulers'
                      ? 'bg-gold-950/90 border-gold-500 text-gold-300 shadow-md ring-1 ring-gold-400'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Shield className="w-4 h-4 text-gold-400" />
                  THE RULERS ({formatINR(currentRulersTreasury)})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTeam('workers');
                    setSelectedTaskId('');
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold font-cinzel border transition-all ${
                    team === 'workers'
                      ? 'bg-blood-950/90 border-rose-500 text-rose-300 shadow-md ring-1 ring-rose-400'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Flame className="w-4 h-4 text-rose-400" />
                  THE WORKERS ({formatINR(currentWorkersTreasury)})
                </button>
              </div>
            </div>

            {/* Type: Add or Deduct */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Action Type <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setType('ADD');
                    if (category === 'Penalty') setCategory('Task Reward');
                  }}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    type === 'ADD'
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <PlusCircle className="w-4 h-4 text-emerald-400" />
                  ADD MONEY
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType('DEDUCT');
                    setCategory('Penalty');
                  }}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    type === 'DEDUCT'
                      ? 'bg-blood-950/80 border-rose-500 text-rose-300 shadow-md'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <MinusCircle className="w-4 h-4 text-rose-400" />
                  DEDUCT MONEY
                </button>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Transaction Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-gold-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Task Selection or Reason */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Associated Task (Optional):
              </label>
              <select
                value={selectedTaskId}
                onChange={(e) => {
                  setSelectedTaskId(e.target.value);
                  if (e.target.value) {
                    const t = state.tasks.find((task) => task.id === e.target.value);
                    if (t) setCustomReason(t.name);
                  }
                }}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-gold-500"
              >
                <option value="">-- No specific task / Custom reason --</option>
                {availableTasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.name} ({task.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Reason */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Description / Reason <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="e.g. The Halloween Factory reward, Puzzle hint penalty..."
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-gold-500"
                required
              />
            </div>

            {/* Amount input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-zinc-300">
                  Amount in Rupees (INR ₹) <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-zinc-400">Manual Entry Only</span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-zinc-400 font-bold">₹</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-lg font-mono text-white focus:outline-none focus:border-gold-500"
                  required
                />
              </div>

              {/* Quick increment chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[200, 500, 1000, 2000, 5000].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      const cur = parseFloat(amountInput) || 0;
                      setAmountInput((cur + chip).toString());
                    }}
                    className="px-2 py-0.5 text-[11px] font-mono rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
                  >
                    +{chip.toLocaleString('en-IN')}
                  </button>
                ))}
                {amountInput && (
                  <button
                    type="button"
                    onClick={() => setAmountInput('')}
                    className="px-2 py-0.5 text-[11px] rounded bg-zinc-900 text-zinc-400 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Optional Notes */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Optional Notes:
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional audit or GM notes..."
                rows={2}
                className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-gold-500"
              />
            </div>

            {/* Live calculation preview */}
            {isValidAmount && (
              <div
                className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                  willFallBelowZero
                    ? 'bg-rose-950/70 border-rose-600 text-rose-200'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between font-mono">
                  <span>Current {team} Balance:</span>
                  <span>{formatINR(currentTeamTreasury)}</span>
                </div>
                <div className="flex items-center justify-between font-mono font-bold">
                  <span>{type === 'ADD' ? '+ Add:' : '- Deduct:'}</span>
                  <span className={type === 'ADD' ? 'text-emerald-400' : 'text-rose-400'}>
                    {type === 'ADD' ? '+' : '-'}
                    {formatINR(parsedAmount)}
                  </span>
                </div>
                <div className="w-full h-[1px] bg-zinc-800 my-1" />
                <div className="flex items-center justify-between font-mono font-bold text-white text-sm">
                  <span>Resulting Balance:</span>
                  <span className={willFallBelowZero ? 'text-rose-400' : 'text-gold-400'}>
                    {formatINR(balanceAfter)}
                  </span>
                </div>
                {willFallBelowZero && (
                  <p className="text-[11px] text-rose-300 font-bold pt-1">
                    ⚠️ Error: Treasury cannot fall below ₹0.
                  </p>
                )}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-700 transition-colors"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={!isValidAmount || willFallBelowZero}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-amber-300 via-gold-400 to-amber-500 hover:from-amber-200 hover:to-gold-300 disabled:opacity-40 disabled:cursor-not-allowed font-cinzel shadow-lg transition-all"
              >
                <span>REVIEW & CONFIRM</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          /* CONFIRMATION STEP */
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 rounded-xl bg-gradient-to-b from-[#18101a] to-zinc-950 border border-gold-600/50 space-y-3">
              <div className="text-center pb-2 border-b border-zinc-800">
                <span className="text-[10px] font-cinzel uppercase tracking-widest text-gold-400">
                  Transaction Verification
                </span>
                <h4 className="text-lg font-cinzel font-black text-white">
                  CONFIRM {type} TO {team.toUpperCase()}
                </h4>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Team:</span>
                  <span className="font-bold text-zinc-200 uppercase">{team}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Category:</span>
                  <span className="font-semibold text-zinc-200">{category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Reason / Task:</span>
                  <span className="font-semibold text-zinc-200">
                    {customReason.trim() || 'Unspecified'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Amount:</span>
                  <span
                    className={`font-mono font-black text-base ${
                      type === 'ADD' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {type === 'ADD' ? '+' : '-'}
                    {formatINR(parsedAmount)}
                  </span>
                </div>
                {notes && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Notes:</span>
                    <span className="text-zinc-300 italic">{notes}</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-black/60 rounded-lg border border-zinc-800 space-y-1 font-mono text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Previous Treasury:</span>
                  <span>{formatINR(currentTeamTreasury)}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-sm">
                  <span>New Treasury:</span>
                  <span className="text-gold-400">{formatINR(balanceAfter)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirming(false)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-700"
              >
                BACK TO EDIT
              </button>
              <button
                type="button"
                onClick={handleExecuteTransaction}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 disabled:opacity-50 font-cinzel shadow-lg"
              >
                <Check className="w-4 h-4" />
                {isSubmitting ? 'RECORDING...' : 'CONFIRM TRANSACTION'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
