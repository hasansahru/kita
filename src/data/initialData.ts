import { Family, SavingsGoal, Transaction, AuditLog } from '../types';

export const INITIAL_FAMILY: Family = {
  id: 'fam_01',
  name: 'Tabungan Keluarga',
  husbandName: 'Suami',
  wifeName: 'Istri',
  bankName: 'BCA Bersama',
  accountNumber: '8820-1928-3011',
  accountHolder: 'Suami & Istri',
  createdAt: '2026-01-01',
};

export const INITIAL_GOALS: SavingsGoal[] = [
  {
    id: 'goal_darurat',
    familyId: 'fam_01',
    accountId: 'acc_01',
    name: 'Dana Darurat',
    targetAmount: 30_000_000,
    color: '#0D9488', // Teal
    iconName: 'ShieldCheck',
    deadline: '2026-12-31',
    notes: 'Dana siaga 6 bulan pengeluaran keluarga',
    createdAt: '2026-01-05',
  },
  {
    id: 'goal_rumah',
    familyId: 'fam_01',
    accountId: 'acc_01',
    name: 'Rumah & DP',
    targetAmount: 100_000_000,
    color: '#3B82F6', // Blue
    iconName: 'Home',
    deadline: '2028-06-30',
    notes: 'DP Rumah pertama dan biaya notaris',
    createdAt: '2026-01-10',
  },
  {
    id: 'goal_liburan',
    familyId: 'fam_01',
    accountId: 'acc_01',
    name: 'Liburan Akhir Tahun',
    targetAmount: 10_000_000,
    color: '#F59E0B', // Amber
    iconName: 'Plane',
    deadline: '2026-11-30',
    notes: 'Rencana liburan keluarga ke Yogyakarta/Bali',
    createdAt: '2026-02-01',
  },
];

/**
 * Initial transaction list carefully calibrated to produce:
 * - Husband deposits: Rp15.000.000
 * - Wife deposits: Rp11.000.000
 * - Withdrawals: Rp1.000.000 (Renovasi/Perlengkapan)
 * -> Total Deposits: Rp26.000.000
 * -> Net Balance: Rp25.000.000
 * -> Goal Allocations:
 *    - Dana Darurat: Rp12.000.000
 *    - Rumah: Rp8.000.000
 *    - Liburan: Rp5.000.000
 *    - Total Goal: Rp25.000.000
 *    - Unallocated: Rp0 (100% consistent)
 */
