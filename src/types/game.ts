export type Team = 'rulers' | 'workers';

export type TaskStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED';

export interface TaskItem {
  id: string;
  team: Team;
  name: string;
  status: TaskStatus;
  amountEarned: number | null;
  order: number;
  transactionIds: string[];
  createdAt: number;
}

export type TransactionCategory =
  | 'Task Reward'
  | 'Bonus'
  | 'Penalty'
  | 'Manual Adjustment'
  | 'Correction'
  | 'Opening Balance';

export type TransactionType = 'ADD' | 'DEDUCT';

export interface Transaction {
  id: string;
  timestamp: number;
  team: Team;
  category: TransactionCategory;
  type: TransactionType;
  amount: number;
  taskId?: string;
  taskName?: string;
  reason: string;
  notes?: string;
  teamBalanceAfter: number;
  rulersBalanceAfter: number;
  workersBalanceAfter: number;
  isReversal?: boolean;
  reversedTransactionId?: string;
  isReversed?: boolean;
}

export interface RoleReversalEvent {
  id: string;
  timestamp: number;
  rulersTreasury: number;
  workersTreasury: number;
  difference: number;
  confirmedByGM: boolean;
  notes?: string;
}

export type GameStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'PAUSED' | 'ENDED';

export interface GameState {
  rulersTreasury: number;
  workersTreasury: number;
  rulersPlayerCount: number; // 7
  workersPlayerCount: number; // 8
  status: GameStatus;
  tasks: TaskItem[];
  transactions: Transaction[];
  roleReversals: RoleReversalEvent[];
  lastAnnouncement: 'OVERTHROW' | 'RECLAIM' | null;
  announcementDismissed: boolean;
  soundEnabled: boolean;
  updatedAt: number;
}

export interface FirebaseConfigSettings {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}
