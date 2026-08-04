import React, { useState, useEffect } from 'react';
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
} from './types';
import { DEFAULT_PRESETS } from './utils/presets';
import { runSimulation } from './utils/calculator';
import { Header } from './components/Header';
import { KpiCards } from './components/KpiCards';
import { DashboardView } from './components/DashboardView';
import { BenchmarksView } from './components/BenchmarksView';
import { ResourcesView } from './components/ResourcesView';
import { ShiftTimelineView } from './components/ShiftTimelineView';
import { ScenarioView } from './components/ScenarioView';
import { CostAnalysisView } from './components/CostAnalysisView';
import { ReportsView } from './components/ReportsView';
import { RosterContainer } from './components/roster/RosterContainer';

export default function App() {
  const defaultPreset = DEFAULT_PRESETS[0];

  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentPresetId, setCurrentPresetId] = useState<string>(defaultPreset.id);

  // Core Simulation State
  const [inputs, setInputs] = useState<GeneralInputs>(defaultPreset.inputs);
  const [inboundBm, setInboundBm] = useState<InboundBenchmark>(defaultPreset.inboundBenchmark);
  const [outboundBm, setOutboundBm] = useState<OutboundBenchmark>(defaultPreset.outboundBenchmark);
  const [auditBm, setAuditBm] = useState<AuditBenchmark>(defaultPreset.auditBenchmark);
  const [resources, setResources] = useState<ResourcePool>(defaultPreset.resources);
  const [financials, setFinancials] = useState<FinancialRates>(defaultPreset.financials);
  const [priorities, setPriorities] = useState<DepartmentPriority>(defaultPreset.priorities);
  const [goal, setGoal] = useState<OptimizationGoal>(defaultPreset.optimizationGoal);

  // Manual Overrides State
  const [manualOverrides, setManualOverrides] = useState<{
    inboundManpower?: number;
    outboundManpower?: number;
    auditManpower?: number;
  }>({});

  // Sync Dark Mode with document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load Preset
  const handleSelectPreset = (preset: Scenario) => {
    setCurrentPresetId(preset.id);
    setInputs(preset.inputs);
    setInboundBm(preset.inboundBenchmark);
    setOutboundBm(preset.outboundBenchmark);
    setAuditBm(preset.auditBenchmark);
    setResources(preset.resources);
    setFinancials(preset.financials);
    setPriorities(preset.priorities);
    setGoal(preset.optimizationGoal);
    setManualOverrides({});
  };

  // Reset to default
  const handleReset = () => {
    handleSelectPreset(DEFAULT_PRESETS[0]);
  };

  // Run Real-Time Calculation
  const result = runSimulation(
    inputs,
    inboundBm,
    outboundBm,
    auditBm,
    resources,
    financials,
    priorities,
    goal,
    manualOverrides
  );

  // Export CSV Helper
  const handleExportCsv = () => {
    const csvRows = [
      ['Metric', 'Value'],
      ['Total Orders', inputs.totalOrders],
      ['Total SKUs', inputs.totalSkus],
      ['Total Units', inputs.totalUnits],
      ['Total Required Headcount', result.totalRequiredManpower],
      ['Total Allocated Headcount', result.totalAllocatedManpower],
      ['Overall Utilization %', `${result.overallUtilizationPct}%`],
      ['Total Overtime Hours', result.totalOvertimeHours],
      ['Total Temp Workers Needed', result.totalTempWorkersNeeded],
      ['Total Labor Cost ($)', result.totalLaborCost],
      ['Cost per Order ($)', result.costPerOrder],
      ['Cost per Unit ($)', result.costPerUnit],
      ['Inbound Utilization %', `${result.inbound.utilizationPct}%`],
      ['Outbound Utilization %', `${result.outbound.utilizationPct}%`],
      ['Audit Utilization %', `${result.audit.utilizationPct}%`],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daily_Manpower_Plan_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Helper
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Header & Navigation */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        currentPresetId={currentPresetId}
        onSelectPreset={handleSelectPreset}
        onReset={handleReset}
        onExportCsv={handleExportCsv}
        onPrint={handlePrint}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Banner always visible on top */}
        <KpiCards result={result} inputs={inputs} />

        {/* Tab Views */}
        {activeTab === 'dashboard' && (
          <DashboardView
            inputs={inputs}
            setInputs={setInputs}
            result={result}
            optimizationGoal={goal}
            setOptimizationGoal={setGoal}
            manualOverrides={manualOverrides}
            setManualOverrides={setManualOverrides}
          />
        )}

        {activeTab === 'roster' && <RosterContainer />}

        {activeTab === 'benchmarks' && (
          <BenchmarksView
            inbound={inboundBm}
            setInbound={setInboundBm}
            outbound={outboundBm}
            setOutbound={setOutboundBm}
            audit={auditBm}
            setAudit={setAuditBm}
            equipment={resources.equipment}
            setEquipment={(eq) => setResources({ ...resources, equipment: eq })}
          />
        )}

        {activeTab === 'resources' && (
          <ResourcesView
            resources={resources}
            setResources={setResources}
            financials={financials}
            setFinancials={setFinancials}
          />
        )}

        {activeTab === 'timeline' && <ShiftTimelineView result={result} />}

        {activeTab === 'scenarios' && (
          <ScenarioView
            inputs={inputs}
            inboundBm={inboundBm}
            outboundBm={outboundBm}
            auditBm={auditBm}
            resources={resources}
            financials={financials}
            priorities={priorities}
            goal={goal}
            currentResult={result}
            onApplyScenarioInputs={(sc) => handleSelectPreset(sc)}
          />
        )}

        {activeTab === 'costs' && <CostAnalysisView result={result} financials={financials} />}

        {activeTab === 'reports' && (
          <ReportsView
            result={result}
            inputs={inputs}
            onExportCsv={handleExportCsv}
            onPrint={handlePrint}
          />
        )}
      </main>
    </div>
  );
}
