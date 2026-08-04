import React, { useState } from 'react';
import { AIRotationInsight } from '../../types/roster';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Zap,
  TrendingUp,
  Sliders,
  Check,
} from 'lucide-react';

interface AIRotationIntelligencePanelProps {
  insights: AIRotationInsight[];
  onApplyInsightAction?: (insight: AIRotationInsight) => void;
}

export const AIRotationIntelligencePanel: React.FC<AIRotationIntelligencePanelProps> = ({
  insights,
  onApplyInsightAction,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('All');
  const [appliedIds, setAppliedIds] = useState<string[]>([]);

  const filteredInsights = insights.filter((ins) => {
    if (filterSeverity !== 'All' && ins.severity !== filterSeverity) return false;
    return true;
  });

  const handleApply = (ins: AIRotationInsight) => {
    setAppliedIds((prev) => [...prev, ins.id]);
    if (onApplyInsightAction) {
      onApplyInsightAction(ins);
    }
  };

  const getSeverityBadge = (severity: AIRotationInsight['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30';
      case 'warning':
        return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
      case 'success':
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30';
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900/10 via-slate-900/5 to-purple-900/10 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-500/20 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/60 dark:border-slate-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              AI Rotation Intelligence Engine
            </h3>
            <p className="text-xs text-slate-500">
              Real-time monitoring of rotation cycles, labor rules, compensatory off due dates, & staffing predictions.
            </p>
          </div>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-slate-400 px-1 font-semibold">Filter:</span>
          {['All', 'critical', 'warning', 'info', 'success'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all ${
                filterSeverity === sev
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Insights Cards Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInsights.map((ins) => {
          const isApplied = appliedIds.includes(ins.id);

          return (
            <div
              key={ins.id}
              className={`p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between space-y-3 transition-all hover:shadow-md ${
                isApplied ? 'opacity-50 border-slate-200 dark:border-slate-800' : ''
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getSeverityBadge(
                      ins.severity
                    )}`}
                  >
                    {ins.severity}
                  </span>
                  {ins.dayNumber && (
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Day {ins.dayNumber}
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                  {ins.title}
                </h4>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {ins.message}
                </p>
              </div>

              {/* Recommendation Action Footer */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-start gap-1">
                  <Zap className="w-3 h-3 shrink-0 mt-0.5" />
                  <span>{ins.recommendedAction}</span>
                </div>

                <button
                  onClick={() => handleApply(ins)}
                  disabled={isApplied}
                  className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isApplied
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                  }`}
                >
                  {isApplied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Recommendation Applied</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Execute AI Recommendation</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
