"use client";

import { useState, useEffect } from "react";
import { useStapler } from "@/hooks/useStapler";
import { Sandpack } from "@codesandbox/sandpack-react";
import { Sparkles, ArrowRight, Loader2, Target, Megaphone, Palette, FileCode2, Paintbrush, Download } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function DashboardPage() {
  const { inputIdea, setInputIdea, isAnalyzing, result, error, startAnalysis } = useStapler();
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!isAnalyzing) {
      setTerminalLogs([]);
      return;
    }
    const logs = [
      "> Auditor: Initiating stealth web scrape...",
      "> Auditor: Analyzing competitor sentiment on Reddit...",
      "> Auditor: Roast complete. Passing to Strategist.",
      "> Strategist: Calculating projected conversion impact...",
      "> Strategist: Defining B2B pivot matrix...",
      "> Brand Architect: Synthesizing typography & aesthetic...",
      "> Brand Architect: Generating hexadecimal color tokens...",
      "> Media Buyer: Scraping viral TikTok hooks...",
      "> Media Buyer: Synthesizing Voiceover TTS audio...",
      "> UI Engineer: Injecting design system tokens...",
      "> UI Engineer: Writing Tailwind React component...",
      "> Critic: Verifying syntax and conversion rate...",
      "> System: Finalizing Stapler package..."
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
    const content = `STAPLER GROWTH ENGINE - EXPORT\n\n` +
      `TARGET AUDIENCE:\n${result.marketing_engine.target_audience}\n\n` +
      `PIVOT STRATEGY:\n${result.marketing_engine.pivot_strategy}\n\n` +
      `ROAST POINTS:\n${result.audit.roast_points.join('\n')}\n\n` +
      `AD HOOKS:\n${result.ad_creative.hooks.join('\n')}\n\n` +
      `VISUAL IDENTITY:\nTypography: ${result.visual_identity.typography_pairing}\nVibe: ${result.visual_identity.moodboard_vibe}\n\n` +
      `REACT CODE:\n${result.live_code_preview.react_component_string}\n`;
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
      await startAnalysis(inputIdea);
    }
  };

  const primaryColor = result?.visual_identity?.color_palette?.Primary || '#0f172a';

  return (
    <div className="min-h-screen text-slate-50 p-6 md:p-12 font-sans selection:bg-rose-500/30 overflow-hidden relative transition-colors duration-1000" style={{ backgroundColor: primaryColor === '#0f172a' ? '#020617' : primaryColor + '10' }}>
      {/* Dynamic Aurora */}
      {result && (
        <>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 blur-[120px] pointer-events-none transition-colors duration-1000" style={{ backgroundColor: primaryColor }} />
          <div className="absolute bottom-0 right-0 w-[800px] h-[600px] opacity-10 blur-[100px] pointer-events-none transition-colors duration-1000" style={{ backgroundColor: result.visual_identity.color_palette.Secondary || '#3b82f6' }} />
        </>
      )}
      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        {/* Header */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold tracking-widest uppercase">
            <Sparkles className="w-3 h-3" /> God Mode MVP
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent">
            Stapler Growth Engine
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Enter your business idea or website URL. We will roast it, build a marketing funnel, generate ad hooks, and instantly code a UI/UX fix.
          </p>
        </div>

        {/* Input */}
        <form onSubmit={handleAnalyze} className="relative max-w-3xl mx-auto">
          <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 to-orange-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-2xl">
            <input
              type="text"
              value={inputIdea}
              onChange={(e) => setInputIdea(e.target.value)}
              placeholder="e.g. A soy candle ecommerce store targeting millennials..."
              className="w-full bg-transparent text-slate-200 px-6 py-4 outline-none placeholder:text-slate-600 text-lg"
              disabled={isAnalyzing}
            />
            <button
              type="submit"
              disabled={isAnalyzing || !inputIdea}
              className="flex items-center gap-2 bg-white text-black px-6 py-4 rounded-xl font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              {isAnalyzing ? "Analyzing..." : "Staple It"}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center font-medium max-w-3xl mx-auto">
            {error}
          </div>
        )}

        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-10 w-full max-w-4xl mx-auto">
            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 mb-12">
              {['Auditor', 'Strategist', 'Brand Architect', 'Media Buyer', 'UI Engineer'].map((agent, i) => (
                <motion.div
                  key={agent}
                  className="flex flex-col items-center gap-3"
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: 1, y: [0, -15, 0], scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2, delay: i * 0.4 }}
                >
                  <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold shadow-[0_0_30px_rgba(244,63,94,0.2)] backdrop-blur-md">
                    {i + 1}
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{agent}</span>
                </motion.div>
              ))}
            </div>
            
            {/* Terminal Window */}
            <div className="w-full max-w-2xl bg-black/80 rounded-xl border border-slate-800 p-4 font-mono text-sm h-56 overflow-hidden relative shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-10 bg-slate-900/80 border-b border-slate-800 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                <span className="ml-4 text-xs text-slate-500 font-sans tracking-widest uppercase">stapler-agent-network.exe</span>
              </div>
              <div className="mt-10 flex flex-col justify-end h-[calc(100%-2.5rem)] text-emerald-400 space-y-2">
                {terminalLogs.slice(-6).map((log, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                    {log}
                  </motion.div>
                ))}
                <div className="flex items-center gap-2 mt-2 opacity-50">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="animate-pulse">Processing...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button onClick={handleExport} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg">
                <Download className="w-4 h-4" /> Export Campaign
              </button>
            </div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
            {/* Left Column: Data */}
            <div className="space-y-8">
              {/* Audit */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800">
                  <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400"><Target className="w-6 h-6" /></div>
                  <h2 className="text-2xl font-bold">The Roast & Audit</h2>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Conversion Killers</h3>
                    <ul className="space-y-3">
                      {result.audit.roast_points.map((point, i) => (
                        <li key={i} className="flex gap-3 text-slate-300">
                          <span className="text-rose-500 mt-0.5">•</span>
                          <span className="leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">UI/UX Fixes</h3>
                    <p className="text-emerald-400 font-medium leading-relaxed bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                      {result.audit.ui_ux_fixes}
                    </p>
                  </div>
                </div>
              </div>

              {/* Marketing Engine */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800">
                  <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400"><Megaphone className="w-6 h-6" /></div>
                  <h2 className="text-2xl font-bold">The Pivot & Marketing</h2>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Pivot Strategy</h3>
                    <p className="text-blue-400 font-medium leading-relaxed bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                      {result.marketing_engine.pivot_strategy}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Projected Impact</h3>
                    <div className="h-64 bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={result.marketing_engine.metrics_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="metric_name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip 
                            cursor={{ fill: '#1e293b' }}
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                          />
                          <Bar dataKey="before_pivot" name="Before Stapler" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="after_pivot" name="After Stapler" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Target Audience</h3>
                    <p className="text-slate-300 leading-relaxed p-4 bg-slate-950 rounded-xl border border-slate-800">
                      {result.marketing_engine.target_audience}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Funnel Steps</h3>
                    <div className="space-y-3">
                      {result.marketing_engine.funnel_steps.map((step, i) => (
                        <div key={i} className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                            {i + 1}
                          </div>
                          <span className="text-slate-300 text-sm">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Brand Architect */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800">
                  <div className="p-3 rounded-xl bg-pink-500/10 text-pink-400"><Paintbrush className="w-6 h-6" /></div>
                  <h2 className="text-2xl font-bold">Brand Architect</h2>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Typography & Aesthetic</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                        <div className="text-xs text-slate-500 mb-1">Fonts</div>
                        <div className="text-slate-300 text-sm font-medium">{result.visual_identity.typography_pairing}</div>
                      </div>
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                        <div className="text-xs text-slate-500 mb-1">Vibe</div>
                        <div className="text-slate-300 text-sm font-medium">{result.visual_identity.moodboard_vibe}</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Color Palette</h3>
                    <div className="flex flex-wrap gap-3">
                      {Object.entries(result.visual_identity.color_palette).map(([key, hex], i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-full shadow-inner border border-white/10" style={{ backgroundColor: hex }} />
                          <span className="text-xs text-slate-500 uppercase">{key}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Photography Style</h3>
                    <p className="text-slate-300 leading-relaxed p-4 bg-slate-950 rounded-xl border border-slate-800 text-sm">
                      {result.visual_identity.photography_style}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ad Creative */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800">
                  <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400"><Palette className="w-6 h-6" /></div>
                  <h2 className="text-2xl font-bold">Ad Creative</h2>
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Video Hooks</h3>
                      {result.audio_b64 && (
                        <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-widest bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> AI Voiceover
                        </div>
                      )}
                    </div>
                    {result.audio_b64 && (
                      <div className="mb-4">
                        <audio controls className="w-full h-10 rounded-lg opacity-80 hover:opacity-100 transition-opacity outline-none">
                          <source src={`data:audio/mp3;base64,${result.audio_b64}`} type="audio/mp3" />
                        </audio>
                      </div>
                    )}
                    <ul className="space-y-3">
                      {result.ad_creative.hooks.map((hook, i) => (
                        <li key={i} className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 text-sm italic">
                          "{hook}"
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Video References</h3>
                    <div className="space-y-3">
                      {result.ad_creative.video_references.map((ref, i) => (
                        <div key={i} className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-violet-400">{ref.platform}</span>
                            <a href={ref.example_url} target="_blank" rel="noreferrer" className="text-xs text-slate-500 hover:text-white underline">
                              Example URL
                            </a>
                          </div>
                          <div className="text-slate-400 font-mono bg-black p-2 rounded-lg text-xs break-all">
                            Search: {ref.search_query}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Code Preview */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl lg:sticky lg:top-12 h-fit">
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400"><FileCode2 className="w-6 h-6" /></div>
                  <h2 className="text-2xl font-bold">Live UI Fix</h2>
                </div>
                {result.live_code_preview.theme_colors && (
                  <div className="flex gap-1">
                    {Object.values(result.live_code_preview.theme_colors).map((color, i) => (
                      <div key={i} className="w-6 h-6 rounded-full shadow-inner" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                )}
              </div>
              
              {result.original_screenshot && (
                <div className="mb-8 p-6 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 text-center">Before & After: The Pivot</h3>
                  <div className="relative group overflow-hidden rounded-xl border-2 border-rose-500/30">
                    <img src={`data:image/jpeg;base64,${result.original_screenshot}`} className="w-full opacity-60 sepia-[.3] hue-rotate-[-20deg]" alt="Original Website" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white font-bold bg-black/80 px-4 py-2 rounded-full border border-white/20">Original Failing Site</span>
                    </div>
                  </div>
                  <div className="flex justify-center -my-3 relative z-10">
                    <div className="bg-slate-900 border border-slate-700 rounded-full p-2 text-slate-400 shadow-xl">
                      <ArrowRight className="w-5 h-5 rotate-90" />
                    </div>
                  </div>
                  <div className="text-center mt-6 text-sm font-bold text-emerald-400 uppercase tracking-widest">
                    Stapler Fix (Live Code Below)
                  </div>
                </div>
              )}
              
              <div className="rounded-2xl overflow-hidden border border-slate-800 bg-[#0d1117]">
                <Sandpack
                  template="react-ts"
                  theme="dark"
                  files={{
                    "/App.tsx": `import React from "react";\nimport "./styles.css";\n\n${result.live_code_preview.react_component_string}`,
                    "/styles.css": `@import url("https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css");\n\nbody {\n  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;\n}`,
                  }}
                  customSetup={{
                    dependencies: {
                      "lucide-react": "latest"
                    }
                  }}
                  options={{
                    showNavigator: false,
                    showTabs: false,
                    editorHeight: 600,
                  }}
                />
              </div>
            </div>
          </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
