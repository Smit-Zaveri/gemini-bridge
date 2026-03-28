import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "../lib/firebase";
import { analyzeIncident } from "../lib/gemini";
import { GlassCard } from "../components/ui/GlassCard";
import { AudioRecorder } from "../components/intake/AudioRecorder";
import { MediaDropzone } from "../components/intake/MediaDropzone";
import { 
  Zap, 
  Send, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Mic,
  Image as ImageIcon,
  FileText,
  MapPin
} from "lucide-react";
import { cn } from "../lib/utils";
import { IncidentStatus, CriticalityLevel } from "../types";

export default function Report() {
  const navigate = useNavigate();
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [textNote, setTextNote] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnalyze = async () => {
    if (!audioBlob && files.length === 0 && !textNote) {
      alert("Please provide at least one form of input (voice, image, or text).");
      return;
    }

    setIsAnalyzing(true);
    try {
      const parts: any[] = [];
      
      if (textNote) {
        parts.push({ text: `USER TEXT NOTE: ${textNote}` });
      }

      if (audioBlob) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(audioBlob);
        });
        const base64 = await base64Promise;
        parts.push({
          inlineData: {
            data: base64,
            mimeType: "audio/webm",
          },
        });
      }

      for (const file of files) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(file);
        });
        const base64 = await base64Promise;
        parts.push({
          inlineData: {
            data: base64,
            mimeType: file.type,
          },
        });
      }

      const result = await analyzeIncident(parts);
      setAnalysisResult(result);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("AI analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!analysisResult) return;

    setIsSubmitting(true);
    try {
      const mediaUrls: string[] = [];
      
      // Upload audio if exists
      if (audioBlob) {
        try {
          const audioRef = ref(storage, `incidents/${Date.now()}_audio.webm`);
          await uploadBytes(audioRef, audioBlob);
          const url = await getDownloadURL(audioRef);
          mediaUrls.push(url);
        } catch (storageErr) {
          console.error("Audio upload failed:", storageErr);
          throw new Error("Failed to upload audio evidence. This might be a CORS configuration issue in Firebase Storage.");
        }
      }

      // Upload files if exist
      for (const file of files) {
        try {
          const fileRef = ref(storage, `incidents/${Date.now()}_${file.name}`);
          await uploadBytes(fileRef, file);
          const url = await getDownloadURL(fileRef);
          mediaUrls.push(url);
        } catch (storageErr) {
          console.error("File upload failed:", storageErr);
          throw new Error(`Failed to upload file: ${file.name}. This might be a CORS configuration issue in Firebase Storage.`);
        }
      }

      const incidentData = {
        reportedBy: auth.currentUser?.uid,
        status: IncidentStatus.PENDING,
        criticalityScore: analysisResult.urgency?.level === 'critical' ? 90 : analysisResult.urgency?.level === 'high' ? 70 : 40,
        criticalityLevel: analysisResult.urgency?.level || CriticalityLevel.MEDIUM,
        locationAddress: analysisResult.location?.structuredAddress || analysisResult.location?.rawDescription,
        emergencyType: analysisResult.emergencyType,
        summary: analysisResult.summary,
        geminiAnalysis: analysisResult,
        mediaUrls,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "incidents"), incidentData);
      navigate(`/incident/${docRef.id}`);
    } catch (error: any) {
      console.error("Submission failed:", error);
      alert(error.message || "Failed to submit incident. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-main uppercase">Multimodal Intake</h1>
          <p className="text-text-main/60 font-bold mt-1">Report an emergency using voice, images, or text</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-main/40">
            <div className="w-2 h-2 bg-text-main/40 rounded-full"></div>
            Step 1: Input
          </div>
          <div className="w-8 h-px bg-text-main/10"></div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-main">
            <div className="w-2 h-2 bg-text-main rounded-full"></div>
            Step 2: Analysis
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Controls */}
        <div className="space-y-6">
          <GlassCard className="space-y-6">
            <div className="flex items-center gap-3 text-text-main font-black uppercase border-b-4 border-text-main pb-4">
              <Mic className="w-5 h-5 text-brand-primary fill-brand-primary" />
              Voice Report
            </div>
            <AudioRecorder 
              onRecordingComplete={setAudioBlob} 
              onClear={() => setAudioBlob(null)} 
            />
          </GlassCard>

          <GlassCard className="space-y-6">
            <div className="flex items-center gap-3 text-text-main font-black uppercase border-b-4 border-text-main pb-4">
              <ImageIcon className="w-5 h-5 text-brand-primary fill-brand-primary" />
              Visual Evidence
            </div>
            <MediaDropzone 
              onFilesSelected={setFiles} 
              onClear={() => setFiles([])} 
            />
          </GlassCard>

          <GlassCard className="space-y-6">
            <div className="flex items-center gap-3 text-text-main font-black uppercase border-b-4 border-text-main pb-4">
              <FileText className="w-5 h-5 text-brand-primary fill-brand-primary" />
              Additional Context
            </div>
            <textarea 
              value={textNote}
              onChange={(e) => setTextNote(e.target.value)}
              placeholder="Type any additional details here..."
              className="w-full h-32 bg-bg-base border-4 border-text-main p-4 text-sm font-bold focus:outline-none focus:ring-0 focus:-translate-y-1 focus:-translate-x-1 focus:shadow-[4px_4px_0px_0px_#1C293C] transition-all resize-none placeholder:text-text-main/30"
            />
          </GlassCard>

          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing || isSubmitting}
            className="w-full btn-primary py-6 text-xl flex items-center justify-center gap-3 uppercase tracking-wider"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Gemini is analyzing...
              </>
            ) : (
              <>
                <Zap className="w-6 h-6 fill-text-main" />
                Analyze with Gemini AI
              </>
            )}
          </button>
        </div>

        {/* AI Preview Panel */}
        <div className="space-y-6">
          <GlassCard className={cn(
            "h-full min-h-[600px] flex flex-col transition-all duration-500",
            !analysisResult && "opacity-50 grayscale"
          )}>
            <div className="p-6 border-b-4 border-text-main flex items-center justify-between">
              <h2 className="text-xl font-black text-text-main flex items-center gap-2 uppercase">
                <Zap className="w-5 h-5 text-brand-primary fill-brand-primary" />
                AI Intelligence Preview
              </h2>
              {analysisResult && (
                <div className="px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-brand-primary text-xs font-bold">
                  Analysis Complete
                </div>
              )}
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-8">
              {!analysisResult ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-bg-base border-4 border-text-main flex items-center justify-center">
                    <Info className="w-8 h-8 text-text-main/40" />
                  </div>
                  <p className="text-text-main/60 font-bold max-w-xs">
                    Provide input on the left and click "Analyze" to see the AI-generated intelligence report.
                  </p>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Summary */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-black text-text-main/40 uppercase tracking-widest">Situation Summary</h3>
                    <p className="text-lg text-text-main leading-relaxed font-bold border-l-4 border-brand-primary pl-4">
                      {analysisResult.summary}
                    </p>
                  </div>

                  {/* Criticality */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-bg-base p-4 border-4 border-text-main">
                      <h3 className="text-[10px] font-black text-text-main/40 uppercase tracking-widest mb-1">Urgency Level</h3>
                      <div className={cn(
                        "text-xl font-black uppercase",
                        analysisResult.urgency?.level === 'critical' ? "text-red-600" : "text-brand-secondary"
                      )}>
                        {analysisResult.urgency?.level || "Unknown"}
                      </div>
                    </div>
                    <div className="bg-bg-base p-4 border-4 border-text-main">
                      <h3 className="text-[10px] font-black text-text-main/40 uppercase tracking-widest mb-1">Emergency Type</h3>
                      <div className="text-xl font-black text-text-main capitalize">
                        {analysisResult.emergencyType?.replace('_', ' ') || "Unknown"}
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-black text-text-main/40 uppercase tracking-widest flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Detected Location
                    </h3>
                    <div className="bg-bg-base p-4 border-4 border-text-main">
                      <p className="text-text-main font-bold">{analysisResult.location?.structuredAddress || "Address not detected"}</p>
                      <p className="text-xs text-text-main/60 mt-1 italic font-bold">"{analysisResult.location?.rawDescription}"</p>
                    </div>
                  </div>

                  {/* Victims */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-black text-text-main/40 uppercase tracking-widest">Victim Assessment</h3>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-brand-primary border-4 border-text-main shadow-[4px_4px_0px_0px_#1C293C] flex items-center justify-center text-text-main font-black text-xl">
                        {analysisResult.victims?.estimatedCount || "?"}
                      </div>
                      <div>
                        <p className="text-text-main font-black uppercase">Estimated Victims</p>
                        <p className="text-xs text-text-main/60 font-bold">
                          {analysisResult.victims?.pediatricInvolved ? "⚠️ Pediatric involvement detected" : "No pediatric flags"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contradictions */}
                  {analysisResult.contradictions?.length > 0 && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl space-y-2">
                      <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Contradictions Detected
                      </h3>
                      <ul className="list-disc list-inside text-sm text-red-400/80 space-y-1">
                        {analysisResult.contradictions.map((c: string, i: number) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {analysisResult && (
              <div className="p-6 border-t-4 border-text-main bg-bg-base">
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full btn-primary py-6 flex items-center justify-center gap-3 uppercase tracking-wider text-xl"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting Incident...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-6 h-6" />
                      Confirm & Submit
                    </>
                  )}
                </button>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
