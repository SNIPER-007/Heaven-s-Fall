import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Coins, Shield, Flame, Check } from 'lucide-react';

interface OpeningBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OpeningBalanceModal: React.FC<OpeningBalanceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { state, setOpeningTreasury } = useGame();
  const [rulersAmount, setRulersAmount] = useState<string>(
    state.rulersTreasury > 0 ? state.rulersTreasury.toString() : '0'
  );
  const [workersAmount, setWorkersAmount] = useState<string>(
    state.workersTreasury > 0 ? state.workersTreasury.toString() : '0'
  );
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rNum = parseFloat(rulersAmount);
    const wNum = parseFloat(workersAmount);

    if (isNaN(rNum) || rNum < 0 || isNaN(wNum) || wNum < 0) {
      setError('Opening balances must be valid non-negative numbers (0 or higher).');
      return;
    }

    const res = setOpeningTreasury(rNum, wNum);
    if (!res.success) {
      setError(res.error || 'Failed to set opening balances');
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#120b15] border-2 border-gold-600/60 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-100">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-zinc-800">
          <div className="p-2.5 rounded-xl bg-gold-950 border border-gold-600/50 text-gold-400">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-cinzel font-bold text-white">
              INITIAL OPENING TREASURY
            </h3>
            <p className="text-xs text-zinc-400">
              Manual entry required • Can be ₹0 or any starting pot
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-950/80 border border-rose-600 text-xs text-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rulers Opening Balance */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-gold-400" />
              <span>The Rulers Opening Balance (INR ₹)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-zinc-400 font-bold">₹</span>
              <input
                type="number"
                min="0"
                step="1"
                value={rulersAmount}
                onChange={(e) => setRulersAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-8 pr-4 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-base font-mono text-white focus:outline-none focus:border-gold-500"
                required
              />
            </div>
          </div>

          {/* Workers Opening Balance */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>The Workers Opening Balance (INR ₹)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-zinc-400 font-bold">₹</span>
              <input
                type="number"
                min="0"
                step="1"
                value={workersAmount}
                onChange={(e) => setWorkersAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-8 pr-4 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-base font-mono text-white focus:outline-none focus:border-rose-500"
                required
              />
            </div>
          </div>

          <div className="p-3 bg-zinc-950/70 rounded-xl border border-zinc-800 text-xs text-zinc-400 space-y-1">
            <div>• Setting opening balances will initialize both teams' pots.</div>
            <div>• Zero is valid for a fresh start with zero balance.</div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-700"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-gold-400 hover:bg-gold-300 font-cinzel shadow-md"
            >
              <Check className="w-4 h-4" />
              SET OPENING BALANCES
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
