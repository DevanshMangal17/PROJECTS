import React from 'react';
import {
  Employee,
  EmployeeWeeklySchedule,
  ReplacementRecommendation,
} from '../../types/roster';
import { DAYS_OF_WEEK } from '../../utils/rosterEngine';
import { FileText, Printer, FileSpreadsheet, ShieldCheck, Download } from 'lucide-react';

interface RosterReportsViewProps {
  employees: Employee[];
  schedules: EmployeeWeeklySchedule[];
  replacementLogs: ReplacementRecommendation[];
  onExportCsv: () => void;
  onPrint: () => void;
}

export const RosterReportsView: React.FC<RosterReportsViewProps> = ({
  employees,
  schedules,
  replacementLogs,
  onExportCsv,
  onPrint,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="p-4 rounded-xl bg-slate-900 text-white shadow-md border border-slate-800 flex items-center justify-between flex-wrap gap-3 print:hidden">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Official Weekly Manpower Roster & Compliance Register
          </h2>
          <p className="text-xs text-slate-400">
            Formatted printable report suitable for distribution center managers and HR compliance audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Roster CSV</span>
          </button>
          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Roster PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Paper Document */}
      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 print:shadow-none print:border-none print:p-0">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              ApexWMS Distribution Center - Weekly Staff Roster
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Week of {new Date().toLocaleDateString()} • Total Active Workforce: {employees.length} Associates
            </p>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Labor Law Compliant
            </span>
          </div>
        </div>

        {/* Weekly Schedule Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            7-Day Weekly Shift Assignment Schedule
          </h3>
          <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <th className="py-2 px-3">Associate</th>
                <th className="py-2 px-2">Dept</th>
                <th className="py-2 px-2">Contract</th>
                {DAYS_OF_WEEK.map((d) => (
                  <th key={d} className="py-2 px-2 text-center">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {employees.map((emp) => {
                const sched = schedules.find((s) => s.employeeId === emp.id);
                return (
                  <tr key={emp.id}>
                    <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">
                      {emp.name} ({emp.id})
                    </td>
                    <td className="py-2 px-2 text-slate-600 dark:text-slate-400">{emp.department}</td>
                    <td className="py-2 px-2 text-slate-500">{emp.contractType}</td>
                    {DAYS_OF_WEEK.map((d) => (
                      <td key={d} className="py-2 px-2 text-center font-bold">
                        {sched?.schedule[d]?.shift || 'A'}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Replacement Action Log Table */}
        {replacementLogs.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Absentee Replacement & Roster Modification Audit Log
            </h3>
            <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <tr>
                  <th className="py-2 px-3">Time</th>
                  <th className="py-2 px-3">Absent Associate</th>
                  <th className="py-2 px-3">Dept / Shift</th>
                  <th className="py-2 px-3">Reassigned Replacement</th>
                  <th className="py-2 px-3">Priority Rule</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {replacementLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-2 px-3 text-slate-500">{log.timestamp}</td>
                    <td className="py-2 px-3 font-semibold text-rose-600 dark:text-rose-400">
                      {log.absentEmployeeName}
                    </td>
                    <td className="py-2 px-3">
                      {log.department} - {log.shift}
                    </td>
                    <td className="py-2 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                      {log.replacementEmployeeName}
                    </td>
                    <td className="py-2 px-3 text-slate-500">{log.matchPriority}</td>
                    <td className="py-2 px-3 font-bold text-indigo-600 dark:text-indigo-400">
                      {log.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
