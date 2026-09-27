import os
import re
from typing import Dict, List, TypedDict, Optional
from pydantic import BaseModel, Field
from langgraph.graph import StateGraph, END
from langchain_core.prompts import ChatPromptTemplate

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
    messages: list  # Conversation history for the interviewer
    is_grill_satisfied: bool
    market_context: str
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

from langchain_openai import ChatOpenAI

# Use Ollama via OpenAI compatible endpoint
OLLAMA_URL = os.getenv("OLLAMA_BASE_URL", "http://global.prd.ga.run.brev.nvidia.com:44205/v1")

# Heavy LLM: For complex reasoning and flawless code generation (NVIDIA Nemotron via Ollama)
heavy_llm = ChatOpenAI(
    model_name="my_custom_model",
    temperature=0.2,
    max_tokens=8000,
    base_url=OLLAMA_URL,
    api_key="ollama" # placeholder required for openai client
)

# Vision LLM: Specifically for reading the screenshots (Llama 3.2 Vision via Ollama)
vision_llm = ChatOpenAI(
    model_name="llama3.2-vision",
    temperature=0.2,
    base_url=OLLAMA_URL,
    api_key="ollama"
)

# Light LLM: For creative writing, roasting, and fast text generation (Llama 3.1 8B via Ollama)
light_llm = ChatOpenAI(
    model_name="llama3.1",
    temperature=0.8,
    base_url=OLLAMA_URL,
    api_key="ollama"
)

# Nodes
from langgraph.types import interrupt
from langchain_core.messages import AIMessage

def run_interviewer(state: StaplerState):
    if state.get("error"): return state
    
    if state.get("is_grill_satisfied"):
        return state

    market_context = ""

    sys_prompt = (
        "You are an analytical and honest business partner helping the user refine their product/service idea.\n"
        "Your goal is to politely interrogate them until you understand exactly what they want to build or sell.\n\n"
        "INSTRUCTIONS:\n"
        "1. Write out your response naturally in Markdown.\n"
        "2. Ask 1-2 clarifying questions to narrow down their niche, target market, or budget.\n"
        "3. You MUST suggest 2-3 specific popular products/models as examples with estimated prices.\n"
        "4. If Reference Images are provided below, use those URLs exactly. If not, you MUST use REAL photos from the internet using: `![Product](https://loremflickr.com/320/240/{keyword})` where keyword is a single word like 'laptop' or 'dress'. DO NOT use pollinations or AI generation.\n"
        "5. If the user has provided enough solid details (exact niche, region, budget) and you are ready to proceed, append the exact text `<CONFIRMED>` to the very end of your response.\n\n"
        "EXAMPLE OUTPUT:\n"
        "That's an exciting idea! Selling hardware is a huge market. To give you the best strategy, I need to know a bit more about your focus.\n\n"
        "**Here are some popular options to consider:**\n"
        "- **NVIDIA RTX 4090** (Est. $1,599) - High-end gaming market.\n"
        "  ![NVIDIA RTX 4090](https://loremflickr.com/320/240/gpu)\n"
        "- **Intel Core i9-14900K** (Est. $589) - Premium workstation builds.\n"
        "  ![Intel Core i9](https://loremflickr.com/320/240/cpu)\n\n"
        "**To help us get started:**\n"
        "1. Are you targeting budget gamers, or high-end professionals?\n"
        "2. Do you plan to sell globally online, or in a specific region?\n\n"
        f"--- MARKET DATA & REFERENCE IMAGES ---\n{market_context}\n--------------------------------------\n"
    )
    
    messages = [SystemMessage(content=sys_prompt)]
    if state.get("messages"):
        messages.extend(state["messages"])
    else:
        messages.append(HumanMessage(content=f"My idea is: {state['input_idea']}"))

    try:
        res = heavy_llm.invoke(messages)
        full_response = res.content
        is_satisfied = "<CONFIRMED>" in full_response
        clean_response = full_response.replace("<CONFIRMED>", "").strip()
        
        new_msgs = state.get("messages", []) + [AIMessage(content=clean_response)]
        return {
            "messages": new_msgs,
            "is_grill_satisfied": is_satisfied,
            "market_context": market_context
        }
    except Exception as e:
        return {"error": f"Interviewer failed: {str(e)}"}

