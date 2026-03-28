import React, { useState, useEffect, useRef } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, limit, getDocs, where } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { GlassCard } from "../components/ui/GlassCard";
import {
  Send,
  Bot,
  User as UserIcon,
  Loader2,
  Sparkles,
  Search,
  MessageSquare,
  AlertCircle,
  Users,
  ChevronRight,
  Shield,
  Clock,
} from "lucide-react";
import { cn } from "../lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  senderName?: string;
  senderUid?: string;
  timestamp: any;
  mentionedPersons?: string[]; // names extracted from the message
}

interface QuickLookupResult {
  type: "person" | "incident" | "user";
  name: string;
  details: string;
  id: string;
}

export default function StaffChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lookupResults, setLookupResults] = useState<QuickLookupResult[]>([]);
  const [searchingLookup, setSearchingLookup] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chat history
  useEffect(() => {
    const q = query(
      collection(db, "staffChat"),
      orderBy("timestamp", "asc"),
      limit(100)
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() } as ChatMessage)
        );
        setMessages(msgs);
      },
      (error) => {
        console.error("Failed to load chat:", error);
      }
    );
    return () => unsubscribe();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Quick lookup when typing @ mentions
  useEffect(() => {
    const lastWord = input.split(/\s+/).pop() || "";
    if (lastWord.startsWith("@") && lastWord.length > 1) {
      const searchName = lastWord.slice(1).toLowerCase();
      performLookup(searchName);
    } else {
      setLookupResults([]);
    }
  }, [input]);

  const performLookup = async (searchTerm: string) => {
    setSearchingLookup(true);
    try {
      // Search persons collection
      const personsSnap = await getDocs(collection(db, "persons"));
      const personResults: QuickLookupResult[] = [];
      personsSnap.docs.forEach((d) => {
        const data = d.data();
        if (data.name?.toLowerCase().includes(searchTerm)) {
          personResults.push({
            type: "person",
            name: data.name,
            details: `${data.role || "Unknown role"} • ${data.associatedIncidents?.length || 0} incidents`,
            id: d.id,
          });
        }
      });

      // Search users collection
      const usersSnap = await getDocs(collection(db, "users"));
      const userResults: QuickLookupResult[] = [];
      usersSnap.docs.forEach((d) => {
        const data = d.data();
        if (
          data.displayName?.toLowerCase().includes(searchTerm) ||
          data.email?.toLowerCase().includes(searchTerm)
        ) {
          userResults.push({
            type: "user",
            name: data.displayName || data.email,
            details: `${data.role} • ${data.email}`,
            id: d.id,
          });
        }
      });

      setLookupResults([...personResults, ...userResults].slice(0, 8));
    } catch (err) {
      console.error("Lookup failed:", err);
    }
    setSearchingLookup(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    if (!auth.currentUser) {
      alert("You must be signed in to use staff chat.");
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setLookupResults([]);

    // Save user message to Firestore
    await addDoc(collection(db, "staffChat"), {
      role: "user",
      content: userMessage,
      senderName: auth.currentUser.displayName || auth.currentUser.email,
      senderUid: auth.currentUser.uid,
      timestamp: serverTimestamp(),
    });

    // Get AI response
    setIsLoading(true);
    try {
      // Gather context from Firestore for the AI
      let context = "";

      // Check if asking about a person
      const personsSnap = await getDocs(collection(db, "persons"));
      const allPersons = personsSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      // Check if asking about users
      const usersSnap = await getDocs(collection(db, "users"));
      const allUsers = usersSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      // Check recent incidents
      const incidentsSnap = await getDocs(
        query(collection(db, "incidents"), orderBy("createdAt", "desc"), limit(10))
      );
      const recentIncidents = incidentsSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      context = `
CONTEXT (from database):
Persons in database: ${JSON.stringify(allPersons.map((p: any) => ({ name: p.name, role: p.role, age: p.age, gender: p.gender, injuries: p.injuries, description: p.description, associatedIncidents: p.associatedIncidents?.length || 0 })))}

Registered users: ${JSON.stringify(allUsers.map((u: any) => ({ displayName: u.displayName, email: u.email, role: u.role })))}

Recent incidents (last 10): ${JSON.stringify(recentIncidents.map((i: any) => ({ id: i.id, type: i.emergencyType, summary: i.summary, criticalityLevel: i.criticalityLevel, status: i.status, location: i.locationAddress })))}
`;

      const response = await fetch("/api/staff-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, context }),
      });

      if (!response.ok) throw new Error("AI response failed");
      const data = await response.json();

      // Save AI response to Firestore
      await addDoc(collection(db, "staffChat"), {
        role: "assistant",
        content: data.response,
        timestamp: serverTimestamp(),
        mentionedPersons: data.mentionedPersons || [],
      });
    } catch (error) {
      console.error("Chat error:", error);
      await addDoc(collection(db, "staffChat"), {
        role: "assistant",
        content:
          "⚠️ Sorry, I couldn't process that request. Please check that the server is running and try again.",
        timestamp: serverTimestamp(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    { label: "Show all victims", prompt: "List all victims with their injuries and associated incidents" },
    { label: "Critical incidents", prompt: "What are the current critical incidents and who is involved?" },
    { label: "Recent activity", prompt: "Summarize the most recent incident reports and the people involved" },
    { label: "Find person", prompt: "Search for a person named " },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b-4 border-text-main pb-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-brand-primary fill-brand-primary" />
            Staff Intelligence Chat
          </h1>
          <p className="text-text-main/80 font-bold mt-2">
            Chat with Gemini AI to look up person info, incidents, and get intelligence reports
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-brand-secondary border-4 border-text-main shadow-[4px_4px_0px_0px_#1C293C] text-white text-xs font-black uppercase tracking-wider">
          <Bot className="w-4 h-4" />
          AI Powered
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-3">
          <div className="bg-bg-surface border-4 border-text-main shadow-[12px_12px_0px_0px_#1C293C] flex flex-col" style={{ height: "650px" }}>
            {/* Chat Header */}
            <div className="p-4 border-b-4 border-text-main bg-brand-primary flex items-center gap-3">
              <div className="w-10 h-10 bg-bg-surface border-4 border-text-main shadow-[2px_2px_0px_0px_#1C293C] flex items-center justify-center">
                <Bot className="w-5 h-5 text-brand-secondary stroke-[3]" />
              </div>
              <div>
                <h2 className="font-black uppercase text-sm">Gemini Bridge Assistant</h2>
                <p className="text-xs font-bold text-text-main/70">
                  Use @name for quick person lookup • Ask about users, incidents & intelligence
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-20 h-20 bg-brand-primary/20 border-4 border-text-main shadow-[4px_4px_0px_0px_#1C293C] flex items-center justify-center">
                    <MessageSquare className="w-10 h-10 text-text-main/40" />
                  </div>
                  <div>
                    <p className="text-text-main/60 font-black uppercase text-lg mb-2">
                      Start a conversation
                    </p>
                    <p className="text-text-main/40 font-bold text-sm max-w-md">
                      Ask about any person, user, or incident. The AI has access to the full database and will provide detailed intelligence reports.
                    </p>
                  </div>
                  {/* Quick Prompts */}
                  <div className="flex flex-wrap gap-2 max-w-lg justify-center">
                    {quickPrompts.map((qp) => (
                      <button
                        key={qp.label}
                        onClick={() => {
                          setInput(qp.prompt);
                          inputRef.current?.focus();
                        }}
                        className="px-3 py-2 bg-bg-base border-2 border-text-main text-xs font-bold hover:bg-brand-primary/20 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#1C293C] transition-all"
                      >
                        {qp.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="w-10 h-10 bg-brand-secondary border-4 border-text-main shadow-[2px_2px_0px_0px_#1C293C] flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-white stroke-[3]" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[75%] border-4 border-text-main p-4",
                      msg.role === "user"
                        ? "bg-brand-primary shadow-[4px_4px_0px_0px_#1C293C]"
                        : "bg-bg-base shadow-[4px_4px_0px_0px_#1C293C]"
                    )}
                  >
                    {msg.role === "user" && msg.senderName && (
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-main/50 mb-1">
                        {msg.senderName}
                      </p>
                    )}
                    <p className="text-sm font-bold text-text-main whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </p>
                    {msg.timestamp && (
                      <p className="text-[10px] font-bold text-text-main/30 mt-2">
                        {msg.timestamp?.toDate
                          ? msg.timestamp.toDate().toLocaleTimeString()
                          : ""}
                      </p>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-10 h-10 bg-bg-surface border-4 border-text-main shadow-[2px_2px_0px_0px_#1C293C] flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderUid || "user"}`}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-10 h-10 bg-brand-secondary border-4 border-text-main shadow-[2px_2px_0px_0px_#1C293C] flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white stroke-[3]" />
                  </div>
                  <div className="bg-bg-base border-4 border-text-main shadow-[4px_4px_0px_0px_#1C293C] p-4 flex items-center gap-3">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-secondary" />
                    <span className="text-sm font-bold text-text-main/60">
                      Analyzing data...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Lookup Results Dropdown */}
            {lookupResults.length > 0 && (
              <div className="border-t-4 border-text-main bg-bg-base p-2 max-h-48 overflow-y-auto">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-main/50 px-2 mb-1">
                  Quick Lookup Results
                </p>
                {lookupResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => {
                      // Replace the @mention with the full name
                      const words = input.split(/\s+/);
                      words[words.length - 1] = `@${result.name}`;
                      setInput(words.join(" ") + " ");
                      setLookupResults([]);
                      inputRef.current?.focus();
                    }}
                    className="w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-brand-primary/20 transition-colors"
                  >
                    <div
                      className={cn(
                        "w-6 h-6 border-2 border-text-main flex items-center justify-center text-white",
                        result.type === "person"
                          ? "bg-brand-secondary"
                          : "bg-crit-low"
                      )}
                    >
                      {result.type === "person" ? (
                        <UserIcon className="w-3 h-3" />
                      ) : (
                        <Shield className="w-3 h-3" />
                      )}
                    </div>
                    <div>
                      <p className="font-black text-sm">{result.name}</p>
                      <p className="text-[10px] text-text-main/50 font-bold">
                        {result.details}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-text-main/30 ml-auto" />
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t-4 border-text-main bg-bg-base flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about any person, incident, or type @name to lookup..."
                className="flex-1 input-field text-sm"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="btn-primary px-6 flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5 stroke-[3]" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar: Online Staff & Recent Lookups */}
        <div className="space-y-6">
          {/* Active Staff */}
          <div className="bg-bg-surface border-4 border-text-main shadow-[8px_8px_0px_0px_#1C293C]">
            <div className="p-4 border-b-4 border-text-main bg-crit-low">
              <h3 className="text-sm font-black uppercase text-white flex items-center gap-2">
                <Users className="w-4 h-4" />
                Chat Info
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-crit-low border border-text-main animate-pulse"></div>
                <span className="text-sm font-bold">All staff messages visible</span>
              </div>
              <div className="flex items-center gap-3">
                <Bot className="w-4 h-4 text-brand-secondary" />
                <span className="text-sm font-bold">AI has database access</span>
              </div>
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 text-text-main/60" />
                <span className="text-sm font-bold">Type @name for lookup</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-bg-surface border-4 border-text-main shadow-[8px_8px_0px_0px_#1C293C]">
            <div className="p-4 border-b-4 border-text-main bg-brand-secondary">
              <h3 className="text-sm font-black uppercase text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Quick Commands
              </h3>
            </div>
            <div className="p-3 space-y-2">
              {[
                { label: "List all persons", cmd: "List all registered persons and their roles" },
                { label: "Victim summary", cmd: "Give me a summary of all victims and their injuries" },
                { label: "Active incidents", cmd: "What are all currently active incidents?" },
                { label: "Today's report", cmd: "Generate a daily intelligence report for today" },
                { label: "User audit", cmd: "List all registered staff users and their roles" },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setInput(item.cmd);
                    inputRef.current?.focus();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold border-2 border-text-main/20 hover:border-text-main hover:bg-brand-primary/10 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#1C293C] transition-all flex items-center gap-2"
                >
                  <ChevronRight className="w-3 h-3 text-text-main/40" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Usage Tips */}
          <div className="bg-brand-primary border-4 border-text-main shadow-[8px_8px_0px_0px_#1C293C] p-4">
            <h3 className="text-sm font-black uppercase mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Tips
            </h3>
            <ul className="space-y-2 text-xs font-bold text-text-main/80">
              <li className="flex items-start gap-2">
                <span className="text-text-main">•</span>
                Ask "Who is [name]?" for person lookup
              </li>
              <li className="flex items-start gap-2">
                <span className="text-text-main">•</span>
                Use @name for quick autocomplete
              </li>
              <li className="flex items-start gap-2">
                <span className="text-text-main">•</span>
                All messages are visible to staff
              </li>
              <li className="flex items-start gap-2">
                <span className="text-text-main">•</span>
                AI checks persons, users & incidents DB
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
