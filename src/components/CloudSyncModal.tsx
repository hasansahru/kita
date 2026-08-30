import React, { useState, useEffect } from 'react';
import {
  X,
  Cloud,
  CloudCheck,
  RefreshCw,
  Copy,
  Check,
  Smartphone,
  Share2,
  ShieldCheck,
  AlertCircle,
  Key,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useSavings } from '../context/SavingsContext';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({ isOpen, onClose }) => {
  const { cloudSync, updateCloudSyncConfig, syncNow, generateSyncCode } = useSavings();

  const [syncCodeInput, setSyncCodeInput] = useState('');
  const [projectIdInput, setProjectIdInput] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [appIdInput, setAppIdInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSyncCodeInput(cloudSync.syncCode || '');
      setProjectIdInput(cloudSync.firebaseProjectId || 'kita-51e3e');
      setApiKeyInput(cloudSync.firebaseApiKey || '');
      setAppIdInput(cloudSync.firebaseAppId || '');
      setSuccessNotice(null);
    }
  }, [isOpen, cloudSync]);

  if (!isOpen) return null;

  const handleGenerateNewCode = () => {
    const newCode = generateSyncCode();
    setSyncCodeInput(newCode);
    updateCloudSyncConfig({
      syncCode: newCode,
    });
  };

  const handleCopyCode = () => {
    if (!syncCodeInput) return;
    navigator.clipboard.writeText(syncCodeInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareToWhatsApp = () => {
    if (!syncCodeInput) return;
    const text = encodeURIComponent(
      `Sayang, ini Kode Sinkronisasi Tabungan Bersama KITA: *${syncCodeInput}*\n\nBuka aplikasi Tabungan Kita, klik ikon Awan (Sinkronisasi), lalu tempel kode ini agar HP kita otomatis terhubung 1 rekening real-time! ❤️`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = syncCodeInput.trim().toUpperCase();
    if (!cleanCode) {
      alert('Mohon masukkan atau buat Kode Sinkronisasi Keluarga terlebih dahulu.');
      return;
    }

    setIsSyncing(true);
    updateCloudSyncConfig({
      isEnabled: true,
      syncCode: cleanCode,
      firebaseProjectId: projectIdInput.trim() || undefined,
      firebaseApiKey: apiKeyInput.trim() || undefined,
      firebaseAppId: appIdInput.trim() || undefined,
    });

    const success = await syncNow();
    setIsSyncing(false);
    if (success) {
      setSuccessNotice('Berhasil terhubung ke Cloud! Data otomatis tersinkronisasi antar-perangkat.');
    }
  };

  const handleDisconnect = () => {
    if (
      window.confirm(
        'Apakah Anda yakin ingin mematikan sinkronisasi cloud? Aplikasi akan kembali menyimpan data secara lokal di HP ini saja.'
      )
    ) {
      updateCloudSyncConfig({
        isEnabled: false,
        status: 'offline',
      });
      setSuccessNotice('Sinkronisasi cloud telah dinonaktifkan.');
    }
  };

  const isConnected = cloudSync.isEnabled && cloudSync.status === 'synced';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-gradient-to-r from-teal-500/10 via-sky-500/10 to-indigo-500/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-600 text-white shadow-sm shrink-0">
              <Cloud className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-heading truncate">
                Sinkronisasi Suami & Istri
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                1 Rekening Bersama Tersinkron Real-time Antar-HP
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Status Badge */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
              isConnected
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                : cloudSync.status === 'connecting'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300'
                : cloudSync.status === 'error'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative">
                <span
                  className={`w-3 h-3 rounded-full block ${
                    isConnected
                      ? 'bg-emerald-500 ring-4 ring-emerald-200 dark:ring-emerald-900'
                      : cloudSync.status === 'connecting'
                      ? 'bg-amber-500 animate-pulse'
                      : cloudSync.status === 'error'
                      ? 'bg-rose-500'
                      : 'bg-slate-400'
                  }`}
                />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-xs block truncate">
                  {isConnected
                    ? '🟢 Tersinkronisasi Cloud (Live Real-time)'
                    : cloudSync.status === 'connecting'
                    ? '🔄 Menghubungkan ke Cloud...'
                    : cloudSync.status === 'error'
                    ? '⚠️ Gangguan Koneksi Cloud'
                    : '☁️ Mode Lokal (Belum Terhubung Cloud)'}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                  {cloudSync.lastSyncedAt
                    ? `Terakhir sinkron: ${new Date(cloudSync.lastSyncedAt).toLocaleTimeString('id-ID')}`
                    : 'Data hanya tersimpan di memori browser HP ini'}
                </span>
              </div>
            </div>

            {isConnected && (
              <button
                type="button"
                onClick={syncNow}
                disabled={isSyncing}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shrink-0 inline-flex items-center gap-1 shadow-xs transition-all active:scale-95"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sinkron</span>
              </button>
            )}
          </div>

          {/* Feedback messages */}
          {successNotice && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {cloudSync.errorMessage && cloudSync.status === 'error' && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block">Gagal menyinkronkan data</span>
                <p className="text-[11px] leading-relaxed">{cloudSync.errorMessage}</p>
              </div>
            </div>
          )}

          {/* Step-by-Step Guide */}
          <div className="p-3.5 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-sky-900 dark:text-sky-200 text-xs">
              <Smartphone className="w-4 h-4 text-sky-600" />
              <span>Cara Menghubungkan HP Suami & Istri:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-sky-800 dark:text-sky-300 leading-relaxed pl-1">
              <li>
                <strong>Di HP Pertama (Suami):</strong> Klik tombol <em>"Buat Kode Baru"</em> di bawah, lalu klik <em>"Hubungkan"</em>.
              </li>
              <li>
                <strong>Kirim ke Pasangan:</strong> Salin kodenya atau klik tombol <em>WhatsApp</em> untuk membagikan ke Istri.
              </li>
              <li>
                <strong>Di HP Kedua (Istri):</strong> Buka menu ini, masukkan kode yang sama, lalu klik <em>"Hubungkan"</em>.
              </li>
            </ol>
          </div>

          {/* Form */}
          <form onSubmit={handleConnect} className="space-y-3.5">
            {/* Sync Code Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                🔑 Kode Sinkronisasi Keluarga (Family Room Key)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={syncCodeInput}
                  onChange={(e) => setSyncCodeInput(e.target.value.toUpperCase())}
                  placeholder="Contoh: KITA-882910"
                  className="flex-1 text-sm px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono uppercase tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
                <button
                  type="button"
                  onClick={handleGenerateNewCode}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-colors shrink-0"
                  title="Buat kode unik otomatis"
                >
                  Buat Baru
                </button>
              </div>
            </div>

            {/* Quick Actions: Copy & WhatsApp */}
            {syncCodeInput && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copied ? 'Kode Tersalin!' : 'Salin Kode'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareToWhatsApp}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors border border-emerald-200 dark:border-emerald-800"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Kirim ke WA Pasangan</span>
                </button>
              </div>
            )}

            {/* Advanced Firebase Firestore Configuration (Collapsible) */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Key className="w-3.5 h-3.5 text-teal-600" />
                  <span>Pengaturan Database Firebase Firestore (Opsional / Custom)</span>
                </div>
                {showAdvanced ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {showAdvanced && (
                <div className="p-3.5 bg-white dark:bg-slate-900 space-y-3 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Jika Anda memiliki project Firebase gratis sendiri di <code>console.firebase.google.com</code>, Anda dapat memasukkan kuncinya di sini agar data tersimpan di Cloud Firestore pribadi Anda:
                  </p>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Firebase Project ID
                    </label>
                    <input
                      type="text"
                      value={projectIdInput}
                      onChange={(e) => setProjectIdInput(e.target.value)}
                      placeholder="Contoh: tabungan-keluarga-kita"
                      className="w-full text-xs px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Firebase API Key (Web API Key)
                    </label>
                    <input
                      type="password"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full text-xs px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Firebase App ID
                    </label>
                    <input
                      type="text"
                      value={appIdInput}
                      onChange={(e) => setAppIdInput(e.target.value)}
                      placeholder="1:123456789:web:abcdef..."
                      className="w-full text-xs px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 pt-2">
              {cloudSync.isEnabled ? (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  Matikan Sinkronisasi
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Tutup
                </button>

                <button
                  type="submit"
                  disabled={isSyncing}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-700/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Menghubungkan...' : 'Hubungkan & Sinkronkan'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
