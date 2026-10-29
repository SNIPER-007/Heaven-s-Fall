// Currency and Date formatting utilities for Heaven's Fall

export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }
  // Indian currency formatting: ₹10,500, ₹1,00,000, etc.
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateTime(timestamp: number): string {
  if (!timestamp) return '—';
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: 'short',
    hour12: true,
  }).format(date);
}

export function formatTimeOnly(timestamp: number): string {
  if (!timestamp) return '—';
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date);
}

export function generateId(): string {
  return 'hf_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export function exportTransactionsToCSV(transactions: Array<{
  id: string;
  timestamp: number;
  team: string;
  category: string;
  type: string;
  amount: number;
  taskName?: string;
  reason: string;
  notes?: string;
  teamBalanceAfter: number;
  rulersBalanceAfter: number;
  workersBalanceAfter: number;
  isReversed?: boolean;
  isReversal?: boolean;
}>): void {
  const headers = [
    'Transaction ID',
    'Date & Time',
    'Team',
    'Category',
    'Type',
    'Amount (INR)',
    'Task Name / Reason',
    'Notes',
    'Team Balance After',
    'Rulers Total After',
    'Workers Total After',
    'Status',
  ];

  const rows = transactions.map((t) => {
    const status = t.isReversed ? 'REVERSED' : t.isReversal ? 'REVERSAL TRANSACTION' : 'ACTIVE';
    return [
      t.id,
      `"${formatDateTime(t.timestamp)}"`,
      t.team.toUpperCase(),
      `"${t.category}"`,
      t.type,
      t.amount,
      `"${(t.taskName || t.reason || '').replace(/"/g, '""')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
      t.teamBalanceAfter,
      t.rulersBalanceAfter,
      t.workersBalanceAfter,
      status,
    ];
  });

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `heavens-fall-transactions-${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
