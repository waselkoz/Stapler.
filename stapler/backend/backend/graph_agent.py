import asyncio
import json
import time
import re
from typing import TypedDict, Annotated, List, Dict, Any
import operator

from langgraph.graph import StateGraph, END

from backend.scraper import scrape_website
from backend.tools import run_all_tools
from backend.agents import (
    run_strategist, run_marketing_analyst, run_branding, run_designer,
    run_developer, run_developer_tinykit, run_developer_fix, run_qa,
    run_logo_agent, run_chart_agent
)
# Define the state of our graph

# Define the state of our graph

def _safe_update_db(state_id, step, data):
    from backend.state import load_state, save_state, update_state
    db_state = load_state(state_id)
    if db_state:
        update_state(db_state, step, data)
        save_state(db_state)

class AgentState(TypedDict):
    url: str
    html: str
    tool_data: dict
    strategy: str
    marketing: str
    branding: str
    design: str
    logos: str
    charts: str
    code: str
    qa: str
    qa_passed: bool
    iterations: int
    error: str
    use_tinykit: bool
    state_id: str
    past_context: str

# Define nodes
async def setup_node(state: AgentState):
    print("[GRAPH] Running setup_node")
    url = state["url"]
    
    from backend.api import create_state, save_state, _load_memory, _get_relevant_memory
    
    # Initialize DB state
    db_state = create_state(url=url)
    save_state(db_state)
    state_id = db_state["id"]
    
    # Load memory
    memory = await asyncio.to_thread(_load_memory)
    past_context = _get_relevant_memory(url, memory)
    
    return {"state_id": state_id, "past_context": past_context}

async def scraper_node(state: AgentState):
    print("[GRAPH] Running scraper_node")
    url = state["url"]
    if not url.startswith("http"):
        url = "https://" + url
    
    try:
        result = await asyncio.wait_for(scrape_website(url), timeout=90)
        html = result.get("html", "")
        return {"html": html, "url": url}
    except Exception as e:
        return {"error": f"Scrape failed: {str(e)}"}

async def tools_node(state: AgentState):
    print("[GRAPH] Running tools_node")
    if state.get("error"): return state
    html = state.get("html", "")
    if not html: return {"error": "No HTML to analyze"}
    
    try:
        tool_data = await asyncio.to_thread(run_all_tools, html)
        return {"tool_data": tool_data}
    except Exception as e:
        return {"tool_data": {}, "error": f"Tools failed: {str(e)}"}

async def strategist_node(state: AgentState):
    print("[GRAPH] Running strategist_node")
    if state.get("error"): return state
    
    from backend.api import _extract_core
    
    core = _extract_core(state["html"])
    prompt = f"URL: {state['url']}\n{core}" if core else f"Business: {state['url']}"
    
    tool_context = ""
    tool_data = state.get("tool_data", {})
    if tool_data:
        if tool_data.get("colors_from_screenshot"):
            colors_str = ", ".join(f"{c.get('hex', 'N/A')} ({round(c.get('frequency', 0) * 100)}%)" for c in tool_data["colors_from_screenshot"] if c.get("hex"))
            tool_context += f"\n\nDETECTED COLORS (from screenshot): {colors_str}"
        if tool_data.get("colors_from_html"):
            css_colors = [c["value"] for c in tool_data["colors_from_html"][:10]]
            tool_context += f"\nCSS COLORS: {', '.join(css_colors)}"
        if tool_data.get("ctas_detected"):
            cta_list = [f'"{c["text"]}" ({c["tag"]}, href={c["href"]})' for c in tool_data["ctas_detected"][:8]]
            tool_context += f"\n\nDETECTED CTAs: {'; '.join(cta_list)}"
        if tool_data.get("text_sentiment") and not tool_data["text_sentiment"].get("error"):
            s = tool_data["text_sentiment"]
            tool_context += f"\n\nTEXT SENTIMENT: compound={s.get('compound', 0)}, label={s.get('label', 'neutral')}"
        if tool_data.get("emotional_dimensions") and not tool_data["emotional_dimensions"].get("error"):
            e = tool_data["emotional_dimensions"]
            for dim in ["luxury", "trust", "confidence", "innovation"]:
                if dim in e:
                    tool_context += f"\n{dim.upper()}: score={e[dim].get('score', '?')}/10, keywords={e[dim].get('keywords_found', [])[:3]}"
        if tool_data.get("accessibility"):
            a = tool_data["accessibility"]
            tool_context += f"\n\nACCESSIBILITY: score={a.get('score', '?')}/100, issues={a.get('issues_count', 0)}"
        if tool_data.get("heatmap_zones"):
            tool_context += "\n\nHEATMAP ZONES:"
            for z in tool_data["heatmap_zones"]:
                tool_context += f"\n- {z['zone']}: {z['attention']} attention ({z['elements']} elements)"
    
    if tool_context:
        prompt += f"\n\nANALYSIS TOOL DATA:\n{tool_context}"
        
    if state.get("past_context"):
        prompt += f"\n\nPREVIOUS ANALYSIS LESSONS:\n{state['past_context']}"
        
    try:
        strategy = await asyncio.to_thread(run_strategist, prompt)
        
        if state.get("state_id"):
            _safe_update_db(state["state_id"], "strategy", {"done": True, "summary": strategy[:500]})
            
        return {"strategy": strategy}
    except Exception as e:
        return {"error": f"Strategist failed: {str(e)}"}

