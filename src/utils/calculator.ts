import {
  GeneralInputs,
  InboundBenchmark,
  OutboundBenchmark,
  AuditBenchmark,
  ResourcePool,
  FinancialRates,
  DepartmentPriority,
  OptimizationGoal,
  SimulationResult,
  DepartmentCalculation,
  AiRecommendation,
  HourlyShiftSlot,
} from '../types';

export function runSimulation(
  inputs: GeneralInputs,
  inboundBm: InboundBenchmark,
  outboundBm: OutboundBenchmark,
  auditBm: AuditBenchmark,
  resources: ResourcePool,
  financials: FinancialRates,
  priorities: DepartmentPriority,
  goal: OptimizationGoal,
  manualOverrides?: {
    inboundManpower?: number;
    outboundManpower?: number;
    auditManpower?: number;
  }
): SimulationResult {
  // 1. Effective Shift Time
  const effectiveShiftMins = Math.max(1, inputs.workingShiftMins - inputs.breakTimeMins);
  const shiftHoursPerPerson = effectiveShiftMins / 60;

  // 2. Skill Matrix Factor
  const sm = resources.skillMatrix;
  const skillMultiplier =
    (sm.beginnerPct / 100) * 0.8 +
    (sm.skilledPct / 100) * 1.0 +
    (sm.expertPct / 100) * 1.25;

  // 3. Absenteeism Buffer
  const totalRawAssociates = resources.availableAssociates;
  const absenteeismBufferAssociates = Math.round(
    totalRawAssociates * (resources.absenteeismBufferPct / 100)
  );
  const effectiveAvailableAssociates = Math.max(
    0,
    totalRawAssociates - absenteeismBufferAssociates
  );

  // Peak Season / Weekend / Holiday multipliers
  let workloadMultiplier = 1.0;
  if (inputs.isPeakSeason) workloadMultiplier *= 1.35;
  if (inputs.isWeekend) workloadMultiplier *= 1.15;
  if (inputs.isHoliday) workloadMultiplier *= 1.25;

  const adjustedUnits = Math.round(inputs.totalUnits * workloadMultiplier);
  const adjustedOrders = Math.round(inputs.totalOrders * workloadMultiplier);

  // --- INBOUND CALCULATION ---
  const inboundEffectiveIpp =
    inboundBm.itemsPerPerson *
    skillMultiplier *
    (1 / (inboundBm.skuComplexityFactor * (1 + (inputs.avgWeightPerOrderKg > 15 ? 0.2 : 0)))) *
    (inboundBm.receivingEfficiencyPct / 100);

  // Labor minutes for Inbound
  const inboundUnits = Math.round(adjustedUnits * 0.45); // ~45% receiving load
  const inboundBaseLaborMins = (inboundUnits / Math.max(1, inboundEffectiveIpp)) * 60;
  const inboundLaborMinsRequired =
    (inboundBaseLaborMins / (inboundBm.dockAvailabilityPct / 100)) *
    (1 + inboundBm.expectedDelayPct / 100);
  const inboundLaborHoursRequired = inboundLaborMinsRequired / 60;
  const inboundBaseManpowerRequired = Math.ceil(inboundLaborMinsRequired / effectiveShiftMins);

  // --- OUTBOUND CALCULATION ---
  const outboundEffectiveIpp =
    outboundBm.itemsPerPerson *
    skillMultiplier *
    (1 / outboundBm.avgWalkingDistanceFactor) *
    (outboundBm.waveEfficiencyPct / 100) *
    (outboundBm.packingEfficiencyPct / 100);

  const outboundUnits = adjustedUnits; // 100% picking/packing load
  const outboundBaseLaborMins = (outboundUnits / Math.max(1, outboundEffectiveIpp)) * 60;
  const outboundLaborMinsRequired =
    outboundBaseLaborMins * (1 + (100 - outboundBm.pickingAccuracyPct) / 100);
  const outboundLaborHoursRequired = outboundLaborMinsRequired / 60;
  const outboundBaseManpowerRequired = Math.ceil(outboundLaborMinsRequired / effectiveShiftMins);

  // --- AUDIT CALCULATION ---
  const auditUnitsToSample = Math.round(adjustedUnits * (auditBm.auditSamplingPct / 100));
  const auditEffectiveIpp = auditBm.itemsAuditedPerPerson * skillMultiplier * (auditBm.auditAccuracyPct / 100);
  const auditBaseLaborMins = (auditUnitsToSample / Math.max(1, auditEffectiveIpp)) * 60;
  const docAndReworkMins =
    (auditUnitsToSample / 15) * auditBm.documentationTimePerAuditMins +
    auditBaseLaborMins * (auditBm.reworkPct / 100);
  const auditLaborMinsRequired = auditBaseLaborMins + docAndReworkMins;
  const auditLaborHoursRequired = auditLaborMinsRequired / 60;
  const auditBaseManpowerRequired = Math.ceil(auditLaborMinsRequired / effectiveShiftMins);

  const totalRequiredManpower =
    inboundBaseManpowerRequired + outboundBaseManpowerRequired + auditBaseManpowerRequired;

  // --- SMART ALLOCATION LOGIC ---
  let assignedInbound = 0;
  let assignedOutbound = 0;
  let assignedAudit = 0;

  let assignedInboundMulti = 0;
  let assignedOutboundMulti = 0;
  let assignedAuditMulti = 0;

  let assignedInboundTemp = 0;
  let assignedOutboundTemp = 0;
  let assignedAuditTemp = 0;

  let inboundOtHours = 0;
  let outboundOtHours = 0;
  let auditOtHours = 0;

  // Check manual overrides
  const isManual =
    manualOverrides &&
    (manualOverrides.inboundManpower !== undefined ||
      manualOverrides.outboundManpower !== undefined ||
      manualOverrides.auditManpower !== undefined);

  if (isManual) {
    assignedInbound = manualOverrides.inboundManpower ?? inboundBaseManpowerRequired;
    assignedOutbound = manualOverrides.outboundManpower ?? outboundBaseManpowerRequired;
    assignedAudit = manualOverrides.auditManpower ?? auditBaseManpowerRequired;
  } else {
    // Smart Priority Allocation
    let poolRegular = effectiveAvailableAssociates;
    let poolMulti = resources.multiSkilledAssociates;

    // Create priority queue
    const depts = [
      { name: 'outbound' as const, req: outboundBaseManpowerRequired },
      { name: 'inbound' as const, req: inboundBaseManpowerRequired },
      { name: 'audit' as const, req: auditBaseManpowerRequired },
    ].sort((a, b) => priorities[a.name] - priorities[b.name]);

    for (const d of depts) {
      let needed = d.req;
      // Step 1: Assign from regular pool
      const takeRegular = Math.min(poolRegular, needed);
      poolRegular -= takeRegular;
      needed -= takeRegular;

      // Step 2: Assign multi-skilled if needed
      const takeMulti = Math.min(poolMulti, needed);
      poolMulti -= takeMulti;
      needed -= takeMulti;

      if (d.name === 'outbound') {
        assignedOutbound = takeRegular;
        assignedOutboundMulti = takeMulti;
      } else if (d.name === 'inbound') {
        assignedInbound = takeRegular;
        assignedInboundMulti = takeMulti;
      } else {
        assignedAudit = takeRegular;
        assignedAuditMulti = takeMulti;
      }
    }

    // Allocate leftover pool if available
    if (poolRegular > 0 || poolMulti > 0) {
      // Put surplus into highest priority or idle
    }

    // Address Deficits using OT & Temp Workers
    const inboundTotalAssigned = assignedInbound + assignedInboundMulti;
    const outboundTotalAssigned = assignedOutbound + assignedOutboundMulti;
    const auditTotalAssigned = assignedAudit + assignedAuditMulti;

    const inboundDeficitMins = Math.max(0, inboundLaborMinsRequired - inboundTotalAssigned * effectiveShiftMins);
    const outboundDeficitMins = Math.max(0, outboundLaborMinsRequired - outboundTotalAssigned * effectiveShiftMins);
    const auditDeficitMins = Math.max(0, auditLaborMinsRequired - auditTotalAssigned * effectiveShiftMins);

    // Goal based strategy
    if (goal === 'min_overtime') {
      // Prefer temp workers over overtime
      assignedInboundTemp = Math.ceil(inboundDeficitMins / effectiveShiftMins);
      assignedOutboundTemp = Math.ceil(outboundDeficitMins / effectiveShiftMins);
      assignedAuditTemp = Math.ceil(auditDeficitMins / effectiveShiftMins);
    } else {
      // Default: Use allowable overtime first up to limit, then temp workers
      const maxOtHoursPerPerson = resources.maxOvertimeAllowedMins / 60;

      // Outbound OT
      if (outboundDeficitMins > 0 && outboundTotalAssigned > 0) {
        const potentialOtHours = outboundDeficitMins / 60;
        const maxCapacityOtHours = outboundTotalAssigned * maxOtHoursPerPerson;
        outboundOtHours = Math.min(potentialOtHours, maxCapacityOtHours);
        const remainingDeficitMins = outboundDeficitMins - outboundOtHours * 60;
        if (remainingDeficitMins > 0) {
          assignedOutboundTemp = Math.ceil(remainingDeficitMins / effectiveShiftMins);
        }
      } else if (outboundDeficitMins > 0) {
        assignedOutboundTemp = Math.ceil(outboundDeficitMins / effectiveShiftMins);
      }

      // Inbound OT
      if (inboundDeficitMins > 0 && inboundTotalAssigned > 0) {
        const potentialOtHours = inboundDeficitMins / 60;
        const maxCapacityOtHours = inboundTotalAssigned * maxOtHoursPerPerson;
        inboundOtHours = Math.min(potentialOtHours, maxCapacityOtHours);
        const remainingDeficitMins = inboundDeficitMins - inboundOtHours * 60;
        if (remainingDeficitMins > 0) {
          assignedInboundTemp = Math.ceil(remainingDeficitMins / effectiveShiftMins);
        }
      } else if (inboundDeficitMins > 0) {
        assignedInboundTemp = Math.ceil(inboundDeficitMins / effectiveShiftMins);
      }

      // Audit OT
      if (auditDeficitMins > 0 && auditTotalAssigned > 0) {
        const potentialOtHours = auditDeficitMins / 60;
        const maxCapacityOtHours = auditTotalAssigned * maxOtHoursPerPerson;
        auditOtHours = Math.min(potentialOtHours, maxCapacityOtHours);
        const remainingDeficitMins = auditDeficitMins - auditOtHours * 60;
        if (remainingDeficitMins > 0) {
          assignedAuditTemp = Math.ceil(remainingDeficitMins / effectiveShiftMins);
        }
      } else if (auditDeficitMins > 0) {
        assignedAuditTemp = Math.ceil(auditDeficitMins / effectiveShiftMins);
      }
    }
  }

  // Summarize per department
  const inboundAllocated = assignedInbound + assignedInboundMulti + assignedInboundTemp;
  const outboundAllocated = assignedOutbound + assignedOutboundMulti + assignedOutboundTemp;
  const auditAllocated = assignedAudit + assignedAuditMulti + assignedAuditTemp;

  const totalAllocatedManpower = inboundAllocated + outboundAllocated + auditAllocated;

  // Effective capacity units per dept
  const inboundCapacity = Math.round(inboundAllocated * shiftHoursPerPerson * inboundEffectiveIpp * (inboundBm.dockAvailabilityPct / 100));
  const outboundCapacity = Math.round(outboundAllocated * shiftHoursPerPerson * outboundEffectiveIpp);
  const auditCapacity = Math.round(auditAllocated * shiftHoursPerPerson * auditEffectiveIpp);

  const inboundUtil = Math.min(150, Math.round((inboundLaborHoursRequired / Math.max(0.1, inboundAllocated * shiftHoursPerPerson + inboundOtHours)) * 100));
  const outboundUtil = Math.min(150, Math.round((outboundLaborHoursRequired / Math.max(0.1, outboundAllocated * shiftHoursPerPerson + outboundOtHours)) * 100));
  const auditUtil = Math.min(150, Math.round((auditLaborHoursRequired / Math.max(0.1, auditAllocated * shiftHoursPerPerson + auditOtHours)) * 100));

  // Equipment warnings
  let inboundEquipWarn: string | undefined;
  if (inboundAllocated > resources.equipment.dockDoorsAvailable * 2) {
    inboundEquipWarn = `Dock doors bottleneck! ${inboundAllocated} assigned vs ${resources.equipment.dockDoorsAvailable} dock doors (max ~${resources.equipment.dockDoorsAvailable * 2} workers).`;
  }

  let outboundEquipWarn: string | undefined;
  if (outboundAllocated > resources.equipment.scannersAvailable) {
    outboundEquipWarn = `Scanner shortage! ${outboundAllocated} workers allocated vs ${resources.equipment.scannersAvailable} RF Scanners.`;
  }

  const inboundCalc: DepartmentCalculation = {
    department: 'Inbound',
    rawWorkloadUnits: inboundUnits,
    effectiveIpp: Math.round(inboundEffectiveIpp),
    laborMinutesRequired: Math.round(inboundLaborMinsRequired),
    laborHoursRequired: Number(inboundLaborHoursRequired.toFixed(1)),
    baseManpowerRequired: inboundBaseManpowerRequired,
    assignedRegularAssociates: assignedInbound,
    assignedMultiSkilledAssociates: assignedInboundMulti,
    assignedTempWorkers: assignedInboundTemp,
    assignedOvertimeHours: Number(inboundOtHours.toFixed(1)),
    totalAllocatedManpower: inboundAllocated,
    effectiveCapacityUnits: inboundCapacity,
    utilizationPct: inboundUtil,
    equipmentConstraintWarning: inboundEquipWarn,
  };

  const outboundCalc: DepartmentCalculation = {
    department: 'Outbound',
    rawWorkloadUnits: outboundUnits,
    effectiveIpp: Math.round(outboundEffectiveIpp),
    laborMinutesRequired: Math.round(outboundLaborMinsRequired),
    laborHoursRequired: Number(outboundLaborHoursRequired.toFixed(1)),
    baseManpowerRequired: outboundBaseManpowerRequired,
    assignedRegularAssociates: assignedOutbound,
    assignedMultiSkilledAssociates: assignedOutboundMulti,
    assignedTempWorkers: assignedOutboundTemp,
    assignedOvertimeHours: Number(outboundOtHours.toFixed(1)),
    totalAllocatedManpower: outboundAllocated,
    effectiveCapacityUnits: outboundCapacity,
    utilizationPct: outboundUtil,
    equipmentConstraintWarning: outboundEquipWarn,
  };

  const auditCalc: DepartmentCalculation = {
    department: 'Audit',
    rawWorkloadUnits: auditUnitsToSample,
    effectiveIpp: Math.round(auditEffectiveIpp),
    laborMinutesRequired: Math.round(auditLaborMinsRequired),
    laborHoursRequired: Number(auditLaborHoursRequired.toFixed(1)),
    baseManpowerRequired: auditBaseManpowerRequired,
    assignedRegularAssociates: assignedAudit,
    assignedMultiSkilledAssociates: assignedAuditMulti,
    assignedTempWorkers: assignedAuditTemp,
    assignedOvertimeHours: Number(auditOtHours.toFixed(1)),
    totalAllocatedManpower: auditAllocated,
    effectiveCapacityUnits: auditCapacity,
    utilizationPct: auditUtil,
  };

  // Overall calculations
  const totalOvertimeHours = inboundOtHours + outboundOtHours + auditOtHours;
  const totalOvertimeMins = Math.round(totalOvertimeHours * 60);
  const totalTempWorkersNeeded = assignedInboundTemp + assignedOutboundTemp + assignedAuditTemp;
  const totalIdleAssociates = Math.max(0, effectiveAvailableAssociates - (assignedInbound + assignedOutbound + assignedAudit));

  const totalCapacityHours = totalAllocatedManpower * shiftHoursPerPerson + totalOvertimeHours;
  const totalRequiredHours = inboundLaborHoursRequired + outboundLaborHoursRequired + auditLaborHoursRequired;
  const overallUtilizationPct = Math.min(150, Math.round((totalRequiredHours / Math.max(0.1, totalCapacityHours)) * 100));

  const secondShiftRequired = totalOvertimeHours > (totalAllocatedManpower * (resources.maxOvertimeAllowedMins / 60)) || overallUtilizationPct > 120;

  let slaCompliancePct = 100;
  if (outboundUtil > 100) {
    slaCompliancePct = Math.max(50, 100 - (outboundUtil - 100) * 1.5);
  }
  if (secondShiftRequired) slaCompliancePct = Math.min(slaCompliancePct, 75);

  // Financial calculations
  const regHours = totalAllocatedManpower * (inputs.workingShiftMins / 60);
  const regularLaborCost = regHours * financials.operatorCostPerHour;
  const supervisorCost = resources.availableSupervisors * (inputs.workingShiftMins / 60) * financials.supervisorCostPerHour;
  const tempWorkerCost = totalTempWorkersNeeded * (inputs.workingShiftMins / 60) * financials.tempWorkerCostPerHour;
  const overtimeCost = totalOvertimeHours * financials.operatorCostPerHour * financials.overtimeMultiplier;
  const totalLaborCost = regularLaborCost + supervisorCost + tempWorkerCost + overtimeCost;

  const costPerOrder = Number((totalLaborCost / Math.max(1, adjustedOrders)).toFixed(2));
  const costPerUnit = Number((totalLaborCost / Math.max(1, adjustedUnits)).toFixed(3));
  const costPerSku = Number((totalLaborCost / Math.max(1, inputs.totalSkus)).toFixed(2));

  // Timeline (12 slots from 06:00 to 18:00)
  const hourlyTimeline: HourlyShiftSlot[] = [
    { hour: '06:00 - 07:00', orderArrivalPct: 5, inboundWorkloadMins: 60, outboundWorkloadMins: 30, auditWorkloadMins: 10, activeAssociates: totalAllocatedManpower, isBreakPeriod: false, overtimeActive: false },
    { hour: '07:00 - 08:00', orderArrivalPct: 8, inboundWorkloadMins: 60, outboundWorkloadMins: 45, auditWorkloadMins: 15, activeAssociates: totalAllocatedManpower, isBreakPeriod: false, overtimeActive: false },
    { hour: '08:00 - 09:00', orderArrivalPct: 12, inboundWorkloadMins: 50, outboundWorkloadMins: 60, auditWorkloadMins: 20, activeAssociates: totalAllocatedManpower, isBreakPeriod: false, overtimeActive: false },
    { hour: '09:00 - 10:00', orderArrivalPct: 15, inboundWorkloadMins: 40, outboundWorkloadMins: 75, auditWorkloadMins: 25, activeAssociates: totalAllocatedManpower, isBreakPeriod: false, overtimeActive: false },
    { hour: '10:00 - 11:00', orderArrivalPct: 14, inboundWorkloadMins: 30, outboundWorkloadMins: 70, auditWorkloadMins: 20, activeAssociates: totalAllocatedManpower, isBreakPeriod: false, overtimeActive: false },
    { hour: '11:00 - 12:00', orderArrivalPct: 10, inboundWorkloadMins: 20, outboundWorkloadMins: 60, auditWorkloadMins: 15, activeAssociates: totalAllocatedManpower, isBreakPeriod: false, overtimeActive: false },
    { hour: '12:00 - 13:00', orderArrivalPct: 4, inboundWorkloadMins: 0, outboundWorkloadMins: 0, auditWorkloadMins: 0, activeAssociates: 0, isBreakPeriod: true, overtimeActive: false },
    { hour: '13:00 - 14:00', orderArrivalPct: 11, inboundWorkloadMins: 30, outboundWorkloadMins: 65, auditWorkloadMins: 20, activeAssociates: totalAllocatedManpower, isBreakPeriod: false, overtimeActive: false },
    { hour: '14:00 - 15:00', orderArrivalPct: 9, inboundWorkloadMins: 30, outboundWorkloadMins: 55, auditWorkloadMins: 20, activeAssociates: totalAllocatedManpower, isBreakPeriod: false, overtimeActive: false },
    { hour: '15:00 - 16:00', orderArrivalPct: 6, inboundWorkloadMins: 20, outboundWorkloadMins: 45, auditWorkloadMins: 15, activeAssociates: totalAllocatedManpower, isBreakPeriod: false, overtimeActive: false },
    { hour: '16:00 - 17:00', orderArrivalPct: 4, inboundWorkloadMins: 10, outboundWorkloadMins: 30, auditWorkloadMins: 10, activeAssociates: totalAllocatedManpower, isBreakPeriod: false, overtimeActive: false },
    { hour: '17:00 - 18:00', orderArrivalPct: 2, inboundWorkloadMins: 0, outboundWorkloadMins: 15, auditWorkloadMins: 5, activeAssociates: totalOvertimeHours > 0 ? totalAllocatedManpower : 0, isBreakPeriod: false, overtimeActive: totalOvertimeHours > 0 },
  ];

  // Recommendations Generation
  const recommendations: AiRecommendation[] = [];

  if (outboundUtil > 105) {
    recommendations.push({
      id: 'rec_outbound_ot',
      type: 'critical',
      title: 'Outbound SLA Risk & Overtime Required',
      message: `Outbound utilization is at ${outboundUtil}%. Dispatch cutoff is at risk. Recommend allocating ${Math.ceil((outboundLaborHoursRequired - outboundAllocated * shiftHoursPerPerson) / shiftHoursPerPerson)} additional associates or authorizing ${outboundOtHours.toFixed(1)} hrs overtime.`,
      impact: `Reduces Outbound Overtime & Protects 100% Dispatch SLA`,
    });
  }

  if (inboundUtil < 70 && outboundUtil > 90) {
    recommendations.push({
      id: 'rec_cross_train_shift',
      type: 'optimization',
      title: 'Dynamic Workload Balancing Opportunity',
      message: `Inbound utilization is low (${inboundUtil}%), while Outbound is heavy (${outboundUtil}%). Reallocate 2-3 multi-skilled associates from Inbound to Outbound during the afternoon peak.`,
      impact: `Saves ~$${Math.round(2.5 * financials.operatorCostPerHour * financials.overtimeMultiplier)} in OT costs`,
    });
  }

  if (inboundEquipWarn) {
    recommendations.push({
      id: 'rec_dock_warn',
      type: 'warning',
      title: 'Dock Door Bottleneck Detected',
      message: inboundEquipWarn,
      impact: `Stagger receiving slots to prevent idle dock wait times`,
    });
  }

  if (outboundEquipWarn) {
    recommendations.push({
      id: 'rec_scanner_warn',
      type: 'warning',
      title: 'RF Scanner Hardware Deficit',
      message: outboundEquipWarn,
      impact: `Procure additional RF handheld scanners or establish paired picking`,
    });
  }

  if (resources.absenteeismBufferPct > 0) {
    recommendations.push({
      id: 'rec_absenteeism',
      type: 'insight',
      title: 'Absenteeism Buffer Active',
      message: `${absenteeismBufferAssociates} associates reserved as a ${resources.absenteeismBufferPct}% attendance protection buffer. Effective headcount available is ${effectiveAvailableAssociates}.`,
      impact: `Ensures shift stability against unexpected call-outs`,
    });
  }

  if (secondShiftRequired) {
    recommendations.push({
      id: 'rec_second_shift',
      type: 'critical',
      title: 'Second Shift Recommendation',
      message: `Total labor requirement exceeds maximum overtime limits. Recommend opening a 2nd Evening Shift (4 hours) rather than accumulating heavy single-shift fatigue.`,
      impact: `Prevents worker burnout and mitigates fatigue productivity loss`,
    });
  } else {
    recommendations.push({
      id: 'rec_single_shift',
      type: 'insight',
      title: 'Shift Structure Optimal',
      message: 'Single shift operation with targeted overtime is sufficient to complete daily workload.',
      impact: 'No 2nd shift overhead required',
    });
  }

  return {
    effectiveShiftMins,
    totalAvailableAssociates: resources.availableAssociates,
    effectiveAvailableAssociates,
    totalRequiredManpower,
    totalAllocatedManpower,
    totalIdleAssociates,
    totalOvertimeMins,
    totalOvertimeHours: Number(totalOvertimeHours.toFixed(1)),
    totalTempWorkersNeeded,
    overallUtilizationPct,
    secondShiftRequired,
    slaCompliancePct: Number(slaCompliancePct.toFixed(1)),

    inbound: inboundCalc,
    outbound: outboundCalc,
    audit: auditCalc,

    regularLaborCost: Math.round(regularLaborCost),
    overtimeCost: Math.round(overtimeCost),
    tempWorkerCost: Math.round(tempWorkerCost),
    supervisorCost: Math.round(supervisorCost),
    totalLaborCost: Math.round(totalLaborCost),
    costPerOrder,
    costPerUnit,
    costPerSku,

    hourlyTimeline,
    recommendations,
  };
}
