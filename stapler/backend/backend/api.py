import sys
import asyncio

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel
import asyncio
import os
import re
import base64
import time
import json
import atexit
import collections
from urllib.parse import urlparse
from dotenv import load_dotenv
load_dotenv()

from backend.scraper import scrape_website
from backend.agents import run_strategist, run_marketing_analyst, run_social_content_planner, run_branding, run_designer, run_developer, run_developer_tinykit, run_developer_fix, run_qa
from backend.tools import run_all_tools
from backend.graph_agent import graph
from fastapi.responses import StreamingResponse
from backend.metrics import MetricsMiddleware, metrics_endpoint, AGENT_CALLS, AGENT_LATENCY, CACHE_HITS, CACHE_MISSES, SCRAPE_DURATION, MODEL_FALLBACKS
from backend.tracing import trace_session, trace_agent, get_recent_traces, get_trace
from backend.guardrails import validate_html, validate_code, validate_prompt, sanitize_output, validate_html_structure
from backend.state import create_state, save_state, load_state, update_state, get_agent_context, get_state_summary, list_states
from backend.models import GoodExample, DeveloperOutput, QAOutput, QAItem, PageOutput
from backend.quality import full_quality_report
from backend.components import COMPONENT_LIBRARY, DESIGN_SYSTEM_BOILERPLATE

app = FastAPI()

app.add_middleware(MetricsMiddleware)

ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://localhost:3001,http://localhost:5001,http://127.0.0.1:5173").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)


class RateLimiter:
    """In-memory sliding window rate limiter with periodic cleanup."""
    def __init__(self, max_requests: int = 10, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window = window_seconds
        self._hits: dict[str, collections.deque] = {}
        self._last_cleanup = time.time()

    def _cleanup_expired(self):
        now = time.time()
        if now - self._last_cleanup < 300:
            return
        cutoff = now - self.window
        stale = [k for k, q in self._hits.items() if not q or q[-1] < cutoff]
        for k in stale:
            del self._hits[k]
        self._last_cleanup = now

    def is_allowed(self, key: str) -> bool:
        self._cleanup_expired()
        now = time.time()
        if key not in self._hits:
            self._hits[key] = collections.deque()
        q = self._hits[key]
        while q and q[0] < now - self.window:
            q.popleft()
        if len(q) >= self.max_requests:
            return False
        q.append(now)
        return True

_rate_limiter = RateLimiter(max_requests=int(os.getenv("RATE_LIMIT_MAX", "10")), window_seconds=int(os.getenv("RATE_LIMIT_WINDOW", "60")))

MEMORY_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "tmp", "agent_memory.json")


