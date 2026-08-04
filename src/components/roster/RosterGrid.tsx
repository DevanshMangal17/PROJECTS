import React, { useState } from 'react';
import {
  Employee,
  DayOfWeek,
  ShiftCode,
  EmployeeWeeklySchedule,
  RosterFilterState,
} from '../../types/roster';
import { DAYS_OF_WEEK } from '../../utils/rosterEngine';
import {
  Filter,
  Search,
  Lock,
  Unlock,
  RefreshCw,
  AlertTriangle,
  UserCheck,
  Zap,
  Check,
} from 'lucide-react';

interface RosterGridProps {
  employees: Employee[];
  schedules: EmployeeWeeklySchedule[];
  onUpdateShift: (employeeId: string, day: DayOfWeek, newShift: ShiftCode) => void;
  onAutoRegenerate: () => void;
  isLocked: boolean;
  setIsLocked: (locked: boolean) => void;
}

const SHIFT_COLOR_MAP: Record<ShiftCode, { bg: string; text: string; label: string }> = {
  A: { bg: 'bg-emerald-500/15 border-emerald-500/30 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-300', label: 'Shift A (50%)' },
  B: { bg: 'bg-sky-500/15 border-sky-500/30 dark:bg-sky-500/20', text: 'text-sky-700 dark:text-sky-300', label: 'Shift B (40%)' },
  C: { bg: 'bg-indigo-500/15 border-indigo-500/30 dark:bg-indigo-500/20', text: 'text-indigo-700 dark:text-indigo-300', label: 'Shift C (10%)' },
  OFF: { bg: 'bg-slate-200/60 border-slate-300 dark:bg-slate-800 dark:border-slate-700', text: 'text-slate-600 dark:text-slate-400', label: 'Weekly Off' },
  TR: { bg: 'bg-amber-500/15 border-amber-500/30 dark:bg-amber-500/20', text: 'text-amber-700 dark:text-amber-300', label: 'Training' },
  ABS: { bg: 'bg-rose-500/15 border-rose-500/30 dark:bg-rose-500/20', text: 'text-rose-700 dark:text-rose-300', label: 'Absent' },
  LV: { bg: 'bg-purple-500/15 border-purple-500/30 dark:bg-purple-500/20', text: 'text-purple-700 dark:text-purple-300', label: 'Leave' },
  OT: { bg: 'bg-fuchsia-500/15 border-fuchsia-500/30 dark:bg-fuchsia-500/20', text: 'text-fuchsia-700 dark:text-fuchsia-300', label: 'Overtime Shift' },
  CO: { bg: 'bg-indigo-500/15 border-indigo-500/30 dark:bg-indigo-500/20', text: 'text-indigo-700 dark:text-indigo-300', label: 'Compensatory Off' },
  HOL: { bg: 'bg-sky-500/15 border-sky-500/30 dark:bg-sky-500/20', text: 'text-sky-700 dark:text-sky-300', label: 'Public Holiday' },
};