async def marketing_node(state: AgentState):
    print("[GRAPH] Running marketing_node")
    if state.get("error"): return state

    strategy = state.get("strategy", "")
    prompt = f"URL: {state['url']}\n\nStrategy analysis:\n{strategy[:4000]}"
    tool_data = state.get("tool_data", {})
    if tool_data:
        ctx = ""
        if tool_data.get("colors_from_screenshot"):
            ctx += f"\nColors: {', '.join(c.get('hex','?') for c in tool_data['colors_from_screenshot'][:5])}"
        if tool_data.get("ctas_detected"):
            ctx += f"\nCTAs: {', '.join(c['text'] for c in tool_data['ctas_detected'][:5])}"
        if ctx:
            prompt += f"\n\nTOOL DATA:\n{ctx}"
    try:
        marketing = await asyncio.to_thread(run_marketing_analyst, prompt)
        if state.get("state_id"):
            _safe_update_db(state["state_id"], "marketing", {"done": True, "summary": marketing[:500]})
        return {"marketing": marketing}
    except Exception as e:
        return {"marketing": "", "error": f"Marketing failed: {str(e)}"}


async def logo_node(state: AgentState):
    print("[GRAPH] Running logo_node")
    if state.get("error"): return state
    branding = state.get("branding", "")
    strategy = state.get("strategy", "")
    prompt = f"URL: {state['url']}\n\nBrand Identity:\n{branding[:3000]}\n\nStrategy:\n{strategy[:2000]}"
    try:
        logos = await asyncio.to_thread(run_logo_agent, prompt)
        if state.get("state_id"):
            _safe_update_db(state["state_id"], "logos", {"done": True})
        return {"logos": logos}
    except Exception as e:
        return {"logos": "", "error": f"Logo agent failed: {str(e)}"}


async def chart_node(state: AgentState):
    print("[GRAPH] Running chart_node")
    if state.get("error"): return state
    strategy = state.get("strategy", "")
    marketing = state.get("marketing", "")
    prompt = f"URL: {state['url']}\n\nStrategy:\n{strategy[:3000]}\n\nMarketing Analysis:\n{marketing[:3000]}"
    try:
        charts = await asyncio.to_thread(run_chart_agent, prompt)
        if state.get("state_id"):
            _safe_update_db(state["state_id"], "charts", {"done": True})
        return {"charts": charts}
    except Exception as e:
        return {"charts": "", "error": f"Chart agent failed: {str(e)}"}


async def branding_node(state: AgentState):
    print("[GRAPH] Running branding_node")
    if state.get("error"): return state
    
    prompt = f"URL: {state['url']}\n\nBusiness context:\n{state.get('strategy', '')[:3000]}"
    
    tool_data = state.get("tool_data", {})
    if tool_data and tool_data.get("colors_from_screenshot"):
        colors = tool_data["colors_from_screenshot"][:5]
        prompt += f"\n\nCurrent site colors: {', '.join(c.get('hex', '?') for c in colors if c.get('hex'))}"
    
    try:
        branding = await asyncio.to_thread(run_branding, prompt)
        if state.get("state_id"):
            
            _safe_update_db(state["state_id"], "branding", {"done": True})
        return {"branding": branding}
    except Exception as e:
        return {"branding": "", "error": f"Branding failed: {str(e)}"}

