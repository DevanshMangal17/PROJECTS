import React, { useState } from 'react';
import { ShiftRatioConfig, DailyShiftMetrics } from '../../types/roster';
import {
  Users,
  Clock,
  PieChart as PieIcon,
  SlidersHorizontal,
  TrendingUp,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';

interface ShiftDashboardProps {
  metrics: {
    shiftA: DailyShiftMetrics;
    shiftB: DailyShiftMetrics;
    shiftC: DailyShiftMetrics;
  };
  config: ShiftRatioConfig;
  onUpdateConfig: (newConfig: ShiftRatioConfig) => void;
}

export const ShiftDashboard: React.FC<ShiftDashboardProps> = ({
  metrics,
  config,
  onUpdateConfig,
}) => {
  const [editingConfig, setEditingConfig] = useState<ShiftRatioConfig>(config);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);

  const shifts = [
    {
      name: 'Shift A (Morning)',
      code: 'A',
      metrics: metrics.shiftA,
      targetPct: config.aShiftPct,
      timeWindow: '06:00 - 16:00 (10 hrs / 600m)',
      color: 'emerald',
    },
    {
      name: 'Shift B (Evening)',
      code: 'B',
      metrics: metrics.shiftB,
      targetPct: config.bShiftPct,
      timeWindow: '16:00 - 02:00 (10 hrs / 600m)',
      color: 'sky',
    },
    {
      name: 'Shift C (Night)',
      code: 'C',
      metrics: metrics.shiftC,
      targetPct: config.cShiftPct,
      timeWindow: '22:00 - 08:00 (10 hrs / 600m)',
      color: 'indigo',
    },
  ];

  const handleSaveRatio = () => {
    onUpdateConfig(editingConfig);
    setShowConfigModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Ratio Config Trigger */}
      <div className="p-4 rounded-xl bg-slate-900 text-white shadow-md border border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Daily Shift Deployment & Standard Ratio Dashboard
          </h2>
          <p className="text-xs text-slate-400">
            Current Standard Allocation Ratio: {config.aShiftPct}% (Shift A) : {config.bShiftPct}% (Shift B) : {config.cShiftPct}% (Shift C)
          </p>
        </div>

        <button
          onClick={() => setShowConfigModal(!showConfigModal)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Edit Shift Ratio Standard</span>
        </button>
      </div>

      {/* Editable Ratio Configuration Card */}
      {showConfigModal && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
            Configure Distribution Center Shift Allocation Ratios
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Shift A Target Ratio (%)
              </label>
              <input
                type="number"
                value={editingConfig.aShiftPct}
                onChange={(e) =>
                  setEditingConfig({ ...editingConfig, aShiftPct: Number(e.target.value) })
                }
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Shift B Target Ratio (%)
              </label>
              <input
                type="number"
                value={editingConfig.bShiftPct}
                onChange={(e) =>
                  setEditingConfig({ ...editingConfig, bShiftPct: Number(e.target.value) })
                }
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Shift C Target Ratio (%)
              </label>
              <input
                type="number"
                value={editingConfig.cShiftPct}
                onChange={(e) =>
                  setEditingConfig({ ...editingConfig, cShiftPct: Number(e.target.value) })
                }
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 text-xs pt-2">
            <button
              onClick={() => setShowConfigModal(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveRatio}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-colors"
            >
              Apply Ratio Standard
            </button>
          </div>
        </div>
      )}

      {/* 3 Shift Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {shifts.map((s) => (
          <div
            key={s.code}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
          >
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 block">
                  Target Allocation: {s.targetPct}%
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{s.name}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{s.timeWindow}</p>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                Shift {s.code}
              </span>
            </div>

            {/* Manpower Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 text-[10px]">Planned Manpower</span>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {s.metrics.plannedManpower} Headcount
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 text-[10px]">Actual Deployed</span>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {s.metrics.actualManpower} Headcount
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 text-[10px]">Attendance %</span>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                  {s.metrics.attendancePct}%
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 text-[10px]">Shift Utilization</span>
                <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {s.metrics.utilizationPct}%
                </div>
              </div>
            </div>

            {/* Deployment Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-400">Deployment Adherence</span>
                <span className="text-slate-900 dark:text-white">
                  {s.metrics.actualManpower} / {s.metrics.plannedManpower} ({s.metrics.attendancePct}%)
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    s.metrics.attendancePct >= 90
                      ? 'bg-emerald-500'
                      : s.metrics.attendancePct >= 75
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, s.metrics.attendancePct)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
