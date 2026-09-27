import os
import re
from typing import Dict, List, TypedDict, Optional
from pydantic import BaseModel, Field
from langgraph.graph import StateGraph, END
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from duckduckgo_search import DDGS
from backend.components import COMPONENT_LIBRARY
from backend.memory_rag import get_relevant_gold_standard, get_past_context, save_memory

# Models for Structured Output
class AuditOutput(BaseModel):
    roast_points: List[str] = Field(default_factory=list, description="List of brutal roast points identifying flaws, citing competitors or Reddit sentiment if relevant.")
    ui_ux_fixes: str = Field(default="No specific UI fixes provided.", description="Actionable UI/UX fixes to beat the competition.")

class ProjectedMetrics(BaseModel):
    metric_name: str = Field(default="Metric", description="e.g. 'Conversion Rate (%)' or 'CAC ($)'")
    before_pivot: float = Field(default=0.0, description="Estimated value before Stapler. MUST NOT contain commas or underscores.")
    after_pivot: float = Field(default=0.0, description="Projected value after Stapler. MUST NOT contain commas or underscores.")

class MarketingEngineOutput(BaseModel):
    target_audience: str = Field(default="General Audience", description="Specific demographic profile.")
    funnel_steps: List[str] = Field(default_factory=list, description="Steps in the marketing funnel.")
    pivot_strategy: str = Field(default="Pivot to better UX.", description="The exact pivot or positioning shift required to stop failing.")
    metrics_data: List[ProjectedMetrics] = Field(default_factory=list, description="Data points for a visual chart showing before/after comparison.")

class VideoReference(BaseModel):
    platform: str = Field(default="TikTok", description="Platform like TikTok or Instagram.")
    search_query: str = Field(default="SaaS ad", description="Search query to find vibe-matching videos.")
    example_url: str = Field(default="https://tiktok.com", description="A curated URL matching the vibe.")

class BrandArchitectOutput(BaseModel):
    typography_pairing: str = Field(default="Inter", description="e.g., 'Playfair Display (Serif) + Inter (Sans)' for a luxury feel.")
    color_palette: Dict[str, str] = Field(default_factory=dict, description="Primary, Secondary, Accent, and Background hex codes.")
    moodboard_vibe: str = Field(default="Modern and clean.", description="Description of the visual aesthetic (e.g., 'Dark Academia meets Cyberpunk').")
    photography_style: str = Field(default="High contrast.", description="Guidelines for imagery (e.g., 'High contrast, flash photography, raw candid').")

class AdCreativeOutput(BaseModel):
    hooks: List[str] = Field(default_factory=list, description="List of hooks for ads.")
    video_references: List[VideoReference] = Field(default_factory=list, description="Video reference queries and URLs.")

class UIPreviewOutput(BaseModel):
    react_component_string: str = Field(default="export default function App() { return <div>Generated Code Missing</div>; }", description="The complete React component code.")
    theme_colors: Dict[str, str] = Field(description="Dictionary of theme colors.")

class StaplerState(TypedDict):
    input_idea: str
    screenshot_b64: Optional[str]
    audit: AuditOutput
    marketing_engine: MarketingEngineOutput
    visual_identity: BrandArchitectOutput
    ad_creative: AdCreativeOutput
    live_code_preview: UIPreviewOutput
    critic_feedback: str
    code_valid: bool
    iterations: int
    error: str

# Instantiate Groq LLMs with Tiered Routing (Brev Credits bypassed)
os.environ["GROQ_API_KEY"] = os.getenv("GROQ_API_KEY", "")

# Heavy LLM: For complex reasoning and flawless code generation
heavy_llm = ChatGroq(
    model_name="openai/gpt-oss-120b",
    temperature=0.2,
    max_tokens=8000
)

# Vision LLM: Specifically for reading the screenshots
vision_llm = ChatGroq(
    model_name="openai/gpt-oss-120b",
    temperature=0.2
)

# Light LLM: For creative writing, roasting, and fast text generation
light_llm = ChatGroq(
    model_name="openai/gpt-oss-20b",
    temperature=0.8
)

