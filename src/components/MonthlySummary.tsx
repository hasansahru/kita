import React, { useState } from 'react';
import { Calendar, TrendingUp, ArrowDownLeft, ArrowUpRight, DollarSign } from 'lucide-react';
import { useSavings } from '../context/SavingsContext';
import { formatRupiah } from '../utils/formatters';

export const MonthlySummary: React.FC = () => {
  const { family, monthlyBreakdowns, hideBalance } = useSavings();

  // Pick the latest month by default
  const latestMonthKey =
    monthlyBreakdowns.length > 0
      ? monthlyBreakdowns[monthlyBreakdowns.length - 1].monthKey
      : '2026-08';

  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(latestMonthKey);

  // Sync if monthlyBreakdowns changed
  const currentMonthData =
    monthlyBreakdowns.find((m) => m.monthKey === selectedMonthKey) ||
    monthlyBreakdowns[monthlyBreakdowns.length - 1] || {
      monthKey: '2026-08',
      monthLabel: 'Agustus 2026',
      husbandDeposit: 0,
      wifeDeposit: 0,
      totalDeposit: 0,
      withdrawal: 0,
      netSavings: 0,
      endingBalance: 0,
    };

  return (
    <div
      id="monthly-summary-card"
      className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
              Ringkasan Bulanan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aktivitas tabungan {currentMonthData.monthLabel}
            </p>
          </div>
        </div>

        {/* Month Selector dropdown */}
        {monthlyBreakdowns.length > 0 && (
          <select
            id="select-summary-month"
            value={selectedMonthKey}
            onChange={(e) => setSelectedMonthKey(e.target.value)}
            className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {monthlyBreakdowns.map((m) => (
              <option key={m.monthKey} value={m.monthKey}>
                Bulan {m.monthLabel}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Grid of 6 Key Monthly Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Setoran Suami */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
            Setoran {family.husbandName}
          </span>
          <span className="text-sm sm:text-base font-bold text-blue-600 dark:text-blue-400 font-heading">
            {formatRupiah(currentMonthData.husbandDeposit, hideBalance)}
          </span>
        </div>

        {/* Setoran Istri */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
            Setoran {family.wifeName}
          </span>
          <span className="text-sm sm:text-base font-bold text-pink-600 dark:text-pink-400 font-heading">
            {formatRupiah(currentMonthData.wifeDeposit, hideBalance)}
          </span>
        </div>

        {/* Total Setoran */}
        <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mb-0.5">
            <ArrowDownLeft className="w-3 h-3" />
            <span>Total Setoran</span>
          </div>
          <span className="text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-300 font-heading">
            {formatRupiah(currentMonthData.totalDeposit, hideBalance)}
          </span>
        </div>

        {/* Penarikan */}
        <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400 mb-0.5">
            <ArrowUpRight className="w-3 h-3" />
            <span>Penarikan</span>
          </div>
          <span className="text-sm sm:text-base font-bold text-rose-700 dark:text-rose-300 font-heading">
            {formatRupiah(currentMonthData.withdrawal, hideBalance)}
          </span>
        </div>

        {/* Pertambahan Bersih (Net) */}
        <div className="p-3 rounded-xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-teal-700 dark:text-teal-400 mb-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>Pertambahan Bersih</span>
          </div>
          <span
            className={`text-sm sm:text-base font-bold font-heading ${
              currentMonthData.netSavings >= 0
                ? 'text-teal-700 dark:text-teal-300'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {currentMonthData.netSavings > 0 ? '+' : ''}
            {formatRupiah(currentMonthData.netSavings, hideBalance)}
          </span>
        </div>

        {/* Saldo Akhir */}
        <div className="p-3 rounded-xl bg-slate-900 text-white dark:bg-slate-800 border border-slate-700/80">
          <span className="text-[11px] font-medium text-slate-300 block mb-0.5">
            Saldo Akhir Periode
          </span>
          <span className="text-sm sm:text-base font-bold text-teal-300 font-heading">
            {formatRupiah(currentMonthData.endingBalance, hideBalance)}
          </span>
        </div>
      </div>
    </div>
  );
};
