import { cn } from "../../lib/utils";

interface CriticalityMeterProps {
  score: number;
  level: string;
}

export function CriticalityMeter({ score, level }: CriticalityMeterProps) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return '#22c55e';
      case 'medium': return '#f59e0b';
      case 'high': return '#f97316';
      case 'critical': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90">
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-white/5"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke={getColor(level)}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: offset }}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white leading-none">{score}</span>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Score</span>
      </div>
    </div>
  );
}
