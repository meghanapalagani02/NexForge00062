import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Bot,
  Terminal
} from 'lucide-react';
import { PlanningSummary, MonthlyPlanItem } from '../types/planning';
import { formatUnits, formatIndianFull } from '../data/planningData';

interface ReasoningModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: PlanningSummary;
  monthlyPlan?: MonthlyPlanItem[];
  onTestScenario: () => void;
  onAskAgent: () => void;
}

export const ReasoningModal: React.FC<ReasoningModalProps> = ({
  isOpen,
  onClose,
  summary,
  monthlyPlan = [],
  onTestScenario,
  onAskAgent
}) => {
  if (!isOpen) return null;

  const planHorizonMonths = summary.forecastHorizonMonths || monthlyPlan.length || 6;
  const firstMonth = monthlyPlan[0]?.month || 'Start';
  const lastMonth = monthlyPlan[monthlyPlan.length - 1]?.month || 'End';

  const totalDemand = summary.forecastDemand;
  const totalProduction = summary.recommendedProduction;
  const startingInventory = summary.currentInventory;
  const safetyStock = summary.safetyStock;
  const monthlyCapacity = summary.monthlyCapacity || (monthlyPlan[0]?.capacity ?? 7000000);
  const deployedStock = Math.max(0, startingInventory - safetyStock);

  // Peak metrics
  const peakProdItem = monthlyPlan.reduce(
    (prev, curr) => (curr.recommendedProduction > prev.recommendedProduction ? curr : prev),
    monthlyPlan[0] || { month: '-', recommendedProduction: 0, capacityUtilization: 0 }
  );

  const minEndingStock = monthlyPlan.length > 0
    ? Math.min(...monthlyPlan.map((m) => m.endingInventory))
    : safetyStock;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl border border-orange-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] text-slate-800"
          role="dialog"
          aria-modal="true"
        >
          {/* Modal Header */}
          <div className="p-5 bg-orange-50 text-slate-900 flex items-center justify-between border-b border-orange-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold tracking-wider uppercase text-orange-700">
                  SYSTEMIC_AUDIT_PROTOCOL // VER 2.4
                </div>
                <h2 className="text-base font-bold font-mono text-slate-900 tracking-tight">
                  PLAN JUSTIFICATION & LOGICAL TRACE
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-orange-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-5 text-slate-700">
            {/* Main Decision Highlight */}
            <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200 flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
                  TARGET AGGREGATE ALLOCATION
                </div>
                <div className="text-2xl font-extrabold text-orange-600 font-mono mt-0.5">
                  {formatUnits(totalProduction)} UNITS <span className="text-sm font-semibold text-slate-600">({(totalProduction / 100000).toFixed(2)} Lakh)</span>
                </div>
                <div className="text-xs font-mono text-slate-500 mt-0.5">
                  PLANNING HORIZON: {planHorizonMonths} MONTHS ({firstMonth.toUpperCase()}–{lastMonth.toUpperCase()})
                </div>
              </div>

              <div className="text-right">
                {summary.planFeasible ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    100% FEASIBLE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-900 bg-amber-50 border border-amber-300 px-3 py-1 rounded">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    CAPACITY ALERT
                  </span>
                )}
              </div>
            </div>

            {/* 5-Step Logic Breakdown */}
            <div className="space-y-2.5">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                5-STAGE CONSTRAINT & DEMAND ENGINE EXECUTION
              </div>

              {/* Step 1: Demand forecast */}
              <div className="p-3.5 rounded-xl border border-orange-200 bg-orange-50/40 flex items-start gap-3.5">
                <div className="w-6 h-6 rounded bg-orange-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  1
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      DEMAND ESTIMATE
                    </span>
                    <span className="font-mono font-bold text-orange-700 text-xs">
                      {formatUnits(totalDemand)} ({(totalDemand / 100000).toFixed(2)} Lakh)
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Expected requirement projected across {planHorizonMonths} planning periods ({firstMonth}–{lastMonth}).
                  </p>
                </div>
              </div>

              {/* Step 2: Existing inventory */}
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-start gap-3.5">
                <div className="w-6 h-6 rounded bg-emerald-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  2
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      EXISTING BUFFER REDUCTION
                    </span>
                    <span className="font-mono font-bold text-emerald-700 text-xs">
                      {formatUnits(startingInventory)} ({formatIndianFull(startingInventory)})
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Warehouse reserve deploys {formatUnits(deployedStock)} toward demand, reducing surplus holding costs while protecting {formatUnits(safetyStock)} safety buffer.
                  </p>
                </div>
              </div>

              {/* Step 3: Production requirement */}
              <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/40 flex items-start gap-3.5">
                <div className="w-6 h-6 rounded bg-amber-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  3
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      NET PRODUCTION REQUIREMENT
                    </span>
                    <span className="font-mono font-bold text-amber-800 text-xs">
                      {formatUnits(totalProduction)} ({(totalProduction / 100000).toFixed(2)} Lakh)
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 font-mono text-[11px]">
                    (Demand {formatUnits(totalDemand)} + Safety Stock {formatUnits(safetyStock)}) - Opening Stock {formatUnits(startingInventory)} = {formatUnits(totalProduction)}
                  </p>
                </div>
              </div>

              {/* Step 4: Capacity check */}
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-start gap-3.5">
                <div className="w-6 h-6 rounded bg-emerald-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  4
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      LINE CAPACITY FEASIBILITY
                    </span>
                    <span className="font-mono font-bold text-emerald-700 text-xs">
                      {formatUnits(monthlyCapacity)} / month max
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Peak load in {peakProdItem.month} at {formatUnits(peakProdItem.recommendedProduction)} ({peakProdItem.capacityUtilization}% load).
                  </p>
                </div>
              </div>

              {/* Step 5: Risk check */}
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-start gap-3.5">
                <div className="w-6 h-6 rounded bg-emerald-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  5
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      BUFFER VIOLATION CHECK
                    </span>
                    <span className="font-mono font-bold text-emerald-700 text-xs">
                      {summary.potentialShortage > 0 ? `${formatUnits(summary.potentialShortage)} SHORTAGE` : '0 STOCKOUTS'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Warehouse safety stock buffer (&ge; {formatUnits(safetyStock)} units) minimum projected level is {formatUnits(minEndingStock)}.
                  </p>
                </div>
              </div>
            </div>

            {/* Conclusion */}
            <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-200 text-xs leading-relaxed space-y-1 font-mono">
              <div className="font-bold text-orange-950">EXPLANATION:</div>
              <p className="text-slate-700">
                The calculated production schedule balances line capacity and minimizes capital lockup while ensuring high service level reliability and buffer safety.
              </p>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-orange-50/80 border-t border-orange-200 flex flex-wrap items-center justify-between gap-3 font-mono">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              CLOSE
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onTestScenario();
                }}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-orange-100 border border-orange-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                SIMULATE SCENARIO
              </button>

              <button
                onClick={() => {
                  onClose();
                  onAskAgent();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs border border-orange-600"
              >
                <Bot className="w-3.5 h-3.5" />
                OPEN AGENT
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
