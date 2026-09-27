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
OLLAMA_URL = os.getenv("OLLAMA_BASE_URL", "https://11434-8vc6ljf6f.gobrev.dev/v1")

# Heavy LLM: For complex reasoning and flawless code generation (NVIDIA Nemotron via Ollama)
heavy_llm = ChatOpenAI(
    model_name="nemotron",
    temperature=0.2,
    max_tokens=8000,
    base_url=OLLAMA_URL,
    api_key="ollama", # placeholder required for openai client
    timeout=300,
    max_retries=3
)

# Vision LLM: Specifically for reading the screenshots (Llama 3.2 Vision via Ollama)
vision_llm = ChatOpenAI(
    model_name="llama3.2-vision",
    temperature=0.2,
    base_url=OLLAMA_URL,
    api_key="ollama",
    timeout=300,
    max_retries=3
)

# Light LLM: For creative writing, roasting, and fast text generation (Llama 3.1 8B via Ollama)
light_llm = ChatOpenAI(
    model_name="llama3.1",
    temperature=0.8,
    base_url=OLLAMA_URL,
    api_key="ollama",
    timeout=300,
    max_retries=3
)

# Nodes
from langgraph.types import interrupt
from langchain_core.messages import AIMessage

def run_interviewer(state: StaplerState):
    if state.get("error"): return state
    
    if state.get("is_grill_satisfied"):
        return state

    if state.get("messages") and state["messages"][-1].content.strip() == "FORCE_GENERATE":
        return {"is_grill_satisfied": True}

    market_context = ""

    sys_prompt = (
        "You are a brutally honest, highly critical venture capitalist and business partner.\n"
        "Your goal is to ARGUE with the user's idea, challenge their assumptions, and provide specific PROS and CONS for their concept before moving forward.\n\n"
        "INSTRUCTIONS:\n"
        "1. Write out your response naturally in Markdown.\n"
        "2. Start by giving 2 PROS and 2 CONS of their specific idea. Be realistic and critical.\n"
        "3. Ask 1-2 difficult, challenging questions to test if they have actually thought this through (e.g., budget, competition, logistics).\n"
        "4. You MUST suggest 2-3 specific popular products/models as examples with estimated prices.\n"
        "5. You MUST use REAL photos from the internet to illustrate your examples. Construct the URL like this: `![Product Name](https://loremflickr.com/320/240/keyword1,keyword2)` CRITICAL: Do NOT forget the `(url)` part of the markdown tag!\n"
        "6. If the user has survived your grilling and provided solid defenses (exact niche, region, budget), append the exact text `<CONFIRMED>` to the very end of your response.\n\n"
        "EXAMPLE OUTPUT:\n"
        "So you want to sell hardware. Let's be real—this is a brutal, low-margin industry.\n\n"
        "**PROS:** High demand, evergreen market, clear upgrade cycles.\n"
        "**CONS:** Massive supply chain risk, terrible profit margins, giants like Amazon will crush you on shipping.\n\n"
        "**Here is what you're competing against:**\n"
        "- **NVIDIA RTX 4090** (Est. $1,599) - High-end gaming market.\n"
        "  ![NVIDIA RTX 4090](https://loremflickr.com/320/240/gpu)\n"
        "- **Intel Core i9-14900K** (Est. $589) - Premium workstation builds.\n"
        "  ![Intel Core i9](https://loremflickr.com/320/240/cpu)\n\n"
        "**My Questions for You:**\n"
        "1. How are you going to acquire customers cheaper than established retailers?\n"
        "2. What is your actual starting budget for inventory?\n\n"
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
        
        # Force the AI to argue at least once!
        if not state.get("messages"):
            is_satisfied = False
            
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
    # Skip live DDGS search to prevent 403 Ratelimit hanging
    reddit_sentiment = ""
    competitors = ""

    # RAG INJECTION: Gold Standard & Mem0 Memory
    gold_standard = get_relevant_gold_standard(state['input_idea'])
    agent_memory = get_past_context()

    sys_prompt = "You are the Auditor, a brutal, anti-sycophantic business and UX reviewer. Your job is to DESTROY bad ideas and terrible UI/UX using REAL market data and competitor intel. Do not be polite. Identify 3 critical conversion-killing flaws.\n\nGOLD STANDARD EXAMPLE OF A ROAST (Do not copy, but match this tone):\n{gold_standard}\n\nCRITICAL: You MUST output ONLY valid JSON matching this schema:\n{format_instructions}\nDO NOT add comments, explanations, or any text inside or outside the JSON block. No markdown formatting. Just the raw JSON object."
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
        print(f"Auditor warning: {e}")
        fallback = AuditOutput(roast_points=[f"Parse Error: {str(e)}", "Please try a slightly different prompt."], ui_ux_fixes="Backend parse error. Refresh and try again.")
        return {"audit": fallback}

def run_strategist(state: StaplerState):
    if state.get("error"): return state
    from langchain_core.output_parsers import JsonOutputParser
    parser = JsonOutputParser(pydantic_object=MarketingEngineOutput)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are the Growth Strategist. Based on the auditor's roast, generate a highly-targeted audience matrix, actionable marketing funnel, a specific pivot strategy, and realistic before/after projected metrics for a chart.\n\nCRITICAL: You MUST output ONLY valid JSON matching this schema:\n{format_instructions}\nDO NOT add comments, explanations, or any text inside or outside the JSON block. No markdown formatting. Just the raw JSON object."),
        ("human", "Auditor Roast:\n{roast}")
    ])
    try:
        chain = prompt | heavy_llm | parser
        audit_json = state["audit"].model_dump_json() if hasattr(state["audit"], "model_dump_json") else str(state["audit"])
        res = chain.invoke({"roast": audit_json, "format_instructions": parser.get_format_instructions()})
        return {"marketing_engine": MarketingEngineOutput(**res) if isinstance(res, dict) else res}
    except Exception as e:
        print(f"Strategist warning: {e}")
        fallback = MarketingEngineOutput(target_audience="Error Parsing", funnel_steps=["Error"], pivot_strategy=str(e), metrics_data=[])
        return {"marketing_engine": fallback}

