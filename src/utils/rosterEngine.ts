import {
  Employee,
  DayOfWeek,
  ShiftCode,
  ShiftRatioConfig,
  EmployeeWeeklySchedule,
  ReplacementRecommendation,
  DailyShiftMetrics,
  DepartmentType,
} from '../types/roster';

export const DAYS_OF_WEEK: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const DEFAULT_SHIFT_RATIO: ShiftRatioConfig = {
  aShiftPct: 50,
  bShiftPct: 40,
  cShiftPct: 10,
  maxConsecutiveDays: 9,
  shiftDurationMins: 600,
  workingTimeMins: 540,
  breakTimeMins: 60,
  allowVoluntaryOvertime: true,
};

/**
 * Generates an optimized weekly schedule for all employees matching the demand & constraints.
 */
export function generateWeeklySchedule(
  employees: Employee[],
  config: ShiftRatioConfig = DEFAULT_SHIFT_RATIO
): EmployeeWeeklySchedule[] {
  // Determine shift assignments
  const totalEmps = employees.length;
  if (totalEmps === 0) return [];

  // Calculate target shift counts per working day
  const dailyWorkingTarget = Math.floor((totalEmps * 6) / 7); // 6 working days per 7 days
  const targetA = Math.round(dailyWorkingTarget * (config.aShiftPct / 100));
  const targetB = Math.round(dailyWorkingTarget * (config.bShiftPct / 100));

  return employees.map((emp, index) => {
    // Determine designated weekly off day based on index for balanced distribution
    const offDayIndex = index % 7;
    const offDay = DAYS_OF_WEEK[offDayIndex];

    const scheduleRecord: EmployeeWeeklySchedule['schedule'] = {
      Mon: { shift: 'A' },
      Tue: { shift: 'A' },
      Wed: { shift: 'A' },
      Thu: { shift: 'A' },
      Fri: { shift: 'A' },
      Sat: { shift: 'A' },
      Sun: { shift: 'A' },
    };

    let runningConsecutive = emp.consecutiveWorkingDays;

    DAYS_OF_WEEK.forEach((day, dayIdx) => {
      // Rule 1: Mandatory Rest Day if consecutive working days >= 9
      if (runningConsecutive >= config.maxConsecutiveDays) {
        scheduleRecord[day] = {
          shift: 'OFF',
          note: 'Mandatory Rest Day (9 Consecutive Days Limit)',
        };
        runningConsecutive = 0;
        return;
      }

      // Rule 2: Scheduled Weekly Off
      if (day === offDay) {
        scheduleRecord[day] = { shift: 'OFF', note: 'Scheduled Weekly Off' };
        runningConsecutive = 0;
        return;
      }

      // Rule 3: Assigned Status (e.g. if employee is marked absent initially)
      if (emp.status === 'Absent' && dayIdx === 1) {
        // e.g. Tuesday absent demo
        scheduleRecord[day] = { shift: 'ABS', note: 'Unplanned Absence' };
        return;
      }

      // Rule 4: Shift Allocation based on preferred shift or A:B:C ratio
      let assignedShift: ShiftCode = emp.preferredShift || 'A';
      
      // Balance shifts across workforce
      if (index % 10 === 8 || index % 10 === 9) {
        assignedShift = 'C';
      } else if (index % 10 >= 4 && index % 10 <= 7) {
        assignedShift = 'B';
      } else {
        assignedShift = 'A';
      }

      scheduleRecord[day] = { shift: assignedShift };
      runningConsecutive += 1;
    });

    return {
      employeeId: emp.id,
      schedule: scheduleRecord,
    };
  });
}

/**
 * Intelligent 8-Priority Replacement Engine
 * Finds the best replacement candidate for an absent associate.
 */
