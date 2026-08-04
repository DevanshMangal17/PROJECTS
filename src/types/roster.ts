export type ShiftCode = 'A' | 'B' | 'C' | 'OFF' | 'TR' | 'ABS' | 'LV' | 'OT' | 'HOL' | 'CO';

export type RotationTeam = 'Team Alpha' | 'Team Bravo' | 'Team Charlie' | 'Team Delta';

export type SkillLevel = 'beginner' | 'skilled' | 'expert';

export type DepartmentType = 'Inbound' | 'Outbound' | 'Audit';

export type ContractType = 'Permanent' | 'Temporary' | 'Contract';

export type AttendanceStatus =
  | 'Present'
  | 'Absent'
  | 'Leave'
  | 'Half Day'
  | 'Late'
  | 'Training'
  | 'Holiday'
  | 'Weekly Off'
  | 'Compensatory Off';

export interface Employee {
  id: string;
  name: string;
  department: DepartmentType;
  designation: string;
  skillLevel: SkillLevel;
  primaryDepartment: DepartmentType;
  secondarySkills: DepartmentType[];
  performanceRating: number; // 1.0 - 5.0
  performanceScore: number; // 0 - 100
  attendancePct: number; // 0 - 100%
  experienceYears: number;
  isCrossTrained: boolean;
  maxOtAllowedMins: number; // default 120
  consecutiveWorkingDays: number; // 0 to 9+
  lastWeeklyOffDate: string;
  currentShift: 'A' | 'B' | 'C' | 'OFF';
  preferredShift: 'A' | 'B' | 'C';
  medicalRestrictions?: string | null;
  contractType: ContractType;
  status: AttendanceStatus;
  avatarUrl?: string;
  totalOtHoursThisMonth: number;
  hourlyRate: number;
  // Team Rotation Fields
  team?: RotationTeam;
  rotationSequence?: ('A' | 'B' | 'C')[];
  startingShift?: 'A' | 'B' | 'C';
  compensatoryOffBalance?: number;
  workedWeeklyOffs?: number;
}

export interface ShiftRatioConfig {
  aShiftPct: number; // default 50%
  bShiftPct: number; // default 40%
  cShiftPct: number; // default 10%
  maxConsecutiveDays: number; // default 9
  shiftDurationMins: number; // 600 mins total
  workingTimeMins: number; // 540 mins work
  breakTimeMins: number; // 60 mins break
  allowVoluntaryOvertime: boolean;
  rotationMode?: 'Individual' | 'Team-Based';
  defaultRotationSequence?: ('A' | 'B' | 'C')[];
  staggerTeams?: boolean;
}

export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface DayShiftAssignment {
  shift: ShiftCode;
  isCompOff?: boolean;
  isWorkedWeeklyOff?: boolean;
  isLocked?: boolean;
  otMinutes?: number;
  note?: string;
  modifiedManually?: boolean;
}

export interface EmployeeWeeklySchedule {
  employeeId: string;
  schedule: Record<DayOfWeek, DayShiftAssignment>;
}

export interface EmployeeMonthlySchedule {
  employeeId: string;
  month: number; // 1-12
  year: number; // e.g. 2026
  days: Record<number, DayShiftAssignment>; // Day 1..31
}

export interface ShiftSwapRecord {
  id: string;
  requestDate: string;
  emp1Id: string;
  emp1Name: string;
  emp2Id: string;
  emp2Name: string;
  swapDate: string;
  dayNumber: number;
  emp1OriginalShift: ShiftCode;
  emp2OriginalShift: ShiftCode;
  status: 'Approved' | 'Pending' | 'Rejected';
  supervisor: string;
  reason: string;
  validationNotes: string[];
  isValid: boolean;
}

export interface AIRotationInsight {
  id: string;
  type:
    | 'rotation_cycle'
    | 'shortage_forecast'
    | 'consecutive_limit'
    | 'comp_off_due'
    | 'compliance'
    | 'fairness';
  severity: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  message: string;
  recommendedAction: string;
  employeeId?: string;
  dayNumber?: number;
}

export interface ReplacementRecommendation {
  id: string;
  timestamp: string;
  absentEmployeeId: string;
  absentEmployeeName: string;
  department: DepartmentType;
  shift: 'A' | 'B' | 'C';
  replacementEmployeeId: string | null;
  replacementEmployeeName: string | null;
  matchPriority: string; // e.g., 'Priority 1: Cross-Trained'
  actionType:
    | 'Cross-Trained Reassignment'
    | 'High-Performer Swap'
    | 'Low Consecutive-Days Assignee'
    | 'Temporary Worker Call-In'
    | 'Overtime Extension'
    | 'External Staffing Alert';
  reasonExplanation: string;
  status: 'Recommended' | 'Applied' | 'Dismissed';
  costImpact: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: DepartmentType;
  leaveType:
    | 'Planned Leave'
    | 'Emergency Leave'
    | 'Medical Leave'
    | 'Training'
    | 'Holiday'
    | 'Compensatory Off';
  startDate: string;
  endDate: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  reason: string;
}

export interface DailyShiftMetrics {
  shift: 'A' | 'B' | 'C';
  plannedManpower: number;
  actualManpower: number;
  attendancePct: number;
  absentPct: number;
  otPct: number;
  utilizationPct: number;
}

export interface RosterFilterState {
  department: string;
  shift: string;
  team: string;
  skill: string;
  contract: string;
  searchQuery: string;
  performanceMin: number;
  onlyCrossTrained: boolean;
  onlyHighRiskConsecutiveDays: boolean;
}

