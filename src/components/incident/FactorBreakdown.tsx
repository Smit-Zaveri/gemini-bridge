import { cn } from "../../lib/utils";

interface FactorBreakdownProps {
  factors: { label: string; value: number; max: number }[];
}

export function FactorBreakdown({ factors }: FactorBreakdownProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Criticality Breakdown</h3>
      {factors.map((factor) => (
        <div key={factor.label} className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">{factor.label}</span>
            <span className="text-white font-bold">{factor.value}/{factor.max}</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-1000 ease-out",
                factor.value / factor.max > 0.8 ? "bg-red-500" : "bg-brand-primary"
              )}
              style={{ width: `${(factor.value / factor.max) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}
