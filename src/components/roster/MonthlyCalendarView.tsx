import React, { useState, useMemo } from 'react';
import {
  Employee,
  ShiftCode,
  EmployeeMonthlySchedule,
  DayShiftAssignment,
  ShiftRatioConfig,
} from '../../types/roster';
import {
  getDayOfWeekName,
  getWeekIndex,
  isWeekend,
  DAYS_IN_AUGUST,
} from '../../utils/monthlyRotationEngine';
import {
  Calendar as CalendarIcon,
  Filter,
  RefreshCw,
  Lock,
  Unlock,
  Undo2,
  Redo2,
  Eye,
  Search,
  CheckCircle2,
  AlertTriangle,
  Users,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface MonthlyCalendarViewProps {
  employees: Employee[];
  monthlySchedules: EmployeeMonthlySchedule[];
  onUpdateMonthlyShift: (employeeId: string, dayNumber: number, newShift: ShiftCode) => void;
  onRegenerateMonth: () => void;
  onRegenerateWeek: (weekIndex: number) => void;
  onToggleLockWeeklyOffs: () => void;
  isLockedAllOffs: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({
  employees,
  monthlySchedules,
  onUpdateMonthlyShift,
  onRegenerateMonth,
  onRegenerateWeek,
  onToggleLockWeeklyOffs,
  isLockedAllOffs,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}) => {
  // Filter States
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedShift, setSelectedShift] = useState<string>('All');
  const [selectedTeam, setSelectedTeam] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showPlannedVsActual, setShowPlannedVsActual] = useState<boolean>(false);
  const [selectedWeekRegen, setSelectedWeekRegen] = useState<number>(1);

  // Cell Editing Modal State
  const [editingCell, setEditingCell] = useState<{
    employeeId: string;
    employeeName: string;
    dayNumber: number;
    currentShift: ShiftCode;
  } | null>(null);

  // Filtered Employee List
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (selectedDept !== 'All' && emp.department !== selectedDept) return false;
      if (selectedShift !== 'All' && emp.currentShift !== selectedShift) return false;
      if (selectedTeam !== 'All' && emp.team !== selectedTeam) return false;
      if (
        searchQuery &&
        !emp.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !emp.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !emp.designation.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [employees, selectedDept, selectedShift, selectedTeam, searchQuery]);

  // Color Mapping Helper
  const getShiftBadgeStyle = (shift: ShiftCode) => {
    switch (shift) {
      case 'A':
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25';
      case 'B':
        return 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 hover:bg-blue-500/25';
      case 'C':
        return 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30 hover:bg-purple-500/25';
      case 'OFF':
        return 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
      case 'ABS':
        return 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30 font-bold';
      case 'LV':
        return 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 font-bold';
      case 'TR':
        return 'bg-yellow-500/20 text-yellow-800 dark:text-yellow-200 border-yellow-500/30';
      case 'OT':
        return 'bg-fuchsia-500/20 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-500/30 font-bold';
      case 'CO':
        return 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 font-bold';
      case 'HOL':
        return 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/30';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  // Shift Cell Handler
  const handleCellClick = (emp: Employee, dayNumber: number) => {
    const empSched = monthlySchedules.find((s) => s.employeeId === emp.id);
    const currShift = empSched?.days[dayNumber]?.shift || emp.currentShift;
    setEditingCell({
      employeeId: emp.id,
      employeeName: emp.name,
      dayNumber,
      currentShift: currShift,
    });
  };

  const handleApplyShiftChange = (newShift: ShiftCode) => {
    if (editingCell) {
      onUpdateMonthlyShift(editingCell.employeeId, editingCell.dayNumber, newShift);
      setEditingCell(null);
    }
  };

  // Daily Deployment Summary (Count A, B, C for each day 1..31)
  const dailySummary = useMemo(() => {
    const summary: Record<number, { a: number; b: number; c: number; off: number }> = {};

    for (let day = 1; day <= DAYS_IN_AUGUST; day++) {
      summary[day] = { a: 0, b: 0, c: 0, off: 0 };
      monthlySchedules.forEach((s) => {
        const shift = s.days[day]?.shift;
        if (shift === 'A') summary[day].a++;
        else if (shift === 'B') summary[day].b++;
        else if (shift === 'C') summary[day].c++;
        else if (shift === 'OFF' || shift === 'CO') summary[day].off++;
      });
    }

    return summary;
  }, [monthlySchedules]);

  return (
    <div className="space-y-5">
      {/* Top Controls & Manual Planning Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Monthly Shift Rotation Calendar (31-Day Planner)
              </h3>
              <p className="text-xs text-slate-500">
                Weekly fixed rotation (A → B → C) across 5 weeks with team staggering & compensatory off rules.
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Undo / Redo */}
            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-1">
              <button
                onClick={onUndo}
                disabled={!canUndo}
                title="Undo last change"
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 transition-all"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                title="Redo change"
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 transition-all"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>

            {/* Toggle Lock Weekly Offs */}
            <button
              onClick={onToggleLockWeeklyOffs}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isLockedAllOffs
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {isLockedAllOffs ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{isLockedAllOffs ? 'Weekly Offs Locked' : 'Lock Weekly Offs'}</span>
            </button>

            {/* Compare Planned vs Actual Toggle */}
            <button
              onClick={() => setShowPlannedVsActual(!showPlannedVsActual)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                showPlannedVsActual
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showPlannedVsActual ? 'Compare: ON' : 'Compare Planned/Actual'}</span>
            </button>

            {/* Single Week Regeneration Control */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-slate-500 px-1 text-[11px] font-medium">Regen:</span>
              <select
                value={selectedWeekRegen}
                onChange={(e) => setSelectedWeekRegen(Number(e.target.value))}
                className="bg-transparent font-bold text-slate-800 dark:text-slate-200 focus:outline-none text-xs"
              >
                <option value={1} className="dark:bg-slate-900">Week 1 (Days 1-7)</option>
                <option value={2} className="dark:bg-slate-900">Week 2 (Days 8-14)</option>
                <option value={3} className="dark:bg-slate-900">Week 3 (Days 15-21)</option>
                <option value={4} className="dark:bg-slate-900">Week 4 (Days 22-28)</option>
                <option value={5} className="dark:bg-slate-900">Week 5 (Days 29-31)</option>
              </select>
              <button
                onClick={() => onRegenerateWeek(selectedWeekRegen)}
                className="px-2 py-0.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors"
              >
                Regen Week
              </button>
            </div>

            {/* Full Month Regeneration Button */}
            <button
              onClick={onRegenerateMonth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-xs font-bold shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate Full Month</span>
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Department Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Departments</option>
              <option value="Inbound">Inbound Receiving</option>
              <option value="Outbound">Outbound Fulfillment</option>
              <option value="Audit">Audit & Quality</option>
            </select>
          </div>

          {/* Team Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Rotation Team</label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Teams</option>
              <option value="Team Alpha">Team Alpha (Starts W1 A)</option>
              <option value="Team Bravo">Team Bravo (Starts W1 B)</option>
              <option value="Team Charlie">Team Charlie (Starts W1 C)</option>
              <option value="Team Delta">Team Delta (Specialist)</option>
            </select>
          </div>

          {/* Shift Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Primary Shift</label>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Shifts</option>
              <option value="A">Shift A (Morning)</option>
              <option value="B">Shift B (Evening)</option>
              <option value="C">Shift C (Night)</option>
            </select>
          </div>

          {/* Search Query */}
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Search Employee</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by associate name, ID, designation..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Intuitive Color Legend */}
      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">
          Legend:
        </span>
        <div className="flex flex-wrap items-center gap-3 font-semibold text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
            <span className="text-slate-700 dark:text-slate-300">Shift A (50%)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-500 inline-block"></span>
            <span className="text-slate-700 dark:text-slate-300">Shift B (40%)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-purple-500 inline-block"></span>
            <span className="text-slate-700 dark:text-slate-300">Shift C (10%)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-400 inline-block"></span>
            <span className="text-slate-700 dark:text-slate-300">Weekly Off (OFF)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500 inline-block"></span>
            <span className="text-slate-700 dark:text-slate-300">Absent (ABS)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500 inline-block"></span>
            <span className="text-slate-700 dark:text-slate-300">Leave (LV)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-yellow-400 inline-block"></span>
            <span className="text-slate-700 dark:text-slate-300">Training (TR)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-fuchsia-500 inline-block"></span>
            <span className="text-slate-700 dark:text-slate-300">Overtime (OT)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-indigo-500 inline-block"></span>
            <span className="text-slate-700 dark:text-slate-300">Comp Off (CO)</span>
          </span>
        </div>
      </div>

      {/* Interactive 31-Day Calendar Matrix */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1300px]">
          <thead>
            {/* Week Headers Row */}
            <tr className="bg-slate-100 dark:bg-slate-800/80 text-[11px] font-extrabold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
              <th className="p-3 sticky left-0 z-20 bg-slate-100 dark:bg-slate-800 min-w-[220px]">
                Employee Information
              </th>
              <th colSpan={7} className="p-2 text-center border-l border-slate-300 dark:border-slate-700 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">
                Week 1 (Days 1–7)
              </th>
              <th colSpan={7} className="p-2 text-center border-l border-slate-300 dark:border-slate-700 bg-blue-500/10 text-blue-700 dark:text-blue-300">
                Week 2 (Days 8–14)
              </th>
              <th colSpan={7} className="p-2 text-center border-l border-slate-300 dark:border-slate-700 bg-purple-500/10 text-purple-700 dark:text-purple-300">
                Week 3 (Days 15–21)
              </th>
              <th colSpan={7} className="p-2 text-center border-l border-slate-300 dark:border-slate-700 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                Week 4 (Days 22–28)
              </th>
              <th colSpan={3} className="p-2 text-center border-l border-slate-300 dark:border-slate-700 bg-amber-500/10 text-amber-700 dark:text-amber-300">
                Week 5 (29–31)
              </th>
            </tr>

            {/* Days Header Row */}
            <tr className="bg-slate-50 dark:bg-slate-900 text-[10px] font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <th className="p-2.5 sticky left-0 z-20 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
                Associate / Team
              </th>
              {Array.from({ length: DAYS_IN_AUGUST }, (_, i) => i + 1).map((dayNum) => {
                const dow = getDayOfWeekName(dayNum);
                const isWknd = isWeekend(dayNum);
                return (
                  <th
                    key={dayNum}
                    className={`p-1.5 text-center min-w-[34px] border-l border-slate-200 dark:border-slate-800/60 ${
                      isWknd ? 'bg-amber-500/5 text-amber-700 dark:text-amber-400 font-extrabold' : ''
                    }`}
                  >
                    <div>{dayNum}</div>
                    <div className="text-[9px] font-normal text-slate-400">{dow}</div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {filteredEmployees.map((emp) => {
              const empSched = monthlySchedules.find((s) => s.employeeId === emp.id);

              return (
                <tr
                  key={emp.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Sticky Employee Info Column */}
                  <td className="p-2.5 sticky left-0 z-10 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/90 border-r border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {emp.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                          <span>{emp.name}</span>
                          {emp.team && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {emp.team}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {emp.id} • {emp.department} • {emp.designation}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 31 Day Shift Cells */}
                  {Array.from({ length: DAYS_IN_AUGUST }, (_, i) => i + 1).map((dayNum) => {
                    const dayAssign = empSched?.days[dayNum];
                    const shiftCode = dayAssign?.shift || 'A';
                    const badgeStyle = getShiftBadgeStyle(shiftCode);
                    const isMod = dayAssign?.modifiedManually;

                    return (
                      <td
                        key={dayNum}
                        onClick={() => handleCellClick(emp, dayNum)}
                        className={`p-1 text-center cursor-pointer border-l border-slate-100 dark:border-slate-800/50 transition-all hover:scale-105 ${
                          isWeekend(dayNum) ? 'bg-amber-500/5' : ''
                        }`}
                        title={`Day ${dayNum} (${getDayOfWeekName(dayNum)}): ${shiftCode} Shift - Click to Edit`}
                      >
                        <div
                          className={`py-1 px-0.5 rounded-lg border font-extrabold text-[11px] shadow-2xs flex items-center justify-center relative ${badgeStyle}`}
                        >
                          <span>{shiftCode}</span>
                          {isMod && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute top-0.5 right-0.5"></span>
                          )}
                          {dayAssign?.isCompOff && (
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 absolute bottom-0.5 right-0.5"></span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>

          {/* Daily Headcount Summary Footer */}
          <tfoot>
            <tr className="bg-slate-100 dark:bg-slate-800 text-[10px] font-bold border-t-2 border-slate-300 dark:border-slate-700">
              <td className="p-2.5 sticky left-0 z-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">
                Daily Deployment (A / B / C)
              </td>
              {Array.from({ length: DAYS_IN_AUGUST }, (_, i) => i + 1).map((dayNum) => {
                const s = dailySummary[dayNum] || { a: 0, b: 0, c: 0 };
                return (
                  <td key={dayNum} className="p-1 text-center border-l border-slate-200 dark:border-slate-700">
                    <div className="text-emerald-700 dark:text-emerald-400 font-extrabold">{s.a}A</div>
                    <div className="text-blue-700 dark:text-blue-400 font-extrabold">{s.b}B</div>
                    <div className="text-purple-700 dark:text-purple-400 font-extrabold">{s.c}C</div>
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Edit Shift Cell Modal / Dropdown */}
      {editingCell && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xl max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-600" />
                Change Shift Assignment
              </h4>
              <button
                onClick={() => setEditingCell(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <p>
                <strong className="text-slate-900 dark:text-white">Associate:</strong>{' '}
                {editingCell.employeeName}
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white">Day:</strong> Day {editingCell.dayNumber} ({getDayOfWeekName(editingCell.dayNumber)}, Aug 2026)
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white">Current Shift:</strong>{' '}
                <span className="font-extrabold">{editingCell.currentShift}</span>
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Select New Shift:</label>
              <div className="grid grid-cols-3 gap-2">
                {(['A', 'B', 'C', 'OFF', 'CO', 'ABS', 'LV', 'TR', 'OT'] as ShiftCode[]).map((code) => (
                  <button
                    key={code}
                    onClick={() => handleApplyShiftChange(code)}
                    className={`p-2 rounded-xl border text-xs font-bold text-center transition-all ${getShiftBadgeStyle(
                      code
                    )} ${editingCell.currentShift === code ? 'ring-2 ring-indigo-500' : ''}`}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setEditingCell(null)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
