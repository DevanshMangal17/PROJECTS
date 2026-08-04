import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { Clock, Coffee, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { SimulationResult } from '../types';

interface ShiftTimelineViewProps {
  result: SimulationResult;
}

export const ShiftTimelineView: React.FC<ShiftTimelineViewProps> = ({ result }) => {
  const timelineData = result.hourlyTimeline;

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-slate-900 text-white shadow-md border border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            Daily Shift Timeline & Hourly Workload Loading Curve
          </h2>
          <p className="text-xs text-slate-400">
            Hourly distribution of order arrival profile, Inbound/Outbound execution waves, break periods, and overtime shifts.
          </p>
        </div>
      </div>

      {/* Hourly Arrival Wave Chart */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Hourly Order Arrival & Workload Distribution Profile (%)
          </h3>
          <span className="text-xs text-slate-500">06:00 - 18:00 Shift</span>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorArrival" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
              />
              <Area
                type="monotone"
                dataKey="orderArrivalPct"
                name="Order Arrival %"
                stroke="#38bdf8"
                fillOpacity={1}
                fill="url(#colorArrival)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hourly Department Labor Loading Bar Chart */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Hourly Department Workload Loading (Minutes)
          </h3>
          <span className="text-xs text-slate-500">Inbound vs Outbound vs Audit</span>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="inboundWorkloadMins" name="Inbound (mins)" fill="#3b82f6" stackId="a" />
              <Bar dataKey="outboundWorkloadMins" name="Outbound (mins)" fill="#8b5cf6" stackId="a" />
              <Bar dataKey="auditWorkloadMins" name="Audit (mins)" fill="#06b6d4" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hourly Schedule Table / Gantt View */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 overflow-x-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Shift Hourly Status Matrix
          </h3>
          <span className="text-xs text-slate-500">12 Operational Hour Slots</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <th className="py-2.5 px-3">Hour Slot</th>
              <th className="py-2.5 px-3">Arrival %</th>
              <th className="py-2.5 px-3">Inbound Load</th>
              <th className="py-2.5 px-3">Outbound Load</th>
              <th className="py-2.5 px-3">Audit Load</th>
              <th className="py-2.5 px-3">Active Staff</th>
              <th className="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {timelineData.map((slot, idx) => (
              <tr
                key={idx}
                className={
                  slot.isBreakPeriod
                    ? 'bg-amber-50/50 dark:bg-amber-950/20'
                    : slot.overtimeActive
                    ? 'bg-purple-50/50 dark:bg-purple-950/20'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }
              >
                <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                  {slot.hour}
                </td>
                <td className="py-2.5 px-3">{slot.orderArrivalPct}%</td>
                <td className="py-2.5 px-3">{slot.inboundWorkloadMins}m</td>
                <td className="py-2.5 px-3">{slot.outboundWorkloadMins}m</td>
                <td className="py-2.5 px-3">{slot.auditWorkloadMins}m</td>
                <td className="py-2.5 px-3 font-semibold">{slot.activeAssociates}</td>
                <td className="py-2.5 px-3">
                  {slot.isBreakPeriod ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 flex items-center gap-1 w-fit">
                      <Coffee className="w-3 h-3" /> Scheduled Break
                    </span>
                  ) : slot.overtimeActive ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300 flex items-center gap-1 w-fit">
                      <Clock className="w-3 h-3" /> Overtime Shift
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 w-fit">
                      Regular Shift
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
