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
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white p-5 sm:p-7 shadow-xl shadow-slate-900/10 border border-slate-700/60 transition-all"
    >
      {/* Background Decorative Rings */}
      <div className="absolute -right-12 -top-12 w-52 h-52 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Meta info */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-teal-300 font-semibold">
              Rekening Tabungan Bersama
            </span>
            <div className="text-xs text-slate-300">
              {family.bankName} {family.accountNumber ? `• ${family.accountNumber}` : ''}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs text-slate-200 border border-white/10">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          <span>Satu Rekening Gabungan</span>
        </div>
      </div>

      {/* Big Balance Number */}
      <div className="relative z-10 my-3">
        <p className="text-xs sm:text-sm font-medium text-slate-400 uppercase tracking-wider mb-1">
          Total Saldo Tabungan Bersama
        </p>
        <div className="flex items-baseline gap-2">
          <h2
            id="main-joint-balance-display"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-heading text-white"
          >
            {formatRupiah(summary.totalBalance, hideBalance)}
          </h2>
        </div>
      </div>

      {/* Micro Metrics: Total Setoran & Total Penarikan */}
      <div className="relative z-10 grid grid-cols-2 gap-3 py-3 border-t border-slate-700/60 my-4 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
          <div>
            <span className="text-slate-400 block">Total Setoran Masuk</span>
            <span className="font-semibold text-slate-200 sm:text-sm">
              {formatRupiah(summary.totalDeposit, hideBalance)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div>
            <span className="text-slate-400 block">Total Penarikan</span>
            <span className="font-semibold text-slate-200 sm:text-sm">
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
          className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold px-4 py-3 rounded-xl shadow-lg shadow-teal-900/30 hover:shadow-teal-900/40 active:scale-[0.99] transition-all text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Tambah Setoran</span>
        </button>

        <button
          id="btn-add-withdrawal"
          type="button"
          onClick={onAddWithdrawal}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-700/80 hover:bg-slate-700 text-slate-100 font-semibold px-4 py-3 rounded-xl border border-slate-600 active:scale-[0.99] transition-all text-sm"
        >
          <MinusCircle className="w-4 h-4 text-rose-400" />
          <span>- Tambah Penarikan</span>
        </button>
      </div>
    </div>
  );
};
