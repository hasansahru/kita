import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Edit2,
  Trash2,
  Calendar,
  Layers,
  X,
  PlusCircle,
  FileText,
} from 'lucide-react';
import { useSavings } from '../context/SavingsContext';
import { Transaction, Role, TransactionType } from '../types';
import { formatRupiah, formatDateIndo, formatShortDate } from '../utils/formatters';
import { EditTransactionModal } from './EditTransactionModal';
import { DeleteTransactionModal } from './DeleteTransactionModal';

interface TransactionHistoryProps {
  onAddTransaction: () => void;
  maxInitialDisplay?: number;
  showFilters?: boolean;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  onAddTransaction,
  maxInitialDisplay,
  showFilters = true,
}) => {
  const { transactions, goals, family, hideBalance } = useSavings();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | Role>('ALL');
  const [filterType, setFilterType] = useState<'ALL' | TransactionType>('ALL');
  const [filterGoalId, setFilterGoalId] = useState<string>('ALL');
  const [filterMonth, setFilterMonth] = useState<string>('ALL');

  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Available unique months from transactions
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach((t) => {
      months.add(t.transactionDate.substring(0, 7));
    });
    return Array.from(months).sort().reverse();
  }, [transactions]);

  // Goal name lookup helper
  const getGoalName = (goalId: string): string => {
    if (goalId === 'UNALLOCATED') return 'Dana Bebas';
    const g = goals.find((item) => item.id === goalId);
    return g ? g.name : 'Pos Target';
  };

  // Filter logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchDesc = tx.description?.toLowerCase().includes(query);
        const matchAmt = tx.amount.toString().includes(query);
        if (!matchDesc && !matchAmt) return false;
      }

      // Role filter
      if (filterRole !== 'ALL' && tx.contributor !== filterRole) {
        return false;
      }

      // Type filter
      if (filterType !== 'ALL' && tx.type !== filterType) {
        return false;
      }

      // Goal filter
      if (filterGoalId !== 'ALL') {
        const hasGoal = tx.allocations?.some((a) => a.goalId === filterGoalId);
        if (!hasGoal) return false;
      }

      // Month filter
      if (filterMonth !== 'ALL') {
        if (!tx.transactionDate.startsWith(filterMonth)) return false;
      }

      return true;
    });
  }, [transactions, searchQuery, filterRole, filterType, filterGoalId, filterMonth]);

  const displayedTransactions = maxInitialDisplay
    ? filteredTransactions.slice(0, maxInitialDisplay)
    : filteredTransactions;

  const handleOpenEdit = (tx: Transaction) => {
    setTransactionToEdit(tx);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (tx: Transaction) => {
    setTransactionToDelete(tx);
    setIsDeleteOpen(true);
  };

  return (
    <div id="transaction-history-section" className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-heading">
              Histori Transaksi Tabungan
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {filteredTransactions.length} Transaksi
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Rekap lengkap uang masuk (setoran) & uang keluar (penarikan)
          </p>
        </div>

        <button
          type="button"
          onClick={onAddTransaction}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-600/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Tambah Transaksi</span>
        </button>
      </div>

      {/* Filter Bar */}
      {showFilters && (
        <div className="space-y-2.5 pt-1">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari catatan transaksi, nominal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-10 pr-9 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Pills / Selects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
            {/* Role Filter */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="ALL">Semua Pelaku (Suami & Istri)</option>
              <option value="HUSBAND">👨 {family.husbandName} (Suami)</option>
              <option value="WIFE">👩 {family.wifeName} (Istri)</option>
            </select>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="ALL">Semua Jenis (Setoran & Tarik)</option>
              <option value="DEPOSIT">📥 Hanya Setoran</option>
              <option value="WITHDRAWAL">📤 Hanya Penarikan</option>
            </select>

            {/* Goal Filter */}
            <select
              value={filterGoalId}
              onChange={(e) => setFilterGoalId(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="ALL">Semua Pos Target</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  🎯 {g.name}
                </option>
              ))}
              <option value="UNALLOCATED">📦 Dana Bebas</option>
            </select>

            {/* Month Filter */}
            {availableMonths.length > 0 && (
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="ALL">Semua Bulan</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    🗓️ {m}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Reset Filters button if any active */}
          {(filterRole !== 'ALL' || filterType !== 'ALL' || filterGoalId !== 'ALL' || filterMonth !== 'ALL' || searchQuery) && (
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setFilterRole('ALL');
                  setFilterType('ALL');
                  setFilterGoalId('ALL');
                  setFilterMonth('ALL');
                }}
                className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline px-1.5"
              >
                Reset Semua Filter
              </button>
            </div>
          )}
        </div>
      )}

      {/* Transaction List Rows */}
      {displayedTransactions.length === 0 ? (
        <div className="py-10 text-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium">Belum ada data transaksi yang sesuai.</p>
          <p className="text-xs mt-0.5">Silakan tambahkan transaksi setoran atau sesuaikan filter pencarian.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {displayedTransactions.map((tx) => {
            const isDeposit = tx.type === 'DEPOSIT';
            const isHusband = tx.contributor === 'HUSBAND';

            return (
              <div
                key={tx.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors group"
              >
                {/* Left: Icon, Date, Contributor, Description, Allocations */}
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isDeposit
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                    }`}
                  >
                    {isDeposit ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">
                        {formatShortDate(tx.transactionDate)}
                      </span>

                      {/* Contributor Pill */}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isHusband
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60'
                            : 'bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border border-pink-200/60'
                        }`}
                      >
                        <span>{isHusband ? '👨' : '👩'}</span>
                        <span>{isHusband ? family.husbandName : family.wifeName}</span>
                      </span>

                      {/* Type Badge */}
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          isDeposit
                            ? 'bg-emerald-100/70 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-rose-100/70 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                        }`}
                      >
                        {isDeposit ? 'Setoran' : 'Penarikan'}
                      </span>
                    </div>

                    {/* Description Notes */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      {tx.description}
                    </p>

                    {/* Target Allocation Badges */}
                    {tx.allocations && tx.allocations.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {tx.allocations.map((alloc, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md"
                          >
                            <Layers className="w-2.5 h-2.5 text-teal-600 dark:text-teal-400" />
                            <span>{getGoalName(alloc.goalId)}</span>
                            {tx.allocations.length > 1 && (
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                ({formatRupiah(alloc.amount, hideBalance)})
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Amount & Edit Action */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 pl-12 sm:pl-0">
                  <span
                    className={`text-sm sm:text-base font-extrabold font-heading ${
                      isDeposit
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isDeposit ? '+' : '-'}
                    {formatRupiah(tx.amount, hideBalance)}
                  </span>

                  <div className="flex items-center gap-1 mt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(tx)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit transaksi dengan audit log"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenDelete(tx)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500/80 hover:text-rose-600 dark:text-rose-400/80 dark:hover:text-rose-400 px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Hapus transaksi dengan audit log"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        transaction={transactionToEdit}
      />

      {/* Delete Transaction Modal */}
      <DeleteTransactionModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        transaction={transactionToDelete}
      />
    </div>
  );
};
