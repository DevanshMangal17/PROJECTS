import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  Building2,
  PackageCheck,
  TrendingUp,
  Flame,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { GeneralInputs, SimulationResult, OptimizationGoal } from '../types';

interface DashboardViewProps {
  inputs: GeneralInputs;
  setInputs: React.Dispatch<React.SetStateAction<GeneralInputs>>;
  result: SimulationResult;
  optimizationGoal: OptimizationGoal;
  setOptimizationGoal: (goal: OptimizationGoal) => void;
  manualOverrides: {
    inboundManpower?: number;
    outboundManpower?: number;
    auditManpower?: number;
  };
  setManualOverrides: React.Dispatch<
    React.SetStateAction<{
      inboundManpower?: number;
      outboundManpower?: number;
      auditManpower?: number;
    }>
  >;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  inputs,
  setInputs,
  result,
  optimizationGoal,
  setOptimizationGoal,
  manualOverrides,
  setManualOverrides,
}) => {
  const isManualActive =
    manualOverrides.inboundManpower !== undefined ||
    manualOverrides.outboundManpower !== undefined ||
    manualOverrides.auditManpower !== undefined;

  // Pie Chart Data
  const pieData = [
    { name: 'Inbound', value: result.inbound.totalAllocatedManpower, color: '#3b82f6' },
    { name: 'Outbound', value: result.outbound.totalAllocatedManpower, color: '#8b5cf6' },
    { name: 'Audit', value: result.audit.totalAllocatedManpower, color: '#06b6d4' },
    { name: 'Idle', value: result.totalIdleAssociates, color: '#94a3b8' },
  ].filter((item) => item.value > 0);

  // Bar Chart Data (Workload vs Capacity)
  const barData = [
    {
      department: 'Inbound',
      'Required Hours': result.inbound.laborHoursRequired,
      'Allocated Hours': Number(
        (
          result.inbound.totalAllocatedManpower * (result.effectiveShiftMins / 60) +
          result.inbound.assignedOvertimeHours
        ).toFixed(1)
      ),
      Utilization: result.inbound.utilizationPct,
    },
    {
      department: 'Outbound',
      'Required Hours': result.outbound.laborHoursRequired,
      'Allocated Hours': Number(
        (
          result.outbound.totalAllocatedManpower * (result.effectiveShiftMins / 60) +
          result.outbound.assignedOvertimeHours
        ).toFixed(1)
      ),
      Utilization: result.outbound.utilizationPct,
    },
    {
      department: 'Audit',
      'Required Hours': result.audit.laborHoursRequired,
      'Allocated Hours': Number(
        (
          result.audit.totalAllocatedManpower * (result.effectiveShiftMins / 60) +
          result.audit.assignedOvertimeHours
        ).toFixed(1)
      ),
      Utilization: result.audit.utilizationPct,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Controls & AI Strategy Bar */}
      <div className="p-4 rounded-xl bg-slate-900 text-white shadow-lg border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/30">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              AI Allocation Engine Strategy
              {isManualActive && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Manual Override Active
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Select AI optimization objective to recalculate dynamic workforce distribution.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300 font-medium">Goal:</span>
          <select
            value={optimizationGoal}
            onChange={(e) => setOptimizationGoal(e.target.value as OptimizationGoal)}
            className="bg-slate-800 text-xs font-semibold text-white px-3 py-1.5 rounded-lg border border-slate-700 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="min_overtime">Minimize Overtime</option>
            <option value="max_utilization">Maximize Labor Utilization</option>
            <option value="min_cost">Minimize Labor Cost</option>
            <option value="balanced_sla">Balanced Dispatch SLA</option>
          </select>

          {isManualActive && (
            <button
              onClick={() => setManualOverrides({})}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset AI Auto</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Inputs + AI Recommendation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Daily Inputs Form */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              Daily Planning Inputs
            </h3>
            <span className="text-[11px] font-medium text-slate-500">Facility Shift Config</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Total Orders
              </label>
              <input
                type="number"
                value={inputs.totalOrders}
                onChange={(e) => setInputs({ ...inputs, totalOrders: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Total SKU Lines
              </label>
              <input
                type="number"
                value={inputs.totalSkus}
                onChange={(e) => setInputs({ ...inputs, totalSkus: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Total Items / Units
              </label>
              <input
                type="number"
                value={inputs.totalUnits}
                onChange={(e) => setInputs({ ...inputs, totalUnits: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Shift Length (Mins)
              </label>
              <input
                type="number"
                value={inputs.workingShiftMins}
                onChange={(e) => setInputs({ ...inputs, workingShiftMins: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Break Time (Mins)
              </label>
              <input
                type="number"
                value={inputs.breakTimeMins}
                onChange={(e) => setInputs({ ...inputs, breakTimeMins: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Avg Weight / Order (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={inputs.avgWeightPerOrderKg}
                onChange={(e) => setInputs({ ...inputs, avgWeightPerOrderKg: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Computed Effective Time */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Effective Working Time:
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {inputs.workingShiftMins - inputs.breakTimeMins} mins ({((inputs.workingShiftMins - inputs.breakTimeMins) / 60).toFixed(1)} hrs)
            </span>
          </div>

          {/* Operational Toggles */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                Peak Season (+35% Workload)
              </span>
              <input
                type="checkbox"
                checked={inputs.isPeakSeason}
                onChange={(e) => setInputs({ ...inputs, isPeakSeason: e.target.checked })}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              <span>Weekend Schedule (+15%)</span>
              <input
                type="checkbox"
                checked={inputs.isWeekend}
                onChange={(e) => setInputs({ ...inputs, isWeekend: e.target.checked })}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              <span>Holiday Shift (+25%)</span>
              <input
                type="checkbox"
                checked={inputs.isHoliday}
                onChange={(e) => setInputs({ ...inputs, isHoliday: e.target.checked })}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Column 2 & 3: AI Recommendations & Insights */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                AI Optimization Insights & Operational Advisory
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                {result.recommendations.length} Active Insights
              </span>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {result.recommendations.map((rec) => {
                let badgeStyle = 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900';
                let icon = <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />;

                if (rec.type === 'critical') {
                  badgeStyle = 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900';
                  icon = <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />;
                } else if (rec.type === 'optimization') {
                  badgeStyle = 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900';
                  icon = <TrendingUp className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />;
                } else if (rec.type === 'warning') {
                  badgeStyle = 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900';
                  icon = <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />;
                }

                return (
                  <div
                    key={rec.id}
                    className={`p-3.5 rounded-xl border ${badgeStyle} flex items-start gap-3 transition-all hover:scale-[1.005]`}
                  >
                    {icon}
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold">{rec.title}</h4>
                        <span className="text-[10px] font-semibold opacity-90 px-2 py-0.5 rounded bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                          {rec.impact}
                        </span>
                      </div>
                      <p className="text-xs opacity-90 mt-1 leading-relaxed">{rec.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick SLA Indicator */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <PackageCheck className="w-5 h-5 text-emerald-500" />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Outbound Dispatch SLA Risk: {result.slaCompliancePct}%
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Calculated based on Outbound picking rate vs daily wave cutoff.
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Total Labor Cost: ${result.totalLaborCost.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                ${result.costPerOrder}/order • ${result.costPerUnit}/unit
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart: Allocation */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Manpower Allocation Distribution
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              Total Staff: {result.totalAllocatedManpower + result.totalIdleAssociates}
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [`${val} Associates`, 'Allocation']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Workload vs Capacity */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Department Required vs Allocated Labor Hours
            </h3>
            <span className="text-xs font-semibold text-slate-500">Hours</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="department" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="Required Hours" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Allocated Hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Department Breakdown Cards & Manual Overrides Slider Panel */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-500" />
              Department Workforce Details & Manual Override Controls
            </h3>
            <p className="text-xs text-slate-500">
              Directly adjust manpower assignments per department to test custom allocation strategies.
            </p>
          </div>

          {isManualActive && (
            <button
              onClick={() => setManualOverrides({})}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              Clear Overrides
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Inbound Card */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                1. Inbound Receiving
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {result.inbound.utilizationPct}% Utilized
              </span>
            </div>

            <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Items to Receive:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {result.inbound.rawWorkloadUnits.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Required Labor:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {result.inbound.laborHoursRequired} hrs ({result.inbound.baseManpowerRequired} Staff)
                </span>
              </div>
              <div className="flex justify-between">
                <span>Effective IPP:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {result.inbound.effectiveIpp} items/hr
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                <span>Assigned Staff:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {manualOverrides.inboundManpower ?? result.inbound.totalAllocatedManpower} Staff
                </span>
              </label>
              <input
                type="range"
                min="0"
                max="40"
                value={manualOverrides.inboundManpower ?? result.inbound.totalAllocatedManpower}
                onChange={(e) =>
                  setManualOverrides({ ...manualOverrides, inboundManpower: Number(e.target.value) })
                }
                className="w-full mt-1 accent-blue-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Outbound Card */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wide">
                2. Outbound Dispatch
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {result.outbound.utilizationPct}% Utilized
              </span>
            </div>

            <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Items to Pick/Pack:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {result.outbound.rawWorkloadUnits.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Required Labor:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {result.outbound.laborHoursRequired} hrs ({result.outbound.baseManpowerRequired} Staff)
                </span>
              </div>
              <div className="flex justify-between">
                <span>Effective IPP:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {result.outbound.effectiveIpp} items/hr
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                <span>Assigned Staff:</span>
                <span className="font-bold text-violet-600 dark:text-violet-400">
                  {manualOverrides.outboundManpower ?? result.outbound.totalAllocatedManpower} Staff
                </span>
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={manualOverrides.outboundManpower ?? result.outbound.totalAllocatedManpower}
                onChange={(e) =>
                  setManualOverrides({ ...manualOverrides, outboundManpower: Number(e.target.value) })
                }
                className="w-full mt-1 accent-violet-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Audit Card */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wide">
                3. Quality Audit Trail
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {result.audit.utilizationPct}% Utilized
              </span>
            </div>

            <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Sample Audited Items:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {result.audit.rawWorkloadUnits.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Required Labor:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {result.audit.laborHoursRequired} hrs ({result.audit.baseManpowerRequired} Staff)
                </span>
              </div>
              <div className="flex justify-between">
                <span>Effective IPP:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {result.audit.effectiveIpp} items/hr
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                <span>Assigned Staff:</span>
                <span className="font-bold text-cyan-600 dark:text-cyan-400">
                  {manualOverrides.auditManpower ?? result.audit.totalAllocatedManpower} Staff
                </span>
              </label>
              <input
                type="range"
                min="0"
                max="25"
                value={manualOverrides.auditManpower ?? result.audit.totalAllocatedManpower}
                onChange={(e) =>
                  setManualOverrides({ ...manualOverrides, auditManpower: Number(e.target.value) })
                }
                className="w-full mt-1 accent-cyan-600 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
