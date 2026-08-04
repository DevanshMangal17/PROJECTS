import React from 'react';
import { ResourcePool, FinancialRates } from '../types';
import { Users, DollarSign, Award, ShieldCheck, UserCheck } from 'lucide-react';

interface ResourcesViewProps {
  resources: ResourcePool;
  setResources: React.Dispatch<React.SetStateAction<ResourcePool>>;
  financials: FinancialRates;
  setFinancials: React.Dispatch<React.SetStateAction<FinancialRates>>;
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({
  resources,
  setResources,
  financials,
  setFinancials,
}) => {
  const sm = resources.skillMatrix;
  const totalSkillPct = sm.beginnerPct + sm.skilledPct + sm.expertPct;

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-slate-900 text-white shadow-md border border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-400" />
            Resource Pool, Skill Matrix & Wage Rates
          </h2>
          <p className="text-xs text-slate-400">
            Define associate availability, multi-skilled cross-training depth, skill level ratios, and labor cost parameters.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resource Headcount Configuration */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <UserCheck className="w-5 h-5 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Associate Headcount Pool</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Available Regular Associates
              </label>
              <input
                type="number"
                value={resources.availableAssociates}
                onChange={(e) => setResources({ ...resources, availableAssociates: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Available Supervisors
              </label>
              <input
                type="number"
                value={resources.availableSupervisors}
                onChange={(e) => setResources({ ...resources, availableSupervisors: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Multi-Skilled (Cross-Trained)
              </label>
              <input
                type="number"
                value={resources.multiSkilledAssociates}
                onChange={(e) => setResources({ ...resources, multiSkilledAssociates: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Temporary Workers Call-In
              </label>
              <input
                type="number"
                value={resources.temporaryWorkers}
                onChange={(e) => setResources({ ...resources, temporaryWorkers: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Max Overtime / Person (Mins)
              </label>
              <input
                type="number"
                value={resources.maxOvertimeAllowedMins}
                onChange={(e) => setResources({ ...resources, maxOvertimeAllowedMins: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Absenteeism Buffer %
              </label>
              <input
                type="number"
                value={resources.absenteeismBufferPct}
                onChange={(e) => setResources({ ...resources, absenteeismBufferPct: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Skill Matrix Distribution */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              Skill Level Matrix (Productivity Weight)
            </h3>
            <span className={`text-xs font-bold ${totalSkillPct === 100 ? 'text-emerald-500' : 'text-amber-500'}`}>
              Total: {totalSkillPct}%
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Beginner Level (0.8x IPP):</span>
                <span>{sm.beginnerPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sm.beginnerPct}
                onChange={(e) =>
                  setResources({
                    ...resources,
                    skillMatrix: { ...sm, beginnerPct: Number(e.target.value) },
                  })
                }
                className="w-full mt-1 accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Skilled Associates (1.0x IPP):</span>
                <span>{sm.skilledPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sm.skilledPct}
                onChange={(e) =>
                  setResources({
                    ...resources,
                    skillMatrix: { ...sm, skilledPct: Number(e.target.value) },
                  })
                }
                className="w-full mt-1 accent-blue-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Expert Specialists (1.25x IPP):</span>
                <span>{sm.expertPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sm.expertPct}
                onChange={(e) =>
                  setResources({
                    ...resources,
                    skillMatrix: { ...sm, expertPct: Number(e.target.value) },
                  })
                }
                className="w-full mt-1 accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
              Weighted Productivity Index:{' '}
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {(
                  (sm.beginnerPct / 100) * 0.8 +
                  (sm.skilledPct / 100) * 1.0 +
                  (sm.expertPct / 100) * 1.25
                ).toFixed(2)}
                x
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Wage Rates Setup */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Wage Rates & Overtime Pricing Structure
          </h3>
          <span className="text-xs text-slate-500">Hourly Labor Rates</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Operator Base Cost ($/hr)
            </label>
            <input
              type="number"
              value={financials.operatorCostPerHour}
              onChange={(e) => setFinancials({ ...financials, operatorCostPerHour: Number(e.target.value) })}
              className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Supervisor Rate ($/hr)
            </label>
            <input
              type="number"
              value={financials.supervisorCostPerHour}
              onChange={(e) => setFinancials({ ...financials, supervisorCostPerHour: Number(e.target.value) })}
              className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Temp Worker Rate ($/hr)
            </label>
            <input
              type="number"
              value={financials.tempWorkerCostPerHour}
              onChange={(e) => setFinancials({ ...financials, tempWorkerCostPerHour: Number(e.target.value) })}
              className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Overtime Multiplier (x)
            </label>
            <input
              type="number"
              step="0.1"
              value={financials.overtimeMultiplier}
              onChange={(e) => setFinancials({ ...financials, overtimeMultiplier: Number(e.target.value) })}
              className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
