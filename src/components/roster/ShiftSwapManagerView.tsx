import React, { useState } from 'react';
import {
  Employee,
  ShiftSwapRecord,
  EmployeeMonthlySchedule,
  ShiftRatioConfig,
} from '../../types/roster';
import { validateShiftSwap } from '../../utils/monthlyRotationEngine';
import {
  ArrowLeftRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  ShieldCheck,
  Search,
  UserCheck,
  FileText,
  Clock,
  Sparkles,
  Zap,
} from 'lucide-react';

interface ShiftSwapManagerViewProps {
  employees: Employee[];
  monthlySchedules: EmployeeMonthlySchedule[];
  swapLogs: ShiftSwapRecord[];
  onAddSwapRecord: (swap: ShiftSwapRecord) => void;
  config?: ShiftRatioConfig;
}

export const ShiftSwapManagerView: React.FC<ShiftSwapManagerViewProps> = ({
  employees,
  monthlySchedules,
  swapLogs,
  onAddSwapRecord,
  config,
}) => {
  const [emp1Id, setEmp1Id] = useState<string>(employees[0]?.id || '');
  const [emp2Id, setEmp2Id] = useState<string>(employees[1]?.id || '');
  const [swapDay, setSwapDay] = useState<number>(12); // Day 12
  const [searchQuery, setSearchQuery] = useState<string>('');

  const emp1 = employees.find((e) => e.id === emp1Id);
  const emp2 = employees.find((e) => e.id === emp2Id);

  // Live Validation Preview
  const liveValidation = emp1 && emp2 ? validateShiftSwap(emp1, emp2, swapDay, monthlySchedules, config) : null;

  const handleCreateSwap = () => {
    if (liveValidation) {
      onAddSwapRecord(liveValidation);
    }
  };

  const filteredLogs = swapLogs.filter((log) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.emp1Name.toLowerCase().includes(q) ||
      log.emp2Name.toLowerCase().includes(q) ||
      log.supervisor.toLowerCase().includes(q) ||
      log.reason.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Supervisor Shift Swap Management & Compliance Logger
            </h2>
            <p className="text-xs text-slate-500">
              Validate and execute shift swaps between associates while enforcing rotation sequence, skills, & consecutive day limits.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>Compliance Guard Active</span>
        </div>
      </div>

      {/* Grid Layout: Create Swap Form & Rules Checker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Create Shift Swap Card (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Plus className="w-4 h-4 text-purple-600" />
            Initiate New Shift Swap Request
          </h3>

          <div className="space-y-3">
            {/* Associate 1 Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                First Associate (Requester)
              </label>
              <select
                value={emp1Id}
                onChange={(e) => setEmp1Id(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.department} - {e.team || 'Team Alpha'})
                  </option>
                ))}
              </select>
            </div>

            {/* Associate 2 Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Second Associate (Swap Partner)
              </label>
              <select
                value={emp2Id}
                onChange={(e) => setEmp2Id(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.department} - {e.team || 'Team Alpha'})
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Day Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Target Swap Date (August 2026)
              </label>
              <select
                value={swapDay}
                onChange={(e) => setSwapDay(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    Day {d} (August {d}, 2026)
                  </option>
                ))}
              </select>
            </div>

            {/* Live Compliance Checks Preview */}
            {liveValidation && (
              <div
                className={`p-3.5 rounded-xl border space-y-2 text-xs ${
                  liveValidation.isValid
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    {liveValidation.isValid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600" />
                    )}
                    <span>
                      {liveValidation.isValid ? 'Compliance Checks Passed' : 'Swap Rule Violations Detected'}
                    </span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-white/50 dark:bg-slate-900/50">
                    Day {swapDay}
                  </span>
                </div>

                <ul className="space-y-1 text-[11px] list-disc list-inside opacity-90">
                  {liveValidation.validationNotes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Submit Button */}
            <button
              onClick={handleCreateSwap}
              disabled={!liveValidation?.isValid}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-purple-500/20 disabled:opacity-40 hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Submit & Log Approved Shift Swap</span>
            </button>
          </div>
        </div>

        {/* Shift Change Log Table (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Approved Shift Change Log ({filteredLogs.length})
            </h3>

            {/* Search Filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter logs..."
                className="pl-8 pr-3 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Associates Swapped</th>
                  <th className="p-2.5 text-center">Shifts</th>
                  <th className="p-2.5">Supervisor</th>
                  <th className="p-2.5 text-right">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-2.5 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {log.swapDate}
                    </td>
                    <td className="p-2.5">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {log.emp1Name} ↔ {log.emp2Name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                        {log.reason}
                      </div>
                    </td>
                    <td className="p-2.5 text-center font-extrabold whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                        {log.emp1OriginalShift} ↔ {log.emp2OriginalShift}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-400 text-[11px] whitespace-nowrap">
                      {log.supervisor}
                    </td>
                    <td className="p-2.5 text-right whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 ${
                          log.status === 'Approved'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {log.status === 'Approved' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        <span>{log.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
