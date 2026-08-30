import React, { useState, useEffect } from 'react';
import { X, Trash2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useSavings } from '../context/SavingsContext';
import { Transaction } from '../types';
import { formatRupiah, formatShortDate } from '../utils/formatters';

interface DeleteTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const DeleteTransactionModal: React.FC<DeleteTransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  const { family, currentRole, deleteTransaction, goals, hideBalance } = useSavings();
  const [reason, setReason] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setErrorMessage('');
    }
  }, [isOpen, transaction]);

  if (!isOpen || !transaction) return null;

  const isDeposit = transaction.type === 'DEPOSIT';
  const isHusband = transaction.contributor === 'HUSBAND';
  const actorName = isHusband ? family.husbandName : family.wifeName;
  const currentActorName = currentRole === 'HUSBAND' ? family.husbandName : family.wifeName;

  const quickReasons = [
    'Salah nominal input',
    'Duplikat transaksi',
    'Transaksi dibatalkan',
    'Uji coba / salah catat',
  ];

  const handleConfirmDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMessage('Alasan penghapusan WAJIB diisi untuk transparansi audit keluarga.');
      return;
    }

    const success = deleteTransaction(transaction.id, reason.trim());
    if (success) {
      onClose();
    }
  };

  const getGoalName = (goalId: string): string => {
    if (goalId === 'UNALLOCATED') return 'Dana Bebas';
    const g = goals.find((item) => item.id === goalId);
    return g ? g.name : 'Pos Target';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-rose-200 dark:border-rose-900/50 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rose-100 dark:border-rose-950 bg-rose-50/70 dark:bg-rose-950/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-600 text-white shadow-sm">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-rose-950 dark:text-rose-200 font-heading">
                Hapus Transaksi
              </h3>
              <p className="text-xs text-rose-700/80 dark:text-rose-300/80 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                <span>Tindakan ini akan tercatat dalam Audit Log</span>
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

        {/* Body Form */}
        <form onSubmit={handleConfirmDelete} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 text-xs bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-800">
              {errorMessage}
            </div>
          )}

          {/* Transaction Summary Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-2">
              <span className="text-slate-500 dark:text-slate-400">
                {formatShortDate(transaction.transactionDate)} • {isDeposit ? 'Setoran Masuk' : 'Penarikan Keluar'}
              </span>
              <span
                className={`font-extrabold text-sm ${
                  isDeposit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {isDeposit ? '+' : '-'}
                {formatRupiah(transaction.amount, hideBalance)}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
              <span>Pelaku / Penyetor:</span>
              <span className="font-semibold">{isHusband ? '👨' : '👩'} {actorName}</span>
            </div>

            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
              <span>Catatan:</span>
              <span className="font-medium text-right max-w-[200px] truncate">{transaction.description || '-'}</span>
            </div>

            {transaction.allocations && transaction.allocations.length > 0 && (
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 pt-1 border-t border-slate-200/40 dark:border-slate-800">
                <span>Pos Target:</span>
                <span className="font-semibold text-teal-600 dark:text-teal-400">
                  {transaction.allocations.map((a) => getGoalName(a.goalId)).join(', ')}
                </span>
              </div>
            )}
          </div>

          {/* Warning Message */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Saldo rekening bersama dan pos target terkait akan otomatis diperbarui dan disinkronkan kembali.
            </span>
          </div>

          {/* Mandatory Reason Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Alasan Penghapusan <span className="text-rose-500">* (Wajib)</span>
            </label>
            <input
              type="text"
              placeholder="Tuliskan alasan penghapusan transaksi..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setErrorMessage('');
              }}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              required
              autoFocus
            />

            {/* Quick reason suggestions */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {quickReasons.map((qr) => (
                <button
                  key={qr}
                  type="button"
                  onClick={() => setReason(qr)}
                  className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  + {qr}
                </button>
              ))}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Dihapus oleh: <strong>{currentActorName}</strong>
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-700/20 active:scale-95 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Ya, Hapus Transaksi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
