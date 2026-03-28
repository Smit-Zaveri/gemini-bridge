import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { Incident, IncidentStatus, CriticalityLevel } from "../types";
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
    { label: "Critical", value: incidents.filter(i => i.criticalityLevel === CriticalityLevel.CRITICAL).length, icon: AlertCircle, bgCol: "bg-crit-critical", iconCol: "text-white" },
    { label: "High", value: incidents.filter(i => i.criticalityLevel === CriticalityLevel.HIGH).length, icon: AlertCircle, bgCol: "bg-crit-high", iconCol: "text-white" },
    { label: "Medium", value: incidents.filter(i => i.criticalityLevel === CriticalityLevel.MEDIUM).length, icon: Activity, bgCol: "bg-brand-primary", iconCol: "text-text-main" },
    { label: "Resolved", value: incidents.filter(i => i.status === IncidentStatus.RESOLVED).length, icon: CheckCircle2, bgCol: "bg-crit-low", iconCol: "text-white" },
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
    <div className="space-y-8 font-body text-text-main">
      <div className="flex items-center justify-between border-b-4 border-text-main pb-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight">Operations Command Center</h1>
          <p className="text-text-main/80 font-bold mt-2">Real-time emergency intelligence dashboard</p>
        </div>
        <div className="flex items-center gap-2 px-6 py-3 bg-crit-low border-4 border-text-main shadow-[4px_4px_0px_0px_#1C293C] text-white text-sm font-black uppercase tracking-wider">
          <div className="w-3 h-3 bg-white border-2 border-text-main rounded-none animate-pulse"></div>
          Live System Active
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-bg-surface border-4 border-text-main shadow-[8px_8px_0px_0px_#1C293C] p-6 flex items-center gap-6 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_#1C293C] transition-all">
            <div className={cn("p-4 border-4 border-text-main shadow-[4px_4px_0px_0px_#1C293C]", stat.bgCol)}>
              <stat.icon className={cn("w-8 h-8 stroke-[3]", stat.iconCol)} />
            </div>
            <div>
              <p className="text-sm text-text-main/80 font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-4xl font-black">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-bg-surface border-4 border-text-main shadow-[12px_12px_0px_0px_#1C293C] overflow-hidden">
            <div className="p-6 border-b-4 border-text-main flex items-center justify-between bg-brand-primary">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                <Clock className="w-6 h-6 stroke-[3]" />
                Live Incident Feed
              </h2>
              <button className="text-sm font-bold border-2 border-text-main bg-bg-surface px-4 py-1 hover:bg-text-main hover:text-white transition-colors">View All</button>
            </div>
            <div className="divide-y-4 divide-text-main max-h-[600px] overflow-y-auto">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="p-6 animate-pulse space-y-4">
                    <div className="h-4 bg-text-main/20 rounded-none w-1/4"></div>
                    <div className="h-6 bg-text-main/20 rounded-none w-3/4"></div>
                    <div className="h-4 bg-text-main/20 rounded-none w-1/2"></div>
                  </div>
                ))
              ) : incidents.length === 0 ? (
                <div className="p-12 text-center text-text-main/60 font-bold uppercase tracking-wider">
                  No active incidents reported.
                </div>
              ) : (
                incidents.map((incident) => (
                  <div key={incident.id} className="p-6 hover:bg-brand-primary/10 transition-colors group cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div className={cn(
                        "px-3 py-1 text-xs font-black uppercase tracking-wider border-2 border-text-main shadow-[2px_2px_0px_0px_#1C293C]",
                        incident.criticalityLevel === 'CRITICAL' ? 'bg-crit-critical text-white' : 
                        incident.criticalityLevel === 'HIGH' ? 'bg-crit-high text-white' : 
                        incident.criticalityLevel === 'MEDIUM' ? 'bg-brand-primary text-text-main' : 'bg-crit-low text-white'
                      )}>
                        {incident.criticalityLevel}
                      </div>
                      <span className="text-sm font-bold text-text-main/60">{formatDate(incident.createdAt)}</span>
                    </div>
                    <h3 className="text-xl font-black group-hover:underline decoration-4 underline-offset-4 transition-all">
                      {incident.emergencyType || "Unknown Emergency"}
                    </h3>
                    <p className="text-base font-bold text-text-main/80 mt-2 line-clamp-2">{incident.summary}</p>
                    <div className="flex items-center gap-6 mt-6 text-sm font-bold text-text-main/70">
                      <div className="flex items-center gap-2">
                        <MapIcon className="w-4 h-4 stroke-[2.5]" />
                        {incident.locationAddress || "Location pending"}
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 stroke-[2.5]" />
                        Score: {incident.criticalityScore}/100
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          <div className="bg-bg-surface border-4 border-text-main shadow-[12px_12px_0px_0px_#1C293C] overflow-hidden">
            <div className="p-6 border-b-4 border-text-main bg-brand-secondary text-white">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                <TrendingUp className="w-6 h-6 stroke-[3]" />
                Criticality Trend
              </h2>
            </div>
            <div className="h-64 p-6 border-b-4 border-text-main bg-brand-primary/10" style={{ height: '256px', minHeight: '256px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#432DD7" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#432DD7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="0" stroke="#1C293C" strokeOpacity={0.1} vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#1C293C" 
                    fontSize={12} 
                    fontWeight="bold"
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#1C293C" 
                    fontSize={12} 
                    fontWeight="bold"
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FBFBF9', border: '4px solid #1C293C', borderRadius: '0px', boxShadow: '4px 4px 0px 0px #1C293C', fontWeight: 'bold' }}
                    itemStyle={{ color: '#432DD7', fontWeight: 'black' }}
                  />
                  <Area 
                    type="step" 
                    dataKey="count" 
                    stroke="#1C293C" 
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                    strokeWidth={4}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-brand-primary border-4 border-text-main shadow-[12px_12px_0px_0px_#1C293C] p-6">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-6">System Intelligence</h3>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between text-base font-bold mb-2">
                  <span>AI Confidence</span>
                  <span className="font-black">94.2%</span>
                </div>
                <div className="w-full bg-bg-surface border-4 border-text-main h-6 rounded-none overflow-hidden relative">
                  <div className="bg-brand-secondary border-r-4 border-text-main h-full w-[94.2%]"></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between text-base font-bold mb-2">
                  <span>Avg. Response Time</span>
                  <span className="font-black">2.4s</span>
                </div>
                <div className="w-full bg-bg-surface border-4 border-text-main h-6 rounded-none overflow-hidden relative">
                  <div className="bg-brand-secondary border-r-4 border-text-main h-full w-[85%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
