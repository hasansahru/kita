import React from 'react';
import { X, History, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';
import { useSavings } from '../context/SavingsContext';
import { formatDateIndo, formatRupiah } from '../utils/formatters';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose }) => {
  const { auditLogs, family } = useSavings();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500 text-white">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                Riwayat Audit & Integritas Transaksi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Log audit setiap penambahan, pengubahan, dan alasan koreksi data
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {auditLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">Belum ada riwayat audit perubahan.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {auditLogs.map((log) => {
                const isHusband = log.modifierRole === 'HUSBAND';
                const dateFormatted = new Date(log.timestamp).toLocaleString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={log.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs space-y-2"
                  >
                    {/* Top line: Who, role, timestamp, action */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isHusband
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300'
                          }`}
                        >
                          <span>{isHusband ? '👨' : '👩'}</span>
                          <span>{log.modifiedBy}</span>
                        </span>

                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            log.action === 'CREATE'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : log.action === 'EDIT'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {log.action === 'CREATE' ? 'Transaksi Baru' : log.action === 'EDIT' ? 'Koreksi Data' : 'Dihapus'}
                        </span>
                      </div>

                      <span className="text-slate-400 text-[11px]">{dateFormatted}</span>
                    </div>

                    {/* Reason */}
                    <div className="text-slate-800 dark:text-slate-200">
                      <span className="font-semibold text-slate-500 dark:text-slate-400">Alasan: </span>
                      <span className="italic font-medium">"{log.reason}"</span>
                    </div>

                    {/* Comparison if EDIT */}
                    {log.action === 'EDIT' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px]">
                        <div className="text-slate-500">
                          <span className="font-bold block text-rose-600 dark:text-rose-400 mb-0.5">
                            Sebelum:
                          </span>
                          <div>Nominal: {formatRupiah(log.previousState.amount)}</div>
                          <div>Pelaku: {log.previousState.contributor === 'HUSBAND' ? family.husbandName : family.wifeName}</div>
                          <div>Catatan: {log.previousState.description || '-'}</div>
                        </div>

                        <div className="text-slate-700 dark:text-slate-300">
                          <span className="font-bold block text-emerald-600 dark:text-emerald-400 mb-0.5">
                            Sesudah:
                          </span>
                          <div className="font-semibold">Nominal: {formatRupiah(log.newState.amount)}</div>
                          <div>Pelaku: {log.newState.contributor === 'HUSBAND' ? family.husbandName : family.wifeName}</div>
                          <div>Catatan: {log.newState.description || '-'}</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
