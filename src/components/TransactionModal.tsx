import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowDownLeft,
  ArrowUpRight,
  User,
  Calendar,
  Layers,
  Sparkles,
  Check,
  AlertCircle,
  Split,
} from 'lucide-react';
import { useSavings } from '../context/SavingsContext';
import { Role, TransactionType, GoalAllocation } from '../types';
import { formatRupiah } from '../utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
  defaultGoalId?: string;
}

const QUICK_AMOUNTS = [500_000, 1_000_000, 2_000_000, 3_000_000, 5_000_000, 10_000_000];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'DEPOSIT',
  defaultGoalId,
}) => {
  const {
    family,
    currentRole,
    goals,
    goalBalances,
    summary,
    addTransaction,
  } = useSavings();

  const [type, setType] = useState<TransactionType>(defaultType);
  const [contributor, setContributor] = useState<Role>(currentRole);
  const [amountStr, setAmountStr] = useState('');
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [description, setDescription] = useState('');

  // Allocation state for DEPOSIT
  // 'SINGLE' | 'SPLIT' | 'UNALLOCATED'
  const [allocMode, setAllocMode] = useState<'SINGLE' | 'SPLIT' | 'UNALLOCATED'>(
    defaultGoalId ? 'SINGLE' : 'SINGLE'
  );
  const [selectedSingleGoalId, setSelectedSingleGoalId] = useState<string>(
    defaultGoalId || (goals.length > 0 ? goals[0].id : 'UNALLOCATED')
  );

  // For Split allocation: Map of goalId -> number
  const [splitAllocations, setSplitAllocations] = useState<Record<string, number>>({});

  // For WITHDRAWAL: deduct from target
  const [withdrawalSourceGoalId, setWithdrawalSourceGoalId] = useState<string>(
    defaultGoalId || (goals.length > 0 ? goals[0].id : 'UNALLOCATED')
  );

  const [errorMessage, setErrorMessage] = useState('');

  // Reset / sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setType(defaultType);
      setContributor(currentRole);
      setAmountStr('');
      setTransactionDate(new Date().toISOString().substring(0, 10));
      setDescription('');
      setSelectedSingleGoalId(defaultGoalId || (goals.length > 0 ? goals[0].id : 'UNALLOCATED'));
      setWithdrawalSourceGoalId(defaultGoalId || (goals.length > 0 ? goals[0].id : 'UNALLOCATED'));
      setAllocMode(defaultGoalId ? 'SINGLE' : 'SINGLE');

      // Initialize split evenly if needed
      const initialSplits: Record<string, number> = {};
      goals.forEach((g) => {
        initialSplits[g.id] = 0;
      });
      setSplitAllocations(initialSplits);
      setErrorMessage('');
    }
  }, [isOpen, defaultType, defaultGoalId, currentRole, goals]);

  if (!isOpen) return null;

  const currentAmount = parseFloat(amountStr.replace(/[^0-9]/g, '')) || 0;

  // Auto calculate split sum
  const splitTotal = Object.values(splitAllocations).reduce<number>(
    (sum, val) => sum + Number(val || 0),
    0
  );
  const splitDifference = currentAmount - splitTotal;

  const handleQuickAddAmount = (addValue: number) => {
    const nextAmount = currentAmount + addValue;
    setAmountStr(nextAmount.toString());

    // If in single mode, keep as is
    // If in split mode, auto update first goal or balance
    if (allocMode === 'SPLIT' && goals.length > 0) {
      const firstGoal = goals[0].id;
      setSplitAllocations((prev) => ({
        ...prev,
        [firstGoal]: (prev[firstGoal] || 0) + addValue,
      }));
    }
  };

  const handleSetExactAmount = (exactValue: number) => {
    setAmountStr(exactValue.toString());
  };

  const handleSplitChange = (goalId: string, valueStr: string) => {
    const val = parseFloat(valueStr.replace(/[^0-9]/g, '')) || 0;
    setSplitAllocations((prev) => ({
      ...prev,
      [goalId]: val,
    }));
  };

  const handleAutoDistributeEvenly = () => {
    if (goals.length === 0 || currentAmount <= 0) return;
    const perGoal = Math.floor(currentAmount / goals.length);
    const remainder = currentAmount - perGoal * goals.length;

    const newSplits: Record<string, number> = {};
    goals.forEach((g, idx) => {
      newSplits[g.id] = perGoal + (idx === 0 ? remainder : 0);
    });
    setSplitAllocations(newSplits);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (currentAmount <= 0) {
      setErrorMessage('Nominal transaksi harus lebih besar dari Rp 0.');
      return;
    }

    if (!transactionDate) {
      setErrorMessage('Tanggal transaksi wajib dipilih.');
      return;
    }

    // Prepare allocations
    let finalAllocations: GoalAllocation[] = [];

    if (type === 'DEPOSIT') {
      if (allocMode === 'UNALLOCATED') {
        finalAllocations = [{ goalId: 'UNALLOCATED', amount: currentAmount }];
      } else if (allocMode === 'SINGLE') {
        if (!selectedSingleGoalId || selectedSingleGoalId === 'UNALLOCATED') {
          finalAllocations = [{ goalId: 'UNALLOCATED', amount: currentAmount }];
        } else {
          finalAllocations = [{ goalId: selectedSingleGoalId, amount: currentAmount }];
        }
      } else if (allocMode === 'SPLIT') {
        if (Math.abs(splitDifference) > 1) {
          setErrorMessage(
            `Total alokasi target (${formatRupiah(splitTotal)}) harus sama persis dengan nominal setoran (${formatRupiah(currentAmount)}). Selisih: ${formatRupiah(splitDifference)}.`
          );
          return;
        }

        finalAllocations = Object.entries(splitAllocations)
          .filter(([_, val]) => Number(val) > 0)
          .map(([goalId, val]) => ({ goalId, amount: Number(val) }));

        if (finalAllocations.length === 0) {
          finalAllocations = [{ goalId: 'UNALLOCATED', amount: currentAmount }];
        }
      }
    } else {
      // WITHDRAWAL
      if (currentAmount > summary.totalBalance) {
        if (
          !window.confirm(
            `Nominal penarikan (${formatRupiah(currentAmount)}) melebihi saldo tabungan saat ini (${formatRupiah(summary.totalBalance)}). Tetap lanjutkan?`
          )
        ) {
          return;
        }
      }

      if (withdrawalSourceGoalId && withdrawalSourceGoalId !== 'UNALLOCATED') {
        const goalBalance = goalBalances[withdrawalSourceGoalId] || 0;
        if (currentAmount > goalBalance) {
          if (
            !window.confirm(
              `Nominal penarikan (${formatRupiah(currentAmount)}) lebih besar dari saldo target yang dipilih (${formatRupiah(goalBalance)}). Saldo target akan menjadi minus atau disesuaikan. Lanjutkan?`
            )
          ) {
            return;
          }
        }
        finalAllocations = [{ goalId: withdrawalSourceGoalId, amount: currentAmount }];
      } else {
        finalAllocations = [{ goalId: 'UNALLOCATED', amount: currentAmount }];
      }
    }

    addTransaction({
      contributor,
      type,
      amount: currentAmount,
      transactionDate,
      description: description.trim() || (type === 'DEPOSIT' ? 'Setoran Tabungan Bersama' : 'Penarikan Dana Bersama'),
      allocations: finalAllocations,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Type Selector */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
              Catat Transaksi Tabungan Bersama
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Type Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setType('DEPOSIT')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                type === 'DEPOSIT'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>+ Setoran (Uang Masuk)</span>
            </button>

            <button
              type="button"
              onClick={() => setType('WITHDRAWAL')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                type === 'WITHDRAWAL'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>- Penarikan (Uang Keluar)</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 text-xs bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. SIAPA YANG MENYETOR / MENARIK */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {type === 'DEPOSIT' ? 'Siapa yang menyetor?' : 'Siapa yang memproses / menarik?'} <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setContributor('HUSBAND')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2.5 transition-all ${
                  contributor === 'HUSBAND'
                    ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span className="text-lg">👨</span>
                <span className="text-xs">{family.husbandName} (Suami)</span>
              </button>

              <button
                type="button"
                onClick={() => setContributor('WIFE')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2.5 transition-all ${
                  contributor === 'WIFE'
                    ? 'border-pink-500 bg-pink-50/80 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 font-bold ring-2 ring-pink-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span className="text-lg">👩</span>
                <span className="text-xs">{family.wifeName} (Istri)</span>
              </button>
            </div>
          </div>

          {/* 2. NOMINAL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nominal {type === 'DEPOSIT' ? 'Setoran' : 'Penarikan'} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">
                Rp
              </span>
              <input
                type="text"
                placeholder="0"
                value={
                  amountStr
                    ? Number(amountStr.replace(/[^0-9]/g, '')).toLocaleString('id-ID')
                    : ''
                }
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  setAmountStr(raw);
                }}
                className="w-full text-base sm:text-lg pl-11 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            {/* Quick Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleSetExactAmount(amt)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-950/60 dark:hover:text-teal-300 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  +{amt >= 1_000_000 ? `${amt / 1_000_000}jt` : `${amt / 1_000}rb`}
                </button>
              ))}
            </div>
          </div>

          {/* 3. TANGGAL TRANSAKSI */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tanggal Transaksi <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="w-full text-sm px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              required
            />
          </div>

          {/* 4. ALOKASI TARGET (DEPOSIT vs WITHDRAWAL) */}
          {type === 'DEPOSIT' ? (
            <div className="pt-1">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Alokasi Target Tabungan
                </label>
                {goals.length > 1 && (
                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setAllocMode('SINGLE')}
                      className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                        allocMode === 'SINGLE'
                          ? 'bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-bold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      1 Target
                    </button>
                    <span>|</span>
                    <button
                      type="button"
                      onClick={() => {
                        setAllocMode('SPLIT');
                        handleAutoDistributeEvenly();
                      }}
                      className={`px-2 py-0.5 rounded-md font-medium transition-colors flex items-center gap-1 ${
                        allocMode === 'SPLIT'
                          ? 'bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-bold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Split className="w-3 h-3" />
                      Split Banyak Target
                    </button>
                  </div>
                )}
              </div>

              {/* Single Target Mode */}
              {allocMode === 'SINGLE' && (
                <select
                  value={selectedSingleGoalId}
                  onChange={(e) => setSelectedSingleGoalId(e.target.value)}
                  className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      🎯 {g.name} (Terkumpul {formatRupiah(goalBalances[g.id] || 0)})
                    </option>
                  ))}
                  <option value="UNALLOCATED">
                    📦 Tidak dialokasikan (Masuk Dana Bebas)
                  </option>
                </select>
              )}

              {/* Split Mode */}
              {allocMode === 'SPLIT' && (
                <div className="space-y-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    <span>Bagi nominal setoran ke target:</span>
                    <button
                      type="button"
                      onClick={handleAutoDistributeEvenly}
                      className="text-teal-600 dark:text-teal-400 hover:underline font-semibold"
                    >
                      Bagi Rata Otomatis
                    </button>
                  </div>

                  {goals.map((goal) => (
                    <div key={goal.id} className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex-1 truncate">
                        {goal.name}
                      </span>
                      <div className="relative w-36 sm:w-44">
                        <span className="absolute left-2.5 top-2 text-[10px] text-slate-400 font-bold">
                          Rp
                        </span>
                        <input
                          type="text"
                          placeholder="0"
                          value={
                            splitAllocations[goal.id]
                              ? splitAllocations[goal.id].toLocaleString('id-ID')
                              : ''
                          }
                          onChange={(e) => handleSplitChange(goal.id, e.target.value)}
                          className="w-full text-xs pl-7 pr-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                  ))}

                  {/* Split Summary Footer */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-500">Total Alokasi:</span>
                    <span
                      className={`font-bold ${
                        Math.abs(splitDifference) < 1
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {formatRupiah(splitTotal)} / {formatRupiah(currentAmount)}
                      {splitDifference !== 0 && (
                        <span className="text-[10px] block text-right font-normal">
                          {splitDifference > 0 ? `Sisa: ${formatRupiah(splitDifference)}` : `Kelebihan: ${formatRupiah(Math.abs(splitDifference))}`}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* WITHDRAWAL TARGET SOURCE */
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Potong dari Pos / Target Mana? <span className="text-rose-500">*</span>
              </label>
              <select
                value={withdrawalSourceGoalId}
                onChange={(e) => setWithdrawalSourceGoalId(e.target.value)}
                className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    🎯 {g.name} (Tersedia: {formatRupiah(goalBalances[g.id] || 0)})
                  </option>
                ))}
                <option value="UNALLOCATED">
                  📦 Dana Bebas / Belum Dialokasikan (Tersedia: {formatRupiah(summary.unallocatedAmount)})
                </option>
              </select>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Penarikan akan mengurangi saldo rekening dan saldo pos target virtual yang dipilih.
              </span>
            </div>
          )}

          {/* 5. CATATAN */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Catatan Transaksi
            </label>
            <input
              type="text"
              placeholder={
                type === 'DEPOSIT'
                  ? 'Contoh: Gaji bulanan, bonus proyek, hadiah...'
                  : 'Contoh: Biaya renovasi genteng, booking tiket...'
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Submit Actions */}
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
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold text-white shadow-md active:scale-95 transition-all ${
                type === 'DEPOSIT'
                  ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-700/20'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-700/20'
              }`}
            >
              {type === 'DEPOSIT' ? 'Simpan Setoran' : 'Simpan Penarikan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