async def designer_node(state: AgentState):
    print("[GRAPH] Running designer_node")
    if state.get("error"): return state
    
    strategy = state.get("strategy", "")
    design_sections = []
    for section_name in ["Visual Direction", "Current Site Audit", "Quick Wins", "Business Overview"]:
        match = re.search(rf'##\s*{section_name}[\s\S]*?(?=##\s*(?:Visual|Current|Quick|Business|Top|SWOT|Porter|Customer)|$)', strategy, re.I)
        if match:
            design_sections.append(match.group(0).strip()[:1500])
    design_input = "\n\n".join(design_sections) if design_sections else strategy[:3000]

    visual_ctx = ""
    tool_data = state.get("tool_data", {})
    if tool_data:
        if tool_data.get("colors_from_screenshot"):
            top_colors = tool_data["colors_from_screenshot"][:5]
            visual_ctx += "\n\nVISUAL LAYOUT FROM SCREENSHOT:\n"
            visual_ctx += f"Top colors: {', '.join(c.get('hex', '?') for c in top_colors if c.get('hex'))}\n"
        if tool_data.get("heatmap_zones"):
            visual_ctx += "Attention zones: " + ", ".join(
                f"{z['zone']}({z['attention']})" for z in tool_data["heatmap_zones"]
            ) + "\n"
        if tool_data.get("accessibility"):
            visual_ctx += f"Accessibility score: {tool_data['accessibility'].get('score', '?')}/100\n"
    
    from backend.api import _extract_core
    core = _extract_core(state["html"])
    prompt = f"Strategy (design-relevant parts):\n{design_input}\n\nBrand Identity:\n{state.get('branding', '')}\n\nCurrent site HTML:\n{core}\n{visual_ctx}"
    
    try:
        design = await asyncio.to_thread(run_designer, prompt)
        if state.get("state_id"):
            _safe_update_db(state["state_id"], "design", {"done": True})
        return {"design": design}
    except Exception as e:
        return {"error": f"Designer failed: {str(e)}"}

async def developer_node(state: AgentState):
    print("[GRAPH] Running developer_node")
    if state.get("error"): return state
    
    iterations = state.get("iterations", 0)
    
    def run_developer_tinykit(prompt: str) -> str:
        """Bypass TinyKit/PocketBase — use OpenCode directly."""
        print("[DEVELOPER-TINYKIT (Bypassing PB)]", flush=True)
        return run_developer(prompt)
    
    def _run_dev(p):
        use_tinykit = state.get("use_tinykit", False)
        if use_tinykit:
            return run_developer_tinykit(p)
        return run_developer(p)
    
    def _run_dev_fix(p):
        use_tinykit = state.get("use_tinykit", False)
        if use_tinykit:
            return run_developer_tinykit(p)
        return run_developer_fix(p)
    
    if iterations == 0:
        aesthetic_directive = (
            "\n\nCRITICAL AESTHETIC & UI INSTRUCTIONS:\n"
            "You MUST create an extremely premium, state-of-the-art design that WOWs the user.\n"
            "- Extract and strictly apply the exact color palette defined in the Brand Identity.\n"
            "- Do NOT use generic layouts. Use rich, curated designs (e.g., sleek dark modes, glassmorphism, dynamic grid layouts).\n"
            "- Use smooth hover effects, micro-interactions, and transition animations (e.g., `transition-all duration-300`, `hover:scale-105`, `hover:-translate-y-1`, `animate-pulse`).\n"
            "- The interface must feel alive and dynamic. Apply entrance animations to sections.\n"
            "- Use elegant shadows (`shadow-xl`, `shadow-indigo-500/20`), rounded corners (`rounded-2xl`), and modern typography.\n"
        )
        # Truncate aggressively to avoid 413 on Groq (8k token limit)
        strategy_txt = (state.get('strategy') or '')[:4000]
        branding_txt = (state.get('branding') or '')[:3000]
        design_txt   = (state.get('design')   or '')[:3000]
        from backend.api import _extract_core
        core_html    = _extract_core(state.get('html') or '')
        html_txt     = core_html[:40000] if core_html else (state.get('html') or '')[:40000]
        prompt = f"Strategy:\n{strategy_txt}\n\nBrand Identity (COLORS to use):\n{branding_txt}\n\nDesign Blueprint:\n{design_txt}\n\nOriginal HTML:\n{html_txt}{aesthetic_directive}"
        if state.get("past_context"):
            prompt += f"\n\nLESSONS FROM PREVIOUS RUNS (avoid these mistakes):\n{state['past_context']}"
            
        try:
            code = await asyncio.to_thread(_run_dev, prompt)
                
            from backend.api import validate_code, sanitize_output
            code_check = validate_code(code)
            if not code_check:
                print(f"[GRAPH] Developer output rejected: {code_check}")
                code = sanitize_output(code)
                print("[GRAPH] Sanitized developer output")
                
            if state.get("state_id"):
                _safe_update_db(state["state_id"], "developer", {"done": True, "code_length": len(code)})
                
            return {"code": code, "iterations": iterations + 1}
        except Exception as e:
            return {"error": f"Developer failed: {str(e)}"}
    else:
        aesthetic_directive = (
            "\n\nCRITICAL FIX INSTRUCTIONS:\n"
            "1. You MUST apply all the QA fixes requested above.\n"
            "2. Maintain the extremely premium aesthetic design. Ensure the exact color palette is applied and smooth hover/transition animations remain intact.\n"
            "3. You MUST output the ENTIRE completely rewritten HTML file from top to bottom. Do not truncate or skip parts.\n"
            "4. You MUST wrap your output in the exact same format as before:\n\n"
            "===PAGE: index.html===\n"
            "<!DOCTYPE html>\n<html>...</html>\n"
            "===END PAGE===\n\n"
            "DO NOT write conversational text like 'Here are the fixes'. ONLY output the page blocks."
        )
        prompt = f"QA Feedback - Fix these issues:\n{state.get('qa', '')}\n\nCurrent code:\n{state.get('code', '')}{aesthetic_directive}"
        try:
            code = await asyncio.to_thread(_run_dev_fix, prompt)
                
            from backend.api import validate_code, sanitize_output
            code_check = validate_code(code)
            if not code_check:
                code = sanitize_output(code)
                
            return {"code": code, "iterations": iterations + 1}
        except Exception as e:
            return {"error": f"Developer fix failed: {str(e)}"}

