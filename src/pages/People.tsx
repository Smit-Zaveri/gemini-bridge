import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { GlassCard } from "../components/ui/GlassCard";
import {
  Users,
  Search,
  User as UserIcon,
  MapPin,
  AlertTriangle,
  Phone,
  Mail,
  Calendar,
  ChevronRight,
  Activity,
  Shield,
  Heart,
  X,
  FileText,
  Clock,
} from "lucide-react";
import { cn } from "../lib/utils";

export interface PersonRecord {
  id: string;
  name: string;
  age?: number | null;
  gender?: string | null;
  role?: string; // victim, witness, reporter, suspect
  description?: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  injuries?: string[];
  conditions?: string[];
  associatedIncidents: string[];
  lastSeen?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface AssociatedIncident {
  id: string;
  emergencyType: string;
  summary: string;
  criticalityLevel: string;
  createdAt: string;
}

function getRoleBadge(role?: string) {
  switch (role?.toLowerCase()) {
    case "victim":
      return { bg: "bg-crit-critical", text: "text-white", icon: Heart };
    case "witness":
      return { bg: "bg-brand-secondary", text: "text-white", icon: UserIcon };
    case "reporter":
      return { bg: "bg-crit-low", text: "text-white", icon: Shield };
    case "suspect":
      return { bg: "bg-crit-high", text: "text-white", icon: AlertTriangle };
    default:
      return { bg: "bg-brand-primary", text: "text-text-main", icon: UserIcon };
  }
}

export default function People() {
  const [persons, setPersons] = useState<PersonRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<PersonRecord | null>(null);
  const [associatedIncidents, setAssociatedIncidents] = useState<AssociatedIncident[]>([]);
  const [loadingIncidents, setLoadingIncidents] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "persons"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() } as PersonRecord)
        );
        setPersons(docs);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to load persons:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Load associated incidents when a person is selected
  useEffect(() => {
    if (!selectedPerson || !selectedPerson.associatedIncidents?.length) {
      setAssociatedIncidents([]);
      return;
    }
    setLoadingIncidents(true);
    Promise.all(
      selectedPerson.associatedIncidents.map(async (incId) => {
        const snap = await getDoc(doc(db, "incidents", incId));
        if (snap.exists()) {
          return { id: snap.id, ...snap.data() } as AssociatedIncident;
        }
        return null;
      })
    ).then((results) => {
      setAssociatedIncidents(results.filter(Boolean) as AssociatedIncident[]);
      setLoadingIncidents(false);
    });
  }, [selectedPerson]);

  const filtered = persons.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      (p.name || '').toLowerCase().includes(q) ||
      (p.role || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.address || '').toLowerCase().includes(q)
    );
  });

  const stats = [
    {
      label: "Total Persons",
      value: persons.length,
      icon: Users,
      bg: "bg-brand-primary",
    },
    {
      label: "Victims",
      value: persons.filter((p) => p.role === "victim").length,
      icon: Heart,
      bg: "bg-crit-critical",
    },
    {
      label: "Witnesses",
      value: persons.filter((p) => p.role === "witness").length,
      icon: UserIcon,
      bg: "bg-brand-secondary",
    },
    {
      label: "Reporters",
      value: persons.filter((p) => p.role === "reporter").length,
      icon: Shield,
      bg: "bg-crit-low",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b-4 border-text-main pb-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight">
            People Database
          </h1>
          <p className="text-text-main/80 font-bold mt-2">
            Persons extracted from incident reports
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-bg-surface border-4 border-text-main shadow-[6px_6px_0px_0px_#1C293C] p-4 flex items-center gap-4 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0px_0px_#1C293C] transition-all"
          >
            <div
              className={cn(
                "p-3 border-4 border-text-main shadow-[3px_3px_0px_0px_#1C293C]",
                stat.bg
              )}
            >
              <stat.icon className="w-6 h-6 text-white stroke-[3]" />
            </div>
            <div>
              <p className="text-xs text-text-main/70 font-bold uppercase tracking-wider">
                {stat.label}
              </p>
              <p className="text-3xl font-black">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-main/60 z-10" />
        <input
          type="text"
          placeholder="Search people by name, role, or address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full input-field pl-12 text-base"
        />
      </div>

      {/* Main Content: Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Person List */}
        <div className="lg:col-span-2 space-y-4 max-h-[700px] overflow-y-auto pr-2">
          {loading ? (
            Array(4)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="bg-bg-surface border-4 border-text-main p-6 animate-pulse space-y-3"
                >
                  <div className="h-5 bg-text-main/20 w-1/2"></div>
                  <div className="h-4 bg-text-main/10 w-3/4"></div>
                </div>
              ))
          ) : filtered.length === 0 ? (
            <div className="bg-bg-surface border-4 border-text-main shadow-[8px_8px_0px_0px_#1C293C] p-12 text-center">
              <Users className="w-16 h-16 text-text-main/30 mx-auto mb-4" />
              <p className="text-text-main/60 font-bold uppercase tracking-wider">
                {searchQuery
                  ? "No persons match your search"
                  : "No persons recorded yet"}
              </p>
              <p className="text-text-main/40 font-bold text-sm mt-2">
                Persons are automatically extracted from incident reports
              </p>
            </div>
          ) : (
            filtered.map((person) => {
              const badge = getRoleBadge(person.role);
              const isSelected = selectedPerson?.id === person.id;
              return (
                <button
                  key={person.id}
                  onClick={() => setSelectedPerson(person)}
                  className={cn(
                    "w-full text-left bg-bg-surface border-4 border-text-main p-5 transition-all group",
                    isSelected
                      ? "bg-brand-primary/20 shadow-[8px_8px_0px_0px_#1C293C] -translate-y-1 -translate-x-1"
                      : "shadow-[4px_4px_0px_0px_#1C293C] hover:shadow-[8px_8px_0px_0px_#1C293C] hover:-translate-y-1 hover:-translate-x-1"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-bg-base border-4 border-text-main shadow-[2px_2px_0px_0px_#1C293C] flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${person.name}`}
                        alt={person.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-black text-lg uppercase truncate">
                          {person.name}
                        </h3>
                        <span
                          className={cn(
                            "px-2 py-0.5 text-[10px] font-black uppercase tracking-widest border-2 border-text-main",
                            badge.bg,
                            badge.text
                          )}
                        >
                          {person.role || "unknown"}
                        </span>
                      </div>
                      {person.description && (
                        <p className="text-sm text-text-main/70 font-bold line-clamp-1">
                          {person.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-text-main/50 font-bold">
                        {person.age && <span>Age: {person.age}</span>}
                        {person.gender && <span>• {person.gender}</span>}
                        <span>
                          • {person.associatedIncidents?.length || 0} incidents
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      className={cn(
                        "w-5 h-5 text-text-main/40 flex-shrink-0 transition-transform",
                        isSelected && "rotate-90 text-text-main"
                      )}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Person Detail Panel */}
        <div className="lg:col-span-3">
          {selectedPerson ? (
            <div className="bg-bg-surface border-4 border-text-main shadow-[12px_12px_0px_0px_#1C293C] overflow-hidden sticky top-24">
              {/* Detail Header */}
              <div className="p-6 border-b-4 border-text-main bg-brand-primary flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-bg-surface border-4 border-text-main shadow-[4px_4px_0px_0px_#1C293C] flex items-center justify-center overflow-hidden">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedPerson.name}`}
                      alt={selectedPerson.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase">
                      {selectedPerson.name}
                    </h2>
                    <p className="text-text-main/80 font-bold capitalize">
                      {selectedPerson.role || "Unknown role"} •{" "}
                      {selectedPerson.gender || "—"} •{" "}
                      {selectedPerson.age ? `Age ${selectedPerson.age}` : "Age unknown"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPerson(null)}
                  className="p-2 border-4 border-text-main bg-bg-surface shadow-[2px_2px_0px_0px_#1C293C] hover:bg-crit-critical hover:text-white transition-all"
                >
                  <X className="w-5 h-5 stroke-[3]" />
                </button>
              </div>

              {/* Detail Body */}
              <div className="p-6 space-y-6 max-h-[550px] overflow-y-auto">
                {/* Description */}
                {selectedPerson.description && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-black text-text-main/50 uppercase tracking-widest">
                      Description
                    </h3>
                    <p className="text-text-main font-bold border-l-4 border-brand-primary pl-4">
                      {selectedPerson.description}
                    </p>
                  </div>
                )}

                {/* Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedPerson.phone && (
                    <div className="bg-bg-base border-4 border-text-main p-4">
                      <div className="flex items-center gap-2 text-xs font-black text-text-main/50 uppercase tracking-widest mb-1">
                        <Phone className="w-3 h-3" />
                        Phone
                      </div>
                      <p className="font-black text-lg">{selectedPerson.phone}</p>
                    </div>
                  )}
                  {selectedPerson.email && (
                    <div className="bg-bg-base border-4 border-text-main p-4">
                      <div className="flex items-center gap-2 text-xs font-black text-text-main/50 uppercase tracking-widest mb-1">
                        <Mail className="w-3 h-3" />
                        Email
                      </div>
                      <p className="font-black text-lg truncate">
                        {selectedPerson.email}
                      </p>
                    </div>
                  )}
                  {selectedPerson.address && (
                    <div className="bg-bg-base border-4 border-text-main p-4 col-span-full">
                      <div className="flex items-center gap-2 text-xs font-black text-text-main/50 uppercase tracking-widest mb-1">
                        <MapPin className="w-3 h-3" />
                        Address
                      </div>
                      <p className="font-black">{selectedPerson.address}</p>
                    </div>
                  )}
                </div>

                {/* Injuries & Conditions */}
                {(selectedPerson.injuries?.length || 0) > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-black text-text-main/50 uppercase tracking-widest flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3" />
                      Injuries
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPerson.injuries!.map((injury, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-crit-critical/10 border-2 border-crit-critical text-crit-critical text-xs font-black uppercase"
                        >
                          {injury}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(selectedPerson.conditions?.length || 0) > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-black text-text-main/50 uppercase tracking-widest flex items-center gap-2">
                      <Activity className="w-3 h-3" />
                      Medical Conditions
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPerson.conditions!.map((cond, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-brand-secondary/10 border-2 border-brand-secondary text-brand-secondary text-xs font-black uppercase"
                        >
                          {cond}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedPerson.notes && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-black text-text-main/50 uppercase tracking-widest flex items-center gap-2">
                      <FileText className="w-3 h-3" />
                      Notes
                    </h3>
                    <p className="text-text-main/80 font-bold bg-bg-base border-4 border-text-main p-4">
                      {selectedPerson.notes}
                    </p>
                  </div>
                )}

                {/* Associated Incidents */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-text-main/50 uppercase tracking-widest flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Associated Incidents (
                    {selectedPerson.associatedIncidents?.length || 0})
                  </h3>
                  {loadingIncidents ? (
                    <div className="animate-pulse space-y-2">
                      <div className="h-12 bg-text-main/10 border-2 border-text-main"></div>
                      <div className="h-12 bg-text-main/10 border-2 border-text-main"></div>
                    </div>
                  ) : associatedIncidents.length > 0 ? (
                    associatedIncidents.map((inc) => (
                      <a
                        key={inc.id}
                        href={`/incident/${inc.id}`}
                        className="block bg-bg-base border-4 border-text-main p-4 hover:bg-brand-primary/10 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#1C293C] transition-all"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={cn(
                              "px-2 py-0.5 text-[10px] font-black uppercase tracking-widest border-2 border-text-main",
                              inc.criticalityLevel === "critical"
                                ? "bg-crit-critical text-white"
                                : inc.criticalityLevel === "high"
                                ? "bg-crit-high text-white"
                                : "bg-brand-primary text-text-main"
                            )}
                          >
                            {inc.criticalityLevel}
                          </span>
                          <span className="text-xs text-text-main/50 font-bold">
                            {new Date(inc.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="font-black uppercase">
                          {inc.emergencyType}
                        </p>
                        <p className="text-sm text-text-main/70 font-bold line-clamp-1">
                          {inc.summary}
                        </p>
                      </a>
                    ))
                  ) : (
                    <p className="text-text-main/40 font-bold text-sm">
                      No linked incidents found
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-bg-surface border-4 border-text-main shadow-[12px_12px_0px_0px_#1C293C] p-16 text-center sticky top-24">
              <div className="w-20 h-20 border-4 border-text-main bg-bg-base shadow-[4px_4px_0px_0px_#1C293C] flex items-center justify-center mx-auto mb-6">
                <UserIcon className="w-10 h-10 text-text-main/30" />
              </div>
              <h3 className="text-xl font-black uppercase text-text-main/60 mb-2">
                Select a Person
              </h3>
              <p className="text-text-main/40 font-bold max-w-sm mx-auto">
                Click on a person from the list to view their detailed profile,
                contact info, and associated incidents.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
