import React, { useState, useEffect } from 'react';
import { X, Target, Calendar, Sparkles, Check, Trash2 } from 'lucide-react';
import { useSavings } from '../context/SavingsContext';
import { SavingsGoal } from '../types';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: SavingsGoal | null;
}

const PRESET_COLORS = [
  '#0D9488', // Teal
  '#3B82F6', // Blue
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#10B981', // Emerald
  '#EF4444', // Red
  '#6366F1', // Indigo
];

const PRESET_ICONS = [
  { name: 'ShieldCheck', label: 'Darurat / Proteksi' },
  { name: 'Home', label: 'Rumah & Properti' },
  { name: 'Plane', label: 'Liburan & Healing' },
  { name: 'Car', label: 'Kendaraan' },
  { name: 'GraduationCap', label: 'Pendidikan Anak' },
  { name: 'Baby', label: 'Kelahiran / Bayi' },
  { name: 'Sparkles', label: 'Hobi / Impian' },
  { name: 'Building', label: 'Modal Usaha' },
];

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  goalToEdit,
}) => {
  const { addGoal, editGoal, deleteGoal } = useSavings();

  const [name, setName] = useState('');
  const [targetAmountStr, setTargetAmountStr] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [iconName, setIconName] = useState('ShieldCheck');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (goalToEdit) {
      setName(goalToEdit.name);
      setTargetAmountStr(goalToEdit.targetAmount.toString());
      setColor(goalToEdit.color || PRESET_COLORS[0]);
      setIconName(goalToEdit.iconName || 'ShieldCheck');
      setDeadline(goalToEdit.deadline || '');
      setNotes(goalToEdit.notes || '');
    } else {
      setName('');
      setTargetAmountStr('');
      setColor(PRESET_COLORS[0]);
      setIconName('Target');
      setDeadline('');
      setNotes('');
    }
    setErrorMessage('');
  }, [goalToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(targetAmountStr.replace(/[^0-9]/g, ''));

    if (!name.trim()) {
      setErrorMessage('Nama target tabungan harus diisi.');
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      setErrorMessage('Target nominal harus berupa angka positif.');
      return;
    }

    if (goalToEdit) {
      editGoal(goalToEdit.id, {
        name: name.trim(),
        targetAmount: amount,
        color,
        iconName,
        deadline: deadline || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      addGoal({
        name: name.trim(),
        targetAmount: amount,
        color,
        iconName,
        deadline: deadline || undefined,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (!goalToEdit) return;
    if (
      window.confirm(
        `Apakah Anda yakin ingin menghapus target "${goalToEdit.name}"? Alokasi dana yang tersisa akan otomatis masuk ke dana bebas alokasi.`
      )
    ) {
      deleteGoal(goalToEdit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div
              style={{ backgroundColor: color }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
            >
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-heading">
                {goalToEdit ? 'Edit Target Virtual' : 'Target Tabungan Virtual'}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Alokasi virtual 1 rekening tabungan bersama
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="p-3 text-xs bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-800">
              {errorMessage}
            </div>
          )}

          {/* Goal Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Target Tabungan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Dana Darurat, Rumah, Liburan..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          {/* Target Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Nominal (Rp) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">
                Rp
              </span>
              <input
                type="text"
                placeholder="Contoh: 30.000.000"
                value={targetAmountStr ? Number(targetAmountStr.replace(/[^0-9]/g, '')).toLocaleString('id-ID') : ''}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  setTargetAmountStr(raw);
                }}
                className="w-full text-sm pl-11 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Batas Waktu / Deadline (Opsional)
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Sistem akan otomatis menghitung rekomendasi tabungan per bulan
            </span>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Warna Identitas Target
            </label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-white transition-transform ${
                    color === c ? 'scale-110 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-105 opacity-80'
                  }`}
                >
                  {color === c && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Catatan / Detail Target
            </label>
            <textarea
              rows={2}
              placeholder="Catatan tambahan rencana tabungan..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-sm px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-3">
            {goalToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
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
                {goalToEdit ? 'Simpan Perubahan' : 'Buat Target'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