def interviewer_router(state: StaplerState):
    if state.get("error"): return "end"
    if state.get("is_grill_satisfied"):
        return "auditor"
    return "human_input"

def human_input(state: StaplerState):
    # Pause and ask the human for input.
    # The value passed to interrupt is returned to the user API.
    last_msg = state["messages"][-1].content if state.get("messages") else "Please provide more details."
    user_reply = interrupt(last_msg)
    new_msgs = state.get("messages", []) + [HumanMessage(content=user_reply)]
    return {"messages": new_msgs}
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

    sys_prompt = "You are the Auditor, a brutal, anti-sycophantic business and UX reviewer. Your job is to DESTROY bad ideas and terrible UI/UX using REAL market data and competitor intel. Do not be polite. Identify 3 critical conversion-killing flaws.\n\nGOLD STANDARD EXAMPLE OF A ROAST (Do not copy, but match this tone):\n{gold_standard}\n\nCRITICAL: You MUST output ONLY valid JSON matching this schema:\n{format_instructions}"
    context_str = f"Business Context:\n{state['input_idea']}\n{competitors}\n{reddit_sentiment}\n{agent_memory}"
    
    from langchain_core.output_parsers import JsonOutputParser
    parser = JsonOutputParser(pydantic_object=AuditOutput)

    if state.get("screenshot_b64"):
        # Use Heavy LLM for Vision
        msg = HumanMessage(content=[
            {"type": "text", "text": f"Here is the context:\n{context_str}\n\nRoast this screenshot and reference the competitor/Reddit data explicitly:"},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{state['screenshot_b64']}"}}
        ])
        try:
            rendered_sys_prompt = sys_prompt.format(gold_standard=gold_standard, format_instructions=parser.get_format_instructions())
            res_content = vision_llm.invoke([SystemMessage(content=rendered_sys_prompt), msg])
            res = parser.invoke(res_content)
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
        chain = prompt | heavy_llm | parser
        res = chain.invoke({"context": context_str, "gold_standard": gold_standard, "format_instructions": parser.get_format_instructions()})
        return {"audit": AuditOutput(**res) if isinstance(res, dict) else res}
    except Exception as e:
        return {"error": f"Auditor failed: {str(e)}"}

def run_strategist(state: StaplerState):
    if state.get("error"): return state
    from langchain_core.output_parsers import JsonOutputParser
    parser = JsonOutputParser(pydantic_object=MarketingEngineOutput)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are the Growth Strategist. Based on the auditor's roast, generate a highly-targeted audience matrix, actionable marketing funnel, a specific pivot strategy, and realistic before/after projected metrics for a chart.\n\nCRITICAL: You MUST output ONLY valid JSON matching this schema:\n{format_instructions}"),
        ("human", "Auditor Roast:\n{roast}")
    ])
    try:
        chain = prompt | heavy_llm | parser
        audit_json = state["audit"].model_dump_json() if hasattr(state["audit"], "model_dump_json") else str(state["audit"])
        res = chain.invoke({"roast": audit_json, "format_instructions": parser.get_format_instructions()})
        return {"marketing_engine": MarketingEngineOutput(**res) if isinstance(res, dict) else res}
    except Exception as e:
        return {"error": f"Strategist failed: {str(e)}"}

def run_brand_architect(state: StaplerState):
    if state.get("error"): return state
    from langchain_core.output_parsers import JsonOutputParser
    parser = JsonOutputParser(pydantic_object=BrandArchitectOutput)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are the Brand Architect. Your job is to invent a highly-converting, psychologically manipulative visual identity for this brand that matches the exact audience the Strategist defined.\n\nCRITICAL: You MUST output ONLY valid JSON matching this schema:\n{format_instructions}"),
        ("human", "Strategist Output:\n{strategy}")
    ])
    try:
        chain = prompt | heavy_llm | parser
        strat_json = state["marketing_engine"].model_dump_json() if hasattr(state["marketing_engine"], "model_dump_json") else str(state["marketing_engine"])
        res = chain.invoke({"strategy": strat_json, "format_instructions": parser.get_format_instructions()})
        return {"visual_identity": BrandArchitectOutput(**res) if isinstance(res, dict) else res}
    except Exception as e:
        return {"error": f"Brand Architect failed: {str(e)}"}

