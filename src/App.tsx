import React, { useState } from 'react';
import { SavingsProvider, useSavings } from './context/SavingsContext';
import { Header } from './components/Header';
import { BalanceCard } from './components/BalanceCard';
import { ContributionCard } from './components/ContributionCard';
import { MonthlySummary } from './components/MonthlySummary';
import { ConsistencyBanner } from './components/ConsistencyBanner';
import { SavingsGoalsSection } from './components/SavingsGoalsSection';
import { TransactionHistory } from './components/TransactionHistory';
import { AnalyticsSection } from './components/AnalyticsSection';
import { TransactionModal } from './components/TransactionModal';
import { AuditLogModal } from './components/AuditLogModal';
import { ExportModal } from './components/ExportModal';
import { SettingsModal } from './components/SettingsModal';
import { TransactionType } from './types';
import { formatRupiah, formatDateIndo } from './utils/formatters';
import { Heart, Plus, Minus, Layers, TrendingUp, Sparkles, Building2 } from 'lucide-react';

const MainDashboard: React.FC = () => {
  const { family, summary, transactions, goals, hideBalance } = useSavings();

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalType, setTxModalType] = useState<TransactionType>('DEPOSIT');
  const [txModalGoalId, setTxModalGoalId] = useState<string | undefined>(undefined);

  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Tab view on mobile/desktop
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'GOALS' | 'HISTORY' | 'ANALYTICS'>('OVERVIEW');

  const handleOpenDeposit = (goalId?: string) => {
    setTxModalType('DEPOSIT');
    setTxModalGoalId(goalId);
    setIsTxModalOpen(true);
  };

  const handleOpenWithdrawal = () => {
    setTxModalType('WITHDRAWAL');
    setTxModalGoalId(undefined);
    setIsTxModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* 1. Header Navigation */}
      <Header
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenAuditLogs={() => setIsAuditModalOpen(true)}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-7 space-y-5 sm:space-y-6">
        {/* Navigation Tabs on Mobile/Desktop */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-print border-b border-slate-200 dark:border-slate-800 scrollbar-none">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('OVERVIEW')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === 'OVERVIEW'
                  ? 'bg-teal-600 text-white dark:bg-teal-500 dark:text-slate-950 shadow-sm shadow-teal-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              Dashboard Utama
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('GOALS')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'GOALS'
                  ? 'bg-teal-600 text-white dark:bg-teal-500 dark:text-slate-950 shadow-sm shadow-teal-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Target Virtual ({goals.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('HISTORY')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === 'HISTORY'
                  ? 'bg-teal-600 text-white dark:bg-teal-500 dark:text-slate-950 shadow-sm shadow-teal-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              Histori Transaksi
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ANALYTICS')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'ANALYTICS'
                  ? 'bg-teal-600 text-white dark:bg-teal-500 dark:text-slate-950 shadow-sm shadow-teal-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Grafik Perkembangan</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>{family.bankName}</span>
            <span>•</span>
            <span>{family.husbandName} & {family.wifeName}</span>
          </div>
        </div>

        {/* --- VIEW: OVERVIEW (MAIN COMPREHENSIVE DASHBOARD) --- */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Top Row: Hero Balance Card */}
            <BalanceCard
              onAddDeposit={() => handleOpenDeposit()}
              onAddWithdrawal={handleOpenWithdrawal}
            />

            {/* Consistency Check Banner */}
            <ConsistencyBanner />

            {/* 2 Columns: Husband vs Wife Contribution & Monthly Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <ContributionCard />
              <MonthlySummary />
            </div>

            {/* Virtual Savings Goals Section */}
            <SavingsGoalsSection onQuickDepositToGoal={(gId) => handleOpenDeposit(gId)} />

            {/* Recent Transactions Preview */}
            <div className="space-y-2">
              <TransactionHistory
                onAddTransaction={() => handleOpenDeposit()}
                maxInitialDisplay={5}
                showFilters={false}
              />
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('HISTORY')}
                  className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
                >
                  Lihat Semua {transactions.length} Transaksi & Filter →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW: GOALS TAB --- */}
        {activeTab === 'GOALS' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <ConsistencyBanner />
            <SavingsGoalsSection onQuickDepositToGoal={(gId) => handleOpenDeposit(gId)} />
          </div>
        )}

        {/* --- VIEW: HISTORY TAB --- */}
        {activeTab === 'HISTORY' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <TransactionHistory
              onAddTransaction={() => handleOpenDeposit()}
              showFilters={true}
            />
          </div>
        )}

        {/* --- VIEW: ANALYTICS TAB --- */}
        {activeTab === 'ANALYTICS' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <AnalyticsSection />
            <MonthlySummary />
          </div>
        )}
      </main>

      {/* 3. PRINT-ONLY STATEMENT LAYOUT */}
      <div className="hidden print:block p-8 bg-white text-black font-sans text-xs">
        <div className="border-b pb-4 mb-4">
          <h1 className="text-xl font-bold">{family.name}</h1>
          <p className="text-gray-600">Laporan Rekening Tabungan Bersama Suami Istri</p>
          <p className="text-gray-500">Pasangan: {family.husbandName} & {family.wifeName} | Bank: {family.bankName}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 border p-4 rounded mb-6">
          <div>
            <strong>Saldo Akhir:</strong>
            <p className="text-base font-bold">{formatRupiah(summary.totalBalance)}</p>
          </div>
          <div>
            <strong>Setoran {family.husbandName}:</strong>
            <p className="text-base">{formatRupiah(summary.husbandDeposit)} ({summary.husbandPercentage}%)</p>
          </div>
          <div>
            <strong>Setoran {family.wifeName}:</strong>
            <p className="text-base">{formatRupiah(summary.wifeDeposit)} ({summary.wifePercentage}%)</p>
          </div>
        </div>

        <h3 className="font-bold text-sm mb-2">Pos Target Tabungan Virtual:</h3>
        <table className="w-full border-collapse border border-gray-300 mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Nama Target</th>
              <th className="border p-2 text-right">Target (Rp)</th>
              <th className="border p-2 text-right">Terkumpul (Rp)</th>
              <th className="border p-2 text-right">Progress</th>
            </tr>
          </thead>
          <tbody>
            {goals.map((g) => (
              <tr key={g.id}>
                <td className="border p-2">{g.name}</td>
                <td className="border p-2 text-right">{formatRupiah(g.targetAmount)}</td>
                <td className="border p-2 text-right">{formatRupiah(g.targetAmount)}</td>
                <td className="border p-2 text-right">{Math.round((g.targetAmount / g.targetAmount) * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className="font-bold text-sm mb-2">Histori Transaksi:</h3>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Tanggal</th>
              <th className="border p-2 text-left">Jenis</th>
              <th className="border p-2 text-left">Pelaku</th>
              <th className="border p-2 text-right">Nominal</th>
              <th className="border p-2 text-left">Catatan</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td className="border p-2">{tx.transactionDate}</td>
                <td className="border p-2">{tx.type}</td>
                <td className="border p-2">{tx.contributor === 'HUSBAND' ? family.husbandName : family.wifeName}</td>
                <td className="border p-2 text-right">{formatRupiah(tx.amount)}</td>
                <td className="border p-2">{tx.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. Footer */}
      <footer className="py-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 dark:text-slate-500 no-print">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="flex items-center gap-1">
            <span>KITA • Satu Rekening Tabungan Bersama Keluarga</span>
          </p>
          <p>
            Saldo murni dihitung dari histori transaksi: Total Setoran - Total Penarikan
          </p>
        </div>
      </footer>

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        defaultType={txModalType}
        defaultGoalId={txModalGoalId}
      />

      <AuditLogModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <SavingsProvider>
      <MainDashboard />
    </SavingsProvider>
  );
}
