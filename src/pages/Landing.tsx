import { motion } from "motion/react";
import { Send, Shield, Zap, Activity, Search, Globe, ArrowRight } from "lucide-react";
import { signInWithGoogle } from "../lib/auth";

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
    <div className="min-h-screen bg-bg-base overflow-hidden selection:bg-brand-primary selection:text-text-main text-text-main font-body">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-6 py-2 bg-brand-primary border-4 border-text-main shadow-[4px_4px_0px_0px_#1C293C] text-text-main text-sm font-black uppercase tracking-wider mb-12"
        >
          <Zap className="w-5 h-5 fill-text-main" />
          <span>Powered by Gemini 1.5 Pro</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-6xl md:text-8xl font-display font-black text-text-main leading-[1.1] mb-8 uppercase tracking-tight"
        >
          Chaos to Clarity, <br />
          <span className="bg-brand-secondary text-white px-2 shadow-[8px_8px_0px_0px_#1C293C] inline-block -rotate-1 mt-4">
            In Under 3 Seconds
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-text-main font-bold max-w-2xl mb-12 border-l-8 border-brand-primary pl-6 text-left"
        >
          Gemini Bridge is the emergency intelligence platform that converts chaotic multimodal inputs into structured, actionable data for first responders.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-6"
        >
          <button 
            onClick={handleLogin}
            className="btn-primary text-xl px-12 py-5 flex items-center gap-3 uppercase tracking-wider"
          >
            Get Started Free
            <ArrowRight className="w-6 h-6 stroke-[3]" />
          </button>
          <button className="btn-outline text-xl px-12 py-5 uppercase tracking-wider">
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
          <div className="bg-bg-surface border-4 border-text-main shadow-[12px_12px_0px_0px_#1C293C] overflow-hidden p-2 group transition-transform hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[20px_20px_0px_0px_#1C293C] duration-300">
            <div className="aspect-video bg-bg-elevated relative border-4 border-text-main overflow-hidden">
              <img 
                src="https://picsum.photos/seed/emergency/1920/1080" 
                alt="Dashboard Preview" 
                className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-brand-primary border-4 border-text-main shadow-[8px_8px_0px_0px_#1C293C] flex items-center justify-center cursor-pointer hover:bg-brand-secondary group-hover:scale-110 transition-all active:scale-95">
                  <Zap className="w-12 h-12 text-text-main fill-text-main group-hover:text-white group-hover:fill-white transition-colors" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-8 max-w-7xl mx-auto border-t-8 border-text-main">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="bg-bg-surface border-4 border-text-main shadow-[8px_8px_0px_0px_#1C293C] p-8 h-full transition-transform hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[16px_16px_0px_0px_#1C293C]">
                <div className="w-16 h-16 bg-brand-primary border-4 border-text-main shadow-[4px_4px_0px_0px_#1C293C] flex items-center justify-center mb-6">
                  <feature.icon className="w-8 h-8 text-text-main stroke-[3]" />
                </div>
                <h3 className="text-2xl font-black text-text-main mb-4 uppercase">{feature.title}</h3>
                <p className="text-text-main/80 font-bold leading-relaxed">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-8 border-t-8 border-text-main bg-brand-secondary">
        <div className="max-w-5xl mx-auto">
          <div className="bg-bg-surface border-4 border-text-main shadow-[16px_16px_0px_0px_#1C293C] p-16 text-center transform -rotate-1 hover:rotate-0 transition-transform duration-300">
            <h2 className="text-5xl md:text-6xl font-black text-text-main mb-8 uppercase tracking-tight">Ready to save lives faster?</h2>
            <p className="text-2xl font-bold text-text-main border-l-8 border-brand-primary pl-6 text-left mb-12 max-w-2xl mx-auto">
              Join the network of first responders and emergency coordinators using Gemini Bridge to transform emergency response.
            </p>
            <button 
              onClick={handleLogin}
              className="btn-primary text-2xl px-16 py-6 uppercase tracking-wider"
            >
              Start Your Free Trial
            </button>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t-8 border-text-main bg-bg-surface text-center font-bold text-text-main text-sm uppercase tracking-wider">
        <p>© 2026 Gemini Bridge. All rights reserved.</p>
      </footer>
    </div>
  );
}
