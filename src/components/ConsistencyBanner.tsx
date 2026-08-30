import React, { useState } from 'react';
import { ShieldCheck, AlertOctagon, HelpCircle, CheckCircle2, ChevronRight, ChevronDown } from 'lucide-react';
import { useSavings } from '../context/SavingsContext';
import { formatRupiah } from '../utils/formatters';

export const ConsistencyBanner: React.FC = () => {
  const { summary, hideBalance } = useSavings();
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <div
      id="consistency-verification-section"
      className={`rounded-2xl p-4 sm:p-5 border transition-all ${
        summary.isConsistent
          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-850'
          : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              summary.isConsistent
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                : 'bg-rose-500 text-white animate-bounce'
            }`}
          >
            {summary.isConsistent ? (
              <ShieldCheck className="w-5 h-5" />
            ) : (
              <AlertOctagon className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                {summary.isConsistent
                  ? 'Audit & Konsistensi Saldo Terverifikasi 100%'
                  : 'Peringatan: Terjadi Ketidaksesuaian Alokasi!'}
              </h4>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                  summary.isConsistent
                    ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                    : 'bg-rose-200 text-rose-800'
                }`}
              >
                {summary.isConsistent ? 'Sinkron' : 'Periksa Transaksi'}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              {summary.isConsistent
                ? `Saldo rekening (${formatRupiah(summary.totalBalance, hideBalance)}) = Target Virtual (${formatRupiah(summary.totalAllocated, hideBalance)}) + Bebas Alokasi (${formatRupiah(summary.unallocatedAmount, hideBalance)})`
                : `Ditemukan selisih sebesar ${formatRupiah(Math.abs(summary.discrepancy))}. Silakan periksa histori transaksi.`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowExplanation(!showExplanation)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 self-start sm:self-auto py-1 px-2 rounded-lg hover:bg-teal-100/50 dark:hover:bg-teal-950/40 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{showExplanation ? 'Tutup Rumus' : 'Lihat Rumus Saldo'}</span>
          {showExplanation ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Expandable Mathematical Formula and Principles Card */}
      {showExplanation && (
        <div className="mt-4 pt-4 border-t border-emerald-200/60 dark:border-emerald-900/60 text-xs text-slate-700 dark:text-slate-300 space-y-2 animate-in fade-in duration-150">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-[11px] leading-relaxed">
            <div className="font-bold text-slate-900 dark:text-slate-100 mb-1">
              Rumus Baku Tabungan Bersama KITA:
            </div>
            <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
              SALDO REKENING = TOTAL SETORAN - TOTAL PENARIKAN
            </div>
            <div className="text-blue-600 dark:text-blue-400 mt-1">
              SALDO REKENING = TOTAL SEMUA TARGET VIRTUAL + DANA BELUM DIALOKASIKAN
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
            💡 <strong>Prinsip Penting:</strong> Target tabungan (Dana Darurat, Rumah, Liburan) hanyalah pembagian virtual di dalam satu rekening bank fisik yang sama. Target bukan rekening terpisah dan tidak pernah menambah atau menggandakan saldo fisik tabungan Anda.
          </p>
        </div>
      )}
    </div>
  );
};
