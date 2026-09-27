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
  
  // New state for the interactive grilling phase
  const [threadId, setThreadId] = useState<string>(`thread_${Math.random().toString(36).substring(7)}`);
  const [grillMessage, setGrillMessage] = useState<string | null>(null);

  const submitIdeaOrReply = async (input: string, isReply: boolean = false) => {
    setIsAnalyzing(true);
    setError(null);
    
    // If it's a completely new idea, reset everything
    if (!isReply) {
      setResult(null);
      setGrillMessage(null);
      setThreadId(`thread_${Math.random().toString(36).substring(7)}`);
      setInputIdea(input);
    }

    try {
      const payload = isReply 
        ? { input_idea: inputIdea, thread_id: threadId, user_reply: input }
        : { input_idea: input, thread_id: threadId };

      const response = await fetch("http://127.0.0.1:313/api/staple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      
      if (data.status === "interrupted") {
        // The AI is asking a follow up question / arguing
        setGrillMessage(data.message);
      } else {
        // The AI is satisfied and completed the generation!
        setGrillMessage(null);
        setResult(data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to run Stapler pipeline");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Keep startAnalysis for backwards compatibility in UI, but it now routes to the new function
  const startAnalysis = (idea: string) => submitIdeaOrReply(idea, false);

  return {
    inputIdea,
    setInputIdea,
    isAnalyzing,
    result,
    error,
    grillMessage,
    submitIdeaOrReply,
    startAnalysis,
  };
}
