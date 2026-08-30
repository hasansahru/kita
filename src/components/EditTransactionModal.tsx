import React, { useState, useEffect } from 'react';
import { X, Edit3, ShieldAlert, History, Trash2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useSavings } from '../context/SavingsContext';
import { Transaction, Role, TransactionType, GoalAllocation } from '../types';
import { formatRupiah } from '../utils/formatters';

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  const {
    family,
    currentRole,
    goals,
    goalBalances,
    editTransaction,
    deleteTransaction,
  } = useSavings();

  const [type, setType] = useState<TransactionType>('DEPOSIT');
  const [contributor, setContributor] = useState<Role>('HUSBAND');
  const [amountStr, setAmountStr] = useState('');
  const [transactionDate, setTransactionDate] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState<string>('UNALLOCATED');
  const [reason, setReason] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setContributor(transaction.contributor);
      setAmountStr(transaction.amount.toString());
      setTransactionDate(transaction.transactionDate);
      setDescription(transaction.description);

      const firstAlloc = transaction.allocations?.[0]?.goalId || 'UNALLOCATED';
      setSelectedGoalId(firstAlloc);
      setReason('');
      setErrorMessage('');
    }
  }, [transaction, isOpen]);

  if (!isOpen || !transaction) return null;

  const currentAmount = parseFloat(amountStr.replace(/[^0-9]/g, '')) || 0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (currentAmount <= 0) {
      setErrorMessage('Nominal harus lebih dari Rp 0.');
      return;
    }

    if (!reason.trim()) {
      setErrorMessage('Alasan perubahan transaksi WAJIB diisi untuk transparansi audit pasangan.');
      return;
    }

    const allocations: GoalAllocation[] =
      selectedGoalId && selectedGoalId !== 'UNALLOCATED'
        ? [{ goalId: selectedGoalId, amount: currentAmount }]
        : [{ goalId: 'UNALLOCATED', amount: currentAmount }];

    const success = editTransaction(
      transaction.id,
      {
        type,
        contributor,
        amount: currentAmount,
        transactionDate,
        description: description.trim(),
        allocations,
      },
      reason.trim()
    );

    if (success) {
      onClose();
    }
  };

  const handleDelete = () => {
    const deleteReason = window.prompt(
      'Masukkan alasan pembatalan/penghapusan transaksi ini (wajib untuk audit log):',
      'Koreksi duplikasi transaksi'
    );
    if (deleteReason && deleteReason.trim()) {
      deleteTransaction(transaction.id, deleteReason.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-amber-50/50 dark:bg-amber-950/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-sm">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                Edit & Koreksi Transaksi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>Setiap perubahan dicatat dalam Audit Log Keluarga</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 text-xs bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-800">
              {errorMessage}
            </div>
          )}

          {/* Type & Contributor Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jenis Transaksi
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TransactionType)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="DEPOSIT">Setoran (Masuk)</option>
                <option value="WITHDRAWAL">Penarikan (Keluar)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pelaku / Penyetor
              </label>
              <select
                value={contributor}
                onChange={(e) => setContributor(e.target.value as Role)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="HUSBAND">👨 {family.husbandName} (Suami)</option>
                <option value="WIFE">👩 {family.wifeName} (Istri)</option>
              </select>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nominal Transaksi (Sebelumnya: {formatRupiah(transaction.amount)})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">
                Rp
              </span>
              <input
                type="text"
                value={amountStr ? Number(amountStr.replace(/[^0-9]/g, '')).toLocaleString('id-ID') : ''}
                onChange={(e) => setAmountStr(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full text-sm font-bold pl-11 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tanggal Transaksi
            </label>
            <input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="w-full text-sm px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              required
            />
          </div>

          {/* Target Allocation */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Pos Target Virtual
            </label>
            <select
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
              className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  🎯 {g.name}
                </option>
              ))}
              <option value="UNALLOCATED">
                📦 Tidak dialokasikan (Dana Bebas)
              </option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Keterangan / Catatan
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          {/* MANDATORY AUDIT REASON */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60">
            <label className="block text-xs font-bold text-amber-900 dark:text-amber-300 mb-1">
              Alasan Perubahan <span className="text-rose-500">* (Wajib Diisi)</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Koreksi salah ketik nominal, salah pilih pos target..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
            <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">
              Pengubah saat ini: <strong>{currentRole === 'HUSBAND' ? family.husbandName : family.wifeName}</strong>
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-3">
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus Transaksi</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-700/20 active:scale-95 transition-all"
              >
                Simpan & Catat Log
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
