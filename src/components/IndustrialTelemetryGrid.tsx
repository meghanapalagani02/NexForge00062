import React from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  Factory,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Sliders,
  Bot,
  Activity,
  Cpu
} from 'lucide-react';
import { PlanningSummary, MonthlyPlanItem, ActiveTab } from '../types/planning';
import { formatUnits, formatIndianFull } from '../data/planningData';

interface IndustrialTelemetryGridProps {
  summary: PlanningSummary;
  monthlyPlan?: MonthlyPlanItem[];
  onWhyThisPlan: () => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onAskAgent: () => void;
}

export const IndustrialTelemetryGrid: React.FC<IndustrialTelemetryGridProps> = ({
  summary,
  monthlyPlan = [],
  onWhyThisPlan,
  onNavigateTab,
  onAskAgent
}) => {
  const planHorizonMonths = summary.forecastHorizonMonths || monthlyPlan.length || 6;
  const firstMonth = monthlyPlan[0]?.month || 'Start';
  const lastMonth = monthlyPlan[monthlyPlan.length - 1]?.month || 'End';

  const totalDemand = summary.forecastDemand;
  const totalProduction = summary.recommendedProduction;
  const startingInventory = summary.currentInventory;
  const safetyStock = summary.safetyStock;
  const monthlyCapacity = summary.monthlyCapacity || (monthlyPlan[0]?.capacity ?? 7000000);

  // Sparkline bars calculation
  const maxDemand = Math.max(...monthlyPlan.map((m) => m.demand), 1);
  const dynamicDemandBars = monthlyPlan.map((m) => ({
    month: m.month,
    val: `${(m.demand / 100000).toFixed(1)}L`,
    pct: Math.max(12, Math.round((m.demand / maxDemand) * 100))
  }));

  const avgDemandMonthly = Math.round(totalDemand / (monthlyPlan.length || 1));

  // Peak demand
  const peakDemandItem = monthlyPlan.reduce(
    (prev, curr) => (curr.demand > prev.demand ? curr : prev),
    monthlyPlan[0] || { month: '-', demand: 0 }
  );

  // Production peak and line load
  const peakProdItem = monthlyPlan.reduce(
    (prev, curr) => (curr.recommendedProduction > prev.recommendedProduction ? curr : prev),
    monthlyPlan[0] || { month: '-', recommendedProduction: 0, capacityUtilization: 0 }
  );
  const peakProdUtilization = peakProdItem?.capacityUtilization ?? 0;
  const peakProdUnits = peakProdItem?.recommendedProduction || 0;
  const headroomPct = Math.max(0, 100 - peakProdUtilization).toFixed(1);
  const headroomUnits = Math.max(0, monthlyCapacity - peakProdUnits);
  const constrainedMonthsList = monthlyPlan.filter(
    (m) => m.status === 'constrained' || m.status === 'shortage'
  );

  // Stock and inventory calculations
  const terminalEndingStock = monthlyPlan[monthlyPlan.length - 1]?.endingInventory ?? safetyStock;
  const minEndingStock = monthlyPlan.length > 0 ? Math.min(...monthlyPlan.map((m) => m.endingInventory)) : terminalEndingStock;
  const deployedStock = Math.max(0, startingInventory - safetyStock);
  const deployRatio = startingInventory > 0 ? Math.min(100, Math.round((deployedStock / startingInventory) * 100)) : 0;
  const bufferRatio = Math.max(0, 100 - deployRatio);
  const isStockProtected = summary.inventoryProtected && minEndingStock >= safetyStock;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" as const }
    }
  };

  return (
    <div id="industrial-telemetry-section" className="space-y-4">
      {/* Top Operations Telemetry Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white/90 border border-orange-200/90 rounded-xl px-5 py-3 text-xs flex flex-wrap items-center justify-between gap-3 shadow-xs relative overflow-hidden"
      >
        {/* Subtle warm industrial watermark */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
            <span className="font-mono text-emerald-800 font-bold uppercase tracking-wider text-[11px]">
              ENGINE ACTIVE // NEXFORGE
            </span>
          </div>

          <span className="text-orange-200 hidden sm:inline">|</span>

          <div className="text-slate-600 hidden sm:flex items-center gap-1.5 font-mono text-[11px]">
            <Activity className="w-3.5 h-3.5 text-amber-600" />
            <span>HORIZON: {planHorizonMonths} MONTHS ({firstMonth.toUpperCase()}–{lastMonth.toUpperCase()})</span>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          {summary.planFeasible ? (
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded font-mono font-semibold text-[10px] tracking-wide uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              100% FEASIBLE
            </span>
          ) : (
            <span className="bg-amber-50 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded font-mono font-semibold text-[10px] tracking-wide uppercase flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              ADJUSTMENTS NEEDED
            </span>
          )}
          <span className="bg-orange-50 text-orange-800 border border-orange-200 px-2 py-0.5 rounded font-mono text-[10px]">
            {summary.potentialShortage > 0 ? `${formatUnits(summary.potentialShortage)} SHORTAGE` : '0 SHORTAGE'}
          </span>
        </div>
      </motion.div>

      {/* 3 SEPARATE DEDICATED INDUSTRIAL BLOCKS: DEMAND, PRODUCTION, STOCK */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch"
      >
        {/* ============================================================ */}
        {/* BLOCK 1: DEMAND FORECAST (Light Warm Orange Industrial)      */}
        {/* ============================================================ */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -3, transition: { duration: 0.15 } }}
          className="bg-white border border-orange-200 rounded-xl p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden shadow-xs hover:shadow-md transition-shadow group"
        >
          {/* Corner CAD Ticks */}
          <div className="absolute top-2 left-2 text-[8px] font-mono text-orange-500/50 select-none">┌ DEMAND</div>
          <div className="absolute top-2 right-2 text-[8px] font-mono text-orange-500/50 select-none">┐</div>
          <div className="absolute bottom-2 left-2 text-[8px] font-mono text-orange-500/50 select-none">└ {formatUnits(totalDemand)}</div>
          <div className="absolute bottom-2 right-2 text-[8px] font-mono text-orange-500/50 select-none">┘</div>

          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-orange-100/50 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

          <div className="relative z-10">
            {/* Block Header */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-orange-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 border border-orange-300 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-orange-950">
                    01. DEMAND FORECAST
                  </h3>
                  <span className="text-[10px] text-slate-500">Target Horizon Baseline</span>
                </div>
              </div>

              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-orange-50 text-orange-800 border border-orange-300">
                CALIBRATED
              </span>
            </div>

            {/* Big Primary Metric (Indian Numbering) */}
            <div className="mt-4">
              <div className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
                Total {planHorizonMonths}-Month Requirement
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-mono">
                  {formatUnits(totalDemand)}
                </span>
                <span className="text-sm font-semibold text-orange-600 font-mono">
                  ({(totalDemand / 100000).toFixed(2)} Lakh)
                </span>
              </div>
            </div>

            {/* Mini Sparkline Bar Distribution */}
            <div className="mt-4 bg-orange-50/60 border border-orange-200/80 rounded-lg p-3">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 mb-2">
                <span>MONTHLY DEMAND CURVE</span>
                <span className="text-orange-700 font-semibold">AVG: {formatUnits(avgDemandMonthly)}/mo</span>
              </div>

              <div
                className="grid gap-1.5 items-end h-14 pt-1"
                style={{ gridTemplateColumns: `repeat(${Math.max(1, dynamicDemandBars.length)}, minmax(0, 1fr))` }}
              >
                {dynamicDemandBars.map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 h-full justify-end group/bar">
                    <div className="w-full bg-orange-100 rounded-xs h-full flex items-end overflow-hidden">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${d.pct}%` }}
                        transition={{ duration: 0.6, delay: 0.05 * i }}
                        className="w-full bg-gradient-to-t from-orange-600 to-amber-400 rounded-xs"
                        title={`${d.month}: ${d.val}`}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-slate-600 truncate max-w-full">{d.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Specifications Readout */}
            <div className="mt-3.5 space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-500">Plan Duration:</span>
                <span className="text-emerald-700 font-bold">{planHorizonMonths} Operational Months</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-500">Monthly Average:</span>
                <span className="text-amber-800 font-bold">{formatUnits(avgDemandMonthly)} Units</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-500">Peak Demand Month:</span>
                <span className="text-slate-900 font-semibold">
                  {peakDemandItem.month} ({formatUnits(peakDemandItem.demand)})
                </span>
              </div>
            </div>
          </div>

          {/* Block Action Link */}
          <div className="mt-4 pt-3 border-t border-orange-100 flex items-center justify-between relative z-10">
            <button
              onClick={() => onNavigateTab('forecast')}
              className="text-xs font-mono font-bold text-orange-700 hover:text-orange-900 flex items-center gap-1.5 transition-colors group-hover:translate-x-1 duration-150 cursor-pointer"
            >
              <span>Open Demand Model</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-500">{planHorizonMonths} Periods</span>
          </div>
        </motion.div>

        {/* ============================================================ */}
        {/* BLOCK 2: PRODUCTION SCHEDULE (Light Industrial Amber Gold)   */}
        {/* ============================================================ */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -3, transition: { duration: 0.15 } }}
          className="bg-white border border-amber-300/80 rounded-xl p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden shadow-xs hover:shadow-md transition-shadow group"
        >
          {/* Corner CAD Ticks */}
          <div className="absolute top-2 left-2 text-[8px] font-mono text-amber-500/50 select-none">┌ PRODUCTION</div>
          <div className="absolute top-2 right-2 text-[8px] font-mono text-amber-500/50 select-none">┐</div>
          <div className="absolute bottom-2 left-2 text-[8px] font-mono text-amber-500/50 select-none">└ {formatUnits(totalProduction)}</div>
          <div className="absolute bottom-2 right-2 text-[8px] font-mono text-amber-500/50 select-none">┘</div>

          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-amber-100/50 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

          <div className="relative z-10">
            {/* Block Header */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-amber-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center">
                  <Factory className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-950">
                    02. PRODUCTION SCHEDULE
                  </h3>
                  <span className="text-[10px] text-slate-500">Calculated Manufacturing Plan</span>
                </div>
              </div>

              <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border flex items-center gap-1 ${
                summary.planFeasible
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-amber-50 text-amber-900 border-amber-300'
              }`}>
                {summary.planFeasible ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    FEASIBLE
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    CAPACITY ALERT
                  </>
                )}
              </span>
            </div>

            {/* Big Primary Metric (Indian Numbering) */}
            <div className="mt-4">
              <div className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
                Target Output
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-mono">
                  {formatUnits(totalProduction)}
                </span>
                <span className="text-sm font-semibold text-amber-700 font-mono">
                  ({(totalProduction / 100000).toFixed(2)} Lakh)
                </span>
              </div>
            </div>

            {/* Animated Capacity Utilization Gauge Meter */}
            <div className="mt-4 bg-amber-50/60 border border-amber-200/80 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-600">
                <span>LINE CAPACITY LOAD ({formatUnits(monthlyCapacity)}/mo LIMIT)</span>
                <span className="text-amber-800 font-bold">
                  PEAK {peakProdUtilization}% ({peakProdItem.month?.toUpperCase() || '-'})
                </span>
              </div>

              {/* Progress Bar with Headroom */}
              <div className="h-3 w-full bg-amber-100 rounded-full overflow-hidden p-0.5 flex">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, peakProdUtilization)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    peakProdUtilization > 95
                      ? 'bg-red-500'
                      : peakProdUtilization > 80
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500'
                      : 'bg-gradient-to-r from-emerald-500 to-amber-500'
                  }`}
                />
              </div>

              <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pt-0.5">
                <span>0 Units</span>
                <span className="text-amber-800 font-semibold">Peak: {formatUnits(peakProdUnits)}</span>
                <span>Max: {formatUnits(monthlyCapacity)}</span>
              </div>
            </div>

            {/* Technical Specifications Readout */}
            <div className="mt-3.5 space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-500">Available Headroom:</span>
                <span className="text-emerald-700 font-bold">{headroomPct}% Buffer ({formatUnits(headroomUnits)}/mo)</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-500">Overtime Required:</span>
                <span className="text-slate-900">
                  {constrainedMonthsList.length > 0 ? `${constrainedMonthsList.length} Months Constrained` : '0.0 Hours (Standard Shifts)'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-500">Line Constrained Months:</span>
                <span className={`${constrainedMonthsList.length > 0 ? 'text-amber-700 font-bold' : 'text-emerald-700 font-bold'}`}>
                  {constrainedMonthsList.length} of {planHorizonMonths} Months
                </span>
              </div>
            </div>
          </div>

          {/* Block Action Link */}
          <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between relative z-10">
            <button
              onClick={() => onNavigateTab('production')}
              className="text-xs font-mono font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1.5 transition-colors group-hover:translate-x-1 duration-150 cursor-pointer"
            >
              <span>Inspect Production Schedule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-500">{formatUnits(monthlyCapacity)} / mo</span>
          </div>
        </motion.div>

        {/* ============================================================ */}
        {/* BLOCK 3: STOCK & INVENTORY (Precision Safety Emerald)        */}
        {/* ============================================================ */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -3, transition: { duration: 0.15 } }}
          className="bg-white border border-emerald-200 rounded-xl p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden shadow-xs hover:shadow-md transition-shadow group"
        >
          {/* Corner CAD Ticks */}
          <div className="absolute top-2 left-2 text-[8px] font-mono text-emerald-500/50 select-none">┌ STOCK</div>
          <div className="absolute top-2 right-2 text-[8px] font-mono text-emerald-500/50 select-none">┐</div>
          <div className="absolute bottom-2 left-2 text-[8px] font-mono text-emerald-500/50 select-none">
            └ {formatUnits(startingInventory)} → {formatUnits(terminalEndingStock)}
          </div>
          <div className="absolute bottom-2 right-2 text-[8px] font-mono text-emerald-500/50 select-none">┘</div>

          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-100/50 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

          <div className="relative z-10">
            {/* Block Header */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-emerald-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-950">
                    03. STOCK & INVENTORY BUFFER
                  </h3>
                  <span className="text-[10px] text-slate-500">Warehouse Runway & Safety Target</span>
                </div>
              </div>

              <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                isStockProtected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-amber-50 text-amber-900 border-amber-300'
              }`}>
                {isStockProtected ? 'PROTECTED' : 'BUFFER WARNING'}
              </span>
            </div>

            {/* Big Primary Metric (Indian Numbering) */}
            <div className="mt-4">
              <div className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
                Warehouse Stock Trajectory
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-mono">
                  {formatUnits(startingInventory)}
                </span>
                <span className="text-xl font-bold text-slate-400 font-mono">→</span>
                <span className="text-3xl sm:text-4xl font-black text-emerald-700 tracking-tight font-mono">
                  {formatUnits(terminalEndingStock)}
                </span>
              </div>
            </div>

            {/* Inventory Deployment & Safety Gauge */}
            <div className="mt-4 bg-emerald-50/50 border border-emerald-200/80 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-600">
                <span>STOCK DEPLOYMENT RATIO</span>
                <span className="text-emerald-800 font-bold">
                  {isStockProtected ? '100% BUFFER MET' : 'BUFFER REVIEW'}
                </span>
              </div>

              {/* Stacked Visual Meter */}
              <div className="h-3 w-full bg-emerald-100/60 rounded-full overflow-hidden flex">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${deployRatio}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-orange-500"
                  title={`${formatUnits(deployedStock)} Deployed to Demand`}
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${bufferRatio}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-full bg-emerald-600"
                  title={`${formatUnits(safetyStock)} Safety Buffer Maintained`}
                />
              </div>

              <div className="flex items-center justify-between text-[9px] font-mono text-slate-600 pt-0.5">
                <span className="text-orange-700 font-semibold">{formatUnits(deployedStock)} Deployed to Orders</span>
                <span className="text-emerald-800 font-semibold">{formatUnits(safetyStock)} Permanent Buffer</span>
              </div>
            </div>

            {/* Technical Specifications Readout */}
            <div className="mt-3.5 space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-500">Stockout / Shortage Risk:</span>
                <span className={`${summary.potentialShortage > 0 ? 'text-red-700 font-bold' : 'text-emerald-700 font-bold'}`}>
                  {summary.potentialShortage > 0 ? `${formatUnits(summary.potentialShortage)} Risk` : '0.0% (Zero Shortage)'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-500">Starting On-Hand:</span>
                <span className="text-slate-900">{formatUnits(startingInventory)} Units ({formatIndianFull(startingInventory)})</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-500">Target Safety Buffer:</span>
                <span className="text-emerald-700 font-bold">{formatUnits(safetyStock)} Units (Protected)</span>
              </div>
            </div>
          </div>

          {/* Block Action Link */}
          <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between relative z-10">
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-xs font-mono font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5 transition-colors group-hover:translate-x-1 duration-150 cursor-pointer"
            >
              <span>View Inventory Runway</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-500">{formatUnits(safetyStock)} Min</span>
          </div>
        </motion.div>
      </motion.div>

      {/* ============================================================ */}
      {/* INDUSTRIAL PLANNING SYNTHESIZER (MATHEMATICAL BALANCE EQUATION) */}
      {/* ============================================================ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-white border border-orange-200/90 rounded-xl p-5 text-slate-900 shadow-xs relative overflow-hidden"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Equation Formula Flow */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-orange-600" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">
                MASTER PRODUCTION CALCULATION EQUATION
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm sm:text-base font-mono font-bold">
              <span className="px-2.5 py-1 rounded bg-orange-100 border border-orange-300 text-orange-950">
                [ {formatUnits(totalDemand)} Demand ]
              </span>
              <span className="text-slate-400 text-lg">−</span>
              <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-300 text-slate-800">
                [ {formatUnits(startingInventory)} Initial Stock ]
              </span>
              <span className="text-slate-400 text-lg">+</span>
              <span className="px-2.5 py-1 rounded bg-emerald-100 border border-emerald-300 text-emerald-950">
                [ {formatUnits(safetyStock)} Safety Buffer ]
              </span>
              <span className="text-orange-600 text-lg">=</span>
              <span className="px-3 py-1 rounded bg-orange-600 border border-orange-700 text-white text-base sm:text-lg shadow-xs">
                [ {formatUnits(totalProduction)} Production Target ]
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
              By deploying {formatUnits(deployedStock)} of existing warehouse stock toward the {formatUnits(totalDemand)} customer demand ({(totalDemand / 100000).toFixed(2)} Lakh), the factory needs to manufacture <strong>{formatUnits(totalProduction)} ({(totalProduction / 100000).toFixed(2)} Lakh)</strong> while locking in the {formatUnits(safetyStock)} safety stock buffer.
            </p>
          </div>

          {/* Fast Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              id="btn-industrial-why-plan"
              onClick={onWhyThisPlan}
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-mono font-bold rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer border border-orange-600"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>PLAN EXPLANATION</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              id="btn-industrial-scenarios"
              onClick={() => onNavigateTab('scenarios')}
              className="px-4 py-2.5 bg-white hover:bg-orange-50 text-slate-800 text-xs font-mono font-semibold rounded-lg border border-orange-300 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span>TEST SCENARIOS</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              id="btn-industrial-agent"
              onClick={onAskAgent}
              className="px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-950 text-xs font-mono font-bold rounded-lg border border-orange-300 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5 text-orange-600" />
              <span>AI AGENT</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
