import { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Trash2, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  onClear: () => void;
}

export function AudioRecorder({ onRecordingComplete, onClear }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        onRecordingComplete(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Failed to start recording:", err);
      alert("Microphone access denied. Please enable it in settings.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const clearRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    onClear();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className={cn(
        "h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all",
        isRecording ? "border-red-500 bg-red-500/5" : "border-white/10 bg-white/5",
        audioBlob && "border-brand-primary bg-brand-primary/5"
      )}>
        {!audioBlob && !isRecording ? (
          <button 
            onClick={startRecording}
            className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center shadow-lg shadow-brand-primary/20 hover:scale-110 transition-transform"
          >
            <Mic className="w-8 h-8 text-white" />
          </button>
        ) : isRecording ? (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-red-500 font-mono font-bold text-xl">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
              {formatTime(recordingTime)}
            </div>
            <button 
              onClick={stopRecording}
              className="px-6 py-2 bg-red-500 text-white rounded-full font-bold flex items-center gap-2 hover:bg-red-600 transition-colors"
            >
              <Square className="w-4 h-4 fill-white" />
              Stop Recording
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 w-full px-6">
            <audio src={audioUrl!} controls className="w-full h-10" />
            <div className="flex items-center gap-4">
              <button 
                onClick={clearRecording}
                className="p-2 text-slate-400 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <span className="text-sm text-brand-primary font-bold">Audio Ready</span>
            </div>
          </div>
        )}
      </div>
      <p className="text-xs text-center text-slate-500">
        {isRecording ? "Recording in progress..." : audioBlob ? "Recording captured" : "Click to record voice report"}
      </p>
    </div>
  );
}