export const RosterGrid: React.FC<RosterGridProps> = ({
  employees,
  schedules,
  onUpdateShift,
  onAutoRegenerate,
  isLocked,
  setIsLocked,
}) => {
  const [filters, setFilters] = useState<RosterFilterState>({
    department: 'all',
    shift: 'all',
    skill: 'all',
    contract: 'all',
    searchQuery: '',
    performanceMin: 0,
    onlyCrossTrained: false,
    onlyHighRiskConsecutiveDays: false,
  });

  const [activeCell, setActiveCell] = useState<{ empId: string; day: DayOfWeek } | null>(null);

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    if (filters.department !== 'all' && emp.department !== filters.department) return false;
    if (filters.skill !== 'all' && emp.skillLevel !== filters.skill) return false;
    if (filters.contract !== 'all' && emp.contractType !== filters.contract) return false;
    if (filters.onlyCrossTrained && !emp.isCrossTrained) return false;
    if (filters.onlyHighRiskConsecutiveDays && emp.consecutiveWorkingDays < 8) return false;
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      return (
        emp.name.toLowerCase().includes(q) ||
        emp.id.toLowerCase().includes(q) ||
        emp.designation.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Controls & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Left Search & Dropdowns */}
        <div className="flex items-center flex-wrap gap-2 text-xs flex-1">
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search associate by name, ID or title..."
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <select
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
          >
            <option value="all">All Departments</option>
            <option value="Inbound">Inbound</option>
            <option value="Outbound">Outbound</option>
            <option value="Audit">Audit</option>
          </select>

          <select
            value={filters.skill}
            onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
          >
            <option value="all">All Skill Levels</option>
            <option value="expert">Expert</option>
            <option value="skilled">Skilled</option>
            <option value="beginner">Beginner</option>
          </select>

          <button
            onClick={() => setFilters({ ...filters, onlyCrossTrained: !filters.onlyCrossTrained })}
            className={`px-3 py-1.5 rounded-xl border font-semibold flex items-center gap-1.5 transition-colors ${
              filters.onlyCrossTrained
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Cross-Trained Only</span>
          </button>

          <button
            onClick={() =>
              setFilters({
                ...filters,
                onlyHighRiskConsecutiveDays: !filters.onlyHighRiskConsecutiveDays,
              })
            }
            className={`px-3 py-1.5 rounded-xl border font-semibold flex items-center gap-1.5 transition-colors ${
              filters.onlyHighRiskConsecutiveDays
                ? 'bg-rose-600 text-white border-rose-600'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-300" />
            <span>High Consecutive Days (&ge;8d)</span>
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setIsLocked(!isLocked)}
            className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition-colors ${
              isLocked
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{isLocked ? 'Schedule Locked' : 'Lock Schedule'}</span>
          </button>

          <button
            onClick={onAutoRegenerate}
            disabled={isLocked}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold flex items-center gap-1.5 hover:opacity-95 transition-opacity disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>AI Auto-Optimize Roster</span>
          </button>
        </div>
      </div>

      {/* Roster Legend */}
      <div className="flex items-center flex-wrap gap-3 px-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
        <span className="uppercase text-[10px] tracking-wider text-slate-400">Legend:</span>
        {Object.entries(SHIFT_COLOR_MAP).map(([code, meta]) => (
          <div key={code} className="flex items-center gap-1.5">
            <span
              className={`w-5 h-5 rounded-md border flex items-center justify-center font-bold text-[10px] ${meta.bg} ${meta.text}`}
            >
              {code}
            </span>
            <span>{meta.label}</span>
          </div>
        ))}
      </div>

      {/* Roster Matrix Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4 font-bold min-w-[220px]">Associate Profile</th>
                <th className="py-3 px-2 font-bold min-w-[100px]">Dept / Skill</th>
                <th className="py-3 px-2 font-bold text-center">Consec. Days</th>
                {DAYS_OF_WEEK.map((day) => (
                  <th key={day} className="py-3 px-2 text-center font-bold min-w-[70px]">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredEmployees.map((emp) => {
                const empSched = schedules.find((s) => s.employeeId === emp.id);
                const isHighRisk = emp.consecutiveWorkingDays >= 9;

                return (
                  <tr
                    key={emp.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Employee Profile */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            emp.department === 'Inbound'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : emp.department === 'Outbound'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                          }`}
                        >
                          {emp.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{emp.name}</span>
                            {emp.isCrossTrained && (
                              <span
                                title="Cross-Trained Associate"
                                className="px-1 py-0.2 text-[9px] font-bold rounded bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300"
                              >
                                XT
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            {emp.id} • {emp.designation}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Department & Skill */}
                    <td className="py-2.5 px-2">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        {emp.department}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">
                        {emp.skillLevel} ({emp.performanceRating}&#9733;)
                      </span>
                    </td>

                    {/* Consecutive Days Counter */}
                    <td className="py-2.5 px-2 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[11px] inline-block ${
                          isHighRisk
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse'
                            : emp.consecutiveWorkingDays >= 7
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {emp.consecutiveWorkingDays}d
                      </span>
                    </td>

                    {/* Shift Days Matrix */}
                    {DAYS_OF_WEEK.map((day) => {
                      const dayAssignment = empSched?.schedule[day]?.shift || emp.currentShift;
                      const shiftMeta = SHIFT_COLOR_MAP[dayAssignment] || SHIFT_COLOR_MAP.A;
                      const isEditing =
                        activeCell?.empId === emp.id && activeCell?.day === day;

                      return (
                        <td key={day} className="py-2.5 px-1 text-center relative">
                          <button
                            disabled={isLocked}
                            onClick={() =>
                              setActiveCell(isEditing ? null : { empId: emp.id, day })
                            }
                            className={`w-full py-1.5 px-1 rounded-lg border font-bold text-xs transition-all flex flex-col items-center justify-center ${
                              shiftMeta.bg
                            } ${shiftMeta.text} ${
                              !isLocked ? 'hover:scale-105 cursor-pointer' : 'cursor-default'
                            }`}
                          >
                            <span>{dayAssignment}</span>
                          </button>

                          {/* Quick Shift Selection Popover */}
                          {isEditing && !isLocked && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-30 p-2 rounded-xl bg-slate-900 text-white shadow-xl border border-slate-700 grid grid-cols-4 gap-1 min-w-[140px]">
                              {(['A', 'B', 'C', 'OFF', 'TR', 'ABS', 'LV', 'OT'] as ShiftCode[]).map(
                                (code) => (
                                  <button
                                    key={code}
                                    onClick={() => {
                                      onUpdateShift(emp.id, day, code);
                                      setActiveCell(null);
                                    }}
                                    className={`py-1 text-[11px] font-bold rounded hover:bg-slate-800 transition-colors ${
                                      dayAssignment === code ? 'ring-1 ring-blue-400 bg-blue-600/30' : ''
                                    }`}
                                  >
                                    {code}
                                  </button>
                                )
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