# Nodes
def run_auditor(state: StaplerState):
    # 1. Live Reddit Sentiment & Competitor Deep-Dive via DDGS
    reddit_sentiment = ""
    competitors = ""
    try:
        ddgs = DDGS()
        clean_idea = state['input_idea'].split("Content Context")[0].strip()[:50]
        
        # Competitor Search
        comp_query = f"top alternatives to {clean_idea}" if "http" in clean_idea else f"competitors in {clean_idea} market"
        comp_results = ddgs.text(comp_query, max_results=2)
        if comp_results:
            competitors = "\nCompetitor Intel:\n" + "\n".join([f"- {r['title']}: {r['body']}" for r in comp_results])
            
        # Reddit Sentiment Search
        reddit_query = f"site:reddit.com {clean_idea} (complaints OR sucks OR pain points OR problem)"
        reddit_results = ddgs.text(reddit_query, max_results=3)
        if reddit_results:
            reddit_sentiment = "\nReddit Sentiment (Real Customer Complaints):\n" + "\n".join([f"- {r['body']}" for r in reddit_results])
    except Exception as e:
        print("DDGS Error during Auditor pre-flight:", e)

    # RAG INJECTION: Gold Standard & Mem0 Memory
    gold_standard = get_relevant_gold_standard(state['input_idea'])
    agent_memory = get_past_context()

    sys_prompt = "You are the Auditor, a brutal, anti-sycophantic business and UX reviewer. Your job is to DESTROY bad ideas and terrible UI/UX using REAL market data and competitor intel. Do not be polite. Identify 3 critical conversion-killing flaws.\n\nGOLD STANDARD EXAMPLE OF A ROAST (Do not copy, but match this tone):\n{gold_standard}"
    context_str = f"Business Context:\n{state['input_idea']}\n{competitors}\n{reddit_sentiment}\n{agent_memory}"
    
    if state.get("screenshot_b64"):
        # Use Heavy LLM for Vision
        msg = HumanMessage(content=[
            {"type": "text", "text": f"Here is the context:\n{context_str}\n\nRoast this screenshot and reference the competitor/Reddit data explicitly:"},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{state['screenshot_b64']}"}}
        ])
        try:
            llm_with_struct = vision_llm.with_structured_output(AuditOutput)
            rendered_sys_prompt = sys_prompt.format(gold_standard=gold_standard)
            res = llm_with_struct.invoke([SystemMessage(content=rendered_sys_prompt), msg])
            return {"audit": res}
        except Exception as e:
            print(f"Vision failed, falling back to text: {e}")
            pass

    # Standard Text-only audit (Fallback or no screenshot)
    prompt = ChatPromptTemplate.from_messages([
        ("system", sys_prompt),
        ("human", "Here is the context:\n{context}")
    ])
    try:
        chain = prompt | heavy_llm.with_structured_output(AuditOutput)
        res = chain.invoke({"context": context_str, "gold_standard": gold_standard})
        return {"audit": res}
    except Exception as e:
        return {"error": f"Auditor failed: {str(e)}"}

def run_strategist(state: StaplerState):
    if state.get("error"): return state
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are the Growth Strategist. Based on the auditor's roast, generate a highly-targeted audience matrix, actionable marketing funnel, a specific pivot strategy, and realistic before/after projected metrics for a chart."),
        ("human", "Auditor Roast:\n{roast}")
    ])
    try:
        chain = prompt | heavy_llm.with_structured_output(MarketingEngineOutput)
        res = chain.invoke({"roast": state["audit"].model_dump_json()})
        return {"marketing_engine": res}
    except Exception as e:
        return {"error": f"Strategist failed: {str(e)}"}

def run_brand_architect(state: StaplerState):
    if state.get("error"): return state
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are the Brand Architect. Your job is to invent a highly-converting, psychologically manipulative visual identity for this brand that matches the exact audience the Strategist defined."),
        ("human", "Strategist Output:\n{strategy}")
    ])
    try:
        chain = prompt | heavy_llm.with_structured_output(BrandArchitectOutput)
        res = chain.invoke({"strategy": state["marketing_engine"].model_dump_json()})
        return {"visual_identity": res}
    except Exception as e:
        return {"error": f"Brand Architect failed: {str(e)}"}

def run_media_buyer(state: StaplerState):
    if state.get("error"): return state
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are the Media Buyer. Generate TikTok/FB ad hooks and highly specific search query strings for video references based on the marketing funnel. Example search queries: 'aesthetic founder POV packing orders', 'brutal honesty skincare review'."),
        ("human", "Marketing Engine:\n{marketing}")
    ])
    try:
        chain = prompt | heavy_llm.with_structured_output(AdCreativeOutput)
        res = chain.invoke({"marketing": state["marketing_engine"].model_dump_json()})
        
        # LIVE SEARCH: Replace hallucinated URLs with real TikTok URLs using DDGS
        try:
            ddgs = DDGS()
            for ref in res.video_references:
                if "tiktok" in ref.platform.lower():
                    search_results = ddgs.text(f"site:tiktok.com inurl:video {ref.search_query}", max_results=1)
                    if search_results:
                        ref.example_url = search_results[0]['href']
        except Exception as e:
            print(f"DDGS Search failed for video references: {e}")
            pass
        
        return {"ad_creative": res}
    except Exception as e:
        return {"error": f"Media Buyer failed: {str(e)}"}

