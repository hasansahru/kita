import React, { useState, useEffect } from 'react';
import { X, Settings, RotateCcw, Building, Users, Check, AlertTriangle, Sun, Moon } from 'lucide-react';
import { useSavings } from '../context/SavingsContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { family, updateFamily, resetToDefaultData, isDarkMode, toggleDarkMode } = useSavings();

  const [name, setName] = useState('');
  const [husbandName, setHusbandName] = useState('');
  const [wifeName, setWifeName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (family && isOpen) {
      setName(family.name || '');
      setHusbandName(family.husbandName || '');
      setWifeName(family.wifeName || '');
      setBankName(family.bankName || '');
      setAccountNumber(family.accountNumber || '');
      setAccountHolder(family.accountHolder || '');
      setSavedSuccess(false);
    }
  }, [family, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFamily({
      name: name.trim() || 'Tabungan Keluarga',
      husbandName: husbandName.trim() || 'Suami',
      wifeName: wifeName.trim() || 'Istri',
      bankName: bankName.trim() || 'BCA Bersama',
      accountNumber: accountNumber.trim(),
      accountHolder: accountHolder.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleReset = () => {
    if (
      window.confirm(
        'Apakah Anda yakin ingin mengatur ulang data ke data percontohan awal (Rp 25.000.000)? Semua transaksi tambahan akan dikembalikan ke data default.'
      )
    ) {
      resetToDefaultData();
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500 text-white">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                Pengaturan Rekening & Pasangan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Konfigurasi 1 rekening tabungan bersama suami & istri
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Pengaturan berhasil disimpan!</span>
            </div>
          )}

          {/* Account Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Akun / Rekening Tabungan Bersama
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Tabungan Keluarga, Tabungan Kita..."
              className="w-full text-sm px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          {/* Husband & Wife Names */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
                👨 Panggilan Suami
              </label>
              <input
                type="text"
                value={husbandName}
                onChange={(e) => setHusbandName(e.target.value)}
                placeholder="Suami"
                className="w-full text-sm px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-pink-700 dark:text-pink-300 mb-1">
                👩 Panggilan Istri
              </label>
              <input
                type="text"
                value={wifeName}
                onChange={(e) => setWifeName(e.target.value)}
                placeholder="Istri"
                className="w-full text-sm px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
          </div>

          {/* Bank Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Bank / Lembaga
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Contoh: BCA, Mandiri, BSI..."
                className="w-full text-sm px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Rekening
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Contoh: 8820-1928-3011"
                className="w-full text-sm px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Pilihan Tema (Terang / Gelap) */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Tema Tampilan Aplikasi
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (isDarkMode) toggleDarkMode();
                }}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  !isDarkMode
                    ? 'bg-amber-50 border-amber-300 text-amber-900 ring-2 ring-amber-400/40 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-750'
                }`}
              >
                <Sun className={`w-4 h-4 ${!isDarkMode ? 'text-amber-500' : 'text-slate-400'}`} />
                <span>Mode Terang (Light)</span>
                {!isDarkMode && <Check className="w-3.5 h-3.5 text-amber-600" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isDarkMode) toggleDarkMode();
                }}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  isDarkMode
                    ? 'bg-indigo-950/70 border-indigo-500 text-indigo-200 ring-2 ring-indigo-500/40 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-750'
                }`}
              >
                <Moon className={`w-4 h-4 ${isDarkMode ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>Mode Gelap (Dark)</span>
                {isDarkMode && <Check className="w-3.5 h-3.5 text-indigo-400" />}
              </button>
            </div>
          </div>

          {/* Reset Demo Data */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Reset Data ke Nilai Contoh Awal
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Kembalikan ke data contoh (Saldo Rp 25.000.000, 3 target)
                </span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition-colors inline-flex items-center gap-1 shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-700/20 active:scale-95 transition-all"
            >
              Simpan Pengaturan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
