"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Loader2, Package } from "lucide-react";

const COLORS = [
  "#2563eb", "#7c3aed", "#059669", "#d97706",
  "#dc2626", "#db2777", "#0891b2", "#4f46e5",
  "#f97316", "#84cc16", "#14b8a6", "#6366f1",
];

const ALL_PLATFORMS = [
  { id: "twitter", label: "X" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
  { id: "github", label: "GitHub" },
  { id: "youtube", label: "YouTube" },
  { id: "tiktok", label: "TikTok" },
  { id: "pinterest", label: "Pinterest" },
];

export default function BrandKitPage() {
  const [name, setName] = useState("BrandName");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#2563eb");
  const [darkBg, setDarkBg] = useState(false);
  const [platforms, setPlatforms] = useState<string[]>(["twitter", "linkedin", "instagram"]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [logos, setLogos] = useState<any>(null);

  const togglePlatform = (id: string) => {
    setPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:313/api/brand-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, color, dark_bg: darkBg, platforms }),
      });
      const data = await res.json();
      setResult(data);
      setLogos(data.logos);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const downloadZip = () => {
    if (!result?.zip_base64) return;
    const byteChars = atob(result.zip_base64);
    const bytes = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
    const blob = new Blob([bytes], { type: "application/zip" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col space-y-2 px-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Brand Kit</h1>
        <p className="text-slate-400 text-lg">Generate a complete brand kit — logos, social links, and brand assets in one zip.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-800 bg-[#0a0a0a]/80 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
            <CardHeader className="border-b border-slate-800/50">
              <CardTitle className="text-lg text-slate-50">Settings</CardTitle>
              <CardDescription className="text-slate-500">Brand identity details</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">Brand Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-slate-900/50 border-slate-800 text-slate-100 h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">Description (optional)</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} className="bg-slate-900/50 border-slate-800 text-slate-100 h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">Primary Color</Label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? "border-white scale-110" : "border-transparent hover:scale-105"}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button onClick={() => setDarkBg(!darkBg)} className={`relative w-12 h-6 rounded-full transition-colors ${darkBg ? "bg-indigo-500" : "bg-slate-700"}`}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${darkBg ? "translate-x-6" : "translate-x-0.5"}`} />
                </button>
                <span className="text-sm text-slate-300">Dark Background</span>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">Social Platforms</Label>
                <div className="flex flex-wrap gap-2">
                  {ALL_PLATFORMS.map((p) => (
                    <button key={p.id} onClick={() => togglePlatform(p.id)} className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${platforms.includes(p.id) ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300" : "border-slate-800 text-slate-500 hover:border-slate-700"}`}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={generate} className="w-full bg-white text-black hover:bg-slate-200 rounded-xl h-11 font-medium">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Package className="mr-2 h-4 w-4" />}
                Generate Brand Kit
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {logos && (
            <Card className="border-slate-800 bg-[#0a0a0a]/80 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
              <CardHeader className="border-b border-slate-800/50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-slate-50">Preview</CardTitle>
                  <CardDescription className="text-slate-500">Generated brand assets</CardDescription>
                </div>
                <Button onClick={downloadZip} className="bg-white text-black hover:bg-slate-200 rounded-xl h-10 px-4 text-sm font-medium">
                  <Download className="mr-2 h-4 w-4" />
                  Download ZIP
                </Button>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(logos).map(([style, svg]: [string, any]) => (
                    <div key={style} className={`rounded-xl border p-6 flex items-center justify-center min-h-[100px] ${darkBg ? "bg-[#1a1a2e] border-slate-700" : "bg-white border-slate-200"}`}>
                      <div className="w-full max-w-[180px]" dangerouslySetInnerHTML={{ __html: svg }} />
                    </div>
                  ))}
                </div>
                {result?.social_links && (
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Social Links</h4>
                    <div className="space-y-1">
                      {Object.entries(result.social_links).map(([platform, link]: [string, any]) => (
                        <div key={platform} className="text-xs text-slate-500 font-mono">
                          <span className="text-indigo-400">{platform}:</span> {link}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          {!logos && (
            <Card className="border-slate-800 bg-[#0a0a0a]/80 backdrop-blur-2xl min-h-[300px] flex items-center justify-center">
              <p className="text-slate-500">Configure your brand and generate the kit</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