async def qa_node(state: AgentState):
    print("[GRAPH] Running qa_node")
    if state.get("error"): return state
    
    prompt = f"Design:\n{state.get('design', '')[:1500]}\n\nCode:\n{state.get('code', '')[:2000]}"
    try:
        qa = await asyncio.to_thread(run_qa, prompt)
        qa_passed = "APPROVED" in qa.upper()
        return {"qa": qa, "qa_passed": qa_passed}
    except Exception as e:
        return {"error": f"QA failed: {str(e)}", "qa_passed": False}

async def memory_record_node(state: AgentState):
    print("[GRAPH] Running memory_record_node")
    if state.get("error"): return state
    
    from backend.api import _load_memory, _record_analysis
    # Record to memory for future learning
    try:
        memory = await asyncio.to_thread(_load_memory)
        await asyncio.to_thread(_record_analysis, state["url"], state["strategy"], state["design"], state["qa"], len(state["code"]), memory, state["tool_data"])
        print("[GRAPH] Recorded analysis")
    except Exception as e:
        print(f"[GRAPH] Failed to record: {e}")
        
    return {"iterations": state.get("iterations", 0)}

# Define edges
def should_continue(state: AgentState):
    if state.get("error"):
        return END
    
    if state.get("qa_passed"):
        return "memory_record"
    
    if state.get("iterations", 0) >= 3:
        return "memory_record"
        
    return "developer"

# Build the graph
workflow = StateGraph(AgentState)

workflow.add_node("setup", setup_node)
workflow.add_node("scraper", scraper_node)
workflow.add_node("tools", tools_node)
workflow.add_node("strategist", strategist_node)
workflow.add_node("marketing", marketing_node)
workflow.add_node("branding", branding_node)
workflow.add_node("logo", logo_node)
workflow.add_node("designer", designer_node)
workflow.add_node("chart", chart_node)
workflow.add_node("developer", developer_node)
workflow.add_node("qa", qa_node)
workflow.add_node("memory_record", memory_record_node)

# Add edges
workflow.set_entry_point("setup")
workflow.add_edge("setup", "scraper")
workflow.add_edge("scraper", "tools")
workflow.add_edge("tools", "strategist")
workflow.add_edge("strategist", "marketing")
workflow.add_edge("marketing", "branding")
workflow.add_edge("branding", "logo")
workflow.add_edge("logo", "designer")
workflow.add_edge("designer", "chart")
workflow.add_edge("chart", "developer")
workflow.add_edge("developer", "qa")
workflow.add_conditional_edges(
    "qa",
    should_continue,
    {
        "developer": "developer",
        "memory_record": "memory_record",
        END: END
    }
)
workflow.add_edge("memory_record", END)

graph = workflow.compile()
