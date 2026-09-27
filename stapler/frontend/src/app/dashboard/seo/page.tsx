"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Loader2, CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";

const SEVERITY_ICONS: Record<string, any> = {
  critical: XCircle,
  major: AlertTriangle,
  minor: Info,
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: "text-red-400 bg-red-950/30 border-red-900/50",
  major: "text-amber-400 bg-amber-950/30 border-amber-900/50",
  minor: "text-blue-400 bg-blue-950/30 border-blue-900/50",
};

export default function SEOPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const analyze = async () => {
    if (!url) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("http://localhost:313/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e: any) {
      setResult({ error: e.message });
    }
    setLoading(false);
  };

  const analyzeHtml = async () => {
    setLoading(true);
    setResult(null);
    try {
      // Use the full pipeline results but transform through SEO
      const res = await fetch("http://localhost:313/api/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: "<html><head><title>Test</title></head><body></body></html>", url }),
      });
      const data = await res.json();
      setResult({ seo: data });
    } catch (e: any) {
      setResult({ error: e.message });
    }
    setLoading(false);
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 50) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col space-y-2 px-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">SEO Analyzer</h1>
        <p className="text-slate-400 text-lg">Audit any website for SEO best practices and get actionable fixes.</p>
      </div>

      <Card className="border-slate-800 bg-[#0a0a0a]/80 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
        <CardHeader className="border-b border-slate-800/50">
          <CardTitle className="text-lg text-slate-50">Audit a Website</CardTitle>
          <CardDescription className="text-slate-500">Enter a URL to analyze its SEO health</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-3">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="bg-slate-900/50 border-slate-800 text-slate-100 focus-visible:ring-indigo-500/30 flex-1 h-12 rounded-xl"
            />
            <Button
              onClick={analyze}
              disabled={loading || !url}
              className="bg-white text-black hover:bg-slate-200 rounded-xl h-12 px-6 font-medium"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Analyze
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && !result.error && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <Card className="border-slate-800 bg-[#0a0a0a]/80 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-hidden">
            <CardHeader className="border-b border-slate-800/50">
              <CardTitle className="text-lg text-slate-50">SEO Score</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {result.quality_report ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className={`text-5xl font-bold ${scoreColor(result.quality_report.overall_score)}`}>
                      {result.quality_report.overall_score}
                    </div>
                    <div className="text-sm text-slate-400">/ 100</div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {["Structure", "Responsive", "Accessibility", "Performance"].map((cat) => {
                      const key = cat.toLowerCase();
                      const val = result.quality_report[key] || result.quality_report[`${key}_score`] || 0;
                      return (
                        <div key={cat} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                          <div className="text-xs text-slate-500 uppercase tracking-wider">{cat}</div>
                          <div className={`text-2xl font-bold mt-1 ${scoreColor(typeof val === 'number' ? val : 0)}`}>
                            {typeof val === 'number' ? val : 'N/A'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-slate-500">Run an analysis to see results</p>
              )}
            </CardContent>
          </Card>

          {result.strategy && (
            <Card className="border-slate-800 bg-[#0a0a0a]/80 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-hidden">
              <CardHeader className="border-b border-slate-800/50">
                <CardTitle className="text-lg text-slate-50">Analysis Report</CardTitle>
              </CardHeader>
              <CardContent className="p-6 prose prose-sm max-w-none text-slate-300 prose-invert whitespace-pre-wrap">
                <div>{result.strategy}</div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {result?.error && (
        <Card className="border-red-900/50 bg-red-950/20">
          <CardContent className="p-6 text-red-400">
            Error: {result.error}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
