"""
State Management — structured state instead of full conversation history
"""

import os
import json
import time
import threading
from typing import Optional

STATE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "tmp", "states")
os.makedirs(STATE_DIR, exist_ok=True)

_lock = threading.Lock()


def create_state(url: str = "", idea: str = "") -> dict:
    return {
        "id": f"state_{int(time.time() * 1000)}",
        "url": url,
        "idea": idea,
        "domain": "",
        "created_at": time.time(),
        "updated_at": time.time(),
        "status": "started",
        "current_step": "init",
        "branding": {
            "done": False,
            "colors": [],
            "tone": "",
            "fonts": [],
            "personality": "",
        },
        "strategy": {
            "done": False,
            "summary": "",
            "strengths": [],
            "weaknesses": [],
            "opportunities": [],
        },
        "design": {
            "done": False,
            "philosophy": "",
            "color_system": {},
            "typography": {},
        },
        "developer": {
            "done": False,
            "pages": [],
            "code_length": 0,
        },
        "qa": {
            "done": False,
            "score": None,
            "issues": [],
            "approved": False,
        },
        "tool_data": {
            "colors_count": 0,
            "ctas_count": 0,
            "accessibility_score": None,
        },
        "errors": [],
        "timing": {},
    }


def save_state(state: dict):
    state["updated_at"] = time.time()
    filepath = os.path.join(STATE_DIR, f"{state['id']}.json")
    with _lock:
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(state, f, indent=2, default=str)


def load_state(state_id: str) -> Optional[dict]:
    filepath = os.path.join(STATE_DIR, f"{state_id}.json")
    if os.path.exists(filepath):
        with _lock:
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
    return None


def update_state(state: dict, step: str, data: dict) -> dict:
    state["current_step"] = step
    state["updated_at"] = time.time()

    if step == "branding" and data.get("done"):
        state["branding"]["done"] = True
        state["branding"]["tone"] = data.get("tone", "")
        state["branding"]["personality"] = data.get("personality", "")
        state["branding"]["colors"] = data.get("colors", [])
        state["branding"]["fonts"] = data.get("fonts", [])

    elif step == "strategy" and data.get("done"):
        state["strategy"]["done"] = True
        state["strategy"]["summary"] = data.get("summary", "")[:500]
        state["strategy"]["strengths"] = data.get("strengths", [])
        state["strategy"]["weaknesses"] = data.get("weaknesses", [])

    elif step == "design" and data.get("done"):
        state["design"]["done"] = True
        state["design"]["philosophy"] = data.get("philosophy", "")[:500]
        state["design"]["color_system"] = data.get("colors", {})
        state["design"]["typography"] = data.get("typography", {})

    elif step == "developer" and data.get("done"):
        state["developer"]["done"] = True
        state["developer"]["pages"] = data.get("pages", [])
        state["developer"]["code_length"] = data.get("code_length", 0)

    elif step == "qa" and data.get("done"):
        state["qa"]["done"] = True
        state["qa"]["score"] = data.get("score")
        state["qa"]["issues"] = data.get("issues", [])
        state["qa"]["approved"] = data.get("approved", False)

    elif step == "error":
        state["errors"].append(data.get("message", "Unknown error"))

    if "timing" in data:
        state["timing"].update(data["timing"])

    save_state(state)
    return state


def get_state_summary(state: dict) -> str:
    lines = [
        f"State: {state['id']}",
        f"URL: {state.get('url', 'N/A')}",
        f"Idea: {state.get('idea', 'N/A')}",
        f"Step: {state['current_step']}",
        f"Status: {state['status']}",
    ]

    sections = [
        ("Branding", state["branding"]["done"]),
        ("Strategy", state["strategy"]["done"]),
        ("Design", state["design"]["done"]),
        ("Developer", state["developer"]["done"]),
        ("QA", state["qa"]["done"]),
    ]

    for name, done in sections:
        status = "done" if done else "pending"
        lines.append(f"  {name}: {status}")

    if state["errors"]:
        lines.append(f"Errors: {len(state['errors'])}")

    return "\n".join(lines)


def get_agent_context(state: dict, agent_role: str) -> str:
    parts = []

    if state.get("url"):
        parts.append(f"URL: {state['url']}")
    if state.get("idea"):
        parts.append(f"Idea: {state['idea']}")

    if agent_role in ["designer", "developer", "qa"]:
        if state["branding"]["done"]:
            parts.append(f"Brand tone: {state['branding']['tone']}")
            parts.append(f"Brand personality: {state['branding']['personality']}")
            if state["branding"]["colors"]:
                parts.append(f"Colors: {', '.join(state['branding']['colors'][:5])}")

    if agent_role in ["developer", "qa"]:
        if state["strategy"]["done"]:
            parts.append(f"Strategy summary: {state['strategy']['summary'][:300]}")
        if state["design"]["done"]:
            parts.append(f"Design philosophy: {state['design']['philosophy'][:300]}")

    if agent_role == "qa":
        if state["developer"]["done"]:
            parts.append(f"Pages: {', '.join(state['developer']['pages'])}")
            parts.append(f"Code length: {state['developer']['code_length']} chars")

    if state["errors"]:
        parts.append(f"Previous errors to avoid: {'; '.join(state['errors'][-3:])}")

    return "\n".join(parts)


def list_states(limit: int = 20) -> list:
    try:
        files = sorted(
            [f for f in os.listdir(STATE_DIR) if f.endswith(".json")],
            reverse=True
        )[:limit]
        states = []
        for fname in files:
            with open(os.path.join(STATE_DIR, fname), "r") as f:
                s = json.load(f)
                states.append({
                    "id": s["id"],
                    "url": s.get("url", ""),
                    "idea": s.get("idea", ""),
                    "step": s["current_step"],
                    "updated": s["updated_at"],
                })
        return states
    except Exception:
        return []
