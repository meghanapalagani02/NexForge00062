import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Sliders,
  Bot,
  HelpCircle,
  ShieldCheck,
  TrendingUp,
  Factory
} from 'lucide-react';
import { PlanningSummary } from '../types/planning';

interface HeroRecommendationProps {
  summary: PlanningSummary;
  displayProductionNumber?: string;
  isFeasible?: boolean;
  statusBadgeText?: string;
  onWhyThisPlan: () => void;
  onTestScenario: () => void;
  onAskAgent: () => void;
}

export const HeroRecommendation: React.FC<HeroRecommendationProps> = ({
  summary,
  displayProductionNumber = '30.95M',
  isFeasible = true,
  statusBadgeText = 'Plan Feasible',
  onWhyThisPlan,
  onTestScenario,
  onAskAgent
}) => {
  return (
    <section
      id="hero-recommendation-card"
      className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col justify-center relative overflow-hidden h-full shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
    >
      {/* Background Geometric Watermark */}
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-slate-900">
        <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>

      <div className="relative z-10">
        <span className="text-[11px] font-bold text-orange-600 uppercase tracking-widest font-mono">
          Target Production Plan
        </span>

        <div className="flex items-baseline gap-3 mt-1">
          <h3 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight font-mono">
            {displayProductionNumber}
          </h3>
          <span className="text-xl text-slate-400 font-medium font-mono">Units</span>
        </div>

        <p className="text-base sm:text-lg text-slate-600 mt-4 max-w-lg leading-relaxed">
          Produce {displayProductionNumber} units over the next 6 months to cover expected demand while maintaining the required inventory buffer.
        </p>

        <div className="flex items-center gap-6 mt-8 flex-wrap">
          {isFeasible ? (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-semibold border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {statusBadgeText}
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-lg text-sm font-semibold border border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              {statusBadgeText}
            </div>
          )}

          <button
            onClick={onWhyThisPlan}
            className="text-orange-600 font-bold text-sm hover:underline flex items-center gap-1 cursor-pointer font-mono"
          >
            View Plan Explanation
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
