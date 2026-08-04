import React, { useState } from 'react';
import { Employee, DepartmentType, SkillLevel, ContractType } from '../../types/roster';
import {
  Users,
  Search,
  Plus,
  Shield,
  Zap,
  Clock,
  AlertTriangle,
  Award,
  Briefcase,
  CheckCircle,
  FileText,
} from 'lucide-react';

interface EmployeeMasterViewProps {
  employees: Employee[];
  onAddEmployee: (newEmp: Employee) => void;
  onUpdateEmployee: (updated: Employee) => void;
}

export const EmployeeMasterView: React.FC<EmployeeMasterViewProps> = ({
  employees,
  onAddEmployee,
  onUpdateEmployee,
}) => {
  const [search, setSearch] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form State for new employee
  const [newForm, setNewForm] = useState<{
    name: string;
    department: DepartmentType;
    designation: string;
    skillLevel: SkillLevel;
    contractType: ContractType;
    experienceYears: number;
    hourlyRate: number;
    isCrossTrained: boolean;
  }>({
    name: '',
    department: 'Inbound',
    designation: 'Warehouse Associate',
    skillLevel: 'skilled',
    contractType: 'Permanent',
    experienceYears: 2.0,
    hourlyRate: 22,
    isCrossTrained: true,
  });

  const filtered = employees.filter((e) => {
    if (deptFilter !== 'all' && e.department !== deptFilter) return false;
    if (skillFilter !== 'all' && e.skillLevel !== skillFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        e.name.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        e.designation.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name) return;

    const newEmp: Employee = {
      id: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      name: newForm.name,
      department: newForm.department,
      designation: newForm.designation,
      skillLevel: newForm.skillLevel,
      primaryDepartment: newForm.department,
      secondarySkills: newForm.isCrossTrained ? ['Outbound', 'Audit'] : [],
      performanceRating: 4.2,
      performanceScore: 84,
      attendancePct: 95.0,
      experienceYears: newForm.experienceYears,
      isCrossTrained: newForm.isCrossTrained,
      maxOtAllowedMins: 120,
      consecutiveWorkingDays: 1,
      lastWeeklyOffDate: new Date().toISOString().slice(0, 10),
      currentShift: 'A',
      preferredShift: 'A',
      contractType: newForm.contractType,
      status: 'Present',
      totalOtHoursThisMonth: 0,
      hourlyRate: newForm.hourlyRate,
    };

    onAddEmployee(newEmp);
    setShowAddModal(false);
    setNewForm({
      name: '',
      department: 'Inbound',
      designation: 'Warehouse Associate',
      skillLevel: 'skilled',
      contractType: 'Permanent',
      experienceYears: 2.0,
      hourlyRate: 22,
      isCrossTrained: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search employee master by name, ID, designation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
          >
            <option value="all">All Departments</option>
            <option value="Inbound">Inbound</option>
            <option value="Outbound">Outbound</option>
            <option value="Audit">Audit</option>
          </select>

          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
          >
            <option value="all">All Skill Levels</option>
            <option value="expert">Expert</option>
            <option value="skilled">Skilled</option>
            <option value="beginner">Beginner</option>
          </select>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Associate</span>
        </button>
      </div>

      {/* New Associate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Add Associate to Employee Master Roster
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Smith"
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Primary Department
                  </label>
                  <select
                    value={newForm.department}
                    onChange={(e) =>
                      setNewForm({ ...newForm, department: e.target.value as DepartmentType })
                    }
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  >
                    <option value="Inbound">Inbound</option>
                    <option value="Outbound">Outbound</option>
                    <option value="Audit">Audit</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={newForm.designation}
                    onChange={(e) => setNewForm({ ...newForm, designation: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Skill Level
                  </label>
                  <select
                    value={newForm.skillLevel}
                    onChange={(e) =>
                      setNewForm({ ...newForm, skillLevel: e.target.value as SkillLevel })
                    }
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="skilled">Skilled</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Contract Type
                  </label>
                  <select
                    value={newForm.contractType}
                    onChange={(e) =>
                      setNewForm({ ...newForm, contractType: e.target.value as ContractType })
                    }
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  >
                    <option value="Permanent">Permanent</option>
                    <option value="Temporary">Temporary</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Base Pay ($/hr)
                  </label>
                  <input
                    type="number"
                    value={newForm.hourlyRate}
                    onChange={(e) =>
                      setNewForm({ ...newForm, hourlyRate: Number(e.target.value) })
                    }
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={newForm.isCrossTrained}
                    onChange={(e) => setNewForm({ ...newForm, isCrossTrained: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Is Cross-Trained (Secondary Skills)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors"
                >
                  Save Associate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((emp) => {
          const isRuleAlert = emp.consecutiveWorkingDays >= 8;
          return (
            <div
              key={emp.id}
              onClick={() => setSelectedEmp(emp)}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500/50 hover:shadow-md transition-all cursor-pointer space-y-3"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold flex items-center justify-center text-xs shrink-0">
                    {emp.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {emp.name}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {emp.id} • {emp.designation}
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    emp.status === 'Present'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}
                >
                  {emp.status}
                </span>
              </div>

              {/* Attributes badges */}
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold">
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {emp.department}
                </span>
                <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {emp.skillLevel} ({emp.performanceRating}&#9733;)
                </span>
                {emp.isCrossTrained && (
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500" /> Cross-Trained
                  </span>
                )}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800/80">
                <div>
                  <span className="text-slate-400 block text-[10px]">Consecutive Days</span>
                  <span
                    className={`font-bold ${
                      isRuleAlert ? 'text-rose-500 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {emp.consecutiveWorkingDays} Days {isRuleAlert ? '(&ge;8 Limit)' : ''}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Attendance %</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {emp.attendancePct}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