def _load_memory() -> dict:
    try:
        if os.path.exists(MEMORY_PATH):
            with open(MEMORY_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception:
        pass
    return {"analyses": [], "learned_fixes": []}


def _save_memory(memory: dict):
    os.makedirs(os.path.dirname(MEMORY_PATH), exist_ok=True)
    with open(MEMORY_PATH, "w", encoding="utf-8") as f:
        json.dump(memory, f, indent=2, ensure_ascii=False)


def _get_domain(url: str) -> str:
    match = re.search(r'https?://([^/]+)', url)
    return match.group(1) if match else url


def _is_safe_url(url: str) -> tuple[bool, str]:
    """Validate URL to prevent SSRF. Returns (safe, error_message)."""
    try:
        parsed = urlparse(url)
    except Exception:
        return False, "Invalid URL"

    if parsed.scheme not in ("http", "https"):
        return False, f"Only http/https URLs allowed, got '{parsed.scheme}'"

    hostname = parsed.hostname or ""
    if not hostname:
        return False, "No hostname in URL"

    blocked = [
        "localhost", "127.0.0.1", "0.0.0.0", "::1",
        "169.254.169.254",  # cloud metadata
        "metadata.google.internal",
        "100.100.100.200",  # alibaba metadata
    ]
    if hostname in blocked:
        return False, f"Access to '{hostname}' is blocked"

    private_prefixes = ("10.", "172.16.", "172.17.", "172.18.", "172.19.",
                        "172.20.", "172.21.", "172.22.", "172.23.", "172.24.",
                        "172.25.", "172.26.", "172.27.", "172.28.", "172.29.",
                        "172.30.", "172.31.", "192.168.")
    if hostname.startswith(private_prefixes) or hostname == "0.0.0.0":
        return False, f"Access to private IP '{hostname}' is blocked"

    return True, ""


def _get_relevant_memory(url: str, memory: dict) -> str:
    domain = _get_domain(url)
    past = [a for a in memory.get("analyses", []) if domain in a.get("domain", "")]
    if not past:
        return ""
    latest = past[-1]
    parts = []
    if latest.get("qa_issues"):
        parts.append(f"Past QA issues on this site: {latest['qa_issues'][:500]}")
    if latest.get("lessons"):
        parts.append(f"Lessons learned: {latest['lessons'][:500]}")
    return "\n".join(parts)


def _get_good_examples(memory: dict, max_examples: int = 3) -> list[GoodExample]:
    """Retrieve the best examples of approved code from memory."""
    examples = []
    for entry in memory.get("analyses", []):
        if entry.get("approved") and entry.get("code"):
            try:
                examples.append(GoodExample(
                    url=entry.get("url", ""),
                    domain=entry.get("domain", ""),
                    code=entry.get("code", ""),
                    qa_score=entry.get("qa_score", 0),
                    tags=entry.get("tags", []),
                    timestamp=entry.get("timestamp", 0),
                ))
            except Exception:
                pass
    examples.sort(key=lambda e: e.qa_score, reverse=True)
    return examples[:max_examples]


def _good_examples_prompt(memory: dict) -> str:
    """Build a few-shot prompt from past approved code examples."""
    examples = _get_good_examples(memory)
    if not examples:
        return ""
    parts = ["\n\n## PREVIOUSLY APPROVED CODE (Reference — match this quality):\n"]
    for i, ex in enumerate(examples[:2], 1):
        code_preview = ex.code[:800]
        parts.append(f"### Example {i}: {ex.domain} (QA Score: {ex.qa_score}/100)\n```html\n{code_preview}\n```\n")
    return "\n".join(parts)


def _record_analysis(url: str, strategy: str, design: str, qa: str, code_len: int, memory: dict, tool_data: dict = None, code: str = "", qa_score: float = 0, tags: list = None):
    domain = _get_domain(url)
    approved = qa and "APPROVED" in qa
    entry = {
        "domain": domain,
        "url": url,
        "timestamp": time.time(),
        "strategy_len": len(strategy),
        "design_len": len(design),
        "code_len": code_len,
        "qa_issues": qa[:1000] if qa and not approved else "",
        "lessons": "",
        "approved": approved,
        "qa_score": qa_score,
        "code": code[:2000] if approved else "",
        "tags": tags or [],
    }

    if qa and not approved:
        issues = re.findall(r'\|\s*(Critical|Major|Minor)\s*\|[^|]+\|[^|]+\|[^|]+\|[^|]+\|', qa, re.I)
        if issues:
            entry["lessons"] = "; ".join(f"{sev}" for sev, *_ in issues[:5])

    if tool_data:
        entry["tool_summary"] = {
            "colors_count": len(tool_data.get("colors_from_screenshot", [])),
            "ctas_count": len(tool_data.get("ctas_detected", [])),
            "accessibility_score": tool_data.get("accessibility", {}).get("score", None),
            "sentiment_label": tool_data.get("text_sentiment", {}).get("label", None),
            "emotional_scores": {
                dim: tool_data.get("emotional_dimensions", {}).get(dim, {}).get("score")
                for dim in ["luxury", "trust", "confidence", "innovation"]
                if tool_data.get("emotional_dimensions", {}).get(dim, {}).get("score")
            },
            "heatmap_zones": len(tool_data.get("heatmap_zones", [])),
            "quality_score": tool_data.get("quality_score", 0),
        }

    memory.setdefault("analyses", []).append(entry)
    domain_entries = [a for a in memory["analyses"] if a.get("domain") == domain]
    if len(domain_entries) > 5:
        oldest_domain_idx = next(
            i for i, a in enumerate(memory["analyses"])
            if a.get("domain") == domain
        )
        memory["analyses"].pop(oldest_domain_idx)
    if len(memory["analyses"]) > 50:
        memory["analyses"] = memory["analyses"][-50:]
    _save_memory(memory)


class AnalyzeRequest(BaseModel):
    url: str
    use_tinykit: bool = False


class BrandingRequest(BaseModel):
    url: str = ""
    idea: str = ""


import subprocess
_log_proc = [None]

def _cleanup_logger():
    if _log_proc[0] is not None:
        try:
            _log_proc[0].stdin.close()
        except Exception:
            pass
        try:
            _log_proc[0].terminate()
        except Exception:
            pass

atexit.register(_cleanup_logger)

def _open_logger():
    if _log_proc[0] is None or _log_proc[0].poll() is not None:
        _log_proc[0] = subprocess.Popen(
            ['python', '-c', '''
import sys
for line in sys.stdin:
    print(line, end="", flush=True)
'''],
            stdin=subprocess.PIPE, text=True
        )
    return _log_proc[0]

def log(step, msg):
    print(f"[{step}] {msg}", flush=True)
    try:
        p = _open_logger()
        p.stdin.write(f"[{step}] {msg}\n")
        p.stdin.flush()
    except Exception:
        pass


async def _run(fn, *args, timeout=180, retries=2, agent_name=None):
    name = agent_name or fn.__name__
    timer = trace_agent(name, prompt=str(args)[:300] if args else "")
    last_err = None
    for attempt in range(1 + retries):
        try:
            start = time.time()
            result = await asyncio.wait_for(
                asyncio.to_thread(fn, *args),
                timeout=timeout,
            )
            elapsed = time.time() - start
            AGENT_CALLS.labels(agent=name, status="success").inc()
            AGENT_LATENCY.labels(agent=name).observe(elapsed)
            timer.finish(output=str(result)[:300])
            return result
        except Exception as e:
            last_err = e
            AGENT_CALLS.labels(agent=name, status="error").inc()
            if attempt < retries:
                log("RETRY", f"{name} attempt {attempt+1} failed ({e}), retrying...")
                await asyncio.sleep(2 ** attempt)
    timer.finish(error=str(last_err))
    raise last_err


def _parse_pages(raw_code: str, base_url: str = "") -> dict:
    """Parse multi-page output from developer agent into {filename: html} dict."""
    pages = {}
    pattern = r'===PAGE:\s*(.+?)\s*===\s*\n(.*?)===END\s*PAGE==='
    matches = re.findall(pattern, raw_code, re.DOTALL | re.IGNORECASE)
    if matches:
        for filename, html in matches:
            fname = filename.strip()
            code = html.strip()
            if code.startswith("```"):
                code = re.sub(r'^```(?:html)?\n?', '', code)
            if code.endswith("```"):
                code = code[:-3]
            code = code.strip()
            if base_url and "<head>" in code.lower():
                code = re.sub(r'(<head[^>]*>)', rf'\1\n<base href="{base_url}">', code, count=1, flags=re.I)
            pages[fname] = code
    return pages


def _clean_code(code: str, base_url: str = "") -> str:
    """Clean and normalize a single HTML code string."""
    code = code.strip()
    if code.startswith("```"):
        code = re.sub(r'^```(?:html)?\n?', '', code)
    if code.endswith("```"):
        code = code[:-3]
    code = code.strip()
    if base_url and "<head>" in code.lower():
        code = re.sub(r'(<head[^>]*>)', rf'\1\n<base href="{base_url}">', code, count=1, flags=re.I)
    return code


def _extract_core(html: str) -> str:
    parts = []
    t = re.search(r'<title[^>]*>(.*?)</title>', html, re.I | re.S)
    if t:
        parts.append(f"Title: {t.group(1).strip()[:80]}")
    headings = re.findall(r'<(h[1-6])[^>]*>(.*?)</\1>', html, re.I | re.S)
    for tag, text in headings[:6]:
        clean = re.sub(r'<[^>]+>', '', text).strip()[:80]
        if clean:
            parts.append(f"{tag.upper()}: {clean}")
    nav = re.search(r'<nav[^>]*>(.*?)</nav>', html, re.I | re.S)
    if nav:
        links = [re.sub(r'<[^>]+>', '', l).strip() for l in re.findall(r'<a[^>]*>(.*?)</a>', nav.group(1), re.I | re.S)[:6]]
        parts.append(f"Nav: {' | '.join(links)}")
    body = re.search(r'<body[^>]*>(.*)', html, re.I | re.S)
    if body:
        parts.append(f"Body: {body.group(1)[:1000]}")
    return "\n".join(parts) if parts else html[:1500]


def _build_agent_context(html: str, strategy: str = "", marketing: str = "", branding: str = "", design: str = "", tool_data: dict = None, max_chars: int = 8000) -> str:
    """Build a rich context string for the developer agent by intelligently composing all available info."""
    from backend.agents import _smart_summarize
    sections = []

    if strategy:
        sections.append("## STRATEGY\n" + _smart_summarize(strategy, 2000))
    if marketing:
        sections.append("## MARKETING ANALYSIS\n" + _smart_summarize(marketing, 2000))
    if branding:
        sections.append("## BRANDING\n" + _smart_summarize(branding, 1500))
    if design:
        sections.append("## DESIGN PLAN\n" + _smart_summarize(design, 2000))

    if html:
        body = re.search(r'<body[^>]*>(.*?)</body>', html, re.I | re.S)
        if body:
            body_html = body.group(1)[:4000]
        else:
            body_html = html[:4000]
        sections.append("## ORIGINAL HTML (reference structure, content, and logic)\n" + body_html)

    if tool_data:
        tool_ctx = []
        colors = tool_data.get("colors_from_screenshot", [])
        if colors:
            tool_ctx.append(f"Colors: {', '.join(c.get('hex','?') for c in colors[:5])}")
        quality = tool_data.get("quality_report", {})
        if quality:
            tool_ctx.append(f"Quality score: {quality.get('overall_score', '?')}/100")
        if tool_ctx:
            sections.append("## ANALYSIS DATA\n" + "\n".join(tool_ctx))

    context = "\n\n".join(sections)
    if len(context) > max_chars:
        context = context[:max_chars] + "\n\n[... context truncated]"
    return context


@app.get("/metrics")
async def prometheus_metrics():
    return metrics_endpoint()


@app.get("/api/traces")
async def list_traces(limit: int = 20):
    return {"traces": get_recent_traces(limit)}


@app.get("/api/traces/{trace_id}")
async def get_trace_detail(trace_id: str):
    trace = get_trace(trace_id)
    if not trace:
        raise HTTPException(404, "Trace not found")
    return trace


@app.get("/api/states")
async def list_states_endpoint(limit: int = 20):
    return {"states": list_states(limit)}


@app.get("/api/states/{state_id}")
async def get_state_endpoint(state_id: str):
    state = load_state(state_id)
    if not state:
        raise HTTPException(404, "State not found")
    return {"state": state, "summary": get_state_summary(state)}


@app.post("/api/branding")
async def get_branding(request: BrandingRequest, req: Request):
    client_ip = req.client.host if req.client else "unknown"
    if not _rate_limiter.is_allowed(f"branding:{client_ip}"):
        raise HTTPException(429, "Rate limit exceeded. Try again in a minute.")
    url = request.url.strip() if request.url else ""
    idea = request.idea.strip() if request.idea else ""

    if not url and not idea:
        raise HTTPException(400, "Provide a URL or a business idea")

    t0 = time.time()
    branding_input = ""
    tool_context = ""
    strategy = ""

    if url:
        if not url.startswith("http"):
            url = "https://" + url
        log("BRANDING-SCRAPE", f"{url}...")
        try:
            result = await asyncio.wait_for(scrape_website(url), timeout=90)
            html_content = result.get("html", "") or ""
            core = _extract_core(html_content)
            branding_input = f"URL: {url}\n\nSite content:\n{core}"

            if html_content:
                try:
                    tool_data = run_all_tools(html_content)
                    if tool_data.get("colors_from_screenshot"):
                        colors = tool_data["colors_from_screenshot"][:5]
                        tool_context += f"\nCurrent colors: {', '.join(c.get('hex', '?') for c in colors if c.get('hex'))}"
                except Exception:
                    pass
        except Exception as e:
            raise HTTPException(400, f"Scrape failed: {e}")
    elif idea:
        branding_input = f"Business idea: {idea}"

        log("STRATEGIST", "...")
        try:
            strategy = await _run(run_strategist, f"Business idea: {idea}", timeout=180)
            branding_input += f"\n\nStrategic analysis:\n{strategy[:3000]}"
        except Exception as e:
            log("STRATEGIST", f"Failed ({e}), continuing with idea only")

    if tool_context:
        branding_input += f"\n\nANALYSIS DATA:\n{tool_context}"

    log("BRANDING", "...")
    try:
        branding = await _run(run_branding, branding_input, timeout=180)
    except Exception as e:
        raise HTTPException(500, f"Branding failed: {e}")

    total = round(time.time() - t0, 1)
    log("BRANDING", f"Done in {total}s — {len(branding)} chars")

    return {
        "branding": branding,
        "strategy": strategy,
        "url": url,
        "idea": idea,
        "timing": {"total": total},
    }


@app.post("/api/analyze")
async def analyze_website(request: AnalyzeRequest, req: Request):
    client_ip = req.client.host if req.client else "unknown"
    if not _rate_limiter.is_allowed(f"analyze:{client_ip}"):
        raise HTTPException(429, "Rate limit exceeded. Try again in a minute.")
    try:
        return await asyncio.wait_for(_do_analyze(request), timeout=900)
    except asyncio.TimeoutError:
        raise HTTPException(504, "Analysis timed out (15 min limit). Try a simpler URL.")


@app.post("/api/analyze/stream")
async def analyze_stream(request: AnalyzeRequest, req: Request):
    client_ip = req.client.host if req.client else "unknown"
    if not _rate_limiter.is_allowed(f"analyze_stream:{client_ip}"):
        raise HTTPException(429, "Rate limit exceeded. Try again in a minute.")
    
    url = request.url.strip()
    
    async def event_stream():
        yield f"data: {json.dumps({'step': 'Initializing pipeline for ' + url})}\n\n"
        
        try:
            config = {"configurable": {"thread_id": str(time.time())}}
            final_state = {}
            async for event in graph.astream({"url": url, "iterations": 0, "use_tinykit": request.use_tinykit}, config, stream_mode="updates"):
                for node, state in event.items():
                    final_state.update(state)
                    if state.get("error"):
                        yield f"data: {json.dumps({'error': state['error']})}\n\n"
                        return

                    msg = f"Completed step: {node}"
                    if node == "scraper" and "html" in state:
                        msg = f"Scraped {len(state['html'])} characters"
                    elif node == "qa" and "qa_passed" in state:
                        msg = "QA Passed! Validating code..." if state["qa_passed"] else "QA Failed, looping back to developer..."
                        
                    yield f"data: {json.dumps({'step': msg})}\n\n"
                    
                    if "code" in state and node == "developer":
                        # Send the generated code down
                        pages = _parse_pages(state["code"], url)
                        if not pages:
                            code_clean = _clean_code(state["code"], url)
                            pages = {"index.html": code_clean}
                        yield f"data: {json.dumps({'pages': pages})}\n\n"
            
            if 'html' in final_state:
                del final_state['html']
            if 'tool_data' in final_state:
                del final_state['tool_data']
                
            if 'code' in final_state:
                pages = _parse_pages(final_state["code"], url)
                if not pages:
                    pages = {"index.html": _clean_code(final_state["code"], url)}
                final_state['pages'] = pages
                
            yield f"data: {json.dumps({'step': 'Pipeline complete', 'done': True, 'full_state': final_state})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            
    return StreamingResponse(event_stream(), media_type="text/event-stream")


async def _do_analyze(request: AnalyzeRequest):
    url = request.url.strip()
    use_tinykit = request.use_tinykit
    t0 = time.time()

    state = create_state(url=url)
    save_state(state)

    memory = await asyncio.to_thread(_load_memory)
    past_context = _get_relevant_memory(url, memory)

    timing = {}
    html_content = ""
    screenshot_path = None
    screenshots = {}

    is_url = url.startswith("http") or url.startswith("https") or (" " not in url and "." in url)

    if is_url:
        if not url.startswith("http"):
            url = "https://" + url
        log("SCRAPE", f"{url}...")
        t_step = time.time()
        try:
            result = await asyncio.wait_for(scrape_website(url), timeout=90)
        except asyncio.TimeoutError:
            raise HTTPException(400, "Scrape timeout (90s)")
        except Exception as e:
            raise HTTPException(400, f"Scrape failed: {e}")
        if result["error"]:
            raise HTTPException(400, f"Scrape failed: {result['error']}")
        html_content = result.get("html", "")
        screenshot_path = result.get("screenshot_path")
        screenshots = result.get("screenshots", {})
        timing["scrape"] = round(time.time() - t_step, 1)
        log("SCRAPE", f"{len(html_content)} chars, {timing['scrape']}s")

    core = _extract_core(html_content)

    # Run analysis tools
    tool_data = {}
    if html_content:
        log("TOOLS", "Running analysis tools...")
        t_step = time.time()
        try:
            shot_b64_for_tools = None
            if screenshot_path and os.path.exists(screenshot_path):
                def _read_shot():
                    with open(screenshot_path, "rb") as f:
                        return base64.b64encode(f.read()).decode()
                shot_b64_for_tools = await asyncio.to_thread(_read_shot)
            tool_data = run_all_tools(html_content, shot_b64_for_tools)
            timing["tools"] = round(time.time() - t_step, 1)
            log("TOOLS", f"Done: {timing['tools']}s, {len(tool_data.get('ctas_detected', []))} CTAs, {len(tool_data.get('heatmap_zones', []))} zones")
        except Exception as e:
            log("TOOLS", f"Failed ({e})")
            tool_data = {}

    # Format tool data for strategist
    tool_context = ""
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

    # Strategist
    strat_in = f"URL: {url}\n{core}" if core else f"Business: {url}"
    if tool_context:
        strat_in += f"\n\nANALYSIS TOOL DATA:\n{tool_context}"
    if past_context:
        strat_in += f"\n\nPREVIOUS ANALYSIS LESSONS:\n{past_context}"
    log("STRATEGIST", "...")
    t_step = time.time()
    try:
        strategy = await _run(run_strategist, strat_in, timeout=180, agent_name="strategist")
        timing["strategist"] = round(time.time() - t_step, 1)
        log("STRATEGIST", f"{len(strategy)} chars, {timing['strategist']}s")
        update_state(state, "strategy", {"done": True, "summary": strategy[:500]})
    except Exception as e:
        raise HTTPException(500, f"Strategist: {e}")

    # Marketing Analyst
    log("MARKETING", "...")
    t_step = time.time()
    try:
        marketing_input = f"URL: {url}\n\nStrategy analysis:\n{_smart_summarize(strategy, 4000)}"
        if tool_context:
            marketing_input += f"\n\nTOOL DATA:\n{_smart_summarize(tool_context, 2000)}"
        marketing = await _run(run_marketing_analyst, marketing_input, timeout=180, agent_name="marketing")
        timing["marketing"] = round(time.time() - t_step, 1)
        log("MARKETING", f"{len(marketing)} chars, {timing['marketing']}s")
        update_state(state, "marketing", {"done": True, "summary": marketing[:500]})
    except Exception as e:
        log("MARKETING", f"Failed ({e}), continuing without marketing analysis")
        marketing = ""

    # Branding
    log("BRANDING", "...")
    t_step = time.time()
    try:
        from backend.agents import _smart_summarize
        branding_input = f"URL: {url}\n\nBusiness context:\n{_smart_summarize(strategy, 5000)}"
        if tool_data and tool_data.get("colors_from_screenshot"):
            colors = tool_data["colors_from_screenshot"][:5]
            branding_input += f"\n\nCurrent site colors: {', '.join(c.get('hex', '?') for c in colors if c.get('hex'))}"
        if tool_data.get("quality_report"):
            q = tool_data["quality_report"]
            branding_input += f"\n\nSite quality score: {q.get('overall_score', '?')}/100"
        branding = await _run(run_branding, branding_input, timeout=180, agent_name="branding")
        timing["branding"] = round(time.time() - t_step, 1)
        log("BRANDING", f"{len(branding)} chars, {timing['branding']}s")
        update_state(state, "branding", {"done": True})
    except Exception as e:
        log("BRANDING", f"Failed ({e}), continuing without branding")
        branding = ""

    # Designer — smart context from strategy
    log("DESIGNER", "...")
    t_step = time.time()
    try:
        from backend.agents import _smart_summarize
        design_sections = []
        for section_name in ["Visual Direction", "Current Site Audit", "Quick Wins", "Business Overview"]:
            match = re.search(rf'##\s*{section_name}[\s\S]*?(?=##\s*(?:Visual|Current|Quick|Business|Top|SWOT|Porter|Customer)|$)', strategy, re.I)
            if match:
                design_sections.append(match.group(0).strip()[:2000])
        design_input = "\n\n".join(design_sections) if design_sections else _smart_summarize(strategy, 4000)

        visual_ctx = ""
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

        design = await _run(run_designer, f"Strategy (design-relevant parts):\n{design_input}\n\nBrand Identity:\n{branding}\n\nCurrent site HTML:\n{core}\n{visual_ctx}", timeout=300, agent_name="designer")
        timing["designer"] = round(time.time() - t_step, 1)
        log("DESIGNER", f"{len(design)} chars, {timing['designer']}s")
        update_state(state, "design", {"done": True})
    except Exception as e:
        raise HTTPException(500, f"Designer: {e}")

    # Logo Agent — generate brand logos
    log("LOGO", "...")
    t_step = time.time()
    try:
        logo_input = f"URL: {url}\n\nBrand Identity:\n{branding[:3000]}\n\nStrategy:\n{strategy[:2000]}"
        logos = await _run(run_logo_agent, logo_input, timeout=240, agent_name="logo")
        timing["logo"] = round(time.time() - t_step, 1)
        log("LOGO", f"{len(logos)} chars, {timing['logo']}s")
    except Exception as e:
        log("LOGO", f"Failed ({e}), continuing without logos")
        logos = ""

    # Chart Agent — generate data visualizations
    log("CHART", "...")
    t_step = time.time()
    try:
        chart_input = f"URL: {url}\n\nStrategy:\n{strategy[:3000]}\n\nMarketing Analysis:\n{marketing[:3000]}"
        charts = await _run(run_chart_agent, chart_input, timeout=240, agent_name="chart")
        timing["chart"] = round(time.time() - t_step, 1)
        log("CHART", f"{len(charts)} chars, {timing['chart']}s")
    except Exception as e:
        log("CHART", f"Failed ({e}), continuing without charts")
        charts = ""

    # Developer — build rich context with examples
    dev_fn = run_developer_tinykit if use_tinykit else run_developer
    mode = "TinyKit" if use_tinykit else "OpenCode"
    log("DEVELOPER", f"{mode}...")
    t_step = time.time()
    try:
        agent_context = _build_agent_context(html_content, strategy, marketing, branding, design, tool_data)
        examples_prompt = _good_examples_prompt(memory)
        dev_prompt = f"{agent_context}"
        if past_context:
            dev_prompt += f"\n\n## LESSONS FROM PREVIOUS RUNS (avoid these mistakes):\n{past_context}"
        if examples_prompt:
            dev_prompt += examples_prompt
        code = await _run(dev_fn, dev_prompt, timeout=360, agent_name="developer")
        timing["developer"] = round(time.time() - t_step, 1)
        log("DEVELOPER", f"{len(code)} chars, {timing['developer']}s")

        code_check = validate_code(code)
        if not code_check:
            log("GUARDRAILS", f"Developer output rejected: {code_check}")
            code = sanitize_output(code)
            log("GUARDRAILS", "Sanitized developer output")
        update_state(state, "developer", {"done": True, "code_length": len(code)})
    except Exception as e:
        raise HTTPException(500, f"Developer ({mode}): {e}")

    # Parse multi-page output
    pages = _parse_pages(code, url)
    if pages:
        log("PAGES", f"Detected {len(pages)} pages: {', '.join(pages.keys())}")
    else:
        code = _clean_code(code, url)
        pages = {"index.html": code}
        log("PAGES", "Single page output (no markers found)")

    # Iterative QA loop — up to 5 iterations
    MAX_QA_ITERATIONS = 5
    qa_feedback = ""
    qa_approved = False
    iteration_history = []
    qa_score = 0

    all_pages_valid = all("<!DOCTYPE" in p.upper() and len(p) > 500 for p in pages.values())
    if all_pages_valid and pages:
        for iteration in range(MAX_QA_ITERATIONS):
            log("QA", f"Iteration {iteration + 1}/{MAX_QA_ITERATIONS}...")
            t_step = time.time()

            try:
                quality_report_json = full_quality_report(pages.get("index.html", list(pages.values())[0]))
                quality_str = (
                    f"Automated quality score: {quality_report_json['overall_score']}/100\n"
                    f"Structure: {quality_report_json['structure']['score']}/100 "
                    f"({'; '.join(quality_report_json['structure']['issues'][:3])})\n"
                    f"Accessibility: {quality_report_json['accessibility']['score']}/100 "
                    f"({'; '.join(quality_report_json['accessibility']['issues'][:3])})\n"
                    f"Responsive: {quality_report_json['responsive']['responsive_score']}/100\n"
                    f"Performance: {quality_report_json['performance']['performance_score']}/100\n"
                )
            except Exception:
                quality_str = "Automated quality check unavailable."

            iter_history_str = ""
            if iteration_history:
                iter_history_str = "Previous issues found:\n" + "\n".join(
                    f"- Iteration {h['iteration']}: {h['summary'][:200]}" for h in iteration_history[-3:]
                )

            pages_summary = "\n\n".join(f"=== {fname} ===\n{p[:2000]}" for fname, p in pages.items())
            qa_feedback = await _run(
                run_qa,
                f"Design:\n{design[:2000]}\n\nPages:\n{pages_summary}",
                quality_report=quality_str,
                iteration_history=iter_history_str,
                timeout=120,
                agent_name="qa"
            )
            timing[f"qa_iter_{iteration}"] = round(time.time() - t_step, 1)

            if "APPROVED" in qa_feedback:
                qa_approved = True
                log("QA", f"APPROVED on iteration {iteration + 1}")
                try:
                    score_match = re.search(r'Overall Impression.*?(\d+)/10', qa_feedback)
                    if score_match:
                        qa_score = int(score_match.group(1)) * 10
                    else:
                        qa_score = max(70, quality_report_json.get("overall_score", 70))
                except Exception:
                    qa_score = 80
                break

            log("QA", f"Issues found (iteration {iteration + 1}), fixing...")
            iteration_history.append({
                "iteration": iteration + 1,
                "summary": qa_feedback[:500],
            })

            if iteration < MAX_QA_ITERATIONS - 1:
                t_step2 = time.time()
                fix_prompt = (
                    f"You previously generated code for this site. "
                    f"QA found these issues that MUST be fixed:\n\n{qa_feedback[:1500]}\n\n"
                    f"## PREVIOUS ITERATION FEEDBACK\n"
                )
                for h in iteration_history:
                    fix_prompt += f"Iteration {h['iteration']} issues: {h['summary'][:300]}\n"
                fix_prompt += "\n## Current Code (fix ALL issues):\n\n"
                for fname, p in pages.items():
                    fix_prompt += f"=== {fname} ===\n{p[:2500]}\n\n"
                fix_prompt += (
                    "\nIMPORTANT: Output ALL pages again with ALL fixes applied. "
                    "Use the exact same ===PAGE: / ===END PAGE=== format."
                )

                fix_fn = run_developer_tinykit if use_tinykit else run_developer_fix
                try:
                    fixed_raw = await _run(fix_fn, fix_prompt, timeout=300, agent_name="developer_fix")
                    timing[f"qa_fix_{iteration}"] = round(time.time() - t_step2, 1)
                    fixed_pages = _parse_pages(fixed_raw)
                    if fixed_pages:
                        pages = fixed_pages
                        log("QA", f"Fixed pages re-parsed ({len(pages)} pages)")
                    else:
                        fixed_code = _clean_code(fixed_raw, url)
                        if "<!DOCTYPE" in fixed_code.upper():
                            pages = {"index.html": fixed_code}
                            log("QA", "Single fixed page parsed")
                        else:
                            log("QA", "Fix output had no valid HTML, keeping previous version")
                            break
                except Exception as e:
                    log("QA", f"Fix attempt {iteration + 1} failed ({e}), keeping current version")
                    break
            else:
                log("QA", f"Max iterations ({MAX_QA_ITERATIONS}) reached, keeping best version")

    if not qa_approved and qa_feedback:
        log("QA", "Final result: NOT APPROVED after all iterations")
        qa_score = 0

    # Build primary code (index.html or first page)
    primary_code = pages.get("index.html", list(pages.values())[0] if pages else "")

    # Screenshots
    shot_b64 = None
    if screenshot_path and os.path.exists(screenshot_path):
        def _read_main_shot():
            with open(screenshot_path, "rb") as f:
                return base64.b64encode(f.read()).decode()
        shot_b64 = await asyncio.to_thread(_read_main_shot)
    shots_b64 = {}
    for k, p in screenshots.items():
        if p and os.path.exists(p):
            def _read_shot(_p=p):
                with open(_p, "rb") as f:
                    return base64.b64encode(f.read()).decode()
            shots_b64[k] = await asyncio.to_thread(_read_shot)

    total = round(time.time() - t0, 1)
    timing["total"] = total
    timing["qa_iterations"] = len(iteration_history) + (1 if qa_approved else 0)
    log("DONE", f"{total}s — {len(primary_code)} chars — QA: {'APPROVED' if qa_approved else 'REJECTED'}")

    # Record to memory for future learning
    try:
        await asyncio.to_thread(
            _record_analysis, url, strategy, design, qa_feedback, len(primary_code),
            memory, tool_data, code=primary_code, qa_score=qa_score,
            tags=["approved" if qa_approved else "rejected"]
        )
        log("MEMORY", f"Recorded analysis (approved={qa_approved}, score={qa_score})")
    except Exception as e:
        log("MEMORY", f"Failed to record: {e}")

    # Build timing markdown
    timing_md = "## Generation Time\n\n"
    timing_md += "| Step | Time |\n|------|------|\n"
    for step in ["scrape", "strategist", "marketing", "branding", "designer", "developer", "qa", "qa_fix"]:
        if step in timing:
            label = step.replace("_", " ").title()
            timing_md += f"| {label} | {timing[step]}s |\n"
    timing_md += f"| **Total** | **{total}s** |\n"

    try:
        quality_final = full_quality_report(primary_code) if primary_code else {"overall_score": 0}
    except Exception:
        quality_final = {"overall_score": 0}

    return {
        "strategy": strategy,
        "marketing": marketing,
        "branding": branding,
        "logos": logos,
        "charts": charts,
        "design": design,
        "qa": qa_feedback,
        "qa_approved": qa_approved,
        "qa_score": qa_score,
        "qa_iterations": len(iteration_history) + (1 if qa_approved else 0),
        "code": primary_code,
        "pages": pages,
        "screenshot": shot_b64,
        "screenshots": shots_b64,
        "url": url,
        "timing": timing,
        "timing_markdown": timing_md,
        "tool_data": tool_data,
        "quality_report": quality_final,
    }


class ExportRequest(BaseModel):
    strategy: str = ""
    marketing: str = ""
    branding: str = ""
    design: str = ""
    qa: str = ""
    url: str = ""
    timing: dict = None


ACCENT_COLORS = [
    "#2563eb", "#7c3aed", "#059669", "#d97706",
    "#dc2626", "#db2777", "#0891b2", "#4f46e5",
]


class LogoRequest(BaseModel):
    name: str
    style: str = "wordmark"
    color: str = "#2563eb"
    dark_bg: bool = False


@app.post("/api/logo")
async def generate_logo(req: LogoRequest):
    from backend.logo_generator import wordmark_logo, dual_tone_logo, mark_logo, icon_logo
    generators = {
        "wordmark": wordmark_logo,
        "dual_tone": dual_tone_logo,
        "mark": mark_logo,
        "icon": icon_logo,
    }
    fn = generators.get(req.style, wordmark_logo)
    svg = fn(req.name, req.color, req.dark_bg)
    return {"svg": svg, "style": req.style, "name": req.name}


@app.get("/api/logo/styles")
async def logo_styles():
    return {"styles": ["wordmark", "dual_tone", "mark", "icon"], "colors": ACCENT_COLORS}


class ChartRequest(BaseModel):
    chart_type: str = "bar"
    labels: list[str]
    values: list[float]
    title: str = ""
    color: str = "#2563eb"


@app.post("/api/chart")
async def generate_chart(req: ChartRequest):
    from backend.charts import bar_chart, horizontal_bar_chart, pie_chart, doughnut_chart, line_chart
    generators = {
        "bar": bar_chart,
        "horizontal_bar": horizontal_bar_chart,
        "pie": pie_chart,
        "doughnut": doughnut_chart,
        "line": line_chart,
    }
    fn = generators.get(req.chart_type, bar_chart)
    if req.chart_type == "line":
        points = [{"label": l, "value": v} for l, v in zip(req.labels, req.values)]
        html = fn(points, req.title, line_color=req.color)
    elif req.chart_type in ("pie", "doughnut"):
        html = fn(req.labels, req.values, req.title)
    else:
        html = fn(req.labels, req.values, req.title, bar_color=req.color)
    return {"html": html, "chart_type": req.chart_type}


class SEORequest(BaseModel):
    html: str
    url: str = ""


@app.post("/api/seo")
async def analyze_seo_endpoint(req: SEORequest):
    from backend.tools import analyze_seo
    return analyze_seo(req.html, req.url)


class BrandKitRequest(BaseModel):
    name: str
    description: str = ""
    color: str = "#2563eb"
    dark_bg: bool = False
    platforms: list[str] = []


@app.post("/api/brand-kit")
async def generate_brand_kit(req: BrandKitRequest):
    from backend.logo_generator import generate_all_logos
    from backend.social_tools import SOCIAL_PLATFORMS, BUSINESS_SOCIAL_PLATFORMS
    import io, zipfile, base64, json

    logos = generate_all_logos(req.name, req.color, req.dark_bg)
    platforms = req.platforms or BUSINESS_SOCIAL_PLATFORMS.get("tech", ["twitter", "linkedin", "github"])

    social_links = {}
    for p in platforms:
        if p in SOCIAL_PLATFORMS:
            social_links[p] = SOCIAL_PLATFORMS[p]["url"] + p.lower()

    brand_json = json.dumps({
        "brand": req.name,
        "description": req.description,
        "primary_color": req.color,
        "platforms": platforms,
        "social_links": social_links,
    }, indent=2)

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as zf:
        for style, svg in logos.items():
            zf.writestr(f"logo/{style}.svg", svg)
        zf.writestr("brand.json", brand_json)
        zf.writestr("social_links.json", json.dumps(social_links, indent=2))

    b64 = base64.b64encode(buf.getvalue()).decode()
    return {"zip_base64": b64, "filename": f"{req.name.lower().replace(' ', '-')}-brand-kit.zip", "logos": logos, "social_links": social_links}


class SocialContentRequest(BaseModel):
    business_context: str = ""
    strategy: str = ""
    branding: str = ""
    url: str = ""


@app.post("/api/social-content")
async def generate_social_content(req: SocialContentRequest):
    prompt_parts = []
    if req.url:
        prompt_parts.append(f"Business URL: {req.url}")
    if req.business_context:
        prompt_parts.append(f"\n\n## Business Context\n{req.business_context}")
    if req.strategy:
        prompt_parts.append(f"\n\n## Strategic Analysis\n{req.strategy[:3000]}")
    if req.branding:
        prompt_parts.append(f"\n\n## Brand Identity\n{req.branding[:2000]}")
    if not prompt.strip():
        return {"error": "Provide at least a URL or business context"}
    try:
        result = await _run(run_social_content_planner, prompt, timeout=300, agent_name="social_content")
        return {"content": result}
    except Exception as e:
        log("SOCIAL_ERROR", str(e))
        return {"error": f"Social content generation failed: {e}"}


@app.post("/api/export/markdown")
async def export_markdown(req: ExportRequest):
    parts = [f"# Analysis Report: {req.url}\n"]
    if req.strategy:
        parts.append(req.strategy)
    if req.marketing:
        parts.append(f"\n---\n\n# Marketing Analysis\n\n{req.marketing}")
    if req.branding:
        parts.append(f"\n---\n\n# Brand Identity\n\n{req.branding}")
    if req.design:
        parts.append(f"\n---\n\n# Design Plan\n\n{req.design}")
    if req.qa:
        parts.append(f"\n---\n\n# QA Report\n\n{req.qa}")
    if req.timing:
        parts.append(req.timing_markdown)
    md = "\n".join(parts)
    return PlainTextResponse(content=md, media_type="text/markdown",
                             headers={"Content-Disposition": f"attachment; filename=analysis-{_get_domain(req.url)}.md"})

class StapleRequest(BaseModel):
    input_idea: str
    thread_id: str = "default"
    user_reply: str | None = None

@app.post("/api/staple")
async def run_stapler(req: StapleRequest):
    from backend.stapler_graph import stapler_graph
    from backend.scraper import scrape_website
    from langgraph.types import Command
    import base64
    
    input_idea = req.input_idea
    screenshot_b64 = None
    config = {"configurable": {"thread_id": req.thread_id}}
    
    if req.user_reply:
        # Check if the thread actually exists in memory
        current_state = stapler_graph.get_state(config)
        if not current_state or not current_state.values:
            # Thread was lost (e.g. server restarted). Start a fresh one but include the reply in the idea.
            input_idea = f"{req.input_idea}\n\nUser Follow-up: {req.user_reply}"
            req.user_reply = None # Fall through to the fresh start block
        else:
            try:
                result = await asyncio.to_thread(stapler_graph.invoke, Command(resume=req.user_reply), config)
            except Exception as e:
                raise HTTPException(500, f"Graph execution failed: {e}")
                
    if not req.user_reply:
        if input_idea.startswith("http") or (" " not in input_idea and "." in input_idea):
            url = "https://" + input_idea if not input_idea.startswith("http") else input_idea
            try:
                scrape_res = await asyncio.wait_for(scrape_website(url), timeout=60)
                shot_path = scrape_res.get("screenshot_path")
                if shot_path and os.path.exists(shot_path):
                    with open(shot_path, "rb") as f:
                        screenshot_b64 = base64.b64encode(f.read()).decode()
                if scrape_res.get("html"):
                    core = _extract_core(scrape_res["html"])
                    input_idea = f"URL: {url}\n\nContent Context:\n{core}"
            except Exception as e:
                print(f"Scrape failed for God Mode: {e}")
                
        # Run the graph initially
        try:
            result = await asyncio.to_thread(stapler_graph.invoke, {"input_idea": input_idea, "screenshot_b64": screenshot_b64, "iterations": 0}, config)
        except Exception as e:
            raise HTTPException(500, f"Graph execution failed: {e}")
            
    # Check if interrupted for human input
    state = stapler_graph.get_state(config)
    if state.next:
        tasks = state.tasks
        interrupt_msg = "Please provide more details."
        if tasks and tasks[0].interrupts:
            interrupt_msg = tasks[0].interrupts[0].value
        return {"status": "interrupted", "message": interrupt_msg, "thread_id": req.thread_id}

    # If error
    if result and result.get("error"):
        raise HTTPException(500, result["error"])
        
    # Final return (graph completed)
    from backend.skills import generate_tts_audio
    audio_b64 = None
    if result and result.get("ad_creative") and result["ad_creative"].hooks:
        audio_b64 = generate_tts_audio(result["ad_creative"].hooks[0])

    return {
        "status": "completed",
        "audit": result["audit"].model_dump() if result.get("audit") else {},
        "marketing_engine": result["marketing_engine"].model_dump() if result.get("marketing_engine") else {},
        "visual_identity": result["visual_identity"].model_dump() if result.get("visual_identity") else {},
        "ad_creative": result["ad_creative"].model_dump() if result.get("ad_creative") else {},
        "live_code_preview": result["live_code_preview"].model_dump() if result.get("live_code_preview") else {},
        "original_screenshot": screenshot_b64,
        "audio_b64": audio_b64
    }
