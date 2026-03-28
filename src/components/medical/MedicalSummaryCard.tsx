import { GlassCard } from "../ui/GlassCard";
import { AlertTriangle, Pill, Droplet, Activity, FileText, Download } from "lucide-react";
import { cn } from "../../lib/utils";

interface MedicalSummaryCardProps {
  summary: any;
}

export function MedicalSummaryCard({ summary }: MedicalSummaryCardProps) {
  if (!summary) return null;

  const mustKnow = summary.mustKnow || {};

  return (
    <div className="space-y-6">
      <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          CRITICAL ALLERGIES
        </h3>
        <div className="flex flex-wrap gap-2">
          {mustKnow.allergies?.length > 0 ? (
            mustKnow.allergies.map((a: string, i: number) => (
              <span key={i} className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold uppercase">
                {a}
              </span>
            ))
          ) : (
            <span className="text-slate-500 italic">No critical allergies detected</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Pill className="w-4 h-4 text-brand-primary" />
            Active Medications
          </h3>
          <ul className="space-y-2">
            {mustKnow.medications?.length > 0 ? (
              mustKnow.medications.map((m: string, i: number) => (
                <li key={i} className="text-sm text-white flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-brand-primary rounded-full"></div>
                  {m}
                </li>
              ))
            ) : (
              <li className="text-sm text-slate-500 italic">No medications detected</li>
            )}
          </ul>
        </GlassCard>

        <GlassCard className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Droplet className="w-4 h-4 text-red-500" />
            Blood Type
          </h3>
          <div className="text-3xl font-bold text-white">
            {mustKnow.bloodType || "Unknown"}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Activity className="w-4 h-4 text-green-500" />
          Active Conditions
        </h3>
        <div className="flex flex-wrap gap-2">
          {mustKnow.conditions?.length > 0 ? (
            mustKnow.conditions.map((c: string, i: number) => (
              <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white">
                {c}
              </span>
            ))
          ) : (
            <span className="text-slate-500 italic">No active conditions detected</span>
          )}
        </div>
      </GlassCard>

      <GlassCard className="space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400" />
          Full History Summary
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          {summary.fullHistory || "No history summary available."}
        </p>
      </GlassCard>

      <div className="flex justify-end">
        <button className="btn-outline flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export HL7 FHIR R4 JSON
        </button>
      </div>
    </div>
  );
}
