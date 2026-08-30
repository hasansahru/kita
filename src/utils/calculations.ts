import { Transaction, SavingsGoal, BalanceSummary, MonthlyBreakdown } from '../types';
import { getMonthName } from './formatters';

/**
 * Calculates current virtual balances for all goals based on all transactions.
 * Strict mathematical aggregation:
 * Goal Balance = (Sum of Deposits allocated to Goal) - (Sum of Withdrawals deducted from Goal)
 */
export const calculateGoalBalances = (
  transactions: Transaction[],
  goals: SavingsGoal[]
): Record<string, number> => {
  const balances: Record<string, number> = {};

  // Initialize all goals with 0
  goals.forEach((g) => {
    balances[g.id] = 0;
  });

  transactions.forEach((tx) => {
    if (!tx.allocations || tx.allocations.length === 0) {
      // Legacy or unallocated transaction
      return;
    }

    tx.allocations.forEach((alloc) => {
      if (alloc.goalId && alloc.goalId !== 'UNALLOCATED') {
        if (balances[alloc.goalId] === undefined) {
          balances[alloc.goalId] = 0;
        }

        if (tx.type === 'DEPOSIT') {
          balances[alloc.goalId] += Number(alloc.amount || 0);
        } else if (tx.type === 'WITHDRAWAL') {
          balances[alloc.goalId] -= Number(alloc.amount || 0);
        }
      }
    });
  });

  return balances;
};

/**
 * Comprehensive Account Balance & Consistency Calculation
 * Strictly derived from transactions.
 */
export const calculateBalanceSummary = (
  transactions: Transaction[],
  goals: SavingsGoal[]
): BalanceSummary => {
  let totalDeposit = 0;
  let totalWithdrawal = 0;
  let husbandDeposit = 0;
  let wifeDeposit = 0;

  transactions.forEach((tx) => {
    const amount = Number(tx.amount || 0);
    if (tx.type === 'DEPOSIT') {
      totalDeposit += amount;
      if (tx.contributor === 'HUSBAND') {
        husbandDeposit += amount;
      } else if (tx.contributor === 'WIFE') {
        wifeDeposit += amount;
      }
    } else if (tx.type === 'WITHDRAWAL') {
      totalWithdrawal += amount;
    }
  });

  const totalBalance = totalDeposit - totalWithdrawal;

  const husbandPercentage =
    totalDeposit > 0 ? Math.round((husbandDeposit / totalDeposit) * 100) : 0;
  const wifePercentage =
    totalDeposit > 0 ? Math.max(0, 100 - husbandPercentage) : 0;

  // Virtual Goal Balances
  const goalBalances = calculateGoalBalances(transactions, goals);
  const totalAllocated = Object.values(goalBalances).reduce(
    (sum, val) => sum + Math.max(0, val),
    0
  );

  const unallocatedAmount = totalBalance - totalAllocated;

  // Consistency Check
  const sumOfParts = totalAllocated + unallocatedAmount;
  const discrepancy = totalBalance - sumOfParts;
  const isConsistent = Math.abs(discrepancy) < 0.001;

  return {
    totalBalance,
    totalDeposit,
    totalWithdrawal,
    husbandDeposit,
    wifeDeposit,
    husbandPercentage,
    wifePercentage,
    unallocatedAmount,
    totalAllocated,
    isConsistent,
    discrepancy,
  };
};

/**
 * Calculates monthly breakdown statistics for the selected or all months
 */
export const calculateMonthlyBreakdown = (
  transactions: Transaction[],
  targetMonthKey?: string
): MonthlyBreakdown[] => {
  // Sort transactions chronologically
  const sortedTx = [...transactions].sort((a, b) =>
    a.transactionDate.localeCompare(b.transactionDate)
  );

  // Group by YYYY-MM
  const monthMap = new Map<
    string,
    {
      husbandDeposit: number;
      wifeDeposit: number;
      totalDeposit: number;
      withdrawal: number;
      netSavings: number;
    }
  >();

  sortedTx.forEach((tx) => {
    const monthKey = tx.transactionDate.substring(0, 7); // e.g. "2026-08"
    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, {
        husbandDeposit: 0,
        wifeDeposit: 0,
        totalDeposit: 0,
        withdrawal: 0,
        netSavings: 0,
      });
    }

    const m = monthMap.get(monthKey)!;
    const amount = Number(tx.amount || 0);

    if (tx.type === 'DEPOSIT') {
      m.totalDeposit += amount;
      if (tx.contributor === 'HUSBAND') {
        m.husbandDeposit += amount;
      } else {
        m.wifeDeposit += amount;
      }
      m.netSavings += amount;
    } else {
      m.withdrawal += amount;
      m.netSavings -= amount;
    }
  });

  // Calculate running ending balance
  let runningBalance = 0;
  const result: MonthlyBreakdown[] = [];

  const sortedMonthKeys = Array.from(monthMap.keys()).sort();

  sortedMonthKeys.forEach((key) => {
    const m = monthMap.get(key)!;
    runningBalance += m.netSavings;

    const [yearStr, monthStr] = key.split('-');
    const monthIdx = parseInt(monthStr, 10) - 1;
    const monthLabel = `${getMonthName(monthIdx)} ${yearStr}`;

    result.push({
      monthKey: key,
      monthLabel,
      husbandDeposit: m.husbandDeposit,
      wifeDeposit: m.wifeDeposit,
      totalDeposit: m.totalDeposit,
      withdrawal: m.withdrawal,
      netSavings: m.netSavings,
      endingBalance: runningBalance,
    });
  });

  if (targetMonthKey) {
    return result.filter((r) => r.monthKey === targetMonthKey);
  }

  return result;
};

/**
 * Calculates monthly savings recommendation to meet deadline
 */
export const calculateMonthlyTargetRequirement = (
  targetAmount: number,
  currentAmount: number,
  deadlineStr?: string
): { monthsRemaining: number; monthlyRecommendation: number } | null => {
  if (!deadlineStr) return null;

  const deadline = new Date(deadlineStr + 'T23:59:59');
  const now = new Date();

  if (deadline.getTime() <= now.getTime()) {
    return { monthsRemaining: 0, monthlyRecommendation: targetAmount - currentAmount };
  }

  const remainingAmount = Math.max(0, targetAmount - currentAmount);
  if (remainingAmount === 0) {
    return { monthsRemaining: 0, monthlyRecommendation: 0 };
  }

  // Calculate difference in months
  const yearDiff = deadline.getFullYear() - now.getFullYear();
  const monthDiff = deadline.getMonth() - now.getMonth();
  const dayDiff = deadline.getDate() - now.getDate();
  
  let months = yearDiff * 12 + monthDiff;
  if (dayDiff > 10) months += 1;
  months = Math.max(1, months);

  const monthlyRecommendation = Math.ceil(remainingAmount / months);

  return {
    monthsRemaining: months,
    monthlyRecommendation,
  };
};
