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
          <Link to="/dashboard" className="p-2 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">INC-{incident.id.slice(0, 8).toUpperCase()}</h1>
              <div className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border",
                getCriticalityColor(incident.criticalityLevel)
              )}>
                {incident.criticalityLevel}
              </div>
            </div>
            <p className="text-slate-400 mt-1 flex items-center gap-2">
              <Clock className="w-4 h-4" />
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
              className="px-6 py-2 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Resolve Incident
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Overview */}
        <div className="lg:col-span-2 space-y-8">
          <GlassCard className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-b border-white/5 pb-8">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Emergency Type</p>
                <p className="text-lg font-bold text-white capitalize">{incident.emergencyType?.replace('_', ' ')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Victims</p>
                <p className="text-lg font-bold text-white">~{incident.geminiAnalysis?.victims?.estimatedCount || "Unknown"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Location</p>
                <p className="text-lg font-bold text-white truncate">{incident.locationAddress || "Unknown"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</p>
                <p className="text-lg font-bold text-brand-primary capitalize">{incident.status}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-brand-primary" />
                AI Intelligence Summary
              </h2>
              <p className="text-lg text-slate-300 leading-relaxed italic">
                "{incident.summary}"
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Media Evidence</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {incident.mediaUrls.map((url, i) => (
                  <div key={i} className="aspect-square bg-white/5 rounded-2xl border border-white/5 overflow-hidden group cursor-pointer relative">
                    <img src={url} alt="evidence" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                ))}
                {incident.mediaUrls.length === 0 && (
                  <div className="col-span-full py-8 text-center text-slate-600 text-sm italic">
                    No media evidence attached.
                  </div>
                )}
              </div>
            </div>
          </GlassCard>

          {/* Action Plan */}
          <GlassCard className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              AI Action Plan
            </h2>
            <div className="space-y-4">
              {incident.geminiAnalysis?.actionPlan?.map((action: any, i: number) => (
                <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="w-8 h-8 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary font-bold flex-shrink-0">
                    {action.priority}
                  </div>
                  <div>
                    <p className="text-white font-bold">{action.action}</p>
                    <p className="text-sm text-slate-400 mt-1">{action.reasoning}</p>
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
            <h2 className="text-xl font-bold text-white mt-6">Criticality Intelligence</h2>
            <p className="text-sm text-slate-500 mt-2 px-6">
              {incident.geminiAnalysis?.urgency?.reasoning}
            </p>
            <div className="w-full mt-8 px-6">
              <FactorBreakdown factors={factors} />
            </div>
          </GlassCard>

          <GlassCard className="space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-brand-primary" />
              Dispatch Actions
            </h2>
            <div className="space-y-3">
              <button 
                onClick={handleDraftDispatch}
                disabled={isDrafting}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2"
              >
                {isDrafting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Draft AI Dispatch
                  </>
                )}
              </button>
              <p className="text-[10px] text-center text-slate-500">
                Human-in-the-loop confirmation required before sending.
              </p>
            </div>
          </GlassCard>

          <GlassCard className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-slate-400" />
              Export Data
            </h2>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-slate-300 flex items-center justify-between transition-all">
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  HL7 FHIR JSON
                </span>
                <Download className="w-3 h-3" />
              </button>
              <button className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-slate-300 flex items-center justify-between transition-all">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  EDXL-CAP Alert
                </span>
                <Download className="w-3 h-3" />
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
