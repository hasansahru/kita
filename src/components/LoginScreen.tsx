import React, { useState } from 'react';
import { useSavings } from '../context/SavingsContext';
import { Role } from '../types';
import { Lock, Heart, ShieldCheck, ArrowRight, UserCheck, KeyRound, Sparkles } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { family, loginWithPin, toggleDarkMode, isDarkMode } = useSavings();
  const [selectedRole, setSelectedRole] = useState<Role>('HUSBAND');
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setPin('');
    setError('');
  };

  const handlePinInput = (num: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + num);
      setError('');
    }
  };

  const handleDeletePin = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleClearPin = () => {
    setPin('');
    setError('');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin) {
      setError('Masukkan PIN keamanan terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const res = loginWithPin(selectedRole, pin);
    if (!res.success) {
      setError(res.error || 'PIN salah.');
      setPin('');
    }
    setIsSubmitting(false);
  };

  const isHusband = selectedRole === 'HUSBAND';
  const partnerName = isHusband ? family.husbandName : family.wifeName;

  return (
    <div className="min-h-screen w-full bg-slate-100 dark:bg-slate-950 flex flex-col justify-between items-center p-4 sm:p-6 transition-colors selection:bg-teal-500 selection:text-white">
      {/* Top Brand Bar */}
      <header className="w-full max-w-md flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <Heart className="w-4 h-4 fill-white/80" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight font-heading">
              {family.name || 'Tabungan Keluarga'}
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              1 Rekening Bersama ({family.bankName})
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleDarkMode}
          className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-medium"
        >
          {isDarkMode ? '☀️ Terang' : '🌙 Gelap'}
        </button>
      </header>

      {/* Main Login Card */}
      <main className="w-full max-w-md my-auto py-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 mb-1 border border-teal-100 dark:border-teal-900/50">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
              Pilih Akses Pengguna
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Masuk sebagai Suami atau Istri untuk mencatat transaksi rekening bersama
            </p>
          </div>

          {/* Role Selection Switcher */}
          <div className="grid grid-cols-2 gap-2.5 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
            <button
              type="button"
              onClick={() => handleRoleSelect('HUSBAND')}
              className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all ${
                isHusband
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 font-medium'
              }`}
            >
              <span className="text-2xl">👨</span>
              <div className="text-center">
                <p className="text-xs font-bold leading-tight">{family.husbandName}</p>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">Suami</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('WIFE')}
              className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all ${
                !isHusband
                  ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-md font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 font-medium'
              }`}
            >
              <span className="text-2xl">👩</span>
              <div className="text-center">
                <p className="text-xs font-bold leading-tight">{family.wifeName}</p>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">Istri</span>
              </div>
            </button>
          </div>

          {/* PIN Display Dots */}
          <div className="space-y-3">
            <div className="text-center">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Masukkan PIN {partnerName}
              </label>
              <div className="flex justify-center items-center gap-3 my-3">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full border-2 transition-all ${
                      pin.length > index
                        ? isHusband
                          ? 'bg-blue-600 border-blue-600 scale-110'
                          : 'bg-pink-600 border-pink-600 scale-110'
                        : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-900/50 text-center animate-shake">
                {error}
              </div>
            )}
          </div>

          {/* Numeric Keypad for fast touch on Smartphone */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5 max-w-[280px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handlePinInput(num)}
                className="h-12 sm:h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-lg sm:text-xl border border-slate-200/70 dark:border-slate-800 active:scale-95 transition-all flex items-center justify-center select-none"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClearPin}
              className="h-12 sm:h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 font-semibold text-xs border border-slate-200/50 dark:border-slate-800 active:scale-95 transition-all flex items-center justify-center select-none"
            >
              Hapus
            </button>
            <button
              type="button"
              onClick={() => handlePinInput('0')}
              className="h-12 sm:h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-lg sm:text-xl border border-slate-200/70 dark:border-slate-800 active:scale-95 transition-all flex items-center justify-center select-none"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleDeletePin}
              className="h-12 sm:h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-sm border border-slate-200/50 dark:border-slate-800 active:scale-95 transition-all flex items-center justify-center select-none"
            >
              ⌫
            </button>
          </div>

          {/* Submit Action */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isSubmitting || pin.length < 4}
              className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                isHusband
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                  : 'bg-pink-600 hover:bg-pink-700 shadow-pink-600/20'
              } disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Masuk Sebagai {partnerName}</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-center">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                💡 <span className="font-semibold">PIN Default:</span> <span className="font-mono font-bold text-slate-700 dark:text-slate-200">1234</span> (dapat diubah di menu Pengaturan).
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer info */}
      <footer className="w-full max-w-md text-center py-2 text-[11px] text-slate-400 dark:text-slate-500">
        KITA • Sistem Tabungan Bersama Suami & Istri
      </footer>
    </div>
  );
};
