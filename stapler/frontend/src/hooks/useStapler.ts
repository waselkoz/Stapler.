import { useState } from "react";

export interface StaplerResult {
  audit: {
    roast_points: string[];
    ui_ux_fixes: string;
  };
  marketing_engine: {
    target_audience: string;
    funnel_steps: string[];
    pivot_strategy: string;
    metrics_data: { metric_name: string; before_pivot: number; after_pivot: number }[];
  };
  visual_identity: {
    typography_pairing: string;
    color_palette: Record<string, string>;
    moodboard_vibe: string;
    photography_style: string;
  };
  ad_creative: {
    hooks: string[];
    video_references: {
      platform: string;
      search_query: string;
      example_url: string;
    }[];
  };
  live_code_preview: {
    react_component_string: string;
    theme_colors: Record<string, string>;
  };
  original_screenshot?: string;
  audio_b64?: string;
}

export function useStapler() {
  const [inputIdea, setInputIdea] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<StaplerResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startAnalysis = async (idea: string) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("http://localhost:317/api/staple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input_idea: idea }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to run Stapler pipeline");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    inputIdea,
    setInputIdea,
    isAnalyzing,
    result,
    error,
    startAnalysis,
  };
}
