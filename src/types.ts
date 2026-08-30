export type Role = 'HUSBAND' | 'WIFE';

export interface UserProfile {
  id: string;
  name: string;
  role: Role;
  avatarColor: string;
}

export interface Family {
  id: string;
  name: string;
  husbandName: string;
  wifeName: string;
  bankName: string;
  accountNumber?: string;
  accountHolder?: string;
  createdAt: string;
}

export interface GoalAllocation {
  goalId: string; // 'UNALLOCATED' or specific goal id
  amount: number;
}

export interface SavingsGoal {
  id: string;
  familyId: string;
  accountId: string;
  name: string;
  targetAmount: number;
  color: string;
  iconName: string;
  deadline?: string; // YYYY-MM-DD
  notes?: string;
  isArchived?: boolean;
  createdAt: string;
}

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL';

export interface Transaction {
  id: string;
  familyId: string;
  accountId: string;
  createdBy: string;
  contributor: Role;
  type: TransactionType;
  amount: number;
  transactionDate: string; // YYYY-MM-DD
  description: string;
  allocations: GoalAllocation[];
  createdAt: string;
  updatedAt?: string;
}

export interface AuditLog {
  id: string;
  transactionId: string;
  action: 'EDIT' | 'CREATE' | 'DELETE';
  modifiedBy: string;
  modifierRole: Role;
  timestamp: string;
  reason: string;
  previousState: {
    amount: number;
    contributor: Role;
    type: TransactionType;
    transactionDate: string;
    description: string;
    allocations: GoalAllocation[];
  };
  newState: {
    amount: number;
    contributor: Role;
    type: TransactionType;
    transactionDate: string;
    description: string;
    allocations: GoalAllocation[];
  };
}

export interface BalanceSummary {
  totalBalance: number;
  totalDeposit: number;
  totalWithdrawal: number;
  husbandDeposit: number;
  wifeDeposit: number;
  husbandPercentage: number;
  wifePercentage: number;
  unallocatedAmount: number;
  totalAllocated: number;
  isConsistent: boolean;
  discrepancy: number;
}

export interface MonthlyBreakdown {
  monthKey: string; // YYYY-MM
  monthLabel: string;
  husbandDeposit: number;
  wifeDeposit: number;
  totalDeposit: number;
  withdrawal: number;
  netSavings: number;
  endingBalance: number;
}
