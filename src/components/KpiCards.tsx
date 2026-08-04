import React from 'react';
import {
  Package,
  Boxes,
  Layers,
  Users,
  UserCheck,
  Percent,
  Clock,
  UserX,
  Hourglass,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { SimulationResult, GeneralInputs } from '../types';

interface KpiCardsProps {
  result: SimulationResult;
  inputs: GeneralInputs;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ result, inputs }) => {
  // Utilization status color
  const util = result.overallUtilizationPct;
  let utilColor = 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30';
  let utilStatus = 'Optimal';
  let UtilIcon = CheckCircle2;

  if (util > 105) {
    utilColor = 'text-rose-600 dark:text-rose-400 border-rose-500/30 bg-rose-50 dark:bg-rose-950/30';
    utilStatus = 'Critical Surge';
    UtilIcon = AlertTriangle;
  } else if (util > 95 || util < 70) {
    utilColor = 'text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-50 dark:bg-amber-950/30';
    utilStatus = util > 95 ? 'High Load' : 'Underutilized';
    UtilIcon = AlertTriangle;
  }

  const kpiItems = [
    {
      label: 'Total Orders',
      value: inputs.totalOrders.toLocaleString(),
      subtext: `Avg ${(inputs.totalUnits / Math.max(1, inputs.totalOrders)).toFixed(1)} units/order`,
      icon: Package,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
    },
    {
      label: 'Total SKUs',
      value: inputs.totalSkus.toLocaleString(),
      subtext: `Avg Weight ${inputs.avgWeightPerOrderKg} kg`,
      icon: Boxes,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900',
    },
    {
      label: 'Total Units',
      value: inputs.totalUnits.toLocaleString(),
      subtext: `Volume ${inputs.avgCubeM3} m³`,
      icon: Layers,
      color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-900',
    },
    {
      label: 'Planned Manpower',
      value: `${result.totalAllocatedManpower} Headcount`,
      subtext: `Req: ${result.totalRequiredManpower} | Temp: ${result.totalTempWorkersNeeded}`,
      icon: Users,
      color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-900',
    },
    {
      label: 'Available Headcount',
      value: `${result.effectiveAvailableAssociates} Staff`,
      subtext: `Absence Buffer: ${inputs.workingShiftMins}m shift`,
      icon: UserCheck,
      color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-900',
    },
    {
      label: 'Utilization %',
      value: `${result.overallUtilizationPct}%`,
      subtext: utilStatus,
      icon: UtilIcon,
      color: utilColor,
      badge: true,
    },
    {
      label: 'Overtime Required',
      value: `${result.totalOvertimeHours} Hours`,
      subtext: `${result.totalOvertimeMins} mins total`,
      icon: Clock,
      color:
        result.totalOvertimeHours > 0
          ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900'
          : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
    },
    {
      label: 'Idle Manpower',
      value: `${result.totalIdleAssociates} Staff`,
      subtext: result.totalIdleAssociates > 0 ? 'Surplus available' : 'Fully allocated',
      icon: UserX,
      color: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800',
    },
    {
      label: 'Total Working Hours',
      value: `${(result.totalAllocatedManpower * (result.effectiveShiftMins / 60)).toFixed(1)} hrs`,
      subtext: `Shift: ${result.effectiveShiftMins}m net`,
      icon: Hourglass,
      color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3 my-4">
      {kpiItems.map((item, idx) => {
        const IconComponent = item.icon;
        return (
          <div
            key={idx}
            className={`p-3 rounded-xl border transition-all duration-200 ${item.color} shadow-sm hover:shadow-md flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold tracking-wide uppercase opacity-80 line-clamp-1">
                {item.label}
              </span>
              <IconComponent className="w-4 h-4 shrink-0 opacity-90" />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight">{item.value}</div>
              <div className="text-[10px] opacity-75 mt-0.5 truncate">{item.subtext}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
