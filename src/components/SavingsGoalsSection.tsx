import React, { useState } from 'react';
import {
  Target,
  Plus,
  Calendar,
  Sparkles,
  TrendingUp,
  Edit2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  PiggyBank,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSavings } from '../context/SavingsContext';
import { SavingsGoal } from '../types';
import { formatRupiah, formatShortDate } from '../utils/formatters';
import { calculateMonthlyTargetRequirement } from '../utils/calculations';
import { GoalModal } from './GoalModal';

interface SavingsGoalsSectionProps {
  onQuickDepositToGoal?: (goalId: string) => void;
}

export const SavingsGoalsSection: React.FC<SavingsGoalsSectionProps> = ({
  onQuickDepositToGoal,
}) => {
  const { goals, goalBalances, summary, hideBalance } = useSavings();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<SavingsGoal | null>(null);

  const handleOpenCreate = () => {
    setGoalToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal: SavingsGoal, e: React.MouseEvent) => {
    e.stopPropagation();
    setGoalToEdit(goal);
    setIsModalOpen(true);
  };

  const triggerCelebration = (e: React.MouseEvent) => {
    e.stopPropagation();
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  return (
    <div id="savings-goals-section" className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-heading">
              Target Tabungan Virtual
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300">
              {goals.length} Pos Virtual
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pembagian virtual saldo rekening bersama untuk berbagai rencana keluarga
          </p>
        </div>

        <button
          id="btn-add-new-goal"
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 border border-teal-200 dark:border-teal-800/80 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Target Baru</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((goal) => {
          const currentAmount = Math.max(0, goalBalances[goal.id] || 0);
          const rawPct = (currentAmount / goal.targetAmount) * 100;
          const progressPct = Math.min(100, Math.round(rawPct));
          const remainingAmount = Math.max(0, goal.targetAmount - currentAmount);
          const isCompleted = progressPct >= 100;

          const deadlineInfo = calculateMonthlyTargetRequirement(
            goal.targetAmount,
            currentAmount,
            goal.deadline
          );

          return (
            <div
              key={goal.id}
              className="group relative bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top Goal Bar */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      style={{ backgroundColor: `${goal.color}20`, color: goal.color }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
                    >
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white font-heading group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {goal.name}
                      </h4>
                      {goal.notes && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {goal.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleOpenEdit(goal, e)}
                    className="opacity-60 hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    title="Edit Target"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Progress bar and percentages */}
                <div className="my-3 space-y-1.5">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-bold text-slate-900 dark:text-white font-heading text-sm sm:text-base">
                      {formatRupiah(currentAmount, hideBalance)}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      dari {formatRupiah(goal.targetAmount, hideBalance)}
                    </span>
                  </div>

                  {/* Progress Line */}
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${progressPct}%`,
                        backgroundColor: goal.color || '#0D9488',
                      }}
                      className="h-full rounded-full transition-all duration-500"
                    />
                  </div>

                  <div className="flex justify-between text-[11px] font-medium pt-0.5">
                    <span
                      style={{ color: goal.color }}
                      className="font-semibold flex items-center gap-1"
                    >
                      {progressPct}% Terkumpul
                      {isCompleted && (
                        <CheckCircle2
                          className="w-3 h-3 text-emerald-500 inline cursor-pointer"
                          onClick={triggerCelebration}
                        />
                      )}
                    </span>
                    <span className="text-slate-400">
                      {isCompleted
                        ? '🎉 Target Tercapai!'
                        : `Kurang: ${formatRupiah(remainingAmount, hideBalance)}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Target Recommendation & Deadline */}
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] space-y-1.5">
                {goal.deadline && (
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Target Selesai:
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {formatShortDate(goal.deadline)}
                    </span>
                  </div>
                )}

                {deadlineInfo && deadlineInfo.monthsRemaining > 0 && !isCompleted && (
                  <div className="p-2 rounded-lg bg-teal-50/60 dark:bg-teal-950/30 text-teal-800 dark:text-teal-300 flex items-center justify-between">
                    <span className="flex items-center gap-1 font-medium">
                      <TrendingUp className="w-3 h-3" />
                      Nabung Bulanan:
                    </span>
                    <span className="font-bold">
                      {formatRupiah(deadlineInfo.monthlyRecommendation, hideBalance)}
                      <span className="text-[10px] font-normal text-teal-600 dark:text-teal-400">
                        /bln ({deadlineInfo.monthsRemaining} bln)
                      </span>
                    </span>
                  </div>
                )}

                {/* Quick Allocate CTA */}
                {onQuickDepositToGoal && !isCompleted && (
                  <button
                    type="button"
                    onClick={() => onQuickDepositToGoal(goal.id)}
                    className="w-full mt-2 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-teal-500 hover:text-white dark:hover:bg-teal-600 text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    + Alokasikan Setoran ke Pos Ini
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Card for Unallocated Funds (if any) */}
        {summary.unallocatedAmount > 0 && (
          <div className="bg-slate-50 dark:bg-slate-850 rounded-2xl p-5 border border-dashed border-slate-300 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                  <PiggyBank className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-heading">
                    Dana Bebas / Belum Dialokasikan
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Saldo tabungan bersama yang belum dibagi ke target tertentu
                  </span>
                </div>
              </div>

              <div className="my-3">
                <div className="text-lg font-bold text-slate-900 dark:text-white font-heading">
                  {formatRupiah(summary.unallocatedAmount, hideBalance)}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Uang ini siap dialokasikan ke pos target kapan saja.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="w-full py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-500 hover:text-teal-600 transition-colors"
            >
              + Buat Target Baru untuk Dana Ini
            </button>
          </div>
        )}
      </div>

      {/* Goal Modal */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        goalToEdit={goalToEdit}
      />
    </div>
  );
};
