import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Family,
  SavingsGoal,
  Transaction,
  AuditLog,
  Role,
  BalanceSummary,
  MonthlyBreakdown,
  GoalAllocation,
} from '../types';
import {
  INITIAL_FAMILY,
  INITIAL_GOALS,
  INITIAL_TRANSACTIONS,
  INITIAL_AUDIT_LOGS,
} from '../data/initialData';
import {
  calculateBalanceSummary,
  calculateGoalBalances,
  calculateMonthlyBreakdown,
} from '../utils/calculations';

interface SavingsContextType {
  family: Family;
  currentRole: Role;
  goals: SavingsGoal[];
  transactions: Transaction[];
  auditLogs: AuditLog[];
  hideBalance: boolean;
  isDarkMode: boolean;
  summary: BalanceSummary;
  goalBalances: Record<string, number>;
  monthlyBreakdowns: MonthlyBreakdown[];
  
  // Actions
  setCurrentRole: (role: Role) => void;
  toggleHideBalance: () => void;
  toggleDarkMode: () => void;
  addTransaction: (data: {
    contributor: Role;
    type: 'DEPOSIT' | 'WITHDRAWAL';
    amount: number;
    transactionDate: string;
    description: string;
    allocations: GoalAllocation[];
  }) => Transaction;
  editTransaction: (
    id: string,
    updatedData: {
      contributor: Role;
      type: 'DEPOSIT' | 'WITHDRAWAL';
      amount: number;
      transactionDate: string;
      description: string;
      allocations: GoalAllocation[];
    },
    reason: string
  ) => boolean;
  deleteTransaction: (id: string, reason: string) => boolean;
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'familyId' | 'accountId'>) => SavingsGoal;
  editGoal: (id: string, goal: Partial<SavingsGoal>) => boolean;
  deleteGoal: (id: string) => boolean;
  updateFamily: (data: Partial<Family>) => void;
  resetToDefaultData: () => void;
  exportJSON: () => string;
  importJSON: (jsonString: string) => { success: boolean; error?: string };
}

const SavingsContext = createContext<SavingsContextType | undefined>(undefined);

const STORAGE_KEYS = {
  FAMILY: 'kita_savings_family_v1',
  GOALS: 'kita_savings_goals_v1',
  TRANSACTIONS: 'kita_savings_transactions_v1',
  AUDIT_LOGS: 'kita_savings_audit_logs_v1',
  ROLE: 'kita_savings_current_role_v1',
  HIDE_BALANCE: 'kita_savings_hide_balance_v1',
  THEME: 'kita_savings_dark_mode_v1',
};

