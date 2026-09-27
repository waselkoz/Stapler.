import { useState } from "react";

export const PIPELINE_STEPS = [
  { key: "setup",      label: "Setup"    },
  { key: "scraper",    label: "Scraping" },
  { key: "tools",      label: "Tools"    },
  { key: "strategist", label: "Strategy" },
  { key: "marketing",  label: "Marketing"},
  { key: "branding",   label: "Branding" },
  { key: "logo",       label: "Logo"     },
  { key: "designer",   label: "Design"   },
  { key: "chart",      label: "Charts"   },
  { key: "developer",  label: "Building" },
  { key: "qa",         label: "QA"       },
];

export function usePipeline() {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generatedPages, setGeneratedPages] = useState<Record<string, string> | null>(null);
  const [strategy, setStrategy] = useState<string | null>(null);
  const [marketing, setMarketing] = useState<string | null>(null);
  const [branding, setBranding] = useState<string | null>(null);

  const startAnalysis = async (targetUrl: string, useTinyKit: boolean = false) => {
    if (!targetUrl) return;

    setIsAnalyzing(true);
    setLogs([]);
    setError(null);
    setGeneratedPages(null);
    setStrategy(null);
    setMarketing(null);
    setBranding(null);
    setCompletedSteps(new Set());
    setCurrentStep("setup");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:313";
      const response = await fetch(`${apiUrl}/api/analyze/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl, use_tinykit: useTinyKit }),
      });

      if (!response.ok) {
        throw new Error("Failed to connect to backend");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            
            try {
              const data = JSON.parse(line.replace("data: ", ""));

              if (data.error) {
                setError(data.error);
                setIsAnalyzing(false);
                return;
              }

              if (data.step) {
                setLogs((prev) => [...prev, data.step]);
                const stepMatch = data.step.match(/Completed step: (\w+)/);
                if (stepMatch) {
                  const stepName = stepMatch[1];
                  setCompletedSteps((prev) => new Set([...prev, stepName]));
                  const idx = PIPELINE_STEPS.findIndex((s) => s.key === stepName);
                  if (idx >= 0 && idx < PIPELINE_STEPS.length - 1) {
                    setCurrentStep(PIPELINE_STEPS[idx + 1].key);
                  }
                }
              }

              if (data.pages) {
                setGeneratedPages(data.pages);
              }

              if (data.done) {
                setIsAnalyzing(false);
                setCurrentStep(null);
                if (data.full_state) {
                  if (data.full_state.strategy) setStrategy(data.full_state.strategy);
                  if (data.full_state.marketing) setMarketing(data.full_state.marketing);
                  if (data.full_state.branding) setBranding(data.full_state.branding);
                  if (data.full_state.pages) setGeneratedPages(data.full_state.pages);
                }
              }
            } catch (parseError) {
              // Gracefully handle partial JSON streams
              console.warn("Stream parse error:", parseError);
            }
          }
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected network error occurred.");
      setIsAnalyzing(false);
    }
  };

  return {
    url,
    setUrl,
    isAnalyzing,
    logs,
    completedSteps,
    currentStep,
    error,
    generatedPages,
    strategy,
    marketing,
    branding,
    startAnalysis
  };
}
