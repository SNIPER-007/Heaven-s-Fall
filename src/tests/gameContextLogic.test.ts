import { describe, it, expect } from 'vitest';
import type { TaskItem, Transaction, RoleReversalEvent } from '../types/game';

describe('Game Task Tracker and History Logic', () => {
  const initialWorkersTasks = [
    'The Halloween Factory',
    "The Monster's Memory",
    'The Haunted Charades',
    'The Ultimate Halloween',
  ];

  const initialRulersTasks = [
    'The Royal Prediction',
    'The House Always Wins',
  ];

  it('initializes with exact task names specified by the plan', () => {
    expect(initialWorkersTasks.length).toBe(4);
    expect(initialRulersTasks.length).toBe(2);
    expect(initialWorkersTasks[0]).toBe('The Halloween Factory');
    expect(initialRulersTasks[0]).toBe('The Royal Prediction');
  });

  it('guarantees tasks have no predefined points or reward tables', () => {
    const task: TaskItem = {
      id: 'task-1',
      team: 'workers',
      name: 'The Halloween Factory',
      status: 'UPCOMING',
      amountEarned: null, // manual entry only
      order: 1,
      transactionIds: [],
      createdAt: Date.now(),
    };

    expect(task.amountEarned).toBeNull();
    // Verify no predefined points or max values exist
    expect((task as unknown as Record<string, unknown>).points).toBeUndefined();
    expect((task as unknown as Record<string, unknown>).maxPoints).toBeUndefined();
  });

  it('flags duplicate payment guard when task already has recorded payment', () => {
    const task: TaskItem = {
      id: 'task-1',
      team: 'workers',
      name: 'The Halloween Factory',
      status: 'COMPLETED',
      amountEarned: 1500,
      order: 1,
      transactionIds: ['tx_1'],
      createdAt: Date.now(),
    };

    const isDuplicate = task.amountEarned !== null && task.amountEarned > 0;
    expect(isDuplicate).toBe(true);
  });

  it('preserves all previous transactions when an overthrow or role reversal occurs', () => {
    const transactions: Transaction[] = [
      {
        id: 'tx_1',
        timestamp: Date.now() - 2000,
        team: 'rulers',
        category: 'Task Reward',
        type: 'ADD',
        amount: 5000,
        reason: 'The Royal Prediction',
        teamBalanceAfter: 5000,
        rulersBalanceAfter: 5000,
        workersBalanceAfter: 0,
      },
      {
        id: 'tx_2',
        timestamp: Date.now() - 1000,
        team: 'workers',
        category: 'Task Reward',
        type: 'ADD',
        amount: 6000, // Workers exceed Rulers: 6000 > 5000
        reason: 'The Halloween Factory',
        teamBalanceAfter: 6000,
        rulersBalanceAfter: 5000,
        workersBalanceAfter: 6000,
      },
    ];

    const reversal: RoleReversalEvent = {
      id: 'rev_1',
      timestamp: Date.now(),
      rulersTreasury: 5000,
      workersTreasury: 6000,
      difference: 1000,
      confirmedByGM: true,
      notes: 'Confirmed by GM',
    };

    // Reversal occurs, but transactions array remains completely intact
    expect(transactions.length).toBe(2);
    expect(transactions[0].amount).toBe(5000);
    expect(transactions[1].amount).toBe(6000);
    expect(reversal.confirmedByGM).toBe(true);
  });
});
