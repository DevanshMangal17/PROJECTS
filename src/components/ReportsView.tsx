import React from 'react';
import { FileText, Download, Printer, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { SimulationResult, GeneralInputs } from '../types';

interface ReportsViewProps {
  result: SimulationResult;
  inputs: GeneralInputs;
  onExportCsv: () => void;
  onPrint: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  result,
  inputs,
  onExportCsv,
  onPrint,
}) => {
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-slate-900 text-white shadow-md border border-slate-800 flex items-center justify-between flex-wrap gap-3 print:hidden">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Executive Daily Shift Manpower & Operational Report
          </h2>
          <p className="text-xs text-slate-400">
            Formatted printable report suitable for distribution center plant managers and operations heads.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Paper Container */}
      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 print:shadow-none print:border-none print:p-0">
        {/* Report Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              ApexWMS Distribution Center Daily Manpower Plan
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Generated: {new Date().toLocaleDateString()} • Shift: {inputs.workingShiftMins} mins (Net {result.effectiveShiftMins} mins)
            </p>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
              Approved Shift Plan
            </span>
          </div>
        </div>

        {/* Executive Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Workload</div>
            <div className="text-base font-bold text-slate-900 dark:text-white">
              {inputs.totalOrders.toLocaleString()} Orders / {inputs.totalUnits.toLocaleString()} Units
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Allocated Staff</div>
            <div className="text-base font-bold text-slate-900 dark:text-white">
              {result.totalAllocatedManpower} Headcount
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Utilization %</div>
            <div className="text-base font-bold text-blue-600 dark:text-blue-400">
              {result.overallUtilizationPct}%
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Labor Cost</div>
            <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
              ${result.totalLaborCost.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Department Breakdown Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Department Labor Breakdown</h3>
          <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Workload Units</th>
                <th className="py-2.5 px-3">Effective IPP</th>
                <th className="py-2.5 px-3">Required Labor Hrs</th>
                <th className="py-2.5 px-3">Allocated Staff</th>
                <th className="py-2.5 px-3">Overtime Hrs</th>
                <th className="py-2.5 px-3">Utilization %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              <tr>
                <td className="py-2.5 px-3 font-semibold">Inbound Receiving</td>
                <td className="py-2.5 px-3">{result.inbound.rawWorkloadUnits.toLocaleString()}</td>
                <td className="py-2.5 px-3">{result.inbound.effectiveIpp}</td>
                <td className="py-2.5 px-3">{result.inbound.laborHoursRequired}</td>
                <td className="py-2.5 px-3 font-semibold">{result.inbound.totalAllocatedManpower}</td>
                <td className="py-2.5 px-3">{result.inbound.assignedOvertimeHours}</td>
                <td className="py-2.5 px-3 font-bold">{result.inbound.utilizationPct}%</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold">Outbound Dispatch</td>
                <td className="py-2.5 px-3">{result.outbound.rawWorkloadUnits.toLocaleString()}</td>
                <td className="py-2.5 px-3">{result.outbound.effectiveIpp}</td>
                <td className="py-2.5 px-3">{result.outbound.laborHoursRequired}</td>
                <td className="py-2.5 px-3 font-semibold">{result.outbound.totalAllocatedManpower}</td>
                <td className="py-2.5 px-3">{result.outbound.assignedOvertimeHours}</td>
                <td className="py-2.5 px-3 font-bold">{result.outbound.utilizationPct}%</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold">Quality Audit Trail</td>
                <td className="py-2.5 px-3">{result.audit.rawWorkloadUnits.toLocaleString()}</td>
                <td className="py-2.5 px-3">{result.audit.effectiveIpp}</td>
                <td className="py-2.5 px-3">{result.audit.laborHoursRequired}</td>
                <td className="py-2.5 px-3 font-semibold">{result.audit.totalAllocatedManpower}</td>
                <td className="py-2.5 px-3">{result.audit.assignedOvertimeHours}</td>
                <td className="py-2.5 px-3 font-bold">{result.audit.utilizationPct}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Financial Expense Summary Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Financial Labor Expense Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500">Regular Staff Payroll</span>
              <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                ${result.regularLaborCost.toLocaleString()}
              </div>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500">Overtime Premium</span>
              <div className="font-bold text-amber-600 dark:text-amber-400 text-sm mt-0.5">
                ${result.overtimeCost.toLocaleString()}
              </div>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500">Temporary Agency Staff</span>
              <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">
                ${result.tempWorkerCost.toLocaleString()}
              </div>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500">Supervision Overhead</span>
              <div className="font-bold text-indigo-600 dark:text-indigo-400 text-sm mt-0.5">
                ${result.supervisorCost.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations Summary */}
        <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Operational Action Items</h3>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">{rec.title}: </span>
                  <span>{rec.message}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
