"use client";

import { useState, useEffect, useRef } from "react";
import { useStapler } from "@/hooks/useStapler";
import { Sandpack } from "@codesandbox/sandpack-react";
import { ArrowRight, Loader2, Download, Terminal, Zap, LayoutTemplate, Video, MessageSquare, Sparkles, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown';

// --- CRIMSON & SUGAR WHITE THEME ---

const AmbientBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#fbfaf9]">
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-multiply"></div>
    <motion.div
      animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-rose-600/20 blur-[140px]"
    />
  </div>
);

function CrimsonCard({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`relative group rounded-3xl border border-rose-100/50 bg-white/80 backdrop-blur-2xl shadow-[0_8px_40px_rgba(225,29,72,0.04)] overflow-hidden transition-all hover:shadow-[0_8px_50px_rgba(225,29,72,0.08)] ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { inputIdea, setInputIdea, isAnalyzing, result, error, grillMessage, submitIdeaOrReply, forceGenerate } = useStapler();
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [userReply, setUserReply] = useState("");

  useEffect(() => {
    if (!isAnalyzing) {
      setTerminalLogs([]);
      return;
    }
    const logs = [
      "INIT // Connecting to Neural Matrix...",
      "EXEC // Scraping real-time market data...",
      "COMPUTE // Identifying friction points...",
      "SYNTH // Generating pivot vectors...",
      "WRITE // Drafting behavioral ad copy...",
      "DESIGN // Compiling visual tokens...",
      "BUILD // Writing raw React payload...",
      "REVIEW // Running adversarial critique...",
      "FINALIZE // Compiling application state..."
    ];
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < logs.length) {
        setTerminalLogs(prev => [...prev, logs[currentIndex]]);
        currentIndex++;
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleExport = () => {
    if (!result) return;
    const content = `STAPLER GROWTH ENGINE - EXPORT\n\nTARGET AUDIENCE:\n${result.marketing_engine?.target_audience || ''}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stapler_campaign.txt";
    a.click();
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputIdea) {
      await submitIdeaOrReply(inputIdea, false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userReply) {
      await submitIdeaOrReply(userReply, true);
      setUserReply("");
    }
  };

  return (
    <div className="min-h-screen text-slate-900 font-sans selection:bg-rose-500/20 overflow-x-hidden relative">
      <AmbientBackground />
      
      <div className="max-w-[1400px] mx-auto py-24 px-6 md:px-12 relative z-10 flex flex-col items-center">
        
        {/* Header */}
        <header className="mb-16 flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-rose-200 bg-rose-50 text-rose-700 text-xs font-bold tracking-widest uppercase mb-8 shadow-sm"
          >
            <Activity className="w-4 h-4 animate-pulse" />
            <span>Stapler Core V2.0</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-tight text-slate-900"
          >
            Idea to App in <br />
            <span className="text-rose-600">Sixty Seconds.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 max-w-[700px] leading-relaxed font-medium"
          >
            Type a concept. Our autonomous swarm engineers the strategy, designs the brand, writes the copy, and builds the codebase in real-time.
          </motion.p>
        </header>

        {/* Input */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full max-w-[800px] mb-20"
        >
          <form onSubmit={handleAnalyze} className="relative group z-20">
            <div className="relative flex flex-col sm:flex-row items-center bg-white border border-slate-200 rounded-[30px] p-2 shadow-xl shadow-rose-900/5 focus-within:border-rose-300 focus-within:ring-4 focus-within:ring-rose-100 transition-all">
              <input
                type="text"
                value={inputIdea}
                onChange={(e) => setInputIdea(e.target.value)}
                placeholder="Paste a URL or describe a wild idea..."
                className="w-full bg-transparent text-slate-900 px-8 py-5 outline-none placeholder:text-slate-400 text-xl font-medium"
                disabled={isAnalyzing}
              />
              <button
                type="submit"
                disabled={isAnalyzing || !inputIdea}
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-rose-600 text-white px-10 py-5 rounded-[22px] font-bold tracking-wide hover:bg-rose-700 transition-all duration-300 disabled:opacity-50 sm:ml-2 shadow-md shadow-rose-600/20"
              >
                {isAnalyzing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                {isAnalyzing ? "Processing..." : "Ignite"}
              </button>
            </div>
          </form>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-rose-600 text-sm font-bold text-center bg-rose-50 py-3 rounded-2xl border border-rose-100">
              {error}
            </motion.div>
          )}

          {/* Interactive Grill */}
          <AnimatePresence>
            {grillMessage && !isAnalyzing && (
              <motion.div initial={{ opacity: 0, height: 0, scale: 0.95 }} animate={{ opacity: 1, height: 'auto', scale: 1 }} exit={{ opacity: 0, height: 0 }} className="mt-8 overflow-hidden">
                <div className="bg-white border border-slate-200 p-8 rounded-[32px] shadow-lg shadow-slate-200/50">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                      <MessageSquare className="w-5 h-5 text-slate-700" />
                    </div>
                    <span className="text-slate-700 font-bold text-sm tracking-widest uppercase">System Query</span>
                  </div>

                  <div className="text-slate-800 text-lg leading-relaxed font-medium mb-8 markdown-body prose prose-slate max-w-none">
                    <ReactMarkdown>{grillMessage}</ReactMarkdown>
                  </div>

                  <form onSubmit={handleReply} className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="text"
                      value={userReply}
                      onChange={(e) => setUserReply(e.target.value)}
                      placeholder="Clarify your vision..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-lg outline-none focus:border-rose-400 focus:bg-white transition-all text-slate-900 shadow-inner"
                      disabled={isAnalyzing}
                    />
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        type="submit"
                        disabled={isAnalyzing || !userReply}
                        className="flex-1 sm:flex-none bg-slate-900 text-white hover:bg-slate-800 px-8 py-5 rounded-2xl font-bold disabled:opacity-50 transition-all"
                      >
                        Respond
                      </button>
                      <button
                        type="button"
                        onClick={forceGenerate}
                        disabled={isAnalyzing}
                        className="flex-1 sm:flex-none bg-rose-600 text-white hover:bg-rose-700 px-8 py-5 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-rose-600/20 transition-all"
                      >
                        <Zap className="w-5 h-5" /> Generate Website
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Terminal */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-[800px] mb-20 z-20">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
                  <div className="flex items-center text-xs font-bold text-slate-400 tracking-widest uppercase">
                    <Terminal className="w-4 h-4 mr-3" /> System Diagnostics
                  </div>
                  <div className="flex gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></div>
                  </div>
                </div>
                <div className="p-8 h-[300px] overflow-y-auto font-mono text-[15px] space-y-4 relative z-20">
                  {terminalLogs.map((log, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-4">
                      <span className="text-rose-500/50 select-none">$&gt;</span>
                      <span className="text-slate-300 font-medium tracking-wide">{log}</span>
                    </motion.div>
                  ))}
                  <div className="flex items-center gap-2 mt-2 ml-8">
                    <span className="w-3 h-5 bg-rose-400 animate-pulse"></span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }} className="w-full max-w-[1400px] space-y-8 z-20">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-4 mb-10">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                  Deployment Ready.
                </h2>
              </div>
              <button onClick={handleExport} className="flex items-center gap-3 text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 hover:scale-105 px-8 py-4 rounded-full transition-all duration-300 border border-rose-100">
                <Download className="w-4 h-4" /> Export Assets
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              <CrimsonCard delay={0.4} className="p-10 flex flex-col lg:col-span-1">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100">
                    <Zap className="w-6 h-6 text-rose-600" />
                  </div>
                  <h3 className="font-black text-slate-900 text-2xl tracking-tight">Strategy</h3>
                </div>
                <div className="space-y-10">
                  <div>
                    <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">Roast & Weaknesses</h4>
                    <ul className="space-y-4">
                      {result.audit?.roast_points?.map((point, i) => (
                        <li key={i} className="flex items-start gap-4 text-[15px] text-slate-600 leading-relaxed font-medium">
                          <span className="text-rose-500 mt-1 shrink-0">✦</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-6 border-t border-slate-100">
                    <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">The Pivot</h4>
                    <p className="text-[16px] font-medium text-rose-900 leading-relaxed bg-rose-50 p-6 rounded-2xl border border-rose-100">
                      {result.marketing_engine?.pivot_strategy}
                    </p>
                  </div>
                </div>
              </CrimsonCard>

              <CrimsonCard delay={0.6} className="p-10 flex flex-col lg:col-span-1">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-slate-100 rounded-2xl border border-slate-200">
                    <LayoutTemplate className="w-6 h-6 text-slate-600" />
                  </div>
                  <h3 className="font-black text-slate-900 text-2xl tracking-tight">Identity</h3>
                </div>
                <div className="space-y-10">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Typography</h4>
                      <div className="text-lg font-bold text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-100">{result.visual_identity?.typography_pairing}</div>
                    </div>
                    <div>
                      <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Aesthetic</h4>
                      <div className="text-lg font-bold text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-100">{result.visual_identity?.moodboard_vibe}</div>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-slate-100">
                    <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Color Tokens</h4>
                    <div className="flex flex-wrap gap-5">
                      {Object.entries(result.visual_identity?.color_palette || {}).map(([key, hex], i) => (
                        <div key={i} className="flex flex-col items-center gap-3">
                          <div className="w-14 h-14 rounded-2xl shadow-sm border border-slate-200" style={{ backgroundColor: hex }} />
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{key}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CrimsonCard>
              
              <CrimsonCard delay={0.8} className="p-10 flex flex-col lg:col-span-1">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-slate-100 rounded-2xl border border-slate-200">
                    <Video className="w-6 h-6 text-slate-600" />
                  </div>
                  <h3 className="font-black text-slate-900 text-2xl tracking-tight">Social Ads</h3>
                </div>
                <div className="space-y-10">
                  <div>
                    <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">Viral Hooks</h4>
                    <ul className="space-y-4">
                      {result.ad_creative?.hooks?.map((hook, i) => (
                        <li key={i} className="flex items-start gap-4 text-[15px] text-slate-700 font-medium leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100">
                          <span className="text-rose-500 shrink-0 text-xl leading-none mt-1">»</span>
                          <span>{hook}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-6 border-t border-slate-100">
                    <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">Media Queries</h4>
                    <div className="grid grid-cols-1 gap-4">
                      {result.ad_creative?.video_references?.map((ref, i) => (
                        <div key={i} className="p-5 border border-slate-100 rounded-2xl bg-white">
                          <div className="text-[15px] font-bold text-slate-900 mb-1">{ref.platform}</div>
                          <div className="text-sm text-slate-500 font-medium">Search: <span className="text-rose-600">"{ref.search_query}"</span></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CrimsonCard>

              <CrimsonCard delay={1.0} className="flex flex-col h-[900px] md:col-span-2 lg:col-span-3 !p-0">
                <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100">
                      <Terminal className="w-5 h-5 text-rose-600" />
                    </div>
                    <h3 className="font-black text-slate-900 text-xl tracking-tight">Live Engineering Environment</h3>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-slate-200"></div>
                    <div className="w-3.5 h-3.5 rounded-full bg-slate-200"></div>
                    <div className="w-3.5 h-3.5 rounded-full bg-slate-200"></div>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden relative">
                  <Sandpack
                    template="react-ts"
                    theme="light"
                    files={{
                      "/public/index.html": `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <script src="https://cdn.tailwindcss.com"></script>\n</head>\n<body>\n  <div id="root"></div>\n</body>\n</html>`,
                      "/App.tsx": `import "./styles.css";\n\n${result.live_code_preview?.react_component_string || 'export default function App() { return <div>Building...</div> }'}`,
                      "/styles.css": `body {\n  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;\n  background-color: ${result.visual_identity?.color_palette?.Background || '#ffffff'};\n  color: ${result.visual_identity?.color_palette?.Text || '#000000'};\n}`,
                    }}
                    customSetup={{
                      dependencies: { "lucide-react": "latest", "framer-motion": "latest" }
                    }}
                    options={{
                      showNavigator: false,
                      showTabs: true,
                      editorHeight: "100%",
                    }}
                  />
                </div>
              </CrimsonCard>

            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
