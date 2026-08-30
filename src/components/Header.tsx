import React, { useState } from 'react';
import {
  Users,
  Eye,
  EyeOff,
  Sun,
  Moon,
  ShieldCheck,
  AlertTriangle,
  Download,
  Settings,
  History,
  Heart,
  LogOut,
} from 'lucide-react';
import { useSavings } from '../context/SavingsContext';

interface HeaderProps {
  onOpenExport: () => void;
  onOpenSettings: () => void;
  onOpenAuditLogs: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenExport,
  onOpenSettings,
  onOpenAuditLogs,
}) => {
  const {
    family,
    currentRole,
    setCurrentRole,
    logout,
    hideBalance,
    toggleHideBalance,
    isDarkMode,
    toggleDarkMode,
    summary,
    auditLogs,
  } = useSavings();

  const [showRoleMenu, setShowRoleMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 dark:bg-slate-900/95 dark:border-slate-800 transition-colors no-print w-full overflow-hidden">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        {/* Brand & Family Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center text-white shrink-0 shadow-sm shadow-teal-500/20">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-white/80" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-lg font-bold tracking-tight font-heading text-slate-900 dark:text-white truncate">
                {family.name || 'Tabungan Bersama'}
              </h1>
              <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                1 Rekening
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
              <span className="truncate">{family.husbandName} & {family.wifeName}</span>
              <span>•</span>
              <span className="shrink-0">{family.bankName}</span>
            </p>
          </div>
        </div>

        {/* Right Actions & Active Role Switcher */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Consistency Quick Status Pill */}
          <div
            className={`hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
              summary.isConsistent
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 animate-pulse'
            }`}
            title={
              summary.isConsistent
                ? 'Saldo rekening dan alokasi virtual 100% konsisten'
                : `Peringatan: Selisih alokasi ${summary.discrepancy}`
            }
          >
            {summary.isConsistent ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Saldo Terverifikasi</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>Selisih Alokasi!</span>
              </>
            )}
          </div>

          {/* Active User Switcher Pill */}
          <div className="relative">
            <button
              id="role-switch-button"
              type="button"
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold border transition-all ${
                currentRole === 'HUSBAND'
                  ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
                  : 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100 dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-800'
              }`}
              title="Ganti profil penginput transaksi (Suami / Istri)"
            >
              <span className="w-1.5 h-1.5 rounded-full animate-ping mr-0.5 bg-current opacity-75 shrink-0" />
              <span className="truncate max-w-[70px] sm:max-w-none">
                {currentRole === 'HUSBAND' ? `👨 ${family.husbandName}` : `👩 ${family.wifeName}`}
              </span>
            </button>

            {showRoleMenu && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setShowRoleMenu(false)}
              >
                <div className="px-2.5 py-1.5 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Sedang Aktif Sebagai:
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentRole('HUSBAND')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                    currentRole === 'HUSBAND'
                      ? 'bg-blue-500 text-white font-semibold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>👨</span>
                    <span>{family.husbandName} (Suami)</span>
                  </span>
                  {currentRole === 'HUSBAND' && <span className="text-xs">✓</span>}
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentRole('WIFE')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors mt-1 ${
                    currentRole === 'WIFE'
                      ? 'bg-pink-500 text-white font-semibold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>👩</span>
                    <span>{family.wifeName} (Istri)</span>
                  </span>
                  {currentRole === 'WIFE' && <span className="text-xs">✓</span>}
                </button>

                <div className="my-1 border-t border-slate-200 dark:border-slate-700" />

                <button
                  type="button"
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Kunci / Ganti Akun</span>
                </button>
              </div>
            )}
          </div>

          {/* Privacy Hide/Show Balance Toggle */}
          <button
            id="toggle-hide-balance-button"
            type="button"
            onClick={toggleHideBalance}
            className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
            title={hideBalance ? 'Tampilkan Saldo' : 'Sembunyikan Saldo (Sensor Privasi)'}
          >
            {hideBalance ? <EyeOff className="w-4 h-4 text-amber-500" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Audit Log Modal Trigger (Hidden on very small mobile since it's on bottom bar) */}
          <button
            id="open-audit-logs-button"
            type="button"
            onClick={onOpenAuditLogs}
            className="hidden sm:inline-flex relative p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
            title="Riwayat Audit & Perubahan Transaksi"
          >
            <History className="w-4 h-4" />
            {auditLogs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full" />
            )}
          </button>

          {/* Dark / Light Mode Toggle Button */}
          <button
            id="toggle-theme-button"
            type="button"
            onClick={toggleDarkMode}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all shadow-xs"
            title={isDarkMode ? 'Klik untuk Mode Terang' : 'Klik untuk Mode Gelap'}
          >
            {isDarkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                <span className="hidden md:inline">Terang</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="hidden md:inline">Gelap</span>
              </>
            )}
          </button>

          {/* Settings Trigger */}
          <button
            id="open-settings-button"
            type="button"
            onClick={onOpenSettings}
            className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
            title="Pengaturan Rekening & Pasangan"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
