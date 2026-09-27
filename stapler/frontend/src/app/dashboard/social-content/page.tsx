"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Megaphone, Loader2, FileText, CalendarDays, Heart, TrendingUp, Target, Zap, Eye, Star } from "lucide-react";

const EMOTION_COLORS: Record<string, string> = {
  Urgency: "bg-red-500/20 border-red-500/40 text-red-300",
  Joy: "bg-yellow-500/20 border-yellow-500/40 text-yellow-300",
  Trust: "bg-blue-500/20 border-blue-500/40 text-blue-300",
  FOMO: "bg-orange-500/20 border-orange-500/40 text-orange-300",
  Curiosity: "bg-purple-500/20 border-purple-500/40 text-purple-300",
  Nostalgia: "bg-pink-500/20 border-pink-500/40 text-pink-300",
  Pride: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
  Belonging: "bg-teal-500/20 border-teal-500/40 text-teal-300",
  Surprise: "bg-cyan-500/20 border-cyan-500/40 text-cyan-300",
  Inspiration: "bg-indigo-500/20 border-indigo-500/40 text-indigo-300",
  Fear: "bg-gray-700/30 border-gray-600/40 text-gray-300",
  Sadness: "bg-slate-700/30 border-slate-600/40 text-slate-300",
  Anger: "bg-rose-700/30 border-rose-600/40 text-rose-300",
};

const HEATMAP_LEVELS = [
  { min: 0, max: 3, class: "bg-emerald-900/40 border-emerald-800/30 text-emerald-300" },
  { min: 4, max: 6, class: "bg-emerald-700/50 border-emerald-600/40 text-emerald-200" },
  { min: 7, max: 8, class: "bg-emerald-500/60 border-emerald-400/50 text-emerald-100" },
  { min: 9, max: 10, class: "bg-emerald-400/80 border-emerald-300/60 text-white font-bold" },
];

const heatLevel = (val: number) => {
  for (const lvl of HEATMAP_LEVELS) {
    if (val >= lvl.min && val <= lvl.max) return lvl.class;
  }
  return HEATMAP_LEVELS[0].class;
};