export const SavingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from LocalStorage or defaults
  const [family, setFamily] = useState<Family>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FAMILY);
      return saved ? JSON.parse(saved) : INITIAL_FAMILY;
    } catch {
      return INITIAL_FAMILY;
    }
  });

  const [currentRole, setCurrentRoleState] = useState<Role>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
      return (saved === 'WIFE' ? 'WIFE' : 'HUSBAND') as Role;
    } catch {
      return 'HUSBAND';
    }
  });

  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
      return saved ? JSON.parse(saved) : INITIAL_GOALS;
    } catch {
      return INITIAL_GOALS;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [hideBalance, setHideBalance] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HIDE_BALANCE);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FAMILY, JSON.stringify(family));
  }, [family]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HIDE_BALANCE, String(hideBalance));
  }, [hideBalance]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, String(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Derived Calculations
  const summary = useMemo(() => {
    return calculateBalanceSummary(transactions, goals);
  }, [transactions, goals]);

  const goalBalances = useMemo(() => {
    return calculateGoalBalances(transactions, goals);
  }, [transactions, goals]);

  const monthlyBreakdowns = useMemo(() => {
    return calculateMonthlyBreakdown(transactions);
  }, [transactions]);

  // Actions
  const setCurrentRole = (role: Role) => {
    setCurrentRoleState(role);
  };

  const toggleHideBalance = () => {
    setHideBalance((prev) => !prev);
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const addTransaction = (data: {
    contributor: Role;
    type: 'DEPOSIT' | 'WITHDRAWAL';
    amount: number;
    transactionDate: string;
    description: string;
    allocations: GoalAllocation[];
  }): Transaction => {
    const newTx: Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      familyId: family.id,
      accountId: 'acc_01',
      createdBy: currentRole === 'HUSBAND' ? family.husbandName : family.wifeName,
      contributor: data.contributor,
      type: data.type,
      amount: Number(data.amount),
      transactionDate: data.transactionDate,
      description: data.description.trim() || (data.type === 'DEPOSIT' ? 'Setoran Tabungan' : 'Penarikan Dana'),
      allocations: data.allocations,
      createdAt: new Date().toISOString(),
    };

    const newAudit: AuditLog = {
      id: `audit_${Date.now()}`,
      transactionId: newTx.id,
      action: 'CREATE',
      modifiedBy: currentRole === 'HUSBAND' ? family.husbandName : family.wifeName,
      modifierRole: currentRole,
      timestamp: new Date().toISOString(),
      reason: 'Pencatatan transaksi baru',
      previousState: {
        amount: 0,
        contributor: data.contributor,
        type: data.type,
        transactionDate: data.transactionDate,
        description: '',
        allocations: [],
      },
      newState: {
        amount: newTx.amount,
        contributor: newTx.contributor,
        type: newTx.type,
        transactionDate: newTx.transactionDate,
        description: newTx.description,
        allocations: newTx.allocations,
      },
    };

    setTransactions((prev) => [newTx, ...prev]);
    setAuditLogs((prev) => [newAudit, ...prev]);
    return newTx;
  };

  const editTransaction = (
    id: string,
    updatedData: {
      contributor: Role;
      type: 'DEPOSIT' | 'WITHDRAWAL';
      amount: number;
      transactionDate: string;
      description: string;
      allocations: GoalAllocation[];
    },
    reason: string
  ): boolean => {
    const existing = transactions.find((t) => t.id === id);
    if (!existing) return false;

    const previousState = {
      amount: existing.amount,
      contributor: existing.contributor,
      type: existing.type,
      transactionDate: existing.transactionDate,
      description: existing.description,
      allocations: [...existing.allocations],
    };

    const updatedTx: Transaction = {
      ...existing,
      contributor: updatedData.contributor,
      type: updatedData.type,
      amount: Number(updatedData.amount),
      transactionDate: updatedData.transactionDate,
      description: updatedData.description.trim(),
      allocations: updatedData.allocations,
      updatedAt: new Date().toISOString(),
    };

    const newAudit: AuditLog = {
      id: `audit_${Date.now()}`,
      transactionId: id,
      action: 'EDIT',
      modifiedBy: currentRole === 'HUSBAND' ? family.husbandName : family.wifeName,
      modifierRole: currentRole,
      timestamp: new Date().toISOString(),
      reason: reason.trim() || 'Koreksi transaksi',
      previousState,
      newState: {
        amount: updatedTx.amount,
        contributor: updatedTx.contributor,
        type: updatedTx.type,
        transactionDate: updatedTx.transactionDate,
        description: updatedTx.description,
        allocations: updatedTx.allocations,
      },
    };

    setTransactions((prev) => prev.map((t) => (t.id === id ? updatedTx : t)));
    setAuditLogs((prev) => [newAudit, ...prev]);
    return true;
  };

  const deleteTransaction = (id: string, reason: string): boolean => {
    const existing = transactions.find((t) => t.id === id);
    if (!existing) return false;

    const newAudit: AuditLog = {
      id: `audit_${Date.now()}`,
      transactionId: id,
      action: 'DELETE',
      modifiedBy: currentRole === 'HUSBAND' ? family.husbandName : family.wifeName,
      modifierRole: currentRole,
      timestamp: new Date().toISOString(),
      reason: reason.trim() || 'Penghapusan transaksi',
      previousState: {
        amount: existing.amount,
        contributor: existing.contributor,
        type: existing.type,
        transactionDate: existing.transactionDate,
        description: existing.description,
        allocations: existing.allocations,
      },
      newState: {
        amount: 0,
        contributor: existing.contributor,
        type: existing.type,
        transactionDate: existing.transactionDate,
        description: 'Dihapus',
        allocations: [],
      },
    };

    setTransactions((prev) => prev.filter((t) => t.id !== id));
    setAuditLogs((prev) => [newAudit, ...prev]);
    return true;
  };

  const addGoal = (
    goalData: Omit<SavingsGoal, 'id' | 'createdAt' | 'familyId' | 'accountId'>
  ): SavingsGoal => {
    const newGoal: SavingsGoal = {
      ...goalData,
      id: `goal_${Date.now()}`,
      familyId: family.id,
      accountId: 'acc_01',
      createdAt: new Date().toISOString(),
    };
    setGoals((prev) => [...prev, newGoal]);
    return newGoal;
  };

  const editGoal = (id: string, updatedData: Partial<SavingsGoal>): boolean => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updatedData } : g)));
    return true;
  };

  const deleteGoal = (id: string): boolean => {
    // Reallocate goal balances in transactions or keep consistency
    setGoals((prev) => prev.filter((g) => g.id !== id));
    return true;
  };

  const updateFamily = (data: Partial<Family>) => {
    setFamily((prev) => ({ ...prev, ...data }));
  };

  const resetToDefaultData = () => {
    setFamily(INITIAL_FAMILY);
    setGoals(INITIAL_GOALS);
    setTransactions(INITIAL_TRANSACTIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCurrentRoleState('HUSBAND');
    setHideBalance(false);
  };

  const exportJSON = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      family,
      goals,
      transactions,
      auditLogs,
    };
    return JSON.stringify(data, null, 2);
  };

  const importJSON = (jsonString: string): { success: boolean; error?: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.family || !Array.isArray(parsed.goals) || !Array.isArray(parsed.transactions)) {
        return { success: false, error: 'Format file JSON tidak sesuai struktur KITA.' };
      }
      setFamily(parsed.family);
      setGoals(parsed.goals);
      setTransactions(parsed.transactions);
      if (Array.isArray(parsed.auditLogs)) {
        setAuditLogs(parsed.auditLogs);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal memproses file JSON.' };
    }
  };

  return (
    <SavingsContext.Provider
      value={{
        family,
        currentRole,
        goals,
        transactions,
        auditLogs,
        hideBalance,
        isDarkMode,
        summary,
        goalBalances,
        monthlyBreakdowns,
        setCurrentRole,
        toggleHideBalance,
        toggleDarkMode,
        addTransaction,
        editTransaction,
        deleteTransaction,
        addGoal,
        editGoal,
        deleteGoal,
        updateFamily,
        resetToDefaultData,
        exportJSON,
        importJSON,
      }}
    >
      {children}
    </SavingsContext.Provider>
  );
};

export const useSavings = (): SavingsContextType => {
  const context = useContext(SavingsContext);
  if (!context) {
    throw new Error('useSavings must be used within a SavingsProvider');
  }
  return context;
};