def run_ui_engineer(state: StaplerState):
    if state.get("error"): return state
    
    # 2. DESIGN.md Enforcement
    design_md = ""
    try:
        # Load DESIGN.md from backend root
        design_path = os.path.join(os.path.dirname(__file__), "..", "DESIGN.md")
        if os.path.exists(design_path):
            with open(design_path, "r") as f:
                design_md = f.read()
    except Exception as e:
        print(f"Could not load DESIGN.md: {e}")

    feedback = state.get("critic_feedback", "")
    feedback_prompt = f"Critic feedback to fix: {feedback}\n" if feedback else ""
    
    brand_identity = state.get("visual_identity")
    brand_context = "\nBRAND IDENTITY TO STRICTLY FOLLOW:\n{brand_identity_json}\n" if brand_identity else ""
    brand_identity_json = brand_identity.model_dump_json() if brand_identity else ""
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are the UI Engineer. Write a complete React component using Tailwind CSS to fix the identified UI/UX flaws. The code must be raw text, no markdown block wrappers.\n\nUse these high-converting blocks as reference:\n{component_library}\n\nCRITICAL DESIGN RULES (DESIGN.md):\n{design_md}\n" + brand_context),
        ("human", "Audit Fixes to Implement:\n{fixes}\n{feedback_prompt}")
    ])
    try:
        chain = prompt | heavy_llm.with_structured_output(UIPreviewOutput)
        res = chain.invoke({
            "fixes": state["audit"].ui_ux_fixes, 
            "feedback_prompt": feedback_prompt,
            "component_library": COMPONENT_LIBRARY,
            "design_md": design_md,
            "brand_identity_json": brand_identity_json
        })
        
        # Save to Mem0 to train the pipeline for future runs
        save_memory(state["input_idea"], state["audit"].ui_ux_fixes)
        
        return {"live_code_preview": res}
    except Exception as e:
        return {"error": f"UI Engineer failed: {str(e)}"}

def run_critic(state: StaplerState):
    if state.get("error"): return state
    
    preview = state.get("live_code_preview")
    if not preview:
        return {"code_valid": False, "iterations": state.get("iterations", 0) + 1, "critic_feedback": "Missing code preview output."}

    code = preview.react_component_string
    feedback = []
    
    if "```" in code:
        feedback.append("Code contains markdown wrapping. Remove ```react and ```.")
    
    if "export default" not in code and "export const" not in code:
        feedback.append("Code must contain an 'export default' or 'export const' component.")
        
    if feedback and state.get("iterations", 0) < 3:
        return {
            "critic_feedback": " ".join(feedback), 
            "code_valid": False, 
            "iterations": state.get("iterations", 0) + 1
        }
    else:
        clean_code = re.sub(r"^```[a-zA-Z]*\n?", "", code)
        clean_code = re.sub(r"```$", "", clean_code).strip()
        state["live_code_preview"].react_component_string = clean_code
        return {"code_valid": True, "live_code_preview": state["live_code_preview"]}

def critic_router(state: StaplerState):
    if state.get("error") or state.get("code_valid"):
        return "end"
    return "ui_engineer"

# Build Graph
builder = StateGraph(StaplerState)
builder.add_node("auditor", run_auditor)
builder.add_node("strategist", run_strategist)
builder.add_node("brand_architect", run_brand_architect)
builder.add_node("media_buyer", run_media_buyer)
builder.add_node("ui_engineer", run_ui_engineer)
builder.add_node("critic", run_critic)

builder.set_entry_point("auditor")
builder.add_edge("auditor", "strategist")
builder.add_edge("strategist", "brand_architect")
builder.add_edge("brand_architect", "media_buyer")
builder.add_edge("media_buyer", "ui_engineer")
builder.add_edge("ui_engineer", "critic")
builder.add_conditional_edges("critic", critic_router, {"end": END, "ui_engineer": "ui_engineer"})

stapler_graph = builder.compile()
