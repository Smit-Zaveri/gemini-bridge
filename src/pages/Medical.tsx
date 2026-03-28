import { useState } from "react";
import { parseMedicalRecord } from "../lib/gemini";
import { GlassCard } from "../components/ui/GlassCard";
import { MediaDropzone } from "../components/intake/MediaDropzone";
import { MedicalSummaryCard } from "../components/medical/MedicalSummaryCard";
import { 
  Stethoscope, 
  ShieldCheck, 
  Loader2, 
  Zap, 
  FileText, 
  Info,
  AlertCircle
} from "lucide-react";
import { cn } from "../lib/utils";

export default function Medical() {
  const [files, setFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (files.length === 0) {
      alert("Please upload at least one medical document.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const parts: any[] = [];
      
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

      const result = await parseMedicalRecord(parts);
      setAnalysisResult(result);
    } catch (error) {
      console.error("Medical analysis failed:", error);
      alert("Failed to parse medical records. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-text-main uppercase">Medical Intelligence Portal</h1>
          <p className="text-text-main/60 font-bold mt-1">Parse messy medical documents into structured emergency data</p>
        </div>
        <div className="flex items-center gap-2 px-6 py-3 bg-brand-primary border-4 border-text-main shadow-[4px_4px_0px_0px_#1C293C] text-text-main text-sm font-black uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          HIPAA Compliant
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Panel */}
        <div className="space-y-6">
          <GlassCard className="space-y-6">
            <div className="flex items-center gap-3 text-text-main font-black uppercase border-b-4 border-text-main pb-4">
              <FileText className="w-5 h-5 text-brand-primary fill-brand-primary" />
              Document Upload
            </div>
            <p className="text-sm text-slate-400">
              Upload PDFs, images of prescriptions, or scanned medical notes. Gemini 1.5 Pro will analyze the full context.
            </p>
            <MediaDropzone 
              onFilesSelected={setFiles} 
              onClear={() => setFiles([])} 
            />
          </GlassCard>

          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing || files.length === 0}
            className="w-full btn-primary py-6 text-xl flex items-center justify-center gap-3 uppercase tracking-wider"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Parsing Documents...
              </>
            ) : (
              <>
                <Zap className="w-6 h-6 fill-text-main" />
                Analyze records
              </>
            )}
          </button>

          <div className="bg-bg-base border-4 border-text-main p-6 space-y-4">
            <h3 className="text-sm font-black text-text-main flex items-center gap-2 uppercase">
              <Info className="w-4 h-4 text-brand-secondary" />
              How it works
            </h3>
            <p className="text-xs text-text-main/70 leading-relaxed font-bold">
              Gemini Bridge uses long-context AI to read through multiple pages of medical history. It identifies critical life-safety information like allergies and medications that are vital for first responders in the field.
            </p>
          </div>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          <GlassCard className={cn(
            "h-full min-h-[600px] flex flex-col transition-all duration-500",
            !analysisResult && "opacity-50 grayscale"
          )}>
            <div className="p-6 border-b-4 border-text-main flex items-center justify-between">
              <h2 className="text-xl font-black text-text-main flex items-center gap-2 uppercase">
                <Stethoscope className="w-5 h-5 text-brand-primary fill-brand-primary" />
                Medical Intelligence Summary
              </h2>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {!analysisResult ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-bg-base border-4 border-text-main flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-text-main/40" />
                  </div>
                  <p className="text-text-main/60 font-bold max-w-xs">
                    Upload medical documents on the left and click "Analyze" to generate a structured medical summary.
                  </p>
                </div>
              ) : (
                <MedicalSummaryCard summary={analysisResult} />
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
