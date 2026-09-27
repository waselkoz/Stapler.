"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Loader2, Palette } from "lucide-react";

const STYLES = [
  { id: "wordmark", label: "Wordmark", desc: "Clean serif wordmark with accent underline" },
  { id: "dual_tone", label: "Dual Tone", desc: "Premium two-tone gradient (Stripe-style)" },
  { id: "mark", label: "Mark + Name", desc: "Initials icon + company name side by side" },
  { id: "icon", label: "Icon Only", desc: "Minimal initials in gradient circle" },
];

const COLORS = [
  "#2563eb", "#7c3aed", "#059669", "#d97706",
  "#dc2626", "#db2777", "#0891b2", "#4f46e5",
  "#f97316", "#84cc16", "#14b8a6", "#6366f1",
];

export default function LogoDesignerPage() {
  const [name, setName] = useState("BrandName");
  const [style, setStyle] = useState("wordmark");
  const [color, setColor] = useState("#2563eb");
  const [darkBg, setDarkBg] = useState(false);
  const [svg, setSvg] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:313/api/logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, style, color, dark_bg: darkBg }),
      });
      const data = await res.json();
      setSvg(data.svg);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { generate(); }, [name, style, color, darkBg]);

  const downloadSvg = () => {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.toLowerCase().replace(/\s+/g, "-")}-logo.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPng = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    const blob = new Blob([svg], { type: "image/svg+xml" });
    img.src = URL.createObjectURL(blob);
    await new Promise((r) => { img.onload = r; });
    ctx.fillStyle = darkBg ? "#1a1a2e" : "#ffffff";
    ctx.fillRect(0, 0, 800, 200);
    ctx.drawImage(img, 0, 0, 800, 200);
    const pngUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = pngUrl;
    a.download = `${name.toLowerCase().replace(/\s+/g, "-")}-logo.png`;
    a.click();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col space-y-2 px-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Logo Designer</h1>
        <p className="text-slate-400 text-lg">Design a brand logo in seconds — no design skills needed.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-800 bg-[#0a0a0a]/80 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
            <CardHeader className="border-b border-slate-800/50">
              <CardTitle className="text-lg text-slate-50">Settings</CardTitle>
              <CardDescription className="text-slate-500">Customize your brand logo</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">Brand Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-900/50 border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500/50 h-11 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">Style</Label>
                <div className="grid grid-cols-2 gap-2">
                  {STYLES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s.id)}
                      className={`text-left p-3 rounded-xl border text-sm transition-all ${
                        style === s.id
                          ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300"
                          : "border-slate-800 bg-slate-900/30 text-slate-400 hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="font-medium">{s.label}</div>
                      <div className="text-[10px] opacity-70 mt-0.5">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">Accent Color</Label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        color === c ? "border-white scale-110" : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setDarkBg(!darkBg)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    darkBg ? "bg-indigo-500" : "bg-slate-700"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      darkBg ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <span className="text-sm text-slate-300">Dark Background</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button
              onClick={downloadSvg}
              className="flex-1 bg-white text-black hover:bg-slate-200 rounded-xl h-11 font-medium"
            >
              <Download className="mr-2 h-4 w-4" />
              Download SVG
            </Button>
            <Button
              onClick={downloadPng}
              className="flex-1 bg-slate-800 text-slate-200 hover:bg-slate-700 rounded-xl h-11 font-medium"
            >
              <Download className="mr-2 h-4 w-4" />
              Download PNG
            </Button>
          </div>
        </div>

        <div className="lg:col-span-3">
          <Card className="border-slate-800 bg-[#0a0a0a]/80 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-hidden h-full">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
            <CardHeader className="border-b border-slate-800/50">
              <CardTitle className="text-lg text-slate-50 flex items-center">
                <Palette className="mr-2 h-4 w-4 text-indigo-400" />
                Preview
              </CardTitle>
              <CardDescription className="text-slate-500">Real-time logo preview</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div
                className={`flex items-center justify-center min-h-[300px] p-8 ${
                  darkBg ? "bg-[#1a1a2e]" : "bg-white"
                }`}
              >
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                ) : svg ? (
                  <div className="w-full max-w-md flex items-center justify-center">
                    <div
                      className="w-full"
                      dangerouslySetInnerHTML={{ __html: svg }}
                    />
                  </div>
                ) : (
                  <p className="text-slate-500">Enter a name to generate</p>
                )}
              </div>
              <div className="border-t border-slate-800/50 p-4 bg-slate-900/30">
                <pre className="text-[10px] text-slate-500 overflow-x-auto max-h-32 font-mono">
                  <code>{svg ? svg.slice(0, 800) + (svg.length > 800 ? "..." : "") : ""}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-slate-800 bg-[#0a0a0a]/80 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
        <CardHeader>
          <CardTitle className="text-lg text-slate-50">All Logo Variants</CardTitle>
          <CardDescription className="text-slate-500">Preview all 4 styles at once</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {STYLES.map((s) => (
                <div
                  key={s.id}
                  className={`rounded-xl border p-6 flex items-center justify-center min-h-[120px] transition-all ${
                    darkBg
                      ? "bg-[#1a1a2e] border-slate-700"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <LogoPreview name={name} style={s.id} color={color} darkBg={darkBg} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LogoPreview({ name, style, color, darkBg }: { name: string; style: string; color: string; darkBg: boolean }) {
  const [svg, setSvg] = useState("");
  useEffect(() => {
    fetch("http://localhost:313/api/logo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, style, color, dark_bg: darkBg }),
    })
      .then((r) => r.json())
      .then((d) => setSvg(d.svg))
      .catch(() => {});
  }, [name, style, color, darkBg]);
  if (!svg) return null;
  return (
    <div className="w-full max-w-[200px]" dangerouslySetInnerHTML={{ __html: svg }} />
  );
}
