import React from 'react';
import {
  Boxes,
  Moon,
  Sun,
  RotateCcw,
  Sparkles,
  Download,
  FileSpreadsheet,
  Printer,
  SlidersHorizontal,
} from 'lucide-react';
import { Scenario } from '../types';
import { DEFAULT_PRESETS } from '../utils/presets';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  currentPresetId: string;
  onSelectPreset: (preset: Scenario) => void;
  onReset: () => void;
  onExportCsv: () => void;
  onPrint: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  setDarkMode,
  currentPresetId,
  onSelectPreset,
  onReset,
  onExportCsv,
  onPrint,
  activeTab,
  setActiveTab,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Executive Dashboard' },
    { id: 'roster', label: 'Weekly Shift Roster' },
    { id: 'benchmarks', label: 'Department Benchmarks' },
    { id: 'resources', label: 'Resource Pool & Skills' },
    { id: 'timeline', label: 'Shift Timeline' },
    { id: 'scenarios', label: 'What-If & Scenarios' },
    { id: 'costs', label: 'Cost Analysis' },
    { id: 'reports', label: 'Shift Reports' },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-md shadow-indigo-500/20">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Warehouse Manpower Planning Simulator
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50">
                v2.4 Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              by Devansh & Shivam • Intelligent DC Workforce Optimization & Operations Research Engine
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Preset Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-medium px-2 text-slate-600 dark:text-slate-400">Preset:</span>
            <select
              value={currentPresetId}
              onChange={(e) => {
                const found = DEFAULT_PRESETS.find((p) => p.id === e.target.value);
                if (found) onSelectPreset(found);
              }}
              className="bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 py-1 px-2 rounded-md border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {DEFAULT_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Actions */}
          <button
            onClick={onReset}
            title="Reset to defaults"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onExportCsv}
            title="Export CSV Report"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>CSV Export</span>
          </button>

          <button
            onClick={onPrint}
            title="Print Dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 dark:border-slate-800/80">
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