function parseSections(markdown: string) {
  const lines = markdown.split("\n");
  const sections: { title: string; body: string[]; type: string }[] = [];
  let current: { title: string; body: string[]; type: string } | null = null;

  for (const line of lines) {
    const h = line.match(/^##\s+(.+)/);
    if (h) {
      if (current) sections.push(current);
      const t = h[1].toLowerCase();
      let type = "markdown";
      if (t.includes("heatmap")) type = "heatmap";
      else if (t.includes("emotional") || t.includes("emotion")) type = "emotions";
      else if (t.includes("kpi") || t.includes("metric") || t.includes("success")) type = "kpi";
      else if (t.includes("script") || t.includes("tiktok") || t.includes("reel")) type = "scripts";
      else if (t.includes("ad") || t.includes("facebook") || t.includes("instagram") || t.includes("copy")) type = "ads";
      else if (t.includes("calendar")) type = "calendar";
      else if (t.includes("platform")) type = "platform";
      else if (t.includes("pillar")) type = "pillars";
      current = { title: h[1], body: [], type };
    } else {
      if (!current) {
        current = { title: "Overview", body: [], type: "markdown" };
      }
      current.body.push(line);
    }
  }
  if (current) sections.push(current);
  return sections;
}

function HeatmapGrid({ body }: { body: string[] }) {
  const tableRows = useMemo(() => {
    const rows: { week: string; platform: string; day: string; type: string; intensity: number; emotion: string }[] = [];
    let inTable = false;
    for (const line of body) {
      if (line.startsWith("|") && !line.includes("---")) {
        const cells = line.split("|").map((c) => c.trim()).filter(Boolean);
        if (cells.length >= 6) {
          const intensity = parseInt(cells[4]) || 5;
          rows.push({ week: cells[0], platform: cells[1], day: cells[2], type: cells[3], intensity, emotion: cells[5] || "—" });
        }
      }
    }
    return rows;
  }, [body]);

  if (tableRows.length === 0) return <div className="text-slate-500 italic">No heatmap data parsed. Run the generator to populate.</div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-900/40" /> Low</span>
        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-700/50" /> Medium</span>
        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-500/60" /> High</span>
        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-400/80" /> Viral</span>
      </div>
      <div className="grid gap-2">
        {tableRows.map((r, i) => (
          <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border bg-slate-900/40 border-slate-800/50 hover:border-slate-700/60 transition-colors">
            <div className="w-16 text-xs text-slate-400 font-mono shrink-0">{r.week} {r.day}</div>
            <div className="w-20 text-xs text-slate-300 font-medium shrink-0">{r.platform}</div>
            <div className={`px-2 py-0.5 rounded text-[11px] font-medium ${heatLevel(r.intensity)}`}>{r.intensity}/10</div>
            <div className="text-xs text-slate-400 flex-1 truncate">{r.type}</div>
            {r.emotion !== "—" && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${EMOTION_COLORS[r.emotion] || "bg-slate-800/50 border-slate-700/50 text-slate-400"}`}>
                {r.emotion}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function EmotionCards({ body }: { body: string[] }) {
  const emotions = useMemo(() => {
    const list: { emotion: string; tactic: string; example: string; platform: string }[] = [];
    let inTable = false;
    for (const line of body) {
      if (line.startsWith("|") && !line.includes("---")) {
        const cells = line.split("|").map((c) => c.trim()).filter(Boolean);
        if (cells.length >= 4) {
          list.push({ emotion: cells[0], tactic: cells[1], example: cells[2], platform: cells[3] || "—" });
        }
      }
    }
    return list;
  }, [body]);

  if (emotions.length === 0) return <div className="text-slate-500 italic">No emotional drive data parsed.</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {emotions.map((e, i) => (
        <div key={i} className={`p-4 rounded-xl border ${EMOTION_COLORS[e.emotion] || "bg-slate-900/50 border-slate-800"}`}>
          <div className="flex items-center gap-2 mb-2">
            <Heart size={14} className="shrink-0" />
            <span className="font-bold text-sm">{e.emotion}</span>
          </div>
          <p className="text-xs opacity-80 mb-1"><span className="font-medium">Tactic:</span> {e.tactic}</p>
          <p className="text-xs opacity-70"><span className="font-medium">Example:</span> {e.example}</p>
          {e.platform !== "—" && <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-black/20 border border-white/10">{e.platform}</span>}
        </div>
      ))}
    </div>
  );
}

function KpiCards({ body }: { body: string[] }) {
  const kpis = useMemo(() => {
    const list: string[][] = [];
    let inTable = false;
    for (const line of body) {
      if (line.startsWith("|") && !line.includes("---")) {
        const cells = line.split("|").map((c) => c.trim()).filter(Boolean);
        if (cells.length >= 3) list.push(cells);
      }
    }
    return list;
  }, [body]);

  if (kpis.length === 0) return <div className="text-slate-500 italic">No KPI data parsed.</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {kpis.map((k, i) => (
        <div key={i} className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/60 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Target size={14} className="text-indigo-400" />
            <span className="font-medium text-sm text-slate-200">{k[0]}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-2">
            <span>Platform: {k[1] || "—"}</span>
            <span>Benchmark: {k[2] || "—"}</span>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-emerald-400">30d: {k[3] || "—"}</span>
            <span className="text-indigo-400">90d: {k[4] || "—"}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionRenderer({ section, index }: { section: { title: string; body: string[]; type: string }; index: number }) {
  const content = section.body.join("\n").trim();
  if (!content) return null;

  const iconMap: Record<string, any> = {
    heatmap: CalendarDays,
    emotions: Heart,
    kpi: TrendingUp,
    scripts: Zap,
    ads: Eye,
    platform: Star,
    calendar: CalendarDays,
    pillars: Star,
  };

  const Icon = iconMap[section.type] || FileText;

  return (
    <Card className="border-slate-800 bg-[#0a0a0a]/80 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
      <CardHeader className="border-b border-slate-800/50">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-indigo-400" />
          <CardTitle className="text-base text-slate-50">{section.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {section.type === "heatmap" ? (
          <HeatmapGrid body={section.body} />
        ) : section.type === "emotions" ? (
          <EmotionCards body={section.body} />
        ) : section.type === "kpi" ? (
          <KpiCards body={section.body} />
        ) : (
          <div className="text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
            {content}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function SocialContentPage() {
  const [url, setUrl] = useState("");
  const [context, setContext] = useState("");
  const [strategy, setStrategy] = useState("");
  const [branding, setBranding] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const sections = useMemo(() => {
    if (!result?.content) return [];
    return parseSections(result.content);
  }, [result]);

  const generate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("http://localhost:313/api/social-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, business_context: context, strategy, branding }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e: any) {
      setResult({ error: e.message });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col space-y-2 px-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Social Content Planner</h1>
        <p className="text-slate-400 text-lg">Generate 30-day content calendars with heatmaps, emotional drive mapping, TikTok/Reels scripts, ad copy, and KPI dashboards.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-slate-800 bg-[#0a0a0a]/80 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-hidden lg:sticky lg:top-24">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
            <CardHeader className="border-b border-slate-800/50">
              <CardTitle className="text-lg text-slate-50">Input</CardTitle>
              <CardDescription className="text-slate-500">Business details and optional analysis data</CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">Website URL</Label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="bg-slate-900/50 border-slate-800 text-slate-100 h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">Business Context</Label>
                <Textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Describe your business, products, target audience..."
                  className="bg-slate-900/50 border-slate-800 text-slate-100 min-h-[100px] rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">Strategy (optional)</Label>
                <Textarea
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  placeholder="Paste strategic analysis from Stapler analysis..."
                  className="bg-slate-900/50 border-slate-800 text-slate-100 min-h-[80px] rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">Branding (optional)</Label>
                <Textarea
                  value={branding}
                  onChange={(e) => setBranding(e.target.value)}
                  placeholder="Paste brand identity details..."
                  className="bg-slate-900/50 border-slate-800 text-slate-100 min-h-[80px] rounded-xl"
                />
              </div>
              <Button onClick={generate} disabled={loading || (!url && !context)} className="w-full bg-white text-black hover:bg-slate-200 rounded-xl h-11 font-medium">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Megaphone className="mr-2 h-4 w-4" />}
                Generate Content Plan
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {sections.length > 0 && (
            <div className="flex items-center justify-between px-1">
              <p className="text-sm text-slate-500">{sections.length} sections generated</p>
              <Button
                onClick={() => {
                  const blob = new Blob([result.content], { type: "text/markdown" });
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = "social-content-plan.md";
                  a.click();
                }}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl h-9 px-4 text-xs"
              >
                <FileText className="mr-2 h-3.5 w-3.5" />
                Export Markdown
              </Button>
            </div>
          )}

          {sections.map((section, i) => (
            <SectionRenderer key={i} section={section} index={i} />
          ))}

          {!result && !loading && (
            <Card className="border-slate-800 bg-[#0a0a0a]/80 backdrop-blur-2xl min-h-[400px] flex items-center justify-center">
              <div className="text-center space-y-3">
                <Megaphone size={40} className="text-slate-700 mx-auto" />
                <p className="text-slate-500">Enter details to generate your social content plan</p>
                <p className="text-xs text-slate-600 max-w-md mx-auto">Includes engagement heatmaps, emotional drive mapping, 30-day calendar, video scripts, ad copy, and KPI tracking.</p>
              </div>
            </Card>
          )}

          {loading && (
            <Card className="border-slate-800 bg-[#0a0a0a]/80 backdrop-blur-2xl min-h-[400px] flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="absolute inset-0 rounded-full border-2 border-slate-800" />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin" />
                  <Megaphone size={24} className="absolute inset-0 m-auto text-indigo-400" />
                </div>
                <p className="text-slate-400">Generating your content plan...</p>
                <p className="text-xs text-slate-600">Analyzing trends, crafting scripts, mapping emotions</p>
              </div>
            </Card>
          )}

          {result?.error && (
            <Card className="border-red-900/50 bg-red-950/20">
              <CardContent className="p-6 text-red-400 whitespace-pre-wrap">
                {result.error}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
