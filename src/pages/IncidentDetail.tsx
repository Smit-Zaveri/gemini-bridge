import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doc, onSnapshot, updateDoc, collection, addDoc } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { Incident, IncidentStatus, DispatchStatus, CriticalityLevel } from "../types";
import { draftDispatch } from "../lib/gemini";
import { GlassCard } from "../components/ui/GlassCard";
import { CriticalityMeter } from "../components/incident/CriticalityMeter";
import { FactorBreakdown } from "../components/incident/FactorBreakdown";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  User as UserIcon, 
  AlertTriangle, 
  Zap, 
  Send, 
  CheckCircle2, 
  Loader2, 
  Image as ImageIcon,
  Download,
  Share2,
  FileText
} from "lucide-react";
import { cn, formatDate, getCriticalityColor } from "../lib/utils";

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDrafting, setIsDrafting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onSnapshot(doc(db, "incidents", id), (doc) => {
      if (doc.exists()) {
        setIncident({ id: doc.id, ...doc.data() } as Incident);
      } else {
        navigate("/dashboard");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id, navigate]);

  const handleDraftDispatch = async () => {
    if (!incident) return;
    setIsDrafting(true);
    try {
      const draft = await draftDispatch(incident);
      await addDoc(collection(db, "dispatches"), {
        incidentId: incident.id,
        service: draft.service || "EMS",
        status: DispatchStatus.DRAFTED,
        message: draft.message,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      navigate("/dispatch");
    } catch (error) {
      console.error("Draft failed:", error);
      alert("Failed to draft dispatch.");
    } finally {
      setIsDrafting(false);
    }
  };

  const handleResolve = async () => {
    if (!id || !window.confirm("Mark this incident as resolved?")) return;
    try {
      await updateDoc(doc(db, "incidents", id), {
        status: IncidentStatus.RESOLVED,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Resolve failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  if (!incident) return null;

  const factors = [
    { label: "Voice Urgency", value: incident.geminiAnalysis?.urgency?.level === 'critical' ? 28 : 15, max: 30 },
    { label: "Visual Severity", value: incident.geminiAnalysis?.confidence?.severity * 25 || 18, max: 25 },
    { label: "Victim Count", value: (incident.geminiAnalysis?.victims?.estimatedCount || 0) * 4, max: 20 },
    { label: "Verification", value: 8, max: 10 },
    { label: "Medical Risk", value: incident.geminiAnalysis?.victims?.pediatricInvolved ? 14 : 8, max: 15 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-3 bg-bg-surface border-4 border-text-main shadow-[4px_4px_0px_0px_#1C293C] text-text-main hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_#1C293C] transition-all">
            <ArrowLeft className="w-5 h-5 stroke-[3]" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-text-main uppercase tracking-tight">INC-{incident.id.slice(0, 8).toUpperCase()}</h1>
              <div className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border",
                getCriticalityColor(incident.criticalityLevel)
              )}>
                {incident.criticalityLevel}
              </div>
            </div>
            <p className="text-text-main/60 mt-1 flex items-center gap-2 font-bold uppercase text-xs tracking-wider">
              <Clock className="w-4 h-4 stroke-[2.5]" />
              Reported {formatDate(incident.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="btn-outline flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </button>
          {incident.status !== IncidentStatus.RESOLVED && (
            <button 
              onClick={handleResolve}
              className="px-8 py-3 bg-crit-low text-white font-black uppercase border-4 border-text-main shadow-[4px_4px_0px_0px_#1C293C] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_0px_#1C293C] active:translate-y-0 active:translate-x-0 active:shadow-none transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 stroke-[3]" />
              Mark Resolved
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Overview */}
        <div className="lg:col-span-2 space-y-8">
          <GlassCard className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-b-4 border-text-main pb-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-text-main/40 uppercase tracking-widest">Emergency Type</p>
                <p className="text-lg font-black text-text-main uppercase">{incident.emergencyType?.replace('_', ' ')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-text-main/40 uppercase tracking-widest">Victims</p>
                <p className="text-lg font-black text-text-main">~{incident.geminiAnalysis?.victims?.estimatedCount || "Unknown"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-text-main/40 uppercase tracking-widest">Location</p>
                <p className="text-lg font-black text-text-main truncate">{incident.locationAddress || "Unknown"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-text-main/40 uppercase tracking-widest">Status</p>
                <p className="text-lg font-black text-brand-secondary uppercase">{incident.status}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-black text-text-main flex items-center gap-3 uppercase tracking-tight">
                <Zap className="w-6 h-6 text-brand-primary fill-brand-primary" />
                Intelligence Summary
              </h2>
              <p className="text-lg text-text-main leading-relaxed font-bold border-l-8 border-brand-primary pl-6 italic">
                "{incident.summary}"
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-black text-text-main/40 uppercase tracking-widest">Media Evidence</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {incident.mediaUrls.map((url, i) => (
                  <div key={i} className="aspect-square bg-bg-base border-4 border-text-main overflow-hidden group cursor-pointer relative shadow-[4px_4px_0px_0px_#1C293C] transition-all hover:translate-y-1 hover:translate-x-1 hover:shadow-none">
                    <img src={url} alt="evidence" className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-x-0 bottom-0 py-1 bg-brand-primary border-t-4 border-text-main opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ImageIcon className="w-4 h-4 text-text-main fill-text-main" />
                    </div>
                  </div>
                ))}
                {incident.mediaUrls.length === 0 && (
                  <div className="col-span-full py-12 text-center text-text-main/30 font-bold uppercase tracking-widest text-sm border-4 border-dashed border-text-main/20">
                    No media evidence attached.
                  </div>
                )}
              </div>
            </div>
          </GlassCard>

          {/* Action Plan */}
          <GlassCard className="space-y-6">
            <h2 className="text-xl font-black text-text-main flex items-center gap-3 uppercase tracking-tight">
              <CheckCircle2 className="w-6 h-6 text-crit-low stroke-[3]" />
              AI Action Plan
            </h2>
            <div className="space-y-4">
              {incident.geminiAnalysis?.actionPlan?.map((action: any, i: number) => (
                <div key={i} className="flex gap-4 p-6 bg-bg-base border-4 border-text-main hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_0px_#1C293C] transition-all">
                  <div className="w-10 h-10 bg-brand-primary border-4 border-text-main flex items-center justify-center text-text-main font-black flex-shrink-0">
                    {action.priority}
                  </div>
                  <div>
                    <p className="text-text-main font-black uppercase tracking-tight">{action.action}</p>
                    <p className="text-sm text-text-main/70 mt-1 font-bold">{action.reasoning}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Intelligence & Actions */}
        <div className="space-y-8">
          <GlassCard className="flex flex-col items-center text-center py-8">
            <CriticalityMeter score={incident.criticalityScore} level={incident.criticalityLevel} />
            <h2 className="text-xl font-black text-text-main mt-6 uppercase tracking-tight">Intelligence</h2>
            <p className="text-sm text-text-main/60 mt-2 px-6 font-bold">
              {incident.geminiAnalysis?.urgency?.reasoning}
            </p>
            <div className="w-full mt-8 px-6">
              <FactorBreakdown factors={factors} />
            </div>
          </GlassCard>

          <GlassCard className="space-y-6">
            <h2 className="text-lg font-black text-text-main flex items-center gap-3 uppercase tracking-tight">
              <Send className="w-6 h-6 text-brand-primary fill-brand-primary" />
              Dispatch
            </h2>
            <div className="space-y-3">
              <button 
                onClick={handleDraftDispatch}
                disabled={isDrafting}
                className="w-full btn-primary py-6 flex items-center justify-center gap-3 uppercase tracking-wider text-xl"
              >
                {isDrafting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-6 h-6 fill-text-main" />
                    Draft Dispatch
                  </>
                )}
              </button>
              <p className="text-[10px] text-center text-text-main/40 font-black uppercase tracking-widest">
                Human Review Required
              </p>
            </div>
          </GlassCard>

          <GlassCard className="space-y-6">
            <h2 className="text-lg font-black text-text-main flex items-center gap-3 uppercase tracking-tight">
              <Download className="w-6 h-6 text-text-main/40" />
              Export
            </h2>
            <div className="space-y-3">
              <button className="w-full px-6 py-3 bg-bg-base border-4 border-text-main text-sm text-text-main font-black uppercase tracking-widest flex items-center justify-between hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_0px_#1C293C] transition-all">
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 stroke-[3]" />
                  HL7 FHIR
                </span>
                <Download className="w-3 h-3 stroke-[3]" />
              </button>
              <button className="w-full px-6 py-3 bg-bg-base border-4 border-text-main text-sm text-text-main font-black uppercase tracking-widest flex items-center justify-between hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_0px_#1C293C] transition-all">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 stroke-[3]" />
                  EDXL-CAP
                </span>
                <Download className="w-3 h-3 stroke-[3]" />
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
