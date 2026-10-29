import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import {
  formatINR,
  formatDateTime,
  formatTimeOnly,
  exportTransactionsToCSV,
} from '../utils/formatters';
import type { Team } from '../types/game';
import {
  Download,
  Search,
  ArrowUpDown,
  RotateCcw,
  Shield,
  Flame,
  Sparkles,
  History,
} from 'lucide-react';

export const TransactionHistory: React.FC = () => {
  const { state, reverseTransaction } = useGame();
  const { transactions, roleReversals } = state;

  // Filtering and sorting state
  const [teamFilter, setTeamFilter] = useState<'all' | Team>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [activeTab, setActiveTab] = useState<'transactions' | 'reversals'>('transactions');

  // Reversal modal state
  const [reversingTxId, setReversingTxId] = useState<string | null>(null);
  const [reversalReason, setReversalReason] = useState<string>('');

  const targetReversalTx = transactions.find((t) => t.id === reversingTxId);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        if (teamFilter !== 'all' && tx.team !== teamFilter) return false;
        if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchReason = (tx.reason || '').toLowerCase().includes(q);
          const matchTask = (tx.taskName || '').toLowerCase().includes(q);
          const matchNotes = (tx.notes || '').toLowerCase().includes(q);
          const matchId = tx.id.toLowerCase().includes(q);
          if (!matchReason && !matchTask && !matchNotes && !matchId) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'newest') {
          return b.timestamp - a.timestamp;
        } else {
          return a.timestamp - b.timestamp;
        }
      });
  }, [transactions, teamFilter, categoryFilter, searchQuery, sortOrder]);

  const handleConfirmReversal = () => {
    if (!reversingTxId) return;
    const result = reverseTransaction(reversingTxId, reversalReason.trim() || undefined);
    if (!result.success) {
      alert(result.error || 'Failed to reverse transaction');
      return;
    }
    setReversingTxId(null);
    setReversalReason('');
  };

  const handleExportCSV = () => {
    exportTransactionsToCSV(transactions);
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#0d0811] p-5 sm:p-7 shadow-2xl relative">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="text-xs uppercase tracking-widest text-zinc-400 font-cinzel">
            Auditable Ledger
          </div>
          <h3 className="text-xl sm:text-2xl font-black font-cinzel tracking-wider text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-gold-400" />
            TRANSACTION & REVERSAL HISTORY
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Transparent event logs • All records preserved during role reversals
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Subtabs: Transactions vs Role Reversals */}
          <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-cinzel transition-all ${
                activeTab === 'transactions'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Transactions ({transactions.length})
            </button>
            <button
              onClick={() => setActiveTab('reversals')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-cinzel transition-all flex items-center gap-1.5 ${
                activeTab === 'reversals'
                  ? 'bg-rose-950 text-rose-300 border border-rose-600/50 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-3 h-3 text-rose-400" />
              Role Reversals ({roleReversals.length})
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            disabled={transactions.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-gold-300 border border-zinc-700 disabled:opacity-40 transition-colors"
            title="Export full transaction ledger to CSV"
          >
            <Download className="w-3.5 h-3.5 text-gold-400" />
            <span>EXPORT CSV</span>
          </button>
        </div>
      </div>

      {activeTab === 'transactions' ? (
        <>
          {/* Filters Bar */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search task, reason, ID..."
                className="w-full pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gold-500"
              />
            </div>

            {/* Team Filter */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-zinc-400 hidden xl:inline">Team:</span>
              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value as 'all' | Team)}
                className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-gold-500"
              >
                <option value="all">All Teams</option>
                <option value="rulers">The Rulers Only</option>
                <option value="workers">The Workers Only</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-zinc-400 hidden xl:inline">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-gold-500"
              >
                <option value="all">All Categories</option>
                <option value="Task Reward">Task Reward</option>
                <option value="Bonus">Bonus</option>
                <option value="Penalty">Penalty</option>
                <option value="Manual Adjustment">Manual Adjustment</option>
                <option value="Correction">Correction</option>
                <option value="Opening Balance">Opening Balance</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-xl text-xs text-zinc-300 transition-colors"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-gold-400" />
                <span>Sort: {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}</span>
              </button>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-800/80 bg-zinc-950/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#140e18] border-b border-zinc-800 text-zinc-400 font-cinzel uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-3.5">Time</th>
                  <th className="py-3 px-3">Team</th>
                  <th className="py-3 px-3">Task / Reason</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-3 text-right">Team Treasury After</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-sans">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-500 font-cinzel">
                      No transactions recorded matching the criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => {
                    const isRulers = tx.team === 'rulers';
                    const isAdd = tx.type === 'ADD';

                    return (
                      <tr
                        key={tx.id}
                        className={`hover:bg-zinc-900/50 transition-colors ${
                          tx.isReversed ? 'opacity-50 line-through bg-zinc-950/40' : ''
                        }`}
                      >
                        {/* Time */}
                        <td className="py-3 px-3.5 font-mono text-zinc-400 whitespace-nowrap">
                          <div>{formatTimeOnly(tx.timestamp)}</div>
                          <div className="text-[10px] text-zinc-500">
                            {formatDateTime(tx.timestamp).split(',')[0]}
                          </div>
                        </td>

                        {/* Team */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold font-cinzel ${
                              isRulers
                                ? 'bg-gold-950/80 text-gold-300 border border-gold-600/40'
                                : 'bg-blood-950/80 text-rose-300 border border-blood-600/40'
                            }`}
                          >
                            {isRulers ? (
                              <Shield className="w-3 h-3 text-gold-400" />
                            ) : (
                              <Flame className="w-3 h-3 text-rose-400" />
                            )}
                            {isRulers ? 'RULERS' : 'WORKERS'}
                          </span>
                        </td>

                        {/* Reason / Task */}
                        <td className="py-3 px-3">
                          <div className="font-semibold text-zinc-200">
                            {tx.taskName || tx.reason}
                          </div>
                          {tx.notes && (
                            <div className="text-[11px] text-zinc-400 italic mt-0.5">
                              {tx.notes}
                            </div>
                          )}
                          {tx.isReversal && (
                            <span className="inline-block px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-700/50 text-[10px] font-mono mt-0.5">
                              Reversal Entry
                            </span>
                          )}
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="text-[11px] text-zinc-400">{tx.category}</span>
                        </td>

                        {/* Amount */}
                        <td className="py-3 px-3 text-right whitespace-nowrap font-mono font-bold text-sm">
                          <span
                            className={
                              isAdd
                                ? 'text-emerald-400'
                                : 'text-rose-400'
                            }
                          >
                            {isAdd ? '+' : '-'}
                            {formatINR(tx.amount)}
                          </span>
                        </td>

                        {/* Team Balance After */}
                        <td className="py-3 px-3 text-right whitespace-nowrap font-mono font-bold text-zinc-200">
                          {formatINR(tx.teamBalanceAfter)}
                        </td>

                        {/* Actions (Reverse incorrect transaction) */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {tx.isReversed ? (
                            <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono">
                              REVERSED
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setReversingTxId(tx.id);
                                setReversalReason('');
                              }}
                              className="px-2 py-1 rounded text-[11px] font-semibold text-zinc-400 hover:text-rose-300 hover:bg-rose-950/40 border border-zinc-800 hover:border-rose-700/50 transition-colors"
                              title="Auditable Reversal (Offsets this transaction without deleting it)"
                            >
                              <RotateCcw className="w-3 h-3 inline mr-1" />
                              Reverse
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* ROLE REVERSALS HISTORY TAB */
        <div className="mt-4 space-y-3">
          {roleReversals.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 font-cinzel text-sm">
              No official role reversals confirmed yet.
            </div>
          ) : (
            roleReversals.map((rev, idx) => (
              <div
                key={rev.id}
                className="p-4 rounded-xl border border-rose-600/40 bg-gradient-to-r from-blood-950/80 via-[#180a11] to-zinc-950 space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-rose-900/80 text-rose-300 border border-rose-500 font-mono text-xs font-bold">
                      #{roleReversals.length - idx}
                    </span>
                    <h4 className="font-cinzel font-bold text-rose-300 text-base">
                      OFFICIAL ROLE REVERSAL RATIFIED
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-zinc-400">
                    {formatDateTime(rev.timestamp)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono p-2.5 rounded-lg bg-black/60 border border-zinc-800">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">WORKERS TREASURY:</span>
                    <span className="text-rose-400 font-bold">{formatINR(rev.workersTreasury)}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">RULERS TREASURY:</span>
                    <span className="text-gold-400 font-bold">{formatINR(rev.rulersTreasury)}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">MARGIN OVER RULERS:</span>
                    <span className="text-emerald-400 font-black">+{formatINR(rev.difference)}</span>
                  </div>
                </div>

                {rev.notes && (
                  <p className="text-xs text-zinc-300 italic pt-1">
                    "{rev.notes}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* REVERSAL CONFIRMATION MODAL */}
      {targetReversalTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#120810] border-2 border-rose-600 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-rose-950 text-rose-400 border border-rose-700">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-cinzel font-bold text-rose-300">
                  REVERSE TRANSACTION
                </h3>
                <p className="text-xs text-zinc-400">Auditable Accounting Correction</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 mb-4 leading-relaxed">
              This will create an exact offsetting reversal entry for{' '}
              <strong className="text-white">
                {targetReversalTx.type === 'ADD' ? '+' : '-'}
                {formatINR(targetReversalTx.amount)}
              </strong>{' '}
              to <strong className="text-gold-400 uppercase">{targetReversalTx.team}</strong>. The
              original record will be marked reversed and preserved for auditing.
            </p>

            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs space-y-1 mb-4 font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-400">Reason:</span>
                <span className="text-zinc-200">{targetReversalTx.reason}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Recorded At:</span>
                <span className="text-zinc-200">{formatTimeOnly(targetReversalTx.timestamp)}</span>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Reason for Reversal:
              </label>
              <input
                type="text"
                value={reversalReason}
                onChange={(e) => setReversalReason(e.target.value)}
                placeholder="e.g. Incorrect amount keyed in by GM"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setReversingTxId(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-700"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleConfirmReversal}
                className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-blood-700 hover:bg-blood-600 border border-rose-500 font-cinzel shadow-md"
              >
                CONFIRM AUDIT REVERSAL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