def run_brand_architect(state: StaplerState):
    if state.get("error"): return state
    from langchain_core.output_parsers import JsonOutputParser
    parser = JsonOutputParser(pydantic_object=BrandArchitectOutput)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are the Brand Architect. Your job is to invent a highly-converting, psychologically manipulative visual identity for this brand that matches the exact audience the Strategist defined.\n\nCRITICAL: You MUST output ONLY valid JSON matching this schema:\n{format_instructions}\nDO NOT add comments, explanations, or any text inside or outside the JSON block. No markdown formatting. Just the raw JSON object."),
        ("human", "Strategist Output:\n{strategy}")
    ])
    try:
        chain = prompt | heavy_llm | parser
        strat_json = state["marketing_engine"].model_dump_json() if hasattr(state["marketing_engine"], "model_dump_json") else str(state["marketing_engine"])
        res = chain.invoke({"strategy": strat_json, "format_instructions": parser.get_format_instructions()})
        return {"visual_identity": BrandArchitectOutput(**res) if isinstance(res, dict) else res}
    except Exception as e:
        print(f"Brand Architect warning: {e}")
        fallback = BrandArchitectOutput(typography_pairing="Parse Error", moodboard_vibe=str(e), photography_style="Error")
        return {"visual_identity": fallback}

def run_media_buyer(state: StaplerState):
    if state.get("error"): return state
    from langchain_core.output_parsers import JsonOutputParser
    parser = JsonOutputParser(pydantic_object=AdCreativeOutput)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are the Media Buyer. Generate TikTok/FB ad hooks and highly specific search query strings for video references based on the marketing funnel. Example search queries: 'aesthetic founder POV packing orders', 'brutal honesty skincare review'.\n\nCRITICAL: You MUST output ONLY valid JSON matching this schema:\n{format_instructions}\nDO NOT add comments, explanations, or any text inside or outside the JSON block. No markdown formatting. Just the raw JSON object."),
        ("human", "Marketing Engine:\n{marketing}")
    ])
    try:
        chain = prompt | heavy_llm | parser
        strat_json = state["marketing_engine"].model_dump_json() if hasattr(state["marketing_engine"], "model_dump_json") else str(state["marketing_engine"])
        res = chain.invoke({"marketing": strat_json, "format_instructions": parser.get_format_instructions()})
        ad_obj = AdCreativeOutput(**res) if isinstance(res, dict) else res
        
        # Removed LIVE SEARCH to prevent DDGS hanging
        return {"ad_creative": ad_obj}
    except Exception as e:
        print(f"Media Buyer warning: {e}")
        fallback = AdCreativeOutput(hooks=[f"Error: {str(e)}"], video_references=[])
        return {"ad_creative": fallback}

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
        ("system", "You are the UI Engineer. Write a complete React component using Tailwind CSS to fix the identified UI/UX flaws. The code must be raw text inside a ```tsx ... ``` markdown block. Do not use JSON. Just write the code.\n\nUse these high-converting blocks as reference:\n{component_library}\n\nCRITICAL DESIGN RULES (DESIGN.md):\n{design_md}\n" + brand_context + "\n\nCRITICAL IMAGE RULE: YOU MUST NOT USE PLACEHOLDERS. YOU MUST USE REAL PHOTOS FROM THE INTERNET. Use 'https://loremflickr.com/800/600/YOUR_KEYWORD' as the src for all images so they populate with real photography."),
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
