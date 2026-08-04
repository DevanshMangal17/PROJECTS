import React, { useState } from 'react';
import {
  Employee,
  AttendanceStatus,
  DayOfWeek,
  ReplacementRecommendation,
} from '../../types/roster';
import {
  UserCheck,
  UserX,
  Clock,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface AttendancePanelProps {
  employees: Employee[];
  onUpdateAttendance: (employeeId: string, newStatus: AttendanceStatus) => void;
  recommendations: ReplacementRecommendation[];
  onApplyReplacement: (rec: ReplacementRecommendation) => void;
  currentDay: DayOfWeek;
  setCurrentDay: (day: DayOfWeek) => void;
}

export const AttendancePanel: React.FC<AttendancePanelProps> = ({
  employees,
  onUpdateAttendance,
  recommendations,
  onApplyReplacement,
  currentDay,
  setCurrentDay,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('all');

  const filteredEmps = employees.filter(
    (e) => selectedDept === 'all' || e.department === selectedDept
  );

  const totalEmps = employees.length;
  const presentCount = employees.filter((e) => e.status === 'Present').length;
  const absentCount = employees.filter((e) => e.status === 'Absent').length;
  const leaveCount = employees.filter((e) => e.status === 'Leave').length;

  return (
    <div className="space-y-6">
      {/* Attendance Stats Overview Header */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Active Roster Staff
            </span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {totalEmps} Headcount
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Distribution center roster</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Present & Deployed
            </span>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {presentCount} ({Math.round((presentCount / totalEmps) * 100)}%)
            </div>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
              Active shift manpower
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Unplanned Absences
            </span>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
              {absentCount} Staff
            </div>
            <p className="text-[10px] text-rose-500 mt-0.5">
              {absentCount > 0 ? 'Shortfall requires replacement' : 'Zero active absences'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
            <UserX className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Approved Leave / TR
            </span>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
              {leaveCount} Staff
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Planned operational absences</p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* AI Automated Absentee Replacement Recommendations Banner */}
      {recommendations.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white shadow-lg border border-indigo-800/60 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  AI Absentee Replacement & Shortage Optimization Engine
                </h3>
                <p className="text-xs text-indigo-200">
                  Automated priority matching: Cross-trained staff &rarr; High Rating &rarr; Low Consecutive Days &rarr; Low OT
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
              {recommendations.length} Active Shortages Resolved
            </span>
          </div>

          {/* Replacement Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wide block">
                      Absent Associate
                    </span>
                    <span className="text-sm font-bold text-white">
                      {rec.absentEmployeeName} ({rec.department} - Shift {rec.shift})
                    </span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {rec.matchPriority}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">
                      Recommended Replacement
                    </span>
                    <span className="font-bold text-emerald-400">
                      {rec.replacementEmployeeName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Action Type</span>
                    <span className="font-semibold text-indigo-300">{rec.actionType}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {rec.reasonExplanation}
                </p>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">
                    Est. Cost: <strong className="text-white">${rec.costImpact}</strong>
                  </span>

                  <button
                    onClick={() => onApplyReplacement(rec)}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Reallocate Roster</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Attendance Marking Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Daily Shift Attendance Register
            </h3>
            <p className="text-xs text-slate-500">
              Select associate status to trigger automatic shortfall calculations and intelligent AI replacement suggestions.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Filter Dept:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            >
              <option value="all">All Departments</option>
              <option value="Inbound">Inbound</option>
              <option value="Outbound">Outbound</option>
              <option value="Audit">Audit</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300">
                <th className="py-2.5 px-3 font-bold">Associate</th>
                <th className="py-2.5 px-3 font-bold">Department</th>
                <th className="py-2.5 px-3 font-bold">Shift</th>
                <th className="py-2.5 px-3 font-bold">Consecutive Days</th>
                <th className="py-2.5 px-3 font-bold">Mark Status</th>
                <th className="py-2.5 px-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredEmps.map((emp) => (
                <tr
                  key={emp.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-900 dark:text-white">{emp.name}</div>
                    <div className="text-[10px] text-slate-500">
                      {emp.id} • {emp.designation}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                    {emp.department}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 font-bold text-[10px] rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      Shift {emp.currentShift}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 font-bold text-[10px] rounded ${
                        emp.consecutiveWorkingDays >= 9
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {emp.consecutiveWorkingDays} Days
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1">
                      {(
                        ['Present', 'Absent', 'Leave', 'Half Day', 'Training'] as AttendanceStatus[]
                      ).map((st) => (
                        <button
                          key={st}
                          onClick={() => onUpdateAttendance(emp.id, st)}
                          className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors ${
                            emp.status === st
                              ? st === 'Present'
                                ? 'bg-emerald-600 text-white'
                                : st === 'Absent'
                                ? 'bg-rose-600 text-white'
                                : 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    {emp.status === 'Absent' ? (
                      <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Shortfall Triggered
                      </span>
                    ) : (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" /> Deployed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