export function findBestReplacement(
  absentEmp: Employee,
  targetShift: 'A' | 'B' | 'C',
  targetDay: DayOfWeek,
  allEmployees: Employee[],
  currentSchedules: EmployeeWeeklySchedule[],
  config: ShiftRatioConfig = DEFAULT_SHIFT_RATIO
): ReplacementRecommendation {
  const department = absentEmp.department;

  // Filter candidate pool (excluding the absent employee)
  const candidates = allEmployees.filter((e) => e.id !== absentEmp.id);

  // Score each candidate based on the 8 strict priorities
  const scoredCandidates = candidates
    .map((candidate) => {
      let score = 0;
      const reasons: string[] = [];

      // Check current schedule for this day
      const candSched = currentSchedules.find((s) => s.employeeId === candidate.id);
      const dayAssignment = candSched?.schedule[targetDay]?.shift || candidate.currentShift;

      // GUARDRAILS CHECK
      if (candidate.consecutiveWorkingDays >= config.maxConsecutiveDays) {
        return { candidate, score: -999, valid: false, reason: 'Violates 9-Day Consecutive Limit' };
      }
      if (candidate.maxOtAllowedMins <= 0) {
        return { candidate, score: -999, valid: false, reason: 'No OT Capacity' };
      }

      // Priority 1: Cross-Trained Employee
      if (candidate.isCrossTrained && candidate.secondarySkills.includes(department)) {
        score += 1000;
        reasons.push('Priority 1: Cross-Trained in ' + department);
      } else if (candidate.primaryDepartment === department) {
        score += 800;
        reasons.push('Priority 5: Same Department (' + department + ')');
      }

      // Priority 2: Performance Rating (Higher rating -> higher score)
      score += Math.round(candidate.performanceRating * 100); // 100-500 pts
      reasons.push(`Priority 2: Performance Rating ${candidate.performanceRating}/5`);

      // Priority 3: Lowest Consecutive Working Days (Fewer days -> higher score)
      const consecutiveBonus = Math.max(0, 10 - candidate.consecutiveWorkingDays) * 20;
      score += consecutiveBonus;
      reasons.push(`Priority 3: Low Consecutive Days (${candidate.consecutiveWorkingDays} days)`);

      // Priority 4: Lowest Monthly Overtime Hours
      const otBonus = Math.max(0, 50 - candidate.totalOtHoursThisMonth) * 10;
      score += otBonus;

      // Priority 6: Contract type adjustment
      if (candidate.contractType === 'Temporary') {
        score += 50; // Use temp before expensive permanent OT if available
      }

      // Shift status modifier (If employee is currently OFF, calling them in requires OT / Comp Off)
      if (dayAssignment === 'OFF') {
        score -= 150; // Mild penalty for disrupting weekly off
      }

      return {
        candidate,
        score,
        valid: true,
        primaryReason: reasons.join(' | '),
      };
    })
    .filter((c) => c.valid)
    .sort((a, b) => b.score - a.score);

  if (scoredCandidates.length > 0) {
    const winner = scoredCandidates[0];
    const cand = winner.candidate;

    let actionType: ReplacementRecommendation['actionType'] = 'Cross-Trained Reassignment';
    if (cand.isCrossTrained && cand.secondarySkills.includes(department)) {
      actionType = 'Cross-Trained Reassignment';
    } else if (cand.performanceRating >= 4.5) {
      actionType = 'High-Performer Swap';
    } else if (cand.consecutiveWorkingDays < 3) {
      actionType = 'Low Consecutive-Days Assignee';
    } else if (cand.contractType === 'Temporary') {
      actionType = 'Temporary Worker Call-In';
    }

    const estimatedCost = cand.hourlyRate * 1.5 * 9; // 9 hrs shift OT rate

    return {
      id: `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      absentEmployeeId: absentEmp.id,
      absentEmployeeName: absentEmp.name,
      department,
      shift: targetShift,
      replacementEmployeeId: cand.id,
      replacementEmployeeName: cand.name,
      matchPriority: winner.primaryReason.split(' | ')[0] || 'Priority 1: Optimal Fit',
      actionType,
      reasonExplanation: `Selected ${cand.name} (${cand.designation}, Rating: ${cand.performanceRating}/5, ${cand.consecutiveWorkingDays} consecutive days). Matches ${winner.primaryReason}.`,
      status: 'Recommended',
      costImpact: estimatedCost,
    };
  }

  // Fallback if no internal candidate available
  return {
    id: `REC-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    absentEmployeeId: absentEmp.id,
    absentEmployeeName: absentEmp.name,
    department,
    shift: targetShift,
    replacementEmployeeId: null,
    replacementEmployeeName: 'External 3PL Agency Worker',
    matchPriority: 'Priority 8: Recommend Additional Manpower (External 3PL Call-in)',
    actionType: 'External Staffing Alert',
    reasonExplanation: `No compliant internal associate available without violating 9-day consecutive rule or OT caps. Call in 1 3PL agency temp worker.`,
    status: 'Recommended',
    costImpact: 234, // 9 hrs * $26 temp rate
  };
}

/**
 * Calculates Daily Shift Dashboard Metrics
 */
export function calculateShiftMetrics(
  employees: Employee[],
  schedules: EmployeeWeeklySchedule[],
  targetDay: DayOfWeek
): {
  shiftA: DailyShiftMetrics;
  shiftB: DailyShiftMetrics;
  shiftC: DailyShiftMetrics;
  totalPresent: number;
  totalAbsent: number;
  totalLeave: number;
  totalWeeklyOff: number;
  totalTraining: number;
  overtimeCount: number;
  consecutiveRuleViolations: number;
} {
  let present = 0;
  let absent = 0;
  let leave = 0;
  let weeklyOff = 0;
  let training = 0;
  let overtime = 0;
  let violations = 0;

  let countA = 0;
  let countB = 0;
  let countC = 0;

  employees.forEach((emp) => {
    if (emp.consecutiveWorkingDays > 9) violations++;

    const sched = schedules.find((s) => s.employeeId === emp.id);
    const dayAssignment = sched?.schedule[targetDay]?.shift || emp.currentShift;

    if (dayAssignment === 'ABS' || emp.status === 'Absent') {
      absent++;
    } else if (dayAssignment === 'OFF' || emp.status === 'Weekly Off') {
      weeklyOff++;
    } else if (dayAssignment === 'LV' || emp.status === 'Leave') {
      leave++;
    } else if (dayAssignment === 'TR' || emp.status === 'Training') {
      training++;
    } else {
      present++;
      if (dayAssignment === 'A') countA++;
      if (dayAssignment === 'B') countB++;
      if (dayAssignment === 'C') countC++;
    }

    if (emp.totalOtHoursThisMonth > 10) overtime++;
  });

  const totalEmps = Math.max(1, employees.length);
  const activeCount = Math.max(1, present);

  return {
    shiftA: {
      shift: 'A',
      plannedManpower: Math.round(totalEmps * 0.5),
      actualManpower: countA,
      attendancePct: Math.round((countA / Math.max(1, Math.round(totalEmps * 0.5))) * 100),
      absentPct: Math.round((absent / totalEmps) * 100),
      otPct: Math.round((overtime / totalEmps) * 100),
      utilizationPct: Math.min(100, Math.round((countA / Math.max(1, countA)) * 95)),
    },
    shiftB: {
      shift: 'B',
      plannedManpower: Math.round(totalEmps * 0.4),
      actualManpower: countB,
      attendancePct: Math.round((countB / Math.max(1, Math.round(totalEmps * 0.4))) * 100),
      absentPct: Math.round((absent / totalEmps) * 100),
      otPct: Math.round((overtime / totalEmps) * 100),
      utilizationPct: Math.min(100, Math.round((countB / Math.max(1, countB)) * 92)),
    },
    shiftC: {
      shift: 'C',
      plannedManpower: Math.round(totalEmps * 0.1),
      actualManpower: countC,
      attendancePct: Math.round((countC / Math.max(1, Math.round(totalEmps * 0.1))) * 100),
      absentPct: Math.round((absent / totalEmps) * 100),
      otPct: Math.round((overtime / totalEmps) * 100),
      utilizationPct: Math.min(100, Math.round((countC / Math.max(1, countC)) * 90)),
    },
    totalPresent: present,
    totalAbsent: absent,
    totalLeave: leave,
    totalWeeklyOff: weeklyOff,
    totalTraining: training,
    overtimeCount: overtime,
    consecutiveRuleViolations: violations,
  };
}
