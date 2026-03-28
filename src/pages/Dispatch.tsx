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
          <h1 className="text-3xl font-bold text-white">Dispatch Command Center</h1>
          <p className="text-slate-400 mt-1">Human-in-the-loop emergency communication queue</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-sm font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {pendingDispatches.length} Awaiting Confirmation
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-brand-primary" />
              Active Draft Queue
            </h2>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="bg-bg-elevated border border-white/5 rounded-lg px-3 py-1 text-xs text-slate-400 focus:outline-none"
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
            <GlassCard className="p-12 text-center text-slate-500">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-lg font-bold text-white mb-1">Queue Clear</p>
              <p className="text-sm">No dispatch drafts awaiting confirmation.</p>
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
            <History className="w-5 h-5 text-slate-500" />
            <h2 className="text-xl font-bold text-white">Sent Log</h2>
          </div>

          <GlassCard className="p-0 overflow-hidden">
            <div className="divide-y divide-white/5 max-h-[700px] overflow-y-auto">
              {sentDispatches.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No dispatches sent yet.
                </div>
              ) : (
                sentDispatches.map((dispatch) => (
                  <div key={dispatch.id} className="p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Sent
                      </span>
                      <span className="text-[10px] text-slate-500">{formatDate(dispatch.createdAt)}</span>
                    </div>
                    <p className="text-xs font-bold text-white mb-1">{dispatch.service}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-2 italic">"{dispatch.message}"</p>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                      <span>ID: {dispatch.incidentId}</span>
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
