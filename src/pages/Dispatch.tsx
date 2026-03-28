import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, orderBy } from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "../lib/firebase";
import { Dispatch, DispatchStatus } from "../types";
import { GlassCard } from "../components/ui/GlassCard";
import { DispatchDraftCard } from "../components/dispatch/DispatchDraftCard";
import { 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Loader2, 
  Filter,
  History
} from "lucide-react";
import { cn, formatDate } from "../lib/utils";

export default function DispatchPage() {
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DispatchStatus | "all">("all");

  useEffect(() => {
    const path = "dispatches";
    const q = query(
      collection(db, path),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Dispatch));
      setDispatches(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsubscribe();
  }, []);

  const handleConfirm = async (id: string, message: string) => {
    try {
      await updateDoc(doc(db, "dispatches", id), {
        status: DispatchStatus.SENT,
        message,
        confirmedBy: auth.currentUser?.uid,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Confirm failed:", error);
      alert("Failed to confirm dispatch.");
    }
  };

  const handleReject = async (id: string) => {
    if (window.confirm("Are you sure you want to reject this dispatch draft?")) {
      try {
        await deleteDoc(doc(db, "dispatches", id));
      } catch (error) {
        console.error("Reject failed:", error);
        alert("Failed to reject dispatch.");
      }
    }
  };

  const pendingDispatches = dispatches.filter(d => d.status === DispatchStatus.DRAFTED);
  const sentDispatches = dispatches.filter(d => d.status === DispatchStatus.SENT);

  const filteredDispatches = filter === "all" ? dispatches : dispatches.filter(d => d.status === filter);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-text-main uppercase">Dispatch Command Center</h1>
          <p className="text-text-main/60 font-bold mt-1">Human-in-the-loop emergency communication queue</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-6 py-3 bg-brand-primary border-4 border-text-main shadow-[4px_4px_0px_0px_#1C293C] text-text-main text-sm font-black uppercase tracking-wider flex items-center gap-2">
            <AlertCircle className="w-5 h-5 fill-text-main" />
            {pendingDispatches.length} Awaiting
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-text-main flex items-center gap-2 uppercase tracking-tight">
              <Send className="w-6 h-6 text-brand-primary fill-brand-primary" />
              Active Draft Queue
            </h2>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-text-main/50" />
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="bg-bg-surface border-4 border-text-main px-4 py-1 text-xs text-text-main font-bold focus:outline-none focus:shadow-[2px_2px_0px_0px_#1C293C] transition-all"
              >
                <option value="all">All Status</option>
                <option value={DispatchStatus.DRAFTED}>Pending</option>
                <option value={DispatchStatus.SENT}>Sent</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            </div>
          ) : pendingDispatches.length === 0 ? (
            <GlassCard className="p-16 text-center text-text-main/40 border-dashed">
              <div className="w-16 h-16 bg-bg-base border-4 border-text-main flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-crit-low" />
              </div>
              <p className="text-2xl font-black text-text-main uppercase mb-2">Queue Clear</p>
              <p className="font-bold">No dispatch drafts awaiting confirmation.</p>
            </GlassCard>
          ) : (
            <div className="space-y-6">
              {pendingDispatches.map((dispatch) => (
                <DispatchDraftCard 
                  key={dispatch.id} 
                  dispatch={dispatch} 
                  onConfirm={handleConfirm}
                  onReject={handleReject}
                />
              ))}
            </div>
          )}
        </div>

        {/* History Log */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-6 h-6 text-text-main/40" />
            <h2 className="text-xl font-black text-text-main uppercase tracking-tight">Sent Log</h2>
          </div>

          <GlassCard className="p-0 overflow-hidden">
            <div className="divide-y-4 divide-text-main max-h-[700px] overflow-y-auto">
              {sentDispatches.length === 0 ? (
                <div className="p-12 text-center text-text-main/40 font-bold uppercase tracking-wider text-sm">
                  No dispatches sent yet.
                </div>
              ) : (
                sentDispatches.map((dispatch) => (
                  <div key={dispatch.id} className="p-6 hover:bg-brand-primary/10 transition-colors bg-bg-surface">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-0.5 bg-crit-low text-white text-[10px] font-black uppercase tracking-widest border-2 border-text-main shadow-[2px_2px_0px_0px_#1C293C] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Sent
                      </span>
                      <span className="text-[10px] font-black text-text-main/40">{formatDate(dispatch.createdAt)}</span>
                    </div>
                    <p className="text-sm font-black text-text-main border-l-4 border-brand-primary pl-3 mb-2 uppercase">{dispatch.service}</p>
                    <p className="text-xs font-bold text-text-main/70 line-clamp-2 italic">"{dispatch.message}"</p>
                    <div className="mt-4 flex items-center justify-between text-[10px] font-black text-text-main/40 uppercase tracking-tighter">
                      <span>ID: {dispatch.incidentId?.slice(0, 8)}</span>
                      <span>By: {dispatch.confirmedBy?.slice(0, 6)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
