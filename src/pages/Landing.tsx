import { motion } from "motion/react";
import { Send, Shield, Zap, Activity, Search, Globe, ArrowRight } from "lucide-react";
import { signInWithGoogle } from "../lib/auth";
import { GlassCard } from "../components/ui/GlassCard";

export default function Landing() {
  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const features = [
    { icon: Zap, title: "Chaos to Clarity", desc: "Convert noisy voice and blurry images into structured data in under 3 seconds." },
    { icon: Shield, title: "Emergency Grade", desc: "Built for first responders with high availability and real-time syncing." },
    { icon: Activity, title: "Smart Criticality", desc: "AI-powered scoring engine prioritizes life-safety incidents automatically." },
    { icon: Search, title: "Deep Verification", desc: "Cross-references reports with weather, news, and historical data." },
    { icon: Globe, title: "Universal Intake", desc: "Accepts voice, images, PDFs, and text from any device in the field." },
    { icon: Send, title: "One-Click Dispatch", desc: "AI-drafted alerts for EMS, Fire, and Police with human-in-the-loop approval." },
  ];

  return (
    <div className="min-h-screen bg-bg-void overflow-hidden selection:bg-brand-primary/30">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-brand-primary/10 blur-[120px] -z-10 rounded-full"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-sm font-semibold mb-8"
        >
          <Zap className="w-4 h-4" />
          <span>Powered by Gemini 1.5 Pro</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-6xl md:text-8xl font-display font-bold text-white leading-[1.1] mb-8"
        >
          Chaos to Clarity, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-purple-500">
            In Under 3 Seconds
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-slate-400 max-w-2xl mb-12"
        >
          Gemini Bridge is the emergency intelligence platform that converts chaotic multimodal inputs into structured, actionable data for first responders.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button 
            onClick={handleLogin}
            className="btn-primary text-lg px-10 py-4 flex items-center gap-2"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </button>
          <button className="btn-outline text-lg px-10 py-4">
            Watch Demo
          </button>
        </motion.div>

        {/* Demo Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-24 w-full max-w-5xl"
        >
          <GlassCard className="p-2 border-white/10 overflow-hidden">
            <div className="aspect-video bg-bg-void rounded-xl relative group">
              <img 
                src="https://picsum.photos/seed/emergency/1920/1080" 
                alt="Dashboard Preview" 
                className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-brand-primary rounded-full flex items-center justify-center shadow-2xl shadow-brand-primary/50 cursor-pointer hover:scale-110 transition-transform">
                  <Zap className="w-10 h-10 text-white fill-white" />
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <GlassCard hover className="h-full">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-brand-primary" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-8">
        <div className="max-w-5xl mx-auto">
          <GlassCard className="bg-gradient-to-br from-brand-primary/20 to-purple-500/20 border-brand-primary/30 p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to save lives faster?</h2>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              Join the network of first responders and emergency coordinators using Gemini Bridge to transform emergency response.
            </p>
            <button 
              onClick={handleLogin}
              className="btn-primary text-xl px-12 py-5"
            >
              Start Your Free Trial
            </button>
          </GlassCard>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 text-center text-slate-500 text-sm">
        <p>© 2026 Gemini Bridge. All rights reserved.</p>
      </footer>
    </div>
  );
}
