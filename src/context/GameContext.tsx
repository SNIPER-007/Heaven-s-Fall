import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import type {
  GameState,
  TaskItem,
  Transaction,
  RoleReversalEvent,
  Team,
  TransactionCategory,
  TransactionType,
  GameStatus,
  FirebaseConfigSettings,
} from '../types/game';
import { generateId } from '../utils/formatters';
import { sound } from '../utils/sound';
import {
  getSavedFirebaseConfig,
  saveFirebaseConfig,
  initFirebase,
  syncStateToFirestore,
  subscribeToFirestoreState,
} from '../services/firebase';
import type { Firestore } from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'heavens_fall_game_state_v1';
const BROADCAST_CHANNEL_NAME = 'heavens_fall_sync_channel';

const INITIAL_TASKS: TaskItem[] = [
  // Workers' Tasks
  {
    id: 'task-w-1',
    team: 'workers',
    name: 'The Halloween Factory',
    status: 'UPCOMING',
    amountEarned: null,
    order: 1,
    transactionIds: [],
    createdAt: Date.now() - 5000,
  },
  {
    id: 'task-w-2',
    team: 'workers',
    name: "The Monster's Memory",
    status: 'UPCOMING',
    amountEarned: null,
    order: 2,
    transactionIds: [],
    createdAt: Date.now() - 4000,
  },
  {
    id: 'task-w-3',
    team: 'workers',
    name: 'The Haunted Charades',
    status: 'UPCOMING',
    amountEarned: null,
    order: 3,
    transactionIds: [],
    createdAt: Date.now() - 3000,
  },
  {
    id: 'task-w-4',
    team: 'workers',
    name: 'The Ultimate Halloween',
    status: 'UPCOMING',
    amountEarned: null,
    order: 4,
    transactionIds: [],
    createdAt: Date.now() - 2000,
  },
  // Rulers' Tasks
  {
    id: 'task-r-1',
    team: 'rulers',
    name: 'The Royal Prediction',
    status: 'UPCOMING',
    amountEarned: null,
    order: 1,
    transactionIds: [],
    createdAt: Date.now() - 1000,
  },
  {
    id: 'task-r-2',
    team: 'rulers',
    name: 'The House Always Wins',
    status: 'UPCOMING',
    amountEarned: null,
    order: 2,
    transactionIds: [],
    createdAt: Date.now(),
  },
];

const DEFAULT_STATE: GameState = {
  rulersTreasury: 0,
  workersTreasury: 0,
  rulersPlayerCount: 7,
  workersPlayerCount: 8,
  status: 'NOT_STARTED',
  tasks: INITIAL_TASKS,
  transactions: [],
  roleReversals: [],
  lastAnnouncement: null,
  announcementDismissed: true,
  soundEnabled: true,
  updatedAt: Date.now(),
};

