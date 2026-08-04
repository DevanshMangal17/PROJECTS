import React, { useState, useMemo, useEffect } from 'react';
import {
  Employee,
  ShiftRatioConfig,
  DayOfWeek,
  ShiftCode,
  AttendanceStatus,
  ReplacementRecommendation,
  LeaveRequest,
  EmployeeMonthlySchedule,
  ShiftSwapRecord,
  AIRotationInsight,
} from '../../types/roster';
import { INITIAL_EMPLOYEES } from '../../data/mockEmployees';
import {
  DEFAULT_SHIFT_RATIO,
  generateWeeklySchedule,
  findBestReplacement,
  calculateShiftMetrics,
} from '../../utils/rosterEngine';
import {
  generateMonthlySchedule,
  generateAIRotationInsights,
} from '../../utils/monthlyRotationEngine';

import { RosterGrid } from './RosterGrid';
import { AttendancePanel } from './AttendancePanel';
import { ShiftDashboard } from './ShiftDashboard';
import { EmployeeMasterView } from './EmployeeMasterView';
import { LeavePlannerView } from './LeavePlannerView';
import { RosterAnalyticsView } from './RosterAnalyticsView';
import { RosterReportsView } from './RosterReportsView';
import { MonthlyCalendarView } from './MonthlyCalendarView';
import { ShiftSwapManagerView } from './ShiftSwapManagerView';
import { AIRotationIntelligencePanel } from './AIRotationIntelligencePanel';
import { MonthlyAnalyticsView } from './MonthlyAnalyticsView';
import { MonthlyReportsView } from './MonthlyReportsView';

import {
  Calendar,
  UserCheck,
  Users,
  BarChart3,
  FileText,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Zap,
  ArrowLeftRight,
  Layers,
} from 'lucide-react';

