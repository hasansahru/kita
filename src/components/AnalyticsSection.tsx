import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, BarChart3, Info } from 'lucide-react';
import { useSavings } from '../context/SavingsContext';
import { formatRupiah, formatRupiahCompact } from '../utils/formatters';

export const AnalyticsSection: React.FC = () => {
  const {
    monthlyBreakdowns,
    goals,
    goalBalances,
    summary,
    family,
    hideBalance,
  } = useSavings();

  const [activeTab, setActiveTab] = useState<'GROWTH' | 'CONTRIBUTION' | 'GOALS'>('GROWTH');

  // 1. Data for Growth Chart
  const growthData = monthlyBreakdowns.map((m) => ({
    name: m.monthLabel.split(' ')[0], // 'Agustus'
    fullLabel: m.monthLabel,
    saldo: m.endingBalance,
    setoran: m.totalDeposit,
    penarikan: m.withdrawal,
  }));

  // 2. Data for Monthly Husband vs Wife Bar chart
  const contributionComparisonData = monthlyBreakdowns.map((m) => ({
    name: m.monthLabel.split(' ')[0],
    suami: m.husbandDeposit,
    istri: m.wifeDeposit,
  }));

  // 3. Data for Goal Distribution Donut Chart
  const goalPieData = goals
    .map((g) => ({
      name: g.name,
      value: Math.max(0, goalBalances[g.id] || 0),
      color: g.color || '#0D9488',
    }))
    .filter((item) => item.value > 0);

  if (summary.unallocatedAmount > 0) {
    goalPieData.push({
      name: 'Dana Bebas',
      value: summary.unallocatedAmount,
      color: '#94A3B8',
    });
  }

  // Custom tooltip for Rupiah currency
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
          <p className="font-bold text-slate-200">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }} className="flex justify-between gap-4">
              <span>{entry.name}:</span>
              <span className="font-semibold">{formatRupiah(entry.value, hideBalance)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      id="analytics-charts-section"
      className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors space-y-4"
    >
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
              Grafik & Perkembangan Tabungan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Visualisasi pertumbuhan saldo, kontribusi, dan alokasi target
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('GROWTH')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'GROWTH'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Pertumbuhan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CONTRIBUTION')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'CONTRIBUTION'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Suami vs Istri
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('GOALS')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'GOALS'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Pos Virtual
          </button>
        </div>
      </div>

      {/* 1. GROWTH TAB */}
      {activeTab === 'GROWTH' && (
        <div className="pt-2">
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickFormatter={(val) => formatRupiahCompact(val, hideBalance)}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="saldo"
                  name="Saldo Akhir"
                  stroke="#0D9488"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSaldo)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-center text-slate-400 mt-2">
            Pergerakan akumulasi saldo tabungan bersama dari bulan ke bulan
          </p>
        </div>
      )}

      {/* 2. CONTRIBUTION TAB */}
      {activeTab === 'CONTRIBUTION' && (
        <div className="pt-2">
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contributionComparisonData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickFormatter={(val) => formatRupiahCompact(val, hideBalance)}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  formatter={(value) => (value === 'suami' ? `👨 ${family.husbandName}` : `👩 ${family.wifeName}`)}
                />
                <Bar
                  dataKey="suami"
                  name="suami"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="istri"
                  name="istri"
                  fill="#EC4899"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-center text-slate-400 mt-2">
            Perbandingan setoran {family.husbandName} dan {family.wifeName} tiap bulan
          </p>
        </div>
      )}

      {/* 3. GOALS DISTRIBUTION TAB */}
      {activeTab === 'GOALS' && (
        <div className="pt-2 flex flex-col md:flex-row items-center justify-center gap-6">
          <div className="h-60 w-60 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={goalPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {goalPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend breakdown list */}
          <div className="space-y-2 text-xs flex-1 max-w-sm">
            {goalPieData.map((item, idx) => {
              const pct =
                summary.totalBalance > 0
                  ? Math.round((item.value / summary.totalBalance) * 100)
                  : 0;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <span
                      style={{ backgroundColor: item.color }}
                      className="w-3 h-3 rounded-full shrink-0"
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatRupiah(item.value, hideBalance)}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-1">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
