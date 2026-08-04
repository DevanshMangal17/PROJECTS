export type OptimizationGoal = 'min_overtime' | 'max_utilization' | 'min_cost' | 'balanced_sla';

export type SkillLevel = 'beginner' | 'skilled' | 'expert';

export interface SkillMatrix {
  beginnerPct: number; // e.g. 20% (0.8x efficiency)
  skilledPct: number;  // e.g. 60% (1.0x efficiency)
  expertPct: number;   // e.g. 20% (1.25x efficiency)
}

export interface EquipmentConstraints {
  forkliftsAvailable: number;
  dockDoorsAvailable: number;
  scannersAvailable: number;
}

export interface InboundBenchmark {
  itemsPerPerson: number; // IPP items/hr
  skuComplexityFactor: number; // 1.0 to 2.0
  weightFactor: number; // 1.0 to 1.8 (heavy items slow down)
  receivingEfficiencyPct: number; // e.g. 90%
  dockAvailabilityPct: number; // e.g. 95%
  expectedDelayPct: number; // e.g. 5%
}

export interface OutboundBenchmark {
  itemsPerPerson: number; // IPP items/hr
  avgPicksPerHour: number;
  avgLinesPerOrder: number;
  waveEfficiencyPct: number; // e.g. 92%
  pickingAccuracyPct: number; // e.g. 99.2%
  packingEfficiencyPct: number; // e.g. 95%
  avgWalkingDistanceFactor: number; // 1.0 to 1.5
}

export interface AuditBenchmark {
  itemsAuditedPerPerson: number; // IPP items/hr
  auditSamplingPct: number; // e.g. 10% of total items
  auditAccuracyPct: number; // e.g. 99.5%
  documentationTimePerAuditMins: number; // e.g. 2 mins
  reworkPct: number; // e.g. 3% rework rate
}

export interface GeneralInputs {
  totalOrders: number;
  totalSkus: number;
  totalUnits: number;
  avgUnitsPerOrder: number;
  avgWeightPerOrderKg: number;
  avgCubeM3: number;
  workingShiftMins: number; // Default 600
  breakTimeMins: number; // Default 60
  workingDaysPerMonth: number;
  isPeakSeason: boolean;
  isWeekend: boolean;
  isHoliday: boolean;
}

export interface DepartmentPriority {
  inbound: number;  // 1 = top priority, 3 = lowest
  outbound: number;
  audit: number;
}

export interface ResourcePool {
  availableAssociates: number;
  availableSupervisors: number;
  multiSkilledAssociates: number;
  temporaryWorkers: number;
  maxOvertimeAllowedMins: number; // per associate, default 120
  maxWorkingHours: number; // max hours per shift (e.g. 12)
  maxAssociatesAllowed: number; // facility capacity cap
  absenteeismBufferPct: number; // e.g. 5% reserved for unplanned absence
  skillMatrix: SkillMatrix;
  equipment: EquipmentConstraints;
}

export interface FinancialRates {
  operatorCostPerHour: number; // $22
  supervisorCostPerHour: number; // $35
  tempWorkerCostPerHour: number; // $26
  overtimeMultiplier: number; // 1.5x
}

export interface DepartmentCalculation {
  department: 'Inbound' | 'Outbound' | 'Audit';
  rawWorkloadUnits: number;
  effectiveIpp: number;
  laborMinutesRequired: number;
  laborHoursRequired: number;
  baseManpowerRequired: number;
  assignedRegularAssociates: number;
  assignedMultiSkilledAssociates: number;
  assignedTempWorkers: number;
  assignedOvertimeHours: number;
  totalAllocatedManpower: number;
  effectiveCapacityUnits: number;
  utilizationPct: number;
  equipmentConstraintWarning?: string;
}

export interface AiRecommendation {
  id: string;
  type: 'warning' | 'optimization' | 'insight' | 'critical';
  title: string;
  message: string;
  impact: string; // e.g. "-2.5 hrs OT", "+5% Utilization"
  actionable?: {
    label: string;
    applyFn?: () => void;
  };
}

export interface HourlyShiftSlot {
  hour: string; // e.g. "06:00 - 07:00"
  orderArrivalPct: number;
  inboundWorkloadMins: number;
  outboundWorkloadMins: number;
  auditWorkloadMins: number;
  activeAssociates: number;
  isBreakPeriod: boolean;
  overtimeActive: boolean;
}

export interface SimulationResult {
  effectiveShiftMins: number; // e.g. 540
  totalAvailableAssociates: number;
  effectiveAvailableAssociates: number; // minus absenteeism buffer
  totalRequiredManpower: number;
  totalAllocatedManpower: number;
  totalIdleAssociates: number;
  totalOvertimeMins: number;
  totalOvertimeHours: number;
  totalTempWorkersNeeded: number;
  overallUtilizationPct: number;
  secondShiftRequired: boolean;
  slaCompliancePct: number;
  
  // Department specific
  inbound: DepartmentCalculation;
  outbound: DepartmentCalculation;
  audit: DepartmentCalculation;
  
  // Costs
  regularLaborCost: number;
  overtimeCost: number;
  tempWorkerCost: number;
  supervisorCost: number;
  totalLaborCost: number;
  costPerOrder: number;
  costPerUnit: number;
  costPerSku: number;

  // Hourly timeline
  hourlyTimeline: HourlyShiftSlot[];
  
  // Recommendations
  recommendations: AiRecommendation[];
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  inputs: GeneralInputs;
  inboundBenchmark: InboundBenchmark;
  outboundBenchmark: OutboundBenchmark;
  auditBenchmark: AuditBenchmark;
  resources: ResourcePool;
  financials: FinancialRates;
  priorities: DepartmentPriority;
  optimizationGoal: OptimizationGoal;
  manualOverrides?: {
    inboundManpower?: number;
    outboundManpower?: number;
    auditManpower?: number;
  };
  result?: SimulationResult;
}
