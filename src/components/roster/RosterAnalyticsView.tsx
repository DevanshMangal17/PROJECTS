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
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Employee, ShiftRatioConfig, DailyShiftMetrics } from '../../types/roster';
import { DAYS_OF_WEEK } from '../../utils/rosterEngine';
import { BarChart3, TrendingUp, ShieldCheck, AlertTriangle } from 'lucide-react';

interface RosterAnalyticsViewProps {
  employees: Employee[];
  metrics: {
    shiftA: DailyShiftMetrics;
    shiftB: DailyShiftMetrics;
    shiftC: DailyShiftMetrics;
  };
  config: ShiftRatioConfig;
}

export const RosterAnalyticsView: React.FC<RosterAnalyticsViewProps> = ({
  employees,
  metrics,
  config,
}) => {
  // Shift distribution data
  const shiftPieData = [
    { name: 'Shift A (Morning)', value: metrics.shiftA.actualManpower, color: '#10b981' },
    { name: 'Shift B (Evening)', value: metrics.shiftB.actualManpower, color: '#0284c7' },
    { name: 'Shift C (Night)', value: metrics.shiftC.actualManpower, color: '#6366f1' },
  ];

  // Department headcount data
  const deptData = [
    {
      department: 'Inbound',
      count: employees.filter((e) => e.department === 'Inbound').length,
      crossTrained: employees.filter((e) => e.department === 'Inbound' && e.isCrossTrained).length,
    },
    {
      department: 'Outbound',
      count: employees.filter((e) => e.department === 'Outbound').length,
      crossTrained: employees.filter((e) => e.department === 'Outbound' && e.isCrossTrained).length,
    },
    {
      department: 'Audit',
      count: employees.filter((e) => e.department === 'Audit').length,
      crossTrained: employees.filter((e) => e.department === 'Audit' && e.isCrossTrained).length,
    },
  ];

  // Consecutive Days distribution
  const consecutiveDaysData = [
    { range: '1-3 Days', count: employees.filter((e) => e.consecutiveWorkingDays <= 3).length },
    { range: '4-6 Days', count: employees.filter((e) => e.consecutiveWorkingDays >= 4 && e.consecutiveWorkingDays <= 6).length },
    { range: '7-8 Days', count: employees.filter((e) => e.consecutiveWorkingDays >= 7 && e.consecutiveWorkingDays <= 8).length },
    { range: '9+ Days (Limit)', count: employees.filter((e) => e.consecutiveWorkingDays >= 9).length },
  ];

  // Overtime trend mockup
  const otTrendData = DAYS_OF_WEEK.map((day, idx) => ({
    day,
    otHours: Math.round(5 + Math.sin(idx) * 4 + idx * 0.8),
    cost: Math.round((5 + Math.sin(idx) * 4 + idx * 0.8) * 35),
  }));

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-slate-900 text-white shadow-md border border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Workforce Intelligence & Roster Compliance Analytics
          </h2>
          <p className="text-xs text-slate-400">
            Real-time monitoring of A:B:C shift ratios, 9-day consecutive working rules, and OT expenditure.
          </p>
        </div>
      </div>

      {/* Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shift Distribution Donut Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            A:B:C Shift Deployment vs Standard ({config.aShiftPct}% : {config.bShiftPct}% : {config.cShiftPct}%)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={shiftPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {shiftPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    color: '#fff',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Staffing & Cross-Training Bar Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Department Headcount & Cross-Trained Capability
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="department" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    color: '#fff',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="count" name="Total Headcount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="crossTrained" name="Cross-Trained" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Consecutive Working Days Risk Analysis */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Consecutive Working Days Distribution (9-Day Rest Rule Enforcement)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consecutiveDaysData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="range" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    color: '#fff',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" name="Associates" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Overtime Hours Trend Line Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Weekly Overtime Expenditure Trend ($)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={otTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    color: '#fff',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="cost"
                  name="OT Cost ($)"
                  stroke="#a855f7"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
