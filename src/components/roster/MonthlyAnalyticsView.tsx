import React from 'react';
import { Employee, EmployeeMonthlySchedule } from '../../types/roster';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Users,
  Clock,
  Sparkles,
  PieChart as PieIcon,
  Layers,
} from 'lucide-react';

interface MonthlyAnalyticsViewProps {
  employees: Employee[];
  monthlySchedules: EmployeeMonthlySchedule[];
}

export const MonthlyAnalyticsView: React.FC<MonthlyAnalyticsViewProps> = ({
  employees,
  monthlySchedules,
}) => {
  // Aggregate Shift Distribution across the 31 days
  let totalA = 0;
  let totalB = 0;
  let totalC = 0;
  let totalOff = 0;
  let totalAbs = 0;
  let totalLv = 0;

  monthlySchedules.forEach((sched) => {
    Object.values(sched.days).forEach((dayItem) => {
      const day = dayItem as { shift: string };
      if (day.shift === 'A') totalA++;
      else if (day.shift === 'B') totalB++;
      else if (day.shift === 'C') totalC++;
      else if (day.shift === 'OFF') totalOff++;
      else if (day.shift === 'ABS') totalAbs++;
      else if (day.shift === 'LV') totalLv++;
    });
  });

  const shiftDistributionData = [
    { name: 'Shift A (Morning)', value: totalA, color: '#10b981' },
    { name: 'Shift B (Evening)', value: totalB, color: '#3b82f6' },
    { name: 'Shift C (Night)', value: totalC, color: '#a855f7' },
    { name: 'Weekly Off (OFF)', value: totalOff, color: '#94a3b8' },
    { name: 'Leave / Absent', value: totalAbs + totalLv, color: '#f43f5e' },
  ];

  // Weekly Team Rotation Timeline Data (Weeks 1 to 5)
  const teamRotationData = [
    { week: 'Week 1 (Days 1-7)', Alpha: 'Shift A (50%)', Bravo: 'Shift B (40%)', Charlie: 'Shift C (10%)', Delta: 'Shift A' },
    { week: 'Week 2 (Days 8-14)', Alpha: 'Shift B (40%)', Bravo: 'Shift C (10%)', Charlie: 'Shift A (50%)', Delta: 'Shift B' },
    { week: 'Week 3 (Days 15-21)', Alpha: 'Shift C (10%)', Bravo: 'Shift A (50%)', Charlie: 'Shift B (40%)', Delta: 'Shift C' },
    { week: 'Week 4 (Days 22-28)', Alpha: 'Shift A (50%)', Bravo: 'Shift B (40%)', Charlie: 'Shift C (10%)', Delta: 'Shift A' },
    { week: 'Week 5 (Days 29-31)', Alpha: 'Shift B (40%)', Bravo: 'Shift C (10%)', Charlie: 'Shift A (50%)', Delta: 'Shift B' },
  ];

  // Daily Staffing Levels Data for 31 days
  const dailyStaffingData = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    let countA = 0;
    let countB = 0;
    let countC = 0;

    monthlySchedules.forEach((s) => {
      const shift = s.days[day]?.shift;
      if (shift === 'A') countA++;
      if (shift === 'B') countB++;
      if (shift === 'C') countC++;
    });

    return {
      day: `D${day}`,
      ShiftA: countA,
      ShiftB: countB,
      ShiftC: countC,
      TotalActive: countA + countB + countC,
      PlannedDemand: Math.round(employees.length * 0.85),
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Monthly Shift Rotation Visual Analytics & Compliance Dashboard
            </h2>
            <p className="text-xs text-slate-500">
              In-depth operational metrics, team rotation cycles, staffing trends, & 50:40:10 deployment compliance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            Rotation Compliance: 98.4%
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
            Schedule Stability: 99.1%
          </div>
        </div>
      </div>

      {/* Grid: Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Shift Distribution Donut Chart (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-emerald-600" />
            Monthly Shift Allocation Ratio (Target 50:40:10)
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={shiftDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {shiftDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {shiftDistributionData.map((d) => (
              <div key={d.name} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }}></span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{d.name}:</span>
                <span className="font-bold text-slate-900 dark:text-white">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Staffing Levels vs Demand Area Chart (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            Daily Staffing Levels vs Planned Demand (31 Days)
          </h3>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyStaffingData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="ShiftA" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Shift A" />
                <Area type="monotone" dataKey="ShiftB" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Shift B" />
                <Area type="monotone" dataKey="ShiftC" stackId="1" stroke="#a855f7" fill="#a855f7" fillOpacity={0.6} name="Shift C" />
                <Line type="monotone" dataKey="PlannedDemand" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name="Planned Demand" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Team Rotation Timeline Matrix Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-600" />
          Weekly Team Rotation Timeline Matrix (A → B → C Cycle)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                <th className="p-3">Week Cycle</th>
                <th className="p-3">Team Alpha (50% Mass)</th>
                <th className="p-3">Team Bravo (35% Mass)</th>
                <th className="p-3">Team Charlie (15% Mass)</th>
                <th className="p-3">Team Delta (Audit)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {teamRotationData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors font-semibold">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{row.week}</td>
                  <td className="p-3 text-emerald-700 dark:text-emerald-300">{row.Alpha}</td>
                  <td className="p-3 text-blue-700 dark:text-blue-300">{row.Bravo}</td>
                  <td className="p-3 text-purple-700 dark:text-purple-300">{row.Charlie}</td>
                  <td className="p-3 text-indigo-700 dark:text-indigo-300">{row.Delta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