def run_media_buyer(state: StaplerState):
    if state.get("error"): return state
    from langchain_core.output_parsers import JsonOutputParser
    parser = JsonOutputParser(pydantic_object=AdCreativeOutput)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are the Media Buyer. Generate TikTok/FB ad hooks and highly specific search query strings for video references based on the marketing funnel. Example search queries: 'aesthetic founder POV packing orders', 'brutal honesty skincare review'.\n\nCRITICAL: You MUST output ONLY valid JSON matching this schema:\n{format_instructions}"),
        ("human", "Marketing Engine:\n{marketing}")
    ])
    try:
        chain = prompt | heavy_llm | parser
        strat_json = state["marketing_engine"].model_dump_json() if hasattr(state["marketing_engine"], "model_dump_json") else str(state["marketing_engine"])
        res = chain.invoke({"marketing": strat_json, "format_instructions": parser.get_format_instructions()})
        ad_obj = AdCreativeOutput(**res) if isinstance(res, dict) else res
        
        # LIVE SEARCH: Replace hallucinated URLs with real TikTok URLs using DDGS
        try:
            ddgs = DDGS()
            for ref in ad_obj.video_references:
                if "tiktok" in ref.platform.lower():
                    search_results = ddgs.text(f"site:tiktok.com inurl:video {ref.search_query}", max_results=1)
                    if search_results:
                        ref.example_url = search_results[0]['href']
        except Exception as e:
            print(f"DDGS Search failed for video references: {e}")
            pass
        
        return {"ad_creative": ad_obj}
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
    brand_identity_json = brand_identity.model_dump_json() if hasattr(brand_identity, "model_dump_json") else str(brand_identity)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are the UI Engineer. Write a complete React component using Tailwind CSS to fix the identified UI/UX flaws. The code must be raw text inside a ```tsx ... ``` markdown block. Do not use JSON. Just write the code.\n\nUse these high-converting blocks as reference:\n{component_library}\n\nCRITICAL DESIGN RULES (DESIGN.md):\n{design_md}\n" + brand_context),
        ("human", "Audit Fixes to Implement:\n{fixes}\n{feedback_prompt}")
    ])
    try:
        audit_fixes = state["audit"].ui_ux_fixes if hasattr(state["audit"], "ui_ux_fixes") else state["audit"].get("ui_ux_fixes", "")
        chain = prompt | heavy_llm
        res = chain.invoke({
            "fixes": audit_fixes, 
            "feedback_prompt": feedback_prompt,
            "component_library": COMPONENT_LIBRARY,
            "design_md": design_md,
            "brand_identity_json": brand_identity_json
        })
        
        # Save to Mem0 to train the pipeline for future runs
        save_memory(state["input_idea"], audit_fixes)
        
        # Extract code from markdown block
        import re
        code_match = re.search(r"```(?:tsx|jsx|javascript|typescript|react)?\n([\s\S]*?)```", res.content)
        code_str = code_match.group(1).strip() if code_match else res.content.strip()
        
        # Fake theme colors for now since we aren't parsing JSON
        ui_obj = UIPreviewOutput(react_component_string=code_str, theme_colors={"primary": "#000000"})
        return {"live_code_preview": ui_obj}
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
from langgraph.checkpoint.memory import MemorySaver

builder = StateGraph(StaplerState)
builder.add_node("interviewer", run_interviewer)
builder.add_node("human_input", human_input)
builder.add_node("auditor", run_auditor)
builder.add_node("strategist", run_strategist)
builder.add_node("brand_architect", run_brand_architect)
builder.add_node("media_buyer", run_media_buyer)
builder.add_node("ui_engineer", run_ui_engineer)
builder.add_node("critic", run_critic)

builder.set_entry_point("interviewer")
builder.add_conditional_edges("interviewer", interviewer_router, {"end": END, "auditor": "auditor", "human_input": "human_input"})
builder.add_edge("human_input", "interviewer")
builder.add_edge("auditor", "strategist")
builder.add_edge("strategist", "brand_architect")
builder.add_edge("brand_architect", "media_buyer")
builder.add_edge("media_buyer", "ui_engineer")
builder.add_edge("ui_engineer", "critic")
builder.add_conditional_edges("critic", critic_router, {"end": END, "ui_engineer": "ui_engineer"})

memory = MemorySaver()
stapler_graph = builder.compile(checkpointer=memory)