export const RosterContainer: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<string>('monthly-calendar');
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [config, setConfig] = useState<ShiftRatioConfig>(DEFAULT_SHIFT_RATIO);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isLockedAllOffs, setIsLockedAllOffs] = useState<boolean>(false);
  const [currentDay, setCurrentDay] = useState<DayOfWeek>('Mon');

  // Generated Weekly Schedules
  const [schedules, setSchedules] = useState(() =>
    generateWeeklySchedule(INITIAL_EMPLOYEES, DEFAULT_SHIFT_RATIO)
  );

  // Generated 31-Day Monthly Schedules with Undo/Redo State
  const [monthlySchedules, setMonthlySchedules] = useState<EmployeeMonthlySchedule[]>(() =>
    generateMonthlySchedule(INITIAL_EMPLOYEES, 2026, 8, DEFAULT_SHIFT_RATIO)
  );

  const [history, setHistory] = useState<EmployeeMonthlySchedule[][]>([
    generateMonthlySchedule(INITIAL_EMPLOYEES, 2026, 8, DEFAULT_SHIFT_RATIO),
  ]);
  const [historyIdx, setHistoryIdx] = useState<number>(0);

  // Shift Swap Logs State
  const [swapLogs, setSwapLogs] = useState<ShiftSwapRecord[]>([
    {
      id: 'SWAP-101',
      requestDate: '2026-08-01',
      emp1Id: 'EMP-101',
      emp1Name: 'Marcus Vance',
      emp2Id: 'EMP-102',
      emp2Name: 'Elena Rostova',
      swapDate: '2026-08-08',
      dayNumber: 8,
      emp1OriginalShift: 'A',
      emp2OriginalShift: 'B',
      status: 'Approved',
      supervisor: 'Alex Morgan (Supervisor)',
      reason: 'Cross-shift operational alignment & transport availability',
      validationNotes: ['Skills level matched (Level 3 vs 3)', 'Max 9-day work limit verified'],
      isValid: true,
    },
    {
      id: 'SWAP-102',
      requestDate: '2026-08-03',
      emp1Id: 'EMP-201',
      emp1Name: 'David Kim',
      emp2Id: 'EMP-202',
      emp2Name: 'Aisha Khan',
      swapDate: '2026-08-15',
      dayNumber: 15,
      emp1OriginalShift: 'B',
      emp2OriginalShift: 'C',
      status: 'Approved',
      supervisor: 'Sarah Jenkins (Ops Manager)',
      reason: 'Personal medical appointment swap',
      validationNotes: ['Weekly off policy respected', 'Skill match confirmed'],
      isValid: true,
    },
  ]);

  // AI Insights State
  const aiInsights = useMemo(() => {
    return generateAIRotationInsights(employees, monthlySchedules, 2026, 8);
  }, [employees, monthlySchedules]);

  // Push new monthly state to history stack
  const pushToHistory = (newSched: EmployeeMonthlySchedule[]) => {
    const nextHist = history.slice(0, historyIdx + 1);
    nextHist.push(newSched);
    setHistory(nextHist);
    setHistoryIdx(nextHist.length - 1);
    setMonthlySchedules(newSched);
  };

  const handleUndo = () => {
    if (historyIdx > 0) {
      const prevIdx = historyIdx - 1;
      setHistoryIdx(prevIdx);
      setMonthlySchedules(history[prevIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      const nextIdx = historyIdx + 1;
      setHistoryIdx(nextIdx);
      setMonthlySchedules(history[nextIdx]);
    }
  };

  // Update Single Monthly Shift Assignment Cell
  const handleUpdateMonthlyShift = (employeeId: string, dayNumber: number, newShift: ShiftCode) => {
    const updated = monthlySchedules.map((s) => {
      if (s.employeeId === employeeId) {
        return {
          ...s,
          days: {
            ...s.days,
            [dayNumber]: {
              ...s.days[dayNumber],
              shift: newShift,
              modifiedManually: true,
            },
          },
        };
      }
      return s;
    });
    pushToHistory(updated);
  };

  // Regenerate Full Month
  const handleRegenerateMonth = () => {
    const newSched = generateMonthlySchedule(employees, 2026, 8, config);
    pushToHistory(newSched);
  };

  // Regenerate Specific Week (1 to 5)
  const handleRegenerateWeek = (weekIndex: number) => {
    const startDay = (weekIndex - 1) * 7 + 1;
    const endDay = Math.min(weekIndex * 7, 31);

    const freshFull = generateMonthlySchedule(employees, 2026, 8, config);

    const updated = monthlySchedules.map((s) => {
      const freshEmp = freshFull.find((f) => f.employeeId === s.employeeId);
      if (!freshEmp) return s;

      const newDays = { ...s.days };
      for (let day = startDay; day <= endDay; day++) {
        newDays[day] = freshEmp.days[day];
      }

      return {
        ...s,
        days: newDays,
      };
    });

    pushToHistory(updated);
  };

  // Lock / Unlock All Weekly Offs
  const handleToggleLockWeeklyOffs = () => {
    setIsLockedAllOffs(!isLockedAllOffs);
  };

  // Add Shift Swap Record
  const handleAddSwapRecord = (swap: ShiftSwapRecord) => {
    setSwapLogs((prev) => [swap, ...prev]);

    if (swap.isValid) {
      // Execute Swap in monthly schedule
      handleUpdateMonthlyShift(swap.emp1Id, swap.dayNumber, swap.emp2OriginalShift);
      handleUpdateMonthlyShift(swap.emp2Id, swap.dayNumber, swap.emp1OriginalShift);
    }
  };

  // Active Replacement Recommendations
  const [recommendations, setRecommendations] = useState<ReplacementRecommendation[]>([]);
  const [replacementLogs, setReplacementLogs] = useState<ReplacementRecommendation[]>([]);

  // Active Leave Requests
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    {
      id: 'LV-101',
      employeeId: 'EMP-103',
      employeeName: 'Devon Lee',
      department: 'Inbound',
      leaveType: 'Planned Leave',
      startDate: '2026-08-05',
      endDate: '2026-08-06',
      status: 'Pending',
      reason: 'Personal family event',
    },
    {
      id: 'LV-102',
      employeeId: 'EMP-206',
      employeeName: 'Nadia Patel',
      department: 'Outbound',
      leaveType: 'Medical Leave',
      startDate: '2026-08-04',
      endDate: '2026-08-05',
      status: 'Approved',
      reason: 'Medical doctor recommendation',
    },
  ]);

  // Handle Auto-Regeneration of Weekly Roster
  const handleAutoRegenerate = () => {
    if (isLocked) return;
    const newSched = generateWeeklySchedule(employees, config);
    setSchedules(newSched);
  };

  // Handle Manual Shift Updates in Grid
  const handleUpdateShift = (employeeId: string, day: DayOfWeek, newShift: ShiftCode) => {
    if (isLocked) return;
    setSchedules((prev) =>
      prev.map((s) => {
        if (s.employeeId === employeeId) {
          return {
            ...s,
            schedule: {
              ...s.schedule,
              [day]: { shift: newShift, modifiedManually: true },
            },
          };
        }
        return s;
      })
    );
  };

  // Handle Attendance Status Updates
  const handleUpdateAttendance = (employeeId: string, newStatus: AttendanceStatus) => {
    setEmployees((prev) =>
      prev.map((e) => {
        if (e.id === employeeId) {
          return { ...e, status: newStatus };
        }
        return e;
      })
    );

    // If associate marked Absent, trigger AI Replacement Engine
    if (newStatus === 'Absent') {
      const absentEmp = employees.find((e) => e.id === employeeId);
      if (absentEmp) {
        const rec = findBestReplacement(
          absentEmp,
          absentEmp.currentShift === 'OFF' ? 'A' : (absentEmp.currentShift as 'A' | 'B' | 'C'),
          currentDay,
          employees,
          schedules,
          config
        );

        setRecommendations((prev) => [rec, ...prev.filter((r) => r.absentEmployeeId !== employeeId)]);
      }
    } else {
      setRecommendations((prev) => prev.filter((r) => r.absentEmployeeId !== employeeId));
    }
  };

  // Apply AI Replacement Recommendation
  const handleApplyReplacement = (rec: ReplacementRecommendation) => {
    if (rec.replacementEmployeeId) {
      handleUpdateShift(rec.replacementEmployeeId, currentDay, rec.shift);

      const updatedRec = { ...rec, status: 'Applied' as const };
      setReplacementLogs((prev) => [updatedRec, ...prev]);

      setRecommendations((prev) => prev.filter((r) => r.id !== rec.id));
    }
  };

  // Leave approval workflow
  const handleApproveLeave = (leaveId: string) => {
    setLeaveRequests((prev) =>
      prev.map((l) => {
        if (l.id === leaveId) {
          setEmployees((emps) =>
            emps.map((e) => (e.id === l.employeeId ? { ...e, status: 'Leave' } : e))
          );
          return { ...l, status: 'Approved' };
        }
        return l;
      })
    );
  };

  const handleRejectLeave = (leaveId: string) => {
    setLeaveRequests((prev) =>
      prev.map((l) => (l.id === leaveId ? { ...l, status: 'Rejected' } : l))
    );
  };

  const handleCreateLeave = (req: LeaveRequest) => {
    setLeaveRequests((prev) => [req, ...prev]);
  };

  // Add / Update employee in master
  const handleAddEmployee = (newEmp: Employee) => {
    setEmployees((prev) => [newEmp, ...prev]);
    setSchedules((prev) => [
      ...prev,
      {
        employeeId: newEmp.id,
        schedule: {
          Mon: { shift: 'A' },
          Tue: { shift: 'A' },
          Wed: { shift: 'A' },
          Thu: { shift: 'A' },
          Fri: { shift: 'A' },
          Sat: { shift: 'OFF' },
          Sun: { shift: 'A' },
        },
      },
    ]);
  };

  const handleUpdateEmployee = (updated: Employee) => {
    setEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  };

  // Calculate Shift Metrics
  const shiftMetrics = useMemo(
    () => calculateShiftMetrics(employees, schedules, currentDay),
    [employees, schedules, currentDay]
  );

  // CSV Export Helper
  const handleExportRosterCsv = () => {
    const header = ['Employee ID', 'Name', 'Department', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const rows = employees.map((emp) => {
      const s = schedules.find((s) => s.employeeId === emp.id);
      return [
        emp.id,
        emp.name,
        emp.department,
        s?.schedule.Mon.shift || 'A',
        s?.schedule.Tue.shift || 'A',
        s?.schedule.Wed.shift || 'A',
        s?.schedule.Thu.shift || 'A',
        s?.schedule.Fri.shift || 'A',
        s?.schedule.Sat.shift || 'OFF',
        s?.schedule.Sun.shift || 'A',
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' + [header, ...rows].map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Weekly_Manpower_Roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintRoster = () => {
    window.print();
  };

  const subTabs = [
    { id: 'monthly-calendar', label: 'Monthly Rotation Planner', icon: Layers, badge: '31 Days' },
    { id: 'swap-manager', label: 'Shift Swap Manager', icon: ArrowLeftRight, badge: swapLogs.length ? `${swapLogs.length} Swaps` : null },
    { id: 'grid', label: 'Weekly Roster Grid', icon: Calendar },
    { id: 'attendance', label: 'Attendance & Shortages', icon: UserCheck, badge: shiftMetrics.totalAbsent > 0 ? `${shiftMetrics.totalAbsent} Absent` : null },
    { id: 'shift-dash', label: 'Shift Deployment (50:40:10)', icon: Users },
    { id: 'master', label: 'Employee Master', icon: ShieldCheck },
    { id: 'leave', label: 'Leave Planner', icon: Clock },
    { id: 'analytics', label: 'Rotation Analytics & AI', icon: BarChart3 },
    { id: 'reports', label: 'Downloadable Reports', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Top Roster Control Navigation Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Intelligent Monthly Shift Rotation & Roster Management Module
            </h2>
            <p className="text-xs text-slate-500">
              Team-based weekly rotation (A → B → C), 31-day calendar, compensatory off ledger, & shift swap validation.
            </p>
          </div>
        </div>

        {/* Day Selector */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
          <span className="text-slate-500 px-2">Active Day:</span>
          {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as DayOfWeek[]).map((d) => (
            <button
              key={d}
              onClick={() => setCurrentDay(d)}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                currentDay === d
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-indigo-500 text-white">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sub-Tab Content Views */}
      {activeSubTab === 'monthly-calendar' && (
        <div className="space-y-6">
          <AIRotationIntelligencePanel insights={aiInsights} />
          <MonthlyCalendarView
            employees={employees}
            monthlySchedules={monthlySchedules}
            onUpdateMonthlyShift={handleUpdateMonthlyShift}
            onRegenerateMonth={handleRegenerateMonth}
            onRegenerateWeek={handleRegenerateWeek}
            onToggleLockWeeklyOffs={handleToggleLockWeeklyOffs}
            isLockedAllOffs={isLockedAllOffs}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyIdx > 0}
            canRedo={historyIdx < history.length - 1}
          />
        </div>
      )}

      {activeSubTab === 'swap-manager' && (
        <ShiftSwapManagerView
          employees={employees}
          monthlySchedules={monthlySchedules}
          swapLogs={swapLogs}
          onAddSwapRecord={handleAddSwapRecord}
          config={config}
        />
      )}

      {activeSubTab === 'grid' && (
        <RosterGrid
          employees={employees}
          schedules={schedules}
          onUpdateShift={handleUpdateShift}
          onAutoRegenerate={handleAutoRegenerate}
          isLocked={isLocked}
          setIsLocked={setIsLocked}
        />
      )}

      {activeSubTab === 'attendance' && (
        <AttendancePanel
          employees={employees}
          onUpdateAttendance={handleUpdateAttendance}
          recommendations={recommendations}
          onApplyReplacement={handleApplyReplacement}
          currentDay={currentDay}
          setCurrentDay={setCurrentDay}
        />
      )}

      {activeSubTab === 'shift-dash' && (
        <ShiftDashboard
          metrics={shiftMetrics}
          config={config}
          onUpdateConfig={setConfig}
        />
      )}

      {activeSubTab === 'master' && (
        <EmployeeMasterView
          employees={employees}
          onAddEmployee={handleAddEmployee}
          onUpdateEmployee={handleUpdateEmployee}
        />
      )}

      {activeSubTab === 'leave' && (
        <LeavePlannerView
          employees={employees}
          leaveRequests={leaveRequests}
          onApproveLeave={handleApproveLeave}
          onRejectLeave={handleRejectLeave}
          onCreateLeave={handleCreateLeave}
        />
      )}

      {activeSubTab === 'analytics' && (
        <MonthlyAnalyticsView
          employees={employees}
          monthlySchedules={monthlySchedules}
        />
      )}

      {activeSubTab === 'reports' && (
        <MonthlyReportsView
          employees={employees}
          monthlySchedules={monthlySchedules}
          swapLogs={swapLogs}
        />
      )}
    </div>
  );
};

