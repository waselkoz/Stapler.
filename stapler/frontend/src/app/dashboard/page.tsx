"use client";

import { useState, useEffect } from "react";
import { useStapler } from "@/hooks/useStapler";
import { Sandpack } from "@codesandbox/sandpack-react";
import { ArrowRight, Loader2, Download, Terminal, Search, Zap, LayoutTemplate, Video } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown';

export default function DashboardPage() {
  const { inputIdea, setInputIdea, isAnalyzing, result, error, grillMessage, submitIdeaOrReply } = useStapler();
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [userReply, setUserReply] = useState("");

  useEffect(() => {
    if (!isAnalyzing) {
      setTerminalLogs([]);
      return;
    }
    const logs = [
      "Initializing Stapler Engine...",
      "Scraping competitor datasets...",
      "Analyzing friction points...",
      "Synthesizing pivot strategy...",
      "Drafting direct-response copy...",
      "Compiling design tokens...",
      "Generating React payload..."
    ];
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < logs.length) {
        setTerminalLogs(prev => [...prev, logs[currentIndex]]);
        currentIndex++;
      }
    }, 1500);
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
    <div className="max-w-[1000px] mx-auto py-12 md:py-16">
      
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">
          Agentic Design Engine
        </h1>
        <p className="text-[17px] text-slate-600 max-w-[600px] leading-relaxed">
          Input your business idea or existing URL. Stapler will aggressively critique it, pivot the strategy, and generate a hyper-optimized design system.
        </p>
      </header>

      {/* Main Form */}
      <div className="max-w-[700px] mb-12">
        <form onSubmit={handleAnalyze} className="relative group">
          <div className="relative flex items-center bg-white border border-slate-200 rounded-xl shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
            <div className="pl-4 pr-2">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={inputIdea}
              onChange={(e) => setInputIdea(e.target.value)}
              placeholder="Paste a URL or describe your business model..."
              className="w-full bg-transparent text-slate-900 px-2 py-4 outline-none placeholder:text-slate-400 text-base"
              disabled={isAnalyzing}
            />
            <div className="pr-2">
              <button
                type="submit"
                disabled={isAnalyzing || !inputIdea}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {isAnalyzing ? "Processing..." : "Analyze"}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="mt-3 text-red-600 text-sm font-medium px-1">
            {error}
          </div>
        )}

        {/* Grilling / Chat */}
        <AnimatePresence>
          {grillMessage && !isAnalyzing && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-8 overflow-hidden">
              <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-xl">
                <div className="text-blue-900 text-[15px] leading-relaxed font-medium mb-5 markdown-body prose prose-blue max-w-none prose-img:rounded-lg prose-img:max-w-[200px] prose-img:inline-block prose-img:mr-2">
                  <ReactMarkdown>{grillMessage}</ReactMarkdown>
                </div>
                <form onSubmit={handleReply} className="flex gap-3">
                  <input
                    type="text"
                    value={userReply}
                    onChange={(e) => setUserReply(e.target.value)}
                    placeholder="Your response..."
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                    disabled={isAnalyzing}
                  />
                  <button
                    type="submit"
                    disabled={isAnalyzing || !userReply}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm disabled:opacity-50 transition-colors shadow-sm"
                  >
                    Reply
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Loading Terminal */}
      {isAnalyzing && (
        <div className="max-w-[700px] mb-12">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
              <Terminal className="w-4 h-4 text-slate-400 mr-2" />
              <span className="text-xs font-semibold text-slate-500">system.log</span>
            </div>
            <div className="p-5 h-[200px] overflow-y-auto font-mono text-[13px] space-y-2.5">
              {terminalLogs.map((log, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="text-slate-600 flex items-start gap-3">
                  <span className="text-blue-500 select-none">→</span>
                  <span>{log}</span>
                </motion.div>
              ))}
              <div className="flex items-center gap-2 mt-2 opacity-50 ml-6">
                <span className="w-1.5 h-3.5 bg-slate-400 animate-pulse"></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-8 space-y-12 border-t border-slate-200">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Analysis Complete</h2>
              <p className="text-sm text-slate-500 mt-1">Review the generated strategy and live component below.</p>
            </div>
            <button onClick={handleExport} className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all">
              <Download className="w-4 h-4" /> Export Spec
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8">
            
            {/* Left Column: Data */}
            <div className="space-y-8">
              
              {/* Audit */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <h3 className="font-semibold text-slate-900 text-[15px]">Strategy Audit</h3>
                </div>
                <div className="p-6 space-y-8">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Conversion Killers</h4>
                    <ul className="space-y-3">
                      {result.audit?.roast_points?.map((point, i) => (
                        <li key={i} className="flex items-start gap-3 text-[14px] text-slate-600 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0"></span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">The Pivot</h4>
                    <p className="text-[15px] font-medium text-slate-900 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                      {result.marketing_engine?.pivot_strategy}
                    </p>
                  </div>
                </div>
              </div>

              {/* Brand Kit */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                  <LayoutTemplate className="w-4 h-4 text-blue-600" />
                  <h3 className="font-semibold text-slate-900 text-[15px]">Design System</h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Typography</h4>
                      <div className="text-[14px] font-medium text-slate-900">{result.visual_identity?.typography_pairing}</div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Aesthetic</h4>
                      <div className="text-[14px] font-medium text-slate-900">{result.visual_identity?.moodboard_vibe}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Color Palette</h4>
                    <div className="flex flex-wrap gap-3">
                      {Object.entries(result.visual_identity?.color_palette || {}).map(([key, hex], i) => (
                        <div key={i} className="flex flex-col gap-1.5">
                          <div className="w-10 h-10 rounded border border-slate-200/50 shadow-sm" style={{ backgroundColor: hex }} />
                          <span className="text-[10px] font-semibold text-slate-500 uppercase">{key}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Ad Creative */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                  <Video className="w-4 h-4 text-blue-600" />
                  <h3 className="font-semibold text-slate-900 text-[15px]">Viral Ad Creative</h3>
                </div>
                <div className="p-6 space-y-8">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">TikTok / IG Hooks</h4>
                    <ul className="space-y-3">
                      {result.ad_creative?.hooks?.map((hook, i) => (
                        <li key={i} className="flex items-start gap-3 text-[14px] text-slate-900 font-medium leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0"></span>
                          "{hook}"
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Video References</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {result.ad_creative?.video_references?.map((ref, i) => (
                        <a key={i} href={ref.example_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-slate-50 transition-all">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl shrink-0">
                            {ref.platform.toLowerCase().includes('tiktok') ? '📱' : '📸'}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{ref.platform}</div>
                            <div className="text-xs text-slate-500 truncate">Search: {ref.search_query}</div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Code & Preview */}
            <div>
              <div className="sticky top-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 text-[15px]">Live Component</h3>
                </div>
                <div>
                  <Sandpack
                    template="react-ts"
                    theme="light"
                    files={{
                      "/App.tsx": `import React from "react";\nimport "./styles.css";\n\n${result.live_code_preview?.react_component_string || 'export default function App() { return <div>Building...</div> }'}`,
                      "/styles.css": `@import url("https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css");\n\nbody {\n  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;\n  background-color: ${result.visual_identity?.color_palette?.Background || '#ffffff'};\n  color: ${result.visual_identity?.color_palette?.Text || '#000000'};\n}`,
                    }}
                    customSetup={{
                      dependencies: { "lucide-react": "latest" }
                    }}
                    options={{
                      showNavigator: false,
                      showTabs: true,
                      editorHeight: 600,
                    }}
                  />
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      )}
    </div>
  );
}
