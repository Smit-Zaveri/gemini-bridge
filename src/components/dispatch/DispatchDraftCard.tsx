import { useState } from "react";
import { GlassCard } from "../ui/GlassCard";
import { Send, CheckCircle2, XCircle, Edit3, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { Dispatch, DispatchStatus } from "../../types";

interface DispatchDraftCardProps {
  dispatch: Dispatch;
  onConfirm: (id: string, message: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  key?: string | number;
}

export function DispatchDraftCard({ dispatch, onConfirm, onReject }: DispatchDraftCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState(dispatch.message);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(dispatch.id, message);
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GlassCard className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-bold">Draft for: {dispatch.service}</h3>
            <p className="text-xs text-slate-500">Incident ID: {dispatch.incidentId}</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-[10px] font-bold uppercase tracking-widest">
          Awaiting Confirmation
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">AI-Drafted Message</label>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="text-xs text-brand-primary hover:underline flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" />
              Edit Message
            </button>
          )}
        </div>
        {isEditing ? (
          <textarea 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full h-32 bg-white/5 border border-brand-primary/30 rounded-xl p-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all resize-none"
          />
        ) : (
          <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-sm text-slate-300 leading-relaxed italic">
            "{message}"
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-white/5">
        <button 
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Confirm & Send
            </>
          )}
        </button>
        <button 
          onClick={() => onReject(dispatch.id)}
          disabled={isSubmitting}
          className="px-6 py-3 border border-red-500/20 text-red-500 hover:bg-red-500/5 rounded-xl transition-all flex items-center gap-2"
        >
          <XCircle className="w-5 h-5" />
          Reject
        </button>
      </div>
    </GlassCard>
  );
}
