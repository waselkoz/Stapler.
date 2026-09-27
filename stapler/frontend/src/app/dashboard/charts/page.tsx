"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, Loader2, Plus, Trash2 } from "lucide-react";

const CHART_TYPES = [
  { id: "bar", label: "Vertical Bar", icon: "📊" },
  { id: "horizontal_bar", label: "Horizontal Bar", icon: "📈" },
  { id: "pie", label: "Pie Chart", icon: "🥧" },
  { id: "doughnut", label: "Doughnut", icon: "🍩" },
  { id: "line", label: "Line Chart", icon: "📉" },
];

const COLORS = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#dc2626", "#db2777", "#0891b2", "#4f46e5"];

function useChartGenerator() {
  const [chartType, setChartType] = useState("bar");
  const [title, setTitle] = useState("Monthly Revenue");
  const [color, setColor] = useState("#2563eb");
  const [data, setData] = useState<{ label: string; value: string }[]>([
    { label: "Jan", value: "30" },
    { label: "Feb", value: "55" },
    { label: "Mar", value: "42" },
    { label: "Apr", value: "78" },
    { label: "May", value: "65" },
    { label: "Jun", value: "90" },
  ]);
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);

  const updateData = (i: number, field: "label" | "value", val: string) => {
    const next = [...data];
    next[i] = { ...next[i], [field]: val };
    setData(next);
  };

  const addRow = () => setData([...data, { label: "", value: "0" }]);
  const removeRow = (i: number) => setData(data.filter((_, idx) => idx !== i));

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:313/api/chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chart_type: chartType,
          labels: data.map((d) => d.label || "?"),
          values: data.map((d) => parseFloat(d.value) || 0),
          title,
          color,
        }),
      });
      const result = await res.json();
      setHtml(result.html);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return { chartType, setChartType, title, setTitle, color, setColor, data, updateData, addRow, removeRow, html, loading, generate };
}

export default function ChartsPage() {
  const c = useChartGenerator();

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col space-y-2 px-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Chart Generator</h1>
        <p className="text-slate-400 text-lg">Create beautiful charts for your website — no JS library needed.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-800 bg-[#0a0a0a]/80 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
            <CardHeader className="border-b border-slate-800/50">
              <CardTitle className="text-lg text-slate-50">Settings</CardTitle>
              <CardDescription className="text-slate-500">Configure your chart</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">Chart Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {CHART_TYPES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => c.setChartType(t.id)}
                      className={`text-left p-3 rounded-xl border text-sm transition-all ${
                        c.chartType === t.id
                          ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300"
                          : "border-slate-800 bg-slate-900/30 text-slate-400 hover:bg-slate-800/40"
                      }`}
                    >
                      <span className="mr-1.5">{t.icon}</span>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">Title</Label>
                <Input
                  value={c.title}
                  onChange={(e) => c.setTitle(e.target.value)}
                  className="bg-slate-900/50 border-slate-800 text-slate-100 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500/50 h-11 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">Accent Color</Label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((clr) => (
                    <button
                      key={clr}
                      onClick={() => c.setColor(clr)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        c.color === clr ? "border-white scale-110" : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: clr }}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-[#0a0a0a]/80 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
            <CardHeader className="border-b border-slate-800/50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg text-slate-50">Data</CardTitle>
                <CardDescription className="text-slate-500">Add labels and values</CardDescription>
              </div>
              <Button onClick={c.addRow} variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300">
                <Plus className="h-4 w-4 mr-1" /> Add Row
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {c.data.map((row, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    value={row.label}
                    onChange={(e) => c.updateData(i, "label", e.target.value)}
                    placeholder="Label"
                    className="bg-slate-900/50 border-slate-800 text-slate-100 h-9 rounded-lg text-sm w-24"
                  />
                  <Input
                    type="number"
                    value={row.value}
                    onChange={(e) => c.updateData(i, "value", e.target.value)}
                    placeholder="Value"
                    className="bg-slate-900/50 border-slate-800 text-slate-100 h-9 rounded-lg text-sm flex-1"
                  />
                  <button
                    onClick={() => c.removeRow(i)}
                    className="text-red-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <Button
                onClick={c.generate}
                className="w-full mt-4 bg-white text-black hover:bg-slate-200 rounded-xl h-11 font-medium"
              >
                {c.loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <BarChart3 className="mr-2 h-4 w-4" />
                )}
                Generate Chart
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="border-slate-800 bg-[#0a0a0a]/80 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-hidden h-full">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
            <CardHeader className="border-b border-slate-800/50">
              <CardTitle className="text-lg text-slate-50 flex items-center">
                <BarChart3 className="mr-2 h-4 w-4 text-indigo-400" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex items-center justify-center min-h-[350px] bg-white p-6">
                {c.loading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                ) : c.html ? (
                  <div className="w-full" dangerouslySetInnerHTML={{ __html: c.html }} />
                ) : (
                  <p className="text-slate-500">Configure and generate your chart</p>
                )}
              </div>
              {c.html && (
                <div className="border-t border-slate-800/50 p-4 bg-slate-900/30">
                  <pre className="text-[10px] text-slate-500 overflow-x-auto max-h-40 font-mono">
                    <code>{c.html.slice(0, 1200) + (c.html.length > 1200 ? "..." : "")}</code>
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
