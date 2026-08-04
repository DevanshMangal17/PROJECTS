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
import { DollarSign, Tag, TrendingUp, Calculator, Shield } from 'lucide-react';
import { SimulationResult, FinancialRates } from '../types';

interface CostAnalysisViewProps {
  result: SimulationResult;
  financials: FinancialRates;
}

export const CostAnalysisView: React.FC<CostAnalysisViewProps> = ({ result, financials }) => {
  const costPieData = [
    { name: 'Regular Operators', value: result.regularLaborCost, color: '#3b82f6' },
    { name: 'Overtime Premium', value: result.overtimeCost, color: '#f59e0b' },
    { name: 'Temp Staffing', value: result.tempWorkerCost, color: '#10b981' },
    { name: 'Supervisors', value: result.supervisorCost, color: '#6366f1' },
  ].filter((c) => c.value > 0);

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-slate-900 text-white shadow-md border border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Financial Labor Cost Engine & Unit Economics
          </h2>
          <p className="text-xs text-slate-400">
            Total payroll expenditure breakdown, overtime premium impact, temporary staffing cost, and unit cost metrics.
          </p>
        </div>
      </div>

      {/* Top Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            Total Daily Labor Payroll
          </span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            ${result.totalLaborCost.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Includes Regular, OT, Temp & Supervision</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            Cost per Order
          </span>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            ${result.costPerOrder}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Labor expense per shipped order</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            Cost per Item / Unit
          </span>
          <div className="text-2xl font-bold text-violet-600 dark:text-violet-400 mt-1">
            ${result.costPerUnit}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Labor expense per processed unit</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            Overtime Premium Share
          </span>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            ${result.overtimeCost.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {((result.overtimeCost / Math.max(1, result.totalLaborCost)) * 100).toFixed(1)}% of total labor cost
          </p>
        </div>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Breakdown Donut */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Payroll Cost Component Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: $${value}`}
                >
                  {costPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [`$${val.toLocaleString()}`, 'Cost']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial Rates Configuration Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Financial Cost Matrix & Hourly Pay Rates
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex justify-between items-center">
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">Operator Base Rate</div>
                <div className="text-[11px] text-slate-500">Standard shift hourly pay</div>
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                ${financials.operatorCostPerHour}/hr
              </span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex justify-between items-center">
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">Overtime Rate</div>
                <div className="text-[11px] text-slate-500">Base x {financials.overtimeMultiplier} multiplier</div>
              </div>
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                ${(financials.operatorCostPerHour * financials.overtimeMultiplier).toFixed(2)}/hr
              </span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex justify-between items-center">
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">Temporary Staff Agency Rate</div>
                <div className="text-[11px] text-slate-500">3PL / Agency call-in rate</div>
              </div>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                ${financials.tempWorkerCostPerHour}/hr
              </span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex justify-between items-center">
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">Supervisor Salary Rate</div>
                <div className="text-[11px] text-slate-500">Operations management overhead</div>
              </div>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                ${financials.supervisorCostPerHour}/hr
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