interface GameContextType {
  state: GameState;
  addTransaction: (params: {
    team: Team;
    category: TransactionCategory;
    type: TransactionType;
    amount: number;
    taskId?: string;
    taskName?: string;
    reason: string;
    notes?: string;
    allowDuplicateTaskPayment?: boolean;
  }) => { success: boolean; error?: string };
  reverseTransaction: (transactionId: string, notes?: string) => { success: boolean; error?: string };
  setOpeningTreasury: (rulersAmount: number, workersAmount: number) => { success: boolean; error?: string };
  confirmRoleReversal: (notes?: string) => { success: boolean; error?: string };
  updateGameStatus: (status: GameStatus) => void;
  resetGame: (options?: { preserveTasks?: boolean }) => void;
  // Task management
  addTask: (team: Team, name: string) => void;
  updateTaskName: (taskId: string, newName: string) => void;
  updateTaskStatus: (taskId: string, status: TaskItem['status']) => void;
  removeTask: (taskId: string) => void;
  reorderTasks: (team: Team, orderedTaskIds: string[]) => void;
  recordTaskPayment: (
    taskId: string,
    amount: number,
    notes?: string,
    allowDuplicate?: boolean
  ) => { success: boolean; error?: string };
  // Visual / audio controls
  dismissAnnouncement: () => void;
  triggerDramaticAnnouncement: (type: 'OVERTHROW' | 'RECLAIM') => void;
  toggleSound: () => void;
  // Firebase sync
  firebaseConfig: FirebaseConfigSettings | null;
  isFirebaseConnected: boolean;
  firebaseError: string | null;
  updateFirebaseConfig: (config: FirebaseConfigSettings | null) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_STATE,
          ...parsed,
          // ensure initial tasks exist if list was empty
          tasks: parsed.tasks && parsed.tasks.length > 0 ? parsed.tasks : INITIAL_TASKS,
        };
      }
    } catch (e) {
      console.error('Error loading initial state from local storage', e);
    }
    return DEFAULT_STATE;
  });

  const [firebaseConfig, setFirebaseConfig] = useState<FirebaseConfigSettings | null>(() =>
    getSavedFirebaseConfig()
  );
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  const dbRef = useRef<Firestore | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const isBroadcastingRef = useRef<boolean>(false);

  // Sync sound settings with sound utility
  useEffect(() => {
    sound.setEnabled(state.soundEnabled);
  }, [state.soundEnabled]);

  // Save state locally and broadcast to other tabs
  const persistState = useCallback((newState: GameState) => {
    setState(newState);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
    } catch (e) {
      console.error('Failed to save to local storage', e);
    }

    // Broadcast to other open tabs
    if (broadcastChannelRef.current) {
      isBroadcastingRef.current = true;
      broadcastChannelRef.current.postMessage({
        type: 'STATE_UPDATE',
        payload: newState,
      });
      setTimeout(() => {
        isBroadcastingRef.current = false;
      }, 50);
    }

    // Sync to Firestore if connected
    if (dbRef.current) {
      syncStateToFirestore(dbRef.current, newState);
    }
  }, []);

  // Setup BroadcastChannel for instant cross-tab sync (Dashboard <-> Projector Mode)
  useEffect(() => {
    try {
      const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      broadcastChannelRef.current = channel;

      channel.onmessage = (event) => {
        if (event.data?.type === 'STATE_UPDATE' && event.data.payload) {
          const remoteState = event.data.payload as GameState;
          setState((prev) => {
            if (remoteState.updatedAt > prev.updatedAt) {
              return remoteState;
            }
            return prev;
          });
        }
      };

      // Also listen to storage event for older browser support
      const onStorage = (e: StorageEvent) => {
        if (e.key === LOCAL_STORAGE_KEY && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            setState((prev) => (parsed.updatedAt > prev.updatedAt ? parsed : prev));
          } catch {
            // Ignore parse errors
          }
        }
      };
      window.addEventListener('storage', onStorage);

      return () => {
        channel.close();
        window.removeEventListener('storage', onStorage);
      };
    } catch (err) {
      console.error('BroadcastChannel not supported or error:', err);
    }
  }, []);

  // Initialize Firebase and subscribe
  useEffect(() => {
    if (!firebaseConfig?.apiKey || !firebaseConfig?.projectId) {
      setIsFirebaseConnected(false);
      dbRef.current = null;
      return;
    }

    const { db, error } = initFirebase(firebaseConfig);
    if (error || !db) {
      setIsFirebaseConnected(false);
      setFirebaseError(error || 'Failed to initialize Firebase');
      return;
    }

    dbRef.current = db;
    setIsFirebaseConnected(true);
    setFirebaseError(null);

    const unsubscribe = subscribeToFirestoreState(
      db,
      (remoteState) => {
        setState((current) => {
          if (remoteState.updatedAt > current.updatedAt) {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remoteState));
            return remoteState;
          }
          return current;
        });
      },
      (err) => {
        console.error('Firebase snapshot error', err);
        setFirebaseError(err.message);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [firebaseConfig]);

  const updateFirebaseConfig = useCallback((newConfig: FirebaseConfigSettings | null) => {
    setFirebaseConfig(newConfig);
    saveFirebaseConfig(newConfig);
  }, []);

  // Dismiss dramatic announcement
  const dismissAnnouncement = useCallback(() => {
    persistState({
      ...state,
      announcementDismissed: true,
      updatedAt: Date.now(),
    });
  }, [state, persistState]);

  // Manually trigger announcement (for testing or game master choice)
  const triggerDramaticAnnouncement = useCallback(
    (type: 'OVERTHROW' | 'RECLAIM') => {
      if (type === 'OVERTHROW') {
        sound.playDramaticThunder();
      } else {
        sound.playGothicBell(1.2);
      }
      persistState({
        ...state,
        lastAnnouncement: type,
        announcementDismissed: false,
        updatedAt: Date.now(),
      });
    },
    [state, persistState]
  );

  // Toggle sound
  const toggleSound = useCallback(() => {
    const nextVal = !state.soundEnabled;
    sound.setEnabled(nextVal);
    persistState({
      ...state,
      soundEnabled: nextVal,
      updatedAt: Date.now(),
    });
  }, [state, persistState]);

  // Add Transaction
  const addTransaction = useCallback(
    (params: {
      team: Team;
      category: TransactionCategory;
      type: TransactionType;
      amount: number;
      taskId?: string;
      taskName?: string;
      reason: string;
      notes?: string;
      allowDuplicateTaskPayment?: boolean;
    }): { success: boolean; error?: string } => {
      const { team, category, type, amount, taskId, taskName, reason, notes, allowDuplicateTaskPayment } = params;

      if (!amount || isNaN(amount) || amount <= 0) {
        return { success: false, error: 'Amount must be a positive number greater than 0.' };
      }

      const isDeduct = type === 'DEDUCT';
      const currentRulers = state.rulersTreasury;
      const currentWorkers = state.workersTreasury;
      const currentTeamBalance = team === 'rulers' ? currentRulers : currentWorkers;

      if (isDeduct && currentTeamBalance - amount < 0) {
        return {
          success: false,
          error: `Cannot deduct ₹${amount.toLocaleString('en-IN')}. Team treasury cannot fall below zero. Current balance is ₹${currentTeamBalance.toLocaleString('en-IN')}.`,
        };
      }

      // Check duplicate task payment guard
      if (taskId && !allowDuplicateTaskPayment) {
        const existingTask = state.tasks.find((t) => t.id === taskId);
        if (existingTask && existingTask.amountEarned !== null && existingTask.amountEarned > 0) {
          return {
            success: false,
            error: `DUPLICATE_GUARD: Task "${existingTask.name}" already has a recorded payment of ₹${existingTask.amountEarned.toLocaleString('en-IN')}.`,
          };
        }
      }

      const newTeamBalance = isDeduct ? currentTeamBalance - amount : currentTeamBalance + amount;
      const newRulersTreasury = team === 'rulers' ? newTeamBalance : currentRulers;
      const newWorkersTreasury = team === 'workers' ? newTeamBalance : currentWorkers;

      // Check lead change and overthrow conditions
      // Workers strictly > Rulers is overthrow
      const wasWorkersLeading = currentWorkers > currentRulers;
      const isWorkersLeading = newWorkersTreasury > newRulersTreasury;
      const isRulersLeading = newRulersTreasury > newWorkersTreasury;

      let newAnnouncement = state.lastAnnouncement;
      let shouldAnnounce = false;

      if (isWorkersLeading && !wasWorkersLeading) {
        // Workers just overtook Rulers!
        newAnnouncement = 'OVERTHROW';
        shouldAnnounce = true;
        sound.playDramaticThunder();
      } else if (isRulersLeading && wasWorkersLeading) {
        // Rulers reclaimed the lead!
        newAnnouncement = 'RECLAIM';
        shouldAnnounce = true;
        sound.playGothicBell(1.3);
      } else {
        if (isDeduct) {
          sound.playPenalty();
        } else {
          sound.playCoinReward();
        }
      }

      const txId = generateId();
      const newTx: Transaction = {
        id: txId,
        timestamp: Date.now(),
        team,
        category,
        type,
        amount,
        taskId,
        taskName: taskName || (taskId ? state.tasks.find((t) => t.id === taskId)?.name : undefined),
        reason: reason || taskName || category,
        notes,
        teamBalanceAfter: newTeamBalance,
        rulersBalanceAfter: newRulersTreasury,
        workersBalanceAfter: newWorkersTreasury,
        isReversed: false,
      };

      // If associated with a task, update task's amountEarned and status if it was not completed
      const updatedTasks = state.tasks.map((task) => {
        if (task.id === taskId) {
          const currentEarned = task.amountEarned || 0;
          return {
            ...task,
            status: 'COMPLETED' as const,
            amountEarned: isDeduct ? Math.max(0, currentEarned - amount) : currentEarned + amount,
            transactionIds: [...task.transactionIds, txId],
          };
        }
        return task;
      });

      const newState: GameState = {
        ...state,
        rulersTreasury: newRulersTreasury,
        workersTreasury: newWorkersTreasury,
        tasks: updatedTasks,
        transactions: [newTx, ...state.transactions],
        lastAnnouncement: shouldAnnounce ? newAnnouncement : state.lastAnnouncement,
        announcementDismissed: shouldAnnounce ? false : state.announcementDismissed,
        updatedAt: Date.now(),
      };

      persistState(newState);
      return { success: true };
    },
    [state, persistState]
  );

  // Reverse an existing transaction auditable without deleting history
  const reverseTransaction = useCallback(
    (transactionId: string, notes?: string): { success: boolean; error?: string } => {
      const originalTx = state.transactions.find((t) => t.id === transactionId);
      if (!originalTx) {
        return { success: false, error: 'Transaction not found.' };
      }
      if (originalTx.isReversed) {
        return { success: false, error: 'This transaction has already been reversed.' };
      }

      // To reverse an ADD, we DEDUCT that amount.
      // To reverse a DEDUCT, we ADD that amount.
      const reverseType: TransactionType = originalTx.type === 'ADD' ? 'DEDUCT' : 'ADD';
      const targetTeam = originalTx.team;
      const currentTeamBalance = targetTeam === 'rulers' ? state.rulersTreasury : state.workersTreasury;

      if (reverseType === 'DEDUCT' && currentTeamBalance - originalTx.amount < 0) {
        return {
          success: false,
          error: `Cannot reverse transaction: Deducting ₹${originalTx.amount.toLocaleString('en-IN')} would make ${targetTeam} treasury fall below zero.`,
        };
      }

      const newTeamBalance =
        reverseType === 'DEDUCT'
          ? currentTeamBalance - originalTx.amount
          : currentTeamBalance + originalTx.amount;

      const newRulersTreasury = targetTeam === 'rulers' ? newTeamBalance : state.rulersTreasury;
      const newWorkersTreasury = targetTeam === 'workers' ? newTeamBalance : state.workersTreasury;

      const reversalTxId = generateId();
      const reversalTx: Transaction = {
        id: reversalTxId,
        timestamp: Date.now(),
        team: targetTeam,
        category: 'Correction',
        type: reverseType,
        amount: originalTx.amount,
        taskId: originalTx.taskId,
        taskName: originalTx.taskName,
        reason: `Reversal of Tx #${originalTx.id.slice(-6)}: ${originalTx.reason}`,
        notes: notes ? `Reversal notes: ${notes}` : `Reversal of original transaction #${originalTx.id}`,
        teamBalanceAfter: newTeamBalance,
        rulersBalanceAfter: newRulersTreasury,
        workersBalanceAfter: newWorkersTreasury,
        isReversal: true,
        reversedTransactionId: originalTx.id,
      };

      // Mark original tx as reversed
      const updatedTransactions = state.transactions.map((tx) => {
        if (tx.id === originalTx.id) {
          return { ...tx, isReversed: true };
        }
        return tx;
      });

      // Update task earned amount if linked
      const updatedTasks = state.tasks.map((task) => {
        if (task.id === originalTx.taskId) {
          const currentEarned = task.amountEarned || 0;
          const adjusted =
            originalTx.type === 'ADD'
              ? Math.max(0, currentEarned - originalTx.amount)
              : currentEarned + originalTx.amount;
          return {
            ...task,
            amountEarned: adjusted === 0 ? null : adjusted,
            transactionIds: [...task.transactionIds, reversalTxId],
          };
        }
        return task;
      });

      // Check lead change
      const wasWorkersLeading = state.workersTreasury > state.rulersTreasury;
      const isWorkersLeading = newWorkersTreasury > newRulersTreasury;
      const isRulersLeading = newRulersTreasury > newWorkersTreasury;

      let newAnnouncement = state.lastAnnouncement;
      let shouldAnnounce = false;

      if (isWorkersLeading && !wasWorkersLeading) {
        newAnnouncement = 'OVERTHROW';
        shouldAnnounce = true;
        sound.playDramaticThunder();
      } else if (isRulersLeading && wasWorkersLeading) {
        newAnnouncement = 'RECLAIM';
        shouldAnnounce = true;
        sound.playGothicBell(1.2);
      } else {
        sound.playCoinReward();
      }

      const newState: GameState = {
        ...state,
        rulersTreasury: newRulersTreasury,
        workersTreasury: newWorkersTreasury,
        tasks: updatedTasks,
        transactions: [reversalTx, ...updatedTransactions],
        lastAnnouncement: shouldAnnounce ? newAnnouncement : state.lastAnnouncement,
        announcementDismissed: shouldAnnounce ? false : state.announcementDismissed,
        updatedAt: Date.now(),
      };

      persistState(newState);
      return { success: true };
    },
    [state, persistState]
  );

  // Set opening treasuries manually
  const setOpeningTreasury = useCallback(
    (rulersAmount: number, workersAmount: number): { success: boolean; error?: string } => {
      if (rulersAmount < 0 || workersAmount < 0) {
        return { success: false, error: 'Treasury amounts cannot be negative.' };
      }

      const newTransactions: Transaction[] = [];
      const now = Date.now();

      if (rulersAmount > 0) {
        newTransactions.push({
          id: generateId(),
          timestamp: now,
          team: 'rulers',
          category: 'Opening Balance',
          type: 'ADD',
          amount: rulersAmount,
          reason: 'Initial Opening Balance',
          teamBalanceAfter: rulersAmount,
          rulersBalanceAfter: rulersAmount,
          workersBalanceAfter: state.workersTreasury,
          isReversed: false,
        });
      }

      if (workersAmount > 0) {
        newTransactions.push({
          id: generateId(),
          timestamp: now + 1,
          team: 'workers',
          category: 'Opening Balance',
          type: 'ADD',
          amount: workersAmount,
          reason: 'Initial Opening Balance',
          teamBalanceAfter: workersAmount,
          rulersBalanceAfter: rulersAmount,
          workersBalanceAfter: workersAmount,
          isReversed: false,
        });
      }

      const newState: GameState = {
        ...state,
        rulersTreasury: rulersAmount,
        workersTreasury: workersAmount,
        transactions: [...newTransactions, ...state.transactions],
        updatedAt: Date.now(),
      };

      persistState(newState);
      sound.playGothicBell(1.0);
      return { success: true };
    },
    [state, persistState]
  );

  // Confirm official Role Reversal (Workers > Rulers)
  const confirmRoleReversal = useCallback(
    (notes?: string): { success: boolean; error?: string } => {
      if (state.workersTreasury <= state.rulersTreasury) {
        return {
          success: false,
          error: 'Role Reversal can only be confirmed when Workers treasury strictly exceeds Rulers treasury.',
        };
      }

      const difference = state.workersTreasury - state.rulersTreasury;
      const reversalEvent: RoleReversalEvent = {
        id: generateId(),
        timestamp: Date.now(),
        rulersTreasury: state.rulersTreasury,
        workersTreasury: state.workersTreasury,
        difference,
        confirmedByGM: true,
        notes: notes || 'Official role reversal confirmed by Game Master.',
      };

      // Play dramatic thunder + bell
      sound.playDramaticThunder();

      const newState: GameState = {
        ...state,
        roleReversals: [reversalEvent, ...state.roleReversals],
        lastAnnouncement: 'OVERTHROW',
        announcementDismissed: false,
        updatedAt: Date.now(),
      };

      persistState(newState);
      return { success: true };
    },
    [state, persistState]
  );

  // Update Game Status (START, PAUSE, RESUME, END)
  const updateGameStatus = useCallback(
    (status: GameStatus) => {
      persistState({
        ...state,
        status,
        updatedAt: Date.now(),
      });
      sound.playGothicBell(1.1);
    },
    [state, persistState]
  );

  // Reset Game
  const resetGame = useCallback(
    (options?: { preserveTasks?: boolean }) => {
      const resetTasks = options?.preserveTasks
        ? state.tasks.map((t) => ({ ...t, status: 'UPCOMING' as const, amountEarned: null, transactionIds: [] }))
        : INITIAL_TASKS;

      const newState: GameState = {
        ...DEFAULT_STATE,
        tasks: resetTasks,
        soundEnabled: state.soundEnabled,
        updatedAt: Date.now(),
      };
      persistState(newState);
      sound.playGothicBell(0.8);
    },
    [state, persistState]
  );

  // Task management functions
  const addTask = useCallback(
    (team: Team, name: string) => {
      if (!name.trim()) return;
      const teamTasks = state.tasks.filter((t) => t.team === team);
      const newTask: TaskItem = {
        id: generateId(),
        team,
        name: name.trim(),
        status: 'UPCOMING',
        amountEarned: null,
        order: teamTasks.length + 1,
        transactionIds: [],
        createdAt: Date.now(),
      };
      persistState({
        ...state,
        tasks: [...state.tasks, newTask],
        updatedAt: Date.now(),
      });
    },
    [state, persistState]
  );

  const updateTaskName = useCallback(
    (taskId: string, newName: string) => {
      if (!newName.trim()) return;
      persistState({
        ...state,
        tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, name: newName.trim() } : t)),
        updatedAt: Date.now(),
      });
    },
    [state, persistState]
  );

  const updateTaskStatus = useCallback(
    (taskId: string, status: TaskItem['status']) => {
      persistState({
        ...state,
        tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
        updatedAt: Date.now(),
      });
    },
    [state, persistState]
  );

  const removeTask = useCallback(
    (taskId: string) => {
      persistState({
        ...state,
        tasks: state.tasks.filter((t) => t.id !== taskId),
        updatedAt: Date.now(),
      });
    },
    [state, persistState]
  );

  const reorderTasks = useCallback(
    (team: Team, orderedTaskIds: string[]) => {
      const idToOrder = new Map(orderedTaskIds.map((id, idx) => [id, idx + 1]));
      persistState({
        ...state,
        tasks: state.tasks.map((t) => {
          if (t.team === team && idToOrder.has(t.id)) {
            return { ...t, order: idToOrder.get(t.id)! };
          }
          return t;
        }),
        updatedAt: Date.now(),
      });
    },
    [state, persistState]
  );

  const recordTaskPayment = useCallback(
    (
      taskId: string,
      amount: number,
      notes?: string,
      allowDuplicate?: boolean
    ): { success: boolean; error?: string } => {
      const task = state.tasks.find((t) => t.id === taskId);
      if (!task) return { success: false, error: 'Task not found' };

      return addTransaction({
        team: task.team,
        category: 'Task Reward',
        type: 'ADD',
        amount,
        taskId: task.id,
        taskName: task.name,
        reason: task.name,
        notes,
        allowDuplicateTaskPayment: allowDuplicate,
      });
    },
    [state.tasks, addTransaction]
  );

  return (
    <GameContext.Provider
      value={{
        state,
        addTransaction,
        reverseTransaction,
        setOpeningTreasury,
        confirmRoleReversal,
        updateGameStatus,
        resetGame,
        addTask,
        updateTaskName,
        updateTaskStatus,
        removeTask,
        reorderTasks,
        recordTaskPayment,
        dismissAnnouncement,
        triggerDramaticAnnouncement,
        toggleSound,
        firebaseConfig,
        isFirebaseConnected,
        firebaseError,
        updateFirebaseConfig,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