export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_01',
    familyId: 'fam_01',
    accountId: 'acc_01',
    createdBy: 'Suami',
    contributor: 'HUSBAND',
    type: 'DEPOSIT',
    amount: 5_000_000,
    transactionDate: '2026-05-10',
    description: 'Setoran tabungan awal bersama & bonus proyek',
    allocations: [
      { goalId: 'goal_darurat', amount: 3_000_000 },
      { goalId: 'goal_rumah', amount: 2_000_000 },
    ],
    createdAt: '2026-05-10T10:00:00Z',
  },
  {
    id: 'tx_02',
    familyId: 'fam_01',
    accountId: 'acc_01',
    createdBy: 'Istri',
    contributor: 'WIFE',
    type: 'DEPOSIT',
    amount: 4_000_000,
    transactionDate: '2026-05-25',
    description: 'Alokasi gaji bulanan istri',
    allocations: [
      { goalId: 'goal_darurat', amount: 2_000_000 },
      { goalId: 'goal_liburan', amount: 2_000_000 },
    ],
    createdAt: '2026-05-25T14:30:00Z',
  },
  {
    id: 'tx_03',
    familyId: 'fam_01',
    accountId: 'acc_01',
    createdBy: 'Suami',
    contributor: 'HUSBAND',
    type: 'DEPOSIT',
    amount: 4_000_000,
    transactionDate: '2026-06-15',
    description: 'Setoran rutin bulanan suami',
    allocations: [
      { goalId: 'goal_darurat', amount: 2_000_000 },
      { goalId: 'goal_rumah', amount: 2_000_000 },
    ],
    createdAt: '2026-06-15T09:15:00Z',
  },
  {
    id: 'tx_04',
    familyId: 'fam_01',
    accountId: 'acc_01',
    createdBy: 'Istri',
    contributor: 'WIFE',
    type: 'DEPOSIT',
    amount: 3_000_000,
    transactionDate: '2026-06-28',
    description: 'Hasil usaha sampingan & tabungan rutin',
    allocations: [
      { goalId: 'goal_darurat', amount: 2_000_000 },
      { goalId: 'goal_liburan', amount: 1_000_000 },
    ],
    createdAt: '2026-06-28T11:00:00Z',
  },
  {
    id: 'tx_05',
    familyId: 'fam_01',
    accountId: 'acc_01',
    createdBy: 'Suami',
    contributor: 'HUSBAND',
    type: 'DEPOSIT',
    amount: 3_000_000,
    transactionDate: '2026-07-12',
    description: 'Gaji Juli suami',
    allocations: [
      { goalId: 'goal_darurat', amount: 1_000_000 },
      { goalId: 'goal_rumah', amount: 2_000_000 },
    ],
    createdAt: '2026-07-12T13:40:00Z',
  },
  {
    id: 'tx_06',
    familyId: 'fam_01',
    accountId: 'acc_01',
    createdBy: 'Istri',
    contributor: 'WIFE',
    type: 'DEPOSIT',
    amount: 2_000_000,
    transactionDate: '2026-07-25',
    description: 'Setoran tabungan liburan & darurat',
    allocations: [
      { goalId: 'goal_darurat', amount: 1_000_000 },
      { goalId: 'goal_liburan', amount: 1_000_000 },
    ],
    createdAt: '2026-07-25T16:20:00Z',
  },
  {
    id: 'tx_07',
    familyId: 'fam_01',
    accountId: 'acc_01',
    createdBy: 'Suami',
    contributor: 'HUSBAND',
    type: 'DEPOSIT',
    amount: 3_000_000,
    transactionDate: '2026-08-10',
    description: 'Setoran Agustus Suami',
    allocations: [
      { goalId: 'goal_darurat', amount: 1_000_000 },
      { goalId: 'goal_rumah', amount: 2_000_000 },
    ],
    createdAt: '2026-08-10T08:00:00Z',
  },
  {
    id: 'tx_08',
    familyId: 'fam_01',
    accountId: 'acc_01',
    createdBy: 'Istri',
    contributor: 'WIFE',
    type: 'DEPOSIT',
    amount: 2_000_000,
    transactionDate: '2026-08-18',
    description: 'Setoran Agustus Istri',
    allocations: [
      { goalId: 'goal_darurat', amount: 1_000_000 },
      { goalId: 'goal_liburan', amount: 1_000_000 },
    ],
    createdAt: '2026-08-18T10:10:00Z',
  },
  {
    id: 'tx_09',
    familyId: 'fam_01',
    accountId: 'acc_01',
    createdBy: 'Suami',
    contributor: 'HUSBAND',
    type: 'WITHDRAWAL',
    amount: 1_000_000,
    transactionDate: '2026-08-25',
    description: 'Perbaikan atap bocor genteng rumah',
    allocations: [
      { goalId: 'goal_darurat', amount: 1_000_000 },
    ],
    createdAt: '2026-08-25T15:00:00Z',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit_01',
    transactionId: 'tx_01',
    action: 'CREATE',
    modifiedBy: 'Suami',
    modifierRole: 'HUSBAND',
    timestamp: '2026-05-10T10:00:00Z',
    reason: 'Pencatatan setoran tabungan pertama',
    previousState: {
      amount: 0,
      contributor: 'HUSBAND',
      type: 'DEPOSIT',
      transactionDate: '2026-05-10',
      description: '',
      allocations: [],
    },
    newState: {
      amount: 5_000_000,
      contributor: 'HUSBAND',
      type: 'DEPOSIT',
      transactionDate: '2026-05-10',
      description: 'Setoran tabungan awal bersama & bonus proyek',
      allocations: [
        { goalId: 'goal_darurat', amount: 3_000_000 },
        { goalId: 'goal_rumah', amount: 2_000_000 },
      ],
    },
  },
];
