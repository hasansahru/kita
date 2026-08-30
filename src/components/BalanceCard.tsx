import React from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  PlusCircle,
  MinusCircle,
  Building2,
} from 'lucide-react';
import { useSavings } from '../context/SavingsContext';
import { formatRupiah } from '../utils/formatters';

interface BalanceCardProps {
  onAddDeposit: () => void;
  onAddWithdrawal: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  onAddDeposit,
  onAddWithdrawal,
}) => {
  const { family, summary, hideBalance } = useSavings();

  return (
    <div
      id="joint-balance-hero-card"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 text-white p-5 sm:p-7 shadow-xl shadow-teal-950/10 dark:shadow-slate-950/30 border border-teal-500/30 dark:border-slate-800 transition-all"
    >
      {/* Background Decorative Rings */}
      <div className="absolute -right-12 -top-12 w-52 h-52 bg-white/10 dark:bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-teal-300/15 dark:bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Meta info */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-white/15 dark:bg-teal-500/20 text-emerald-100 dark:text-teal-400 border border-white/20 dark:border-teal-500/30">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-emerald-100/90 dark:text-teal-300 font-semibold">
              Rekening Tabungan Bersama
            </span>
            <div className="text-xs text-white/90 dark:text-slate-300">
              {family.bankName} {family.accountNumber ? `• ${family.accountNumber}` : ''}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-white/15 dark:bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs text-emerald-50 dark:text-slate-200 border border-white/20 dark:border-white/10">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-200 dark:text-teal-400" />
          <span>Satu Rekening Gabungan</span>
        </div>
      </div>

      {/* Big Balance Number */}
      <div className="relative z-10 my-2 sm:my-3">
        <p className="text-[11px] sm:text-xs font-medium text-emerald-100/90 dark:text-slate-400 uppercase tracking-wider mb-1">
          Total Saldo Tabungan Bersama
        </p>
        <div className="flex items-baseline gap-2">
          <h2
            id="main-joint-balance-display"
            className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-heading text-white break-words"
          >
            {formatRupiah(summary.totalBalance, hideBalance)}
          </h2>
        </div>
      </div>

      {/* Micro Metrics: Total Setoran & Total Penarikan */}
      <div className="relative z-10 grid grid-cols-2 gap-3 py-3 border-t border-white/15 dark:border-slate-700/60 my-4 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-400/20 text-emerald-100 dark:text-emerald-400">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
          <div>
            <span className="text-emerald-100/80 dark:text-slate-400 block text-[11px] sm:text-xs">Total Setoran Masuk</span>
            <span className="font-semibold text-white dark:text-slate-200 text-xs sm:text-sm">
              {formatRupiah(summary.totalDeposit, hideBalance)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-rose-400/20 text-rose-100 dark:text-rose-400">
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div>
            <span className="text-rose-100/80 dark:text-slate-400 block text-[11px] sm:text-xs">Total Penarikan</span>
            <span className="font-semibold text-white dark:text-slate-200 text-xs sm:text-sm">
              {formatRupiah(summary.totalWithdrawal, hideBalance)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="relative z-10 flex flex-col sm:flex-row gap-2.5 pt-1">
        <button
          id="btn-add-deposit"
          type="button"
          onClick={onAddDeposit}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-white text-teal-800 hover:bg-emerald-50 dark:bg-gradient-to-r dark:from-teal-500 dark:to-emerald-500 dark:hover:from-teal-600 dark:hover:to-emerald-600 dark:text-white font-bold px-4 py-3 rounded-xl shadow-lg shadow-black/10 dark:shadow-teal-900/30 active:scale-[0.98] transition-all text-sm cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-emerald-600 dark:text-white" />
          <span>+ Tambah Setoran</span>
        </button>

        <button
          id="btn-add-withdrawal"
          type="button"
          onClick={onAddWithdrawal}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 text-white dark:bg-slate-800/90 dark:hover:bg-slate-750 font-semibold px-4 py-3 rounded-xl border border-white/25 dark:border-slate-700 active:scale-[0.98] transition-all text-sm cursor-pointer"
        >
          <MinusCircle className="w-4 h-4 text-rose-200 dark:text-rose-400" />
          <span>- Tambah Penarikan</span>
        </button>
      </div>
    </div>
  );
};
