"""
Structured Tracing — timeline of every agent call with inputs/outputs/errors
"""

import time
import json
import os
import threading
from contextlib import contextmanager
from typing import Optional

TRACE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "tmp", "traces")
os.makedirs(TRACE_DIR, exist_ok=True)

_local = threading.local()


def _get_trace() -> list:
    if not hasattr(_local, "trace"):
        _local.trace = []
    return _local.trace


def _get_trace_id() -> Optional[str]:
    return getattr(_local, "trace_id", None)


@contextmanager
def trace_session(label: str = "request"):
    trace_id = f"{label}_{int(time.time() * 1000)}"
    _local.trace_id = trace_id
    _local.trace = []
    start = time.time()
    try:
        yield _local.trace
    finally:
        elapsed = round(time.time() - start, 3)
        _save_trace(trace_id, _local.trace, elapsed)
        _local.trace = []
        _local.trace_id = None


def trace_step(name: str, input_summary: str = "", output_summary: str = ""):
    trace = _get_trace()
    entry = {
        "step": name,
        "start": time.time(),
        "input": input_summary[:500],
    }
    trace.append(entry)

    class StepTimer:
        def __init__(self):
            self.entry = entry

        def finish(self, output: str = "", error: str = ""):
            self.entry["end"] = time.time()
            self.entry["duration"] = round(self.entry["end"] - self.entry["start"], 3)
            self.entry["output"] = output[:500]
            if error:
                self.entry["error"] = error[:500]
                self.entry["status"] = "error"
            else:
                self.entry["status"] = "ok"

    return StepTimer()


def trace_agent(agent_name: str, prompt: str = "", model: str = ""):
    return trace_step(
        f"agent:{agent_name}",
        input_summary=f"model={model} prompt={prompt[:300]}",
    )


def _save_trace(trace_id: str, steps: list, total_duration: float):
    trace_data = {
        "trace_id": trace_id,
        "total_duration": total_duration,
        "steps": steps,
        "timestamp": time.time(),
    }
    filepath = os.path.join(TRACE_DIR, f"{trace_id}.json")
    try:
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(trace_data, f, indent=2, default=str)
    except Exception:
        pass


def get_recent_traces(limit: int = 20) -> list:
    try:
        files = sorted(
            [f for f in os.listdir(TRACE_DIR) if f.endswith(".json")],
            reverse=True
        )[:limit]
        traces = []
        for fname in files:
            with open(os.path.join(TRACE_DIR, fname), "r") as f:
                traces.append(json.load(f))
        return traces
    except Exception:
        return []


def get_trace(trace_id: str) -> Optional[dict]:
    filepath = os.path.join(TRACE_DIR, f"{trace_id}.json")
    if os.path.exists(filepath):
        with open(filepath, "r") as f:
            return json.load(f)
    return None
