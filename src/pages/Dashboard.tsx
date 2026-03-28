import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { Incident, IncidentStatus, CriticalityLevel } from "../types";
import { GlassCard } from "../components/ui/GlassCard";
import { 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Map as MapIcon,
  TrendingUp
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { formatDate, getCriticalityColor, cn } from "../lib/utils";

export default function Dashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const path = "incidents";
    const q = query(
      collection(db, path),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Incident));
      setIncidents(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsubscribe();
  }, []);

  const stats = [
    { label: "Critical", value: incidents.filter(i => i.criticalityLevel === CriticalityLevel.CRITICAL).length, icon: AlertCircle, color: "text-red-500" },
    { label: "High", value: incidents.filter(i => i.criticalityLevel === CriticalityLevel.HIGH).length, icon: AlertCircle, color: "text-orange-500" },
    { label: "Medium", value: incidents.filter(i => i.criticalityLevel === CriticalityLevel.MEDIUM).length, icon: Activity, color: "text-amber-500" },
    { label: "Resolved", value: incidents.filter(i => i.status === IncidentStatus.RESOLVED).length, icon: CheckCircle2, color: "text-green-500" },
  ];

  const chartData = [
    { time: "10:00", count: 4 },
    { time: "11:00", count: 7 },
    { time: "12:00", count: 5 },
    { time: "13:00", count: 12 },
    { time: "14:00", count: 8 },
    { time: "15:00", count: 15 },
    { time: "16:00", count: 10 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Operations Command Center</h1>
          <p className="text-slate-400 mt-1">Real-time emergency intelligence dashboard</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-500 text-sm font-semibold">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Live System Active
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <GlassCard key={stat.label} className="flex items-center gap-4">
            <div className={cn("p-3 rounded-xl bg-white/5", stat.color)}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-0 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-primary" />
                Live Incident Feed
              </h2>
              <button className="text-sm text-brand-primary hover:underline">View All</button>
            </div>
            <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="p-6 animate-pulse space-y-3">
                    <div className="h-4 bg-white/5 rounded w-1/4"></div>
                    <div className="h-6 bg-white/5 rounded w-3/4"></div>
                    <div className="h-4 bg-white/5 rounded w-1/2"></div>
                  </div>
                ))
              ) : incidents.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  No active incidents reported.
                </div>
              ) : (
                incidents.map((incident) => (
                  <div key={incident.id} className="p-6 hover:bg-white/5 transition-colors group cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <div className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                        getCriticalityColor(incident.criticalityLevel)
                      )}>
                        {incident.criticalityLevel}
                      </div>
                      <span className="text-xs text-slate-500">{formatDate(incident.createdAt)}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-brand-primary transition-colors">
                      {incident.emergencyType || "Unknown Emergency"}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">{incident.summary}</p>
                    <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <MapIcon className="w-3 h-3" />
                        {incident.locationAddress || "Location pending"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        Score: {incident.criticalityScore}/100
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          <GlassCard className="p-0 overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-primary" />
                Criticality Trend
              </h2>
            </div>
            <div className="h-64 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0d1424', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#3b82f6' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard className="bg-brand-primary/10 border-brand-primary/20">
            <h3 className="text-lg font-bold text-white mb-4">System Intelligence</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">AI Confidence</span>
                <span className="text-brand-primary font-bold">94.2%</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div className="bg-brand-primary h-full w-[94.2%]"></div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Avg. Response Time</span>
                <span className="text-brand-primary font-bold">2.4s</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div className="bg-brand-primary h-full w-[85%]"></div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
