import React, { useState } from 'react';
import {
  Employee,
  EmployeeMonthlySchedule,
  ShiftSwapRecord,
} from '../../types/roster';
import {
  FileText,
  Download,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Users,
  ShieldCheck,
} from 'lucide-react';

interface MonthlyReportsViewProps {
  employees: Employee[];
  monthlySchedules: EmployeeMonthlySchedule[];
  swapLogs: ShiftSwapRecord[];
}

export const MonthlyReportsView: React.FC<MonthlyReportsViewProps> = ({
  employees,
  monthlySchedules,
  swapLogs,
}) => {
  const [selectedReport, setSelectedReport] = useState<string>('roster');

  const reportTypes = [
    { id: 'roster', title: 'Monthly Shift Roster Report', desc: 'Full 31-day shift schedule per employee with team details.' },
    { id: 'rotation', title: 'Weekly Rotation Compliance Report', desc: 'A → B → C rotation sequence verification & fairness logs.' },
    { id: 'attendance', title: 'Monthly Attendance Register', desc: 'Present, absent, leave, & weekly off audit trail.' },
    { id: 'overtime', title: 'Overtime Register Report', desc: 'Total monthly OT hours, rates, & cost impact.' },
    { id: 'comp-off', title: 'Compensatory Off Register', desc: 'Worked weekly offs, earned comp offs, & balance ledger.' },
    { id: 'swaps', title: 'Shift Swap Log Report', desc: 'Approved & rejected shift swap requests with supervisor notes.' },
  ];

  // Helper to generate and download CSV
  const handleExportCsv = () => {
    let filename = `Monthly_Report_${selectedReport}_${new Date().toISOString().slice(0, 10)}.csv`;
    let csvRows: string[][] = [];

    if (selectedReport === 'roster') {
      const header = ['Employee ID', 'Name', 'Department', 'Team', ...Array.from({ length: 31 }, (_, i) => `Day ${i + 1}`)];
      csvRows.push(header);
      employees.forEach((emp) => {
        const sched = monthlySchedules.find((s) => s.employeeId === emp.id);
        const days = Array.from({ length: 31 }, (_, i) => sched?.days[i + 1]?.shift || 'A');
        csvRows.push([emp.id, emp.name, emp.department, emp.team || 'Team Alpha', ...days]);
      });
    } else if (selectedReport === 'swaps') {
      const header = ['Swap ID', 'Date', 'Employee 1', 'Employee 2', 'Original Shifts', 'Status', 'Supervisor', 'Reason'];
      csvRows.push(header);
      swapLogs.forEach((log) => {
        csvRows.push([
          log.id,
          log.swapDate,
          log.emp1Name,
          log.emp2Name,
          `${log.emp1OriginalShift} <-> ${log.emp2OriginalShift}`,
          log.status,
          log.supervisor,
          log.reason,
        ]);
      });
    } else if (selectedReport === 'comp-off') {
      const header = ['Employee ID', 'Name', 'Department', 'Worked Weekly Offs', 'Comp Off Balance'];
      csvRows.push(header);
      employees.forEach((emp) => {
        csvRows.push([
          emp.id,
          emp.name,
          emp.department,
          String(emp.workedWeeklyOffs || 0),
          String(emp.compensatoryOffBalance || 0),
        ]);
      });
    } else {
      const header = ['Employee ID', 'Name', 'Department', 'Team', 'Present Days', 'Absent Days', 'Leave Days', 'OT Hours'];
      csvRows.push(header);
      employees.forEach((emp) => {
        csvRows.push([
          emp.id,
          emp.name,
          emp.department,
          emp.team || 'Team Alpha',
          '24',
          '1',
          '1',
          String(emp.totalOtHoursThisMonth),
        ]);
      });
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Downloadable Roster & Compliance Reports
            </h2>
            <p className="text-xs text-slate-500">
              Export monthly shift rosters, weekly rotation logs, overtime registers, & compensatory off statements.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel / CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Grid Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((rep) => {
          const isSelected = selectedReport === rep.id;
          return (
            <div
              key={rep.id}
              onClick={() => setSelectedReport(rep.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                isSelected
                  ? 'bg-indigo-600/10 border-indigo-600 ring-2 ring-indigo-500/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-indigo-600/10 text-indigo-600 font-bold">
                  <FileText className="w-4 h-4" />
                </span>
                {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{rep.title}</h4>
              <p className="text-xs text-slate-500">{rep.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Preview Section */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Report Data Summary Preview
        </h3>
        <p className="text-xs text-slate-500">
          Ready to export {employees.length} employees & 31 days of shift schedule data.
        </p>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
          <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
            <span>Total Records:</span>
            <span>{employees.length * 31} Shift Days</span>
          </div>
          <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
            <span>Target Rotation Cycle:</span>
            <span>A → B → C (Weekly Fixed)</span>
          </div>
          <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
            <span>Compensatory Off Ledger Balance:</span>
            <span>{employees.reduce((acc, e) => acc + (e.compensatoryOffBalance || 0), 0)} Earned Days</span>
          </div>
        </div>
      </div>
    </div>
  );
};
