import React from 'react';
import {
  InboundBenchmark,
  OutboundBenchmark,
  AuditBenchmark,
  EquipmentConstraints,
} from '../types';
import { Sliders, Truck, PackageCheck, ClipboardCheck, Wrench, ShieldAlert } from 'lucide-react';

interface BenchmarksViewProps {
  inbound: InboundBenchmark;
  setInbound: React.Dispatch<React.SetStateAction<InboundBenchmark>>;
  outbound: OutboundBenchmark;
  setOutbound: React.Dispatch<React.SetStateAction<OutboundBenchmark>>;
  audit: AuditBenchmark;
  setAudit: React.Dispatch<React.SetStateAction<AuditBenchmark>>;
  equipment: EquipmentConstraints;
  setEquipment: (eq: EquipmentConstraints) => void;
}

export const BenchmarksView: React.FC<BenchmarksViewProps> = ({
  inbound,
  setInbound,
  outbound,
  setOutbound,
  audit,
  setAudit,
  equipment,
  setEquipment,
}) => {
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-slate-900 text-white shadow-md border border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            Operational Benchmarks & Equipment Constraints
          </h2>
          <p className="text-xs text-slate-400">
            Tune industrial engineering productivity targets, complexity factors, and warehouse physical hardware capacity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Inbound Benchmarks */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Truck className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Inbound Receiving</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Items Per Person (IPP) / hr
              </label>
              <input
                type="number"
                value={inbound.itemsPerPerson}
                onChange={(e) => setInbound({ ...inbound, itemsPerPerson: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                SKU Complexity Factor (1.0 - 2.0)
              </label>
              <input
                type="number"
                step="0.1"
                value={inbound.skuComplexityFactor}
                onChange={(e) => setInbound({ ...inbound, skuComplexityFactor: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Weight Slowdown Factor (1.0 - 1.8)
              </label>
              <input
                type="number"
                step="0.1"
                value={inbound.weightFactor}
                onChange={(e) => setInbound({ ...inbound, weightFactor: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Receiving Efficiency %
              </label>
              <input
                type="number"
                value={inbound.receivingEfficiencyPct}
                onChange={(e) => setInbound({ ...inbound, receivingEfficiencyPct: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Dock Availability %
              </label>
              <input
                type="number"
                value={inbound.dockAvailabilityPct}
                onChange={(e) => setInbound({ ...inbound, dockAvailabilityPct: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Expected Delay %
              </label>
              <input
                type="number"
                value={inbound.expectedDelayPct}
                onChange={(e) => setInbound({ ...inbound, expectedDelayPct: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Outbound Benchmarks */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <PackageCheck className="w-5 h-5 text-violet-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Outbound Picking & Packing</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Items Per Person (IPP) / hr
              </label>
              <input
                type="number"
                value={outbound.itemsPerPerson}
                onChange={(e) => setOutbound({ ...outbound, itemsPerPerson: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Average Picks / hr
              </label>
              <input
                type="number"
                value={outbound.avgPicksPerHour}
                onChange={(e) => setOutbound({ ...outbound, avgPicksPerHour: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Average Lines / Order
              </label>
              <input
                type="number"
                step="0.1"
                value={outbound.avgLinesPerOrder}
                onChange={(e) => setOutbound({ ...outbound, avgLinesPerOrder: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Wave Efficiency %
              </label>
              <input
                type="number"
                value={outbound.waveEfficiencyPct}
                onChange={(e) => setOutbound({ ...outbound, waveEfficiencyPct: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Picking Accuracy %
              </label>
              <input
                type="number"
                step="0.1"
                value={outbound.pickingAccuracyPct}
                onChange={(e) => setOutbound({ ...outbound, pickingAccuracyPct: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Walking Distance Factor (1.0 - 1.5)
              </label>
              <input
                type="number"
                step="0.05"
                value={outbound.avgWalkingDistanceFactor}
                onChange={(e) => setOutbound({ ...outbound, avgWalkingDistanceFactor: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>
        </div>

        {/* Audit Benchmarks */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <ClipboardCheck className="w-5 h-5 text-cyan-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Quality Audit & Compliance</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Items Audited Per Person / hr
              </label>
              <input
                type="number"
                value={audit.itemsAuditedPerPerson}
                onChange={(e) => setAudit({ ...audit, itemsAuditedPerPerson: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Audit Sampling Rate % of Total Load
              </label>
              <input
                type="number"
                value={audit.auditSamplingPct}
                onChange={(e) => setAudit({ ...audit, auditSamplingPct: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Audit Accuracy Target %
              </label>
              <input
                type="number"
                step="0.1"
                value={audit.auditAccuracyPct}
                onChange={(e) => setAudit({ ...audit, auditAccuracyPct: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Documentation Time / Audit (mins)
              </label>
              <input
                type="number"
                step="0.5"
                value={audit.documentationTimePerAuditMins}
                onChange={(e) =>
                  setAudit({ ...audit, documentationTimePerAuditMins: Number(e.target.value) })
                }
                className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Rework Rate %
              </label>
              <input
                type="number"
                step="0.5"
                value={audit.reworkPct}
                onChange={(e) => setAudit({ ...audit, reworkPct: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Physical Constraints Section */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-500" />
            Equipment & Facility Hardware Constraints
          </h3>
          <span className="text-xs text-slate-500">Physical Equipment Limits</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Active Forklifts Available
            </label>
            <input
              type="number"
              value={equipment.forkliftsAvailable}
              onChange={(e) => setEquipment({ ...equipment, forkliftsAvailable: Number(e.target.value) })}
              className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">Used for pallet moves & heavy receiving.</p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Active Receiving Dock Doors
            </label>
            <input
              type="number"
              value={equipment.dockDoorsAvailable}
              onChange={(e) => setEquipment({ ...equipment, dockDoorsAvailable: Number(e.target.value) })}
              className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">Max simultaneous trailer unloading capacity.</p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Active RF Handheld Scanners
            </label>
            <input
              type="number"
              value={equipment.scannersAvailable}
              onChange={(e) => setEquipment({ ...equipment, scannersAvailable: Number(e.target.value) })}
              className="mt-1 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">Limits max simultaneous scanning operators.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
