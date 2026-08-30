import React from 'react';
import { Users2, HeartHandshake, Info } from 'lucide-react';
import { useSavings } from '../context/SavingsContext';
import { formatRupiah } from '../utils/formatters';

export const ContributionCard: React.FC = () => {
  const { family, summary, hideBalance } = useSavings();

  const husbandPct = summary.husbandPercentage || 0;
  const wifePct = summary.wifePercentage || 0;

  return (
    <div
      id="contribution-stats-card"
      className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors"
    >
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <Users2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
              Kontribusi Tabungan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Perbandingan setoran {family.husbandName} & {family.wifeName}
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          Total: {formatRupiah(summary.totalDeposit, hideBalance)}
        </span>
      </div>

      {/* Visual Dual Progress Bar */}
      <div className="space-y-2 mb-5">
        <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex p-0.5">
          <div
            style={{ width: `${husbandPct}%` }}
            className="h-full bg-blue-500 rounded-l-full transition-all duration-500 relative group"
            title={`${family.husbandName}: ${husbandPct}%`}
          />
          <div
            style={{ width: `${wifePct}%` }}
            className="h-full bg-pink-500 rounded-r-full transition-all duration-500 relative group"
            title={`${family.wifeName}: ${wifePct}%`}
          />
        </div>

        <div className="flex justify-between text-xs font-medium">
          <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            {family.husbandName} ({husbandPct}%)
          </span>
          <span className="text-pink-600 dark:text-pink-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-pink-500" />
            {family.wifeName} ({wifePct}%)
          </span>
        </div>
      </div>

      {/* 2 Column Details */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {/* Suami Box */}
        <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
          <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
            <span>👨</span>
            <span>{family.husbandName.toUpperCase()}</span>
          </div>
          <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-heading">
            {formatRupiah(summary.husbandDeposit, hideBalance)}
          </p>
          <span className="text-[11px] text-blue-600/80 dark:text-blue-400 font-medium">
            {husbandPct}% dari total setoran
          </span>
        </div>

        {/* Istri Box */}
        <div className="p-3.5 rounded-xl bg-pink-50/70 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/50">
          <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold text-pink-700 dark:text-pink-300">
            <span>👩</span>
            <span>{family.wifeName.toUpperCase()}</span>
          </div>
          <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-heading">
            {formatRupiah(summary.wifeDeposit, hideBalance)}
          </p>
          <span className="text-[11px] text-pink-600/80 dark:text-pink-400 font-medium">
            {wifePct}% dari total setoran
          </span>
        </div>
      </div>

      {/* Subtle Principle Reminder */}
      <div className="mt-3.5 flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
        <Info className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
        <span>
          Semua setoran suami dan istri masuk ke satu rekening bersama yang sama tanpa membuat rekening terpisah.
        </span>
      </div>
    </div>
  );
};
