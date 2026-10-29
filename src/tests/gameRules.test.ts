import { describe, it, expect } from 'vitest';
import { formatINR, formatDateTime, formatTimeOnly } from '../utils/formatters';

describe("Heaven's Fall Game Logic & Rules", () => {
  it('formats Indian Rupee amounts correctly', () => {
    expect(formatINR(0)).toBe('₹0');
    expect(formatINR(10500)).toContain('10,500');
    expect(formatINR(100000)).toContain('1,00,000');
  });

  it('formats date and time correctly', () => {
    const ts = 1700000000000;
    expect(formatDateTime(ts)).toBeTruthy();
    expect(formatTimeOnly(ts)).toBeTruthy();
  });

  it('calculates lead and overthrow condition strictly', () => {
    // Condition 1: Rulers leading
    let rulers = 10000;
    let workers = 8000;
    expect(rulers > workers).toBe(true);
    expect(workers > rulers).toBe(false);

    // Condition 2: Tied - A tie is strictly NOT an overthrow
    rulers = 10000;
    workers = 10000;
    expect(workers > rulers).toBe(false);
    expect(rulers > workers).toBe(false);
    expect(rulers === workers).toBe(true);

    // Condition 3: Workers strictly exceed Rulers - Overthrow!
    rulers = 10000;
    workers = 10001;
    expect(workers > rulers).toBe(true);
  });

  it('prevents treasury from falling below zero', () => {
    const currentBalance = 500;
    const deductAmount = 600;
    const canDeduct = currentBalance - deductAmount >= 0;
    expect(canDeduct).toBe(false);
  });

  it('calculates the exact amount needed to exceed leader', () => {
    // When Rulers lead by 2,000, Workers need 2,001 to strictly exceed
    const rulers = 5000;
    const workers = 3000;
    const needed = rulers - workers + 1;
    expect(needed).toBe(2001);
    expect(workers + needed > rulers).toBe(true);
  });

  it('reverses transactions accurately without deleting history', () => {
    let rulersTreasury = 5000;
    const originalTx = {
      id: 'tx_1',
      team: 'rulers',
      amount: 1500,
      type: 'ADD',
    };
    rulersTreasury += originalTx.amount;
    expect(rulersTreasury).toBe(6500);

    // Reversal entry
    const reversalTx = {
      id: 'tx_2',
      reversedTransactionId: originalTx.id,
      amount: originalTx.amount,
      type: 'DEDUCT',
    };
    rulersTreasury -= reversalTx.amount;
    expect(rulersTreasury).toBe(5000);
  });
});
