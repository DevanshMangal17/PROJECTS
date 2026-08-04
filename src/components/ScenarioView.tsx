import React, { useState } from 'react';
import {
  SlidersHorizontal,
  BookmarkPlus,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Trash2,
  Layers,
} from 'lucide-react';
import {
  GeneralInputs,
  InboundBenchmark,
  OutboundBenchmark,
  AuditBenchmark,
  ResourcePool,
  FinancialRates,
  DepartmentPriority,
  OptimizationGoal,
  Scenario,
  SimulationResult,
} from '../types';
import { runSimulation } from '../utils/calculator';

interface ScenarioViewProps {
  inputs: GeneralInputs;
  inboundBm: InboundBenchmark;
  outboundBm: OutboundBenchmark;
  auditBm: AuditBenchmark;
  resources: ResourcePool;
  financials: FinancialRates;
  priorities: DepartmentPriority;
  goal: OptimizationGoal;
  currentResult: SimulationResult;
  onApplyScenarioInputs: (scenario: Scenario) => void;
}

export const ScenarioView: React.FC<ScenarioViewProps> = ({
  inputs,
  inboundBm,
  outboundBm,
  auditBm,
  resources,
  financials,
  priorities,
  goal,
  currentResult,
  onApplyScenarioInputs,
}) => {
  // What-if Sliders State
  const [orderSurgePct, setOrderSurgePct] = useState<number>(0);
  const [ippBoostPct, setIppBoostPct] = useState<number>(0);
  const [absenteeismPct, setAbsenteeismPct] = useState<number>(resources.absenteeismBufferPct);

  // Saved scenarios list
  const [savedScenarios, setSavedScenarios] = useState<Scenario[]>([]);
  const [newScenarioName, setNewScenarioName] = useState<string>('');

  // Calculate What-if modified simulation
  const adjustedInputs: GeneralInputs = {
    ...inputs,
    totalOrders: Math.round(inputs.totalOrders * (1 + orderSurgePct / 100)),
    totalUnits: Math.round(inputs.totalUnits * (1 + orderSurgePct / 100)),
  };

  const adjustedInboundBm: InboundBenchmark = {
    ...inboundBm,
    itemsPerPerson: Math.round(inboundBm.itemsPerPerson * (1 + ippBoostPct / 100)),
  };

  const adjustedOutboundBm: OutboundBenchmark = {
    ...outboundBm,
    itemsPerPerson: Math.round(outboundBm.itemsPerPerson * (1 + ippBoostPct / 100)),
  };

  const adjustedResources: ResourcePool = {
    ...resources,
    absenteeismBufferPct: absenteeismPct,
  };

  const whatIfResult = runSimulation(
    adjustedInputs,
    adjustedInboundBm,
    adjustedOutboundBm,
    auditBm,
    adjustedResources,
    financials,
    priorities,
    goal
  );

  // Default preset scenarios for comparison
  const scenarioOvertimeOnly = runSimulation(
    adjustedInputs,
    adjustedInboundBm,
    adjustedOutboundBm,
    auditBm,
    { ...adjustedResources, temporaryWorkers: 0 },
    financials,
    priorities,
    'balanced_sla'
  );

  const scenarioTempOnly = runSimulation(
    adjustedInputs,
    adjustedInboundBm,
    adjustedOutboundBm,
    auditBm,
    adjustedResources,
    financials,
    priorities,
    'min_overtime'
  );

  const handleSaveScenario = () => {
    if (!newScenarioName.trim()) return;
    const newSc: Scenario = {
      id: `sc_${Date.now()}`,
      name: newScenarioName,
      description: `Surge: +${orderSurgePct}%, IPP: ${ippBoostPct}%, Absence: ${absenteeismPct}%`,
      inputs: adjustedInputs,
      inboundBenchmark: adjustedInboundBm,
      outboundBenchmark: adjustedOutboundBm,
      auditBenchmark: auditBm,
      resources: adjustedResources,
      financials,
      priorities,
      optimizationGoal: goal,
      result: whatIfResult,
    };
    setSavedScenarios([...savedScenarios, newSc]);
    setNewScenarioName('');
  };

  const handleDeleteScenario = (id: string) => {
    setSavedScenarios(savedScenarios.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-slate-900 text-white shadow-md border border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
            What-If Sensitivity Sandbox & Multi-Scenario Comparison
          </h2>
          <p className="text-xs text-slate-400">
            Simulate real-time demand spikes, productivity changes, call-outs, and compare trade-offs across strategies.
          </p>
        </div>
      </div>

      {/* What-If Interactive Controls */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            What-If Sensitivity Sliders
          </h3>
          <span className="text-xs text-slate-500">Real-Time Instant Recalculation</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Slider 1: Order Surge */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Order Volume Spike / Surge:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">+{orderSurgePct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={orderSurgePct}
              onChange={(e) => setOrderSurgePct(Number(e.target.value))}
              className="w-full mt-2 accent-blue-600 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Simulates marketing promotion or Cyber surge (+{Math.round(inputs.totalUnits * (orderSurgePct / 100))} units).
            </p>
          </div>

          {/* Slider 2: IPP Boost */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Productivity / IPP Target Delta:</span>
              <span className="font-bold text-violet-600 dark:text-violet-400">
                {ippBoostPct >= 0 ? `+${ippBoostPct}%` : `${ippBoostPct}%`}
              </span>
            </div>
            <input
              type="range"
              min="-30"
              max="30"
              step="5"
              value={ippBoostPct}
              onChange={(e) => setIppBoostPct(Number(e.target.value))}
              className="w-full mt-2 accent-violet-600 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Test impact of industrial engineering speed improvement or slowdowns.
            </p>
          </div>

          {/* Slider 3: Absenteeism Buffer */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Unplanned Absenteeism Rate:</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">{absenteeismPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              value={absenteeismPct}
              onChange={(e) => setAbsenteeismPct(Number(e.target.value))}
              className="w-full mt-2 accent-amber-600 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Reserves manpower buffer to withstand unexpected shift call-outs.
            </p>
          </div>
        </div>

        {/* Save Custom Scenario Input */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Name custom scenario (e.g., '50% Surge + Overtime Strategy')..."
            value={newScenarioName}
            onChange={(e) => setNewScenarioName(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleSaveScenario}
            disabled={!newScenarioName.trim()}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>Save Scenario</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Comparison Matrix */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 overflow-x-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-600" />
            Strategy Comparison Matrix
          </h3>
          <span className="text-xs text-slate-500">Baseline vs What-If Options</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <th className="py-2.5 px-3">Metric</th>
              <th className="py-2.5 px-3 font-bold text-blue-600 dark:text-blue-400">
                Baseline (Current)
              </th>
              <th className="py-2.5 px-3 font-bold text-indigo-600 dark:text-indigo-400">
                What-If Sandbox
              </th>
              <th className="py-2.5 px-3 font-bold text-amber-600 dark:text-amber-400">
                Overtime Heavy Strategy
              </th>
              <th className="py-2.5 px-3 font-bold text-teal-600 dark:text-teal-400">
                Temp Worker Strategy
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            <tr>
              <td className="py-2.5 px-3 font-semibold">Total Daily Orders</td>
              <td className="py-2.5 px-3">{inputs.totalOrders.toLocaleString()}</td>
              <td className="py-2.5 px-3 font-semibold">{adjustedInputs.totalOrders.toLocaleString()}</td>
              <td className="py-2.5 px-3">{adjustedInputs.totalOrders.toLocaleString()}</td>
              <td className="py-2.5 px-3">{adjustedInputs.totalOrders.toLocaleString()}</td>
            </tr>
            <tr>
              <td className="py-2.5 px-3 font-semibold">Required Headcount</td>
              <td className="py-2.5 px-3">{currentResult.totalRequiredManpower} Staff</td>
              <td className="py-2.5 px-3 font-semibold">{whatIfResult.totalRequiredManpower} Staff</td>
              <td className="py-2.5 px-3">{scenarioOvertimeOnly.totalRequiredManpower} Staff</td>
              <td className="py-2.5 px-3">{scenarioTempOnly.totalRequiredManpower} Staff</td>
            </tr>
            <tr>
              <td className="py-2.5 px-3 font-semibold">Allocated Headcount</td>
              <td className="py-2.5 px-3">{currentResult.totalAllocatedManpower} Staff</td>
              <td className="py-2.5 px-3 font-semibold">{whatIfResult.totalAllocatedManpower} Staff</td>
              <td className="py-2.5 px-3">{scenarioOvertimeOnly.totalAllocatedManpower} Staff</td>
              <td className="py-2.5 px-3">{scenarioTempOnly.totalAllocatedManpower} Staff</td>
            </tr>
            <tr>
              <td className="py-2.5 px-3 font-semibold">Overtime Required</td>
              <td className="py-2.5 px-3">{currentResult.totalOvertimeHours} hrs</td>
              <td className="py-2.5 px-3 font-semibold">{whatIfResult.totalOvertimeHours} hrs</td>
              <td className="py-2.5 px-3">{scenarioOvertimeOnly.totalOvertimeHours} hrs</td>
              <td className="py-2.5 px-3">{scenarioTempOnly.totalOvertimeHours} hrs</td>
            </tr>
            <tr>
              <td className="py-2.5 px-3 font-semibold">Temp Workers Call-In</td>
              <td className="py-2.5 px-3">{currentResult.totalTempWorkersNeeded} Workers</td>
              <td className="py-2.5 px-3 font-semibold">{whatIfResult.totalTempWorkersNeeded} Workers</td>
              <td className="py-2.5 px-3">{scenarioOvertimeOnly.totalTempWorkersNeeded} Workers</td>
              <td className="py-2.5 px-3">{scenarioTempOnly.totalTempWorkersNeeded} Workers</td>
            </tr>
            <tr>
              <td className="py-2.5 px-3 font-semibold">Utilization Rate</td>
              <td className="py-2.5 px-3 font-bold">{currentResult.overallUtilizationPct}%</td>
              <td className="py-2.5 px-3 font-bold text-indigo-600">{whatIfResult.overallUtilizationPct}%</td>
              <td className="py-2.5 px-3 font-bold">{scenarioOvertimeOnly.overallUtilizationPct}%</td>
              <td className="py-2.5 px-3 font-bold">{scenarioTempOnly.overallUtilizationPct}%</td>
            </tr>
            <tr>
              <td className="py-2.5 px-3 font-semibold">Total Daily Labor Cost</td>
              <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                ${currentResult.totalLaborCost.toLocaleString()}
              </td>
              <td className="py-2.5 px-3 font-bold text-indigo-600 dark:text-indigo-400">
                ${whatIfResult.totalLaborCost.toLocaleString()}
              </td>
              <td className="py-2.5 px-3 font-bold">
                ${scenarioOvertimeOnly.totalLaborCost.toLocaleString()}
              </td>
              <td className="py-2.5 px-3 font-bold">
                ${scenarioTempOnly.totalLaborCost.toLocaleString()}
              </td>
            </tr>
            <tr>
              <td className="py-2.5 px-3 font-semibold">Cost per Order</td>
              <td className="py-2.5 px-3">${currentResult.costPerOrder}</td>
              <td className="py-2.5 px-3 font-semibold">${whatIfResult.costPerOrder}</td>
              <td className="py-2.5 px-3">${scenarioOvertimeOnly.costPerOrder}</td>
              <td className="py-2.5 px-3">${scenarioTempOnly.costPerOrder}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Saved Custom Scenarios List */}
      {savedScenarios.length > 0 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Saved Custom Scenarios</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedScenarios.map((sc) => (
              <div
                key={sc.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{sc.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{sc.description}</p>
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                    Cost: ${sc.result?.totalLaborCost.toLocaleString()} • Util: {sc.result?.overallUtilizationPct}%
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onApplyScenarioInputs(sc)}
                    className="px-2.5 py-1 text-xs font-semibold rounded bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => handleDeleteScenario(sc.id)}
                    className="p-1 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
