"""
Direct API Client — calls OpenRouter/Groq/xAI APIs with per-provider key rotation.
No OpenCode server dependency. Keys rotate on failure/rate-limit.
"""

import os
import json
import httpx
import hashlib
import time
import threading
from backend.api_key_manager import APIKeyManager

_shared_client: httpx.Client | None = None


def get_client() -> httpx.Client:
    global _shared_client
    if _shared_client is None or _shared_client.is_closed:
        _shared_client = httpx.Client(
            timeout=httpx.Timeout(connect=15.0, read=300.0, write=15.0, pool=10.0),
            limits=httpx.Limits(max_connections=12, max_keepalive_connections=6, keepalive_expiry=300),
        )
    return _shared_client


# ---------------------------------------------------------------------------
# Provider registry — each provider has its own base URL, env var, and keys
# ---------------------------------------------------------------------------
PROVIDERS = {
    "ollama": {
        "base_url": os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1"),
        "env_var": "OLLAMA_API_KEYS",
        "extra_headers": {},
        "no_auth": True,
    },
    "openrouter": {
        "base_url": os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"),
        "env_var": "OPENROUTER_API_KEYS",
        "extra_headers": {
            "HTTP-Referer": "https://stapler.app",
            "X-Title": "Stapler AI Agent",
        },
    },
    "groq": {
        "base_url": os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1"),
        "env_var": "GROQ_API_KEYS",
        "extra_headers": {},
    },
}

_cooldown = int(os.getenv("KEY_COOLDOWN_SECONDS", "60"))
_provider_managers: dict[str, APIKeyManager] = {}


def get_key_manager(provider: str = "openrouter") -> APIKeyManager:
    if provider in _provider_managers:
        return _provider_managers[provider]

    cfg = PROVIDERS.get(provider)
    if cfg is None:
        raise ValueError(f"Unknown provider: {provider}")

    if cfg.get("no_auth"):
        km = APIKeyManager(["dummy-ollama-key"], cooldown_seconds=0)
        print(f"[API-KEY-MGR] {provider} — no auth required", flush=True)
        _provider_managers[provider] = km
        return km

    km = APIKeyManager.from_env(env_var=cfg["env_var"], cooldown=_cooldown)
    if km.count == 0:
        raise RuntimeError(
            f"No API keys for {provider}! Set {cfg['env_var']} in .env"
        )
    print(f"[API-KEY-MGR] Loaded {km.count} {provider} keys", flush=True)
    _provider_managers[provider] = km
    return km


# ---------------------------------------------------------------------------
# Model routing — each entry tags models with their provider
# Models are tuples: (provider, model_id)
# ---------------------------------------------------------------------------
MODEL_MAP = {
    "strategist": {
        "models": [
            ("ollama", "phi4-mini"),
            ("ollama", "llama3.2"),
            ("groq", "llama-3.3-70b-versatile"),
            ("openrouter", "openai/gpt-4o-mini"),
            ("openrouter", "nvidia/nemotron-3-super-120b-a12b:free"),
            ("openrouter", "google/gemma-4-31b-it:free"),
            ("ollama", "qwen2.5-coder:7b"),
        ],
        "max_tokens": 4096,
    },
    "designer": {
        "models": [
            ("ollama", "qwen2.5-coder:7b"),
            ("ollama", "phi4-mini"),
            ("groq", "llama-3.3-70b-versatile"),
            ("openrouter", "openai/gpt-4o-mini"),
            ("openrouter", "nvidia/nemotron-3-super-120b-a12b:free"),
            ("openrouter", "google/gemma-4-31b-it:free"),
            ("ollama", "llama3.2"),
        ],
        "max_tokens": 4096,
    },
    "developer": {
        "models": [
            ("openrouter", "openai/gpt-4o-mini"),
            ("groq", "llama-3.3-70b-versatile"),
            ("ollama", "qwen2.5-coder:7b"),
            ("openrouter", "openai/gpt-4o-mini"),
            ("openrouter", "nvidia/nemotron-3-super-120b-a12b:free"),
            ("openrouter", "google/gemma-4-31b-it:free"),
            ("ollama", "llama3.2"),
        ],
        "max_tokens": 4096,
    },
    "developer_fix": {
        "models": [
            ("openrouter",  "openai/gpt-4o-mini"),
            ("groq",        "llama-3.3-70b-versatile"),
            ("ollama",      "qwen2.5-coder:7b"),
            ("ollama",      "phi4-mini"),
            ("openrouter",  "openai/gpt-4o-mini"),
            ("openrouter",  "nvidia/nemotron-3-super-120b-a12b:free"),
            ("openrouter",  "google/gemma-4-31b-it:free"),
        ],
        "max_tokens": 4096,
    },
    "qa": {
        "models": [
            ("ollama",      "phi4-mini"),
            ("ollama",      "qwen2.5-coder:7b"),
            ("groq",        "llama-3.3-70b-versatile"),
            ("openrouter",  "openai/gpt-4o-mini"),
            ("ollama",      "llama3.2"),
            ("openrouter",  "nvidia/nemotron-3-super-120b-a12b:free"),
            ("openrouter",  "google/gemma-4-31b-it:free"),
        ],
        "max_tokens": 2048,
    },
}


class ResultCache:
    """In-memory LRU cache for identical agent prompts. TTL = 10 min."""

    def __init__(self, max_size: int = 64, ttl: int = 600):
        self._cache: dict[str, tuple[str, float]] = {}
        self._lock = threading.Lock()
        self._max_size = max_size
        self._ttl = ttl

    def _key(self, system_prompt: str, prompt: str) -> str:
        raw = f"{system_prompt}|||{prompt}"
        return hashlib.sha256(raw.encode()).hexdigest()[:16]

    def get(self, system_prompt: str, prompt: str) -> str | None:
        key = self._key(system_prompt, prompt)
        with self._lock:
            if key in self._cache:
                result, ts = self._cache[key]
                if time.time() - ts < self._ttl:
                    print(f"[CACHE HIT] {key}", flush=True)
                    return result
                del self._cache[key]
        return None

    def set(self, system_prompt: str, prompt: str, result: str):
        key = self._key(system_prompt, prompt)
        with self._lock:
            if len(self._cache) >= self._max_size:
                oldest_key = min(self._cache, key=lambda k: self._cache[k][1])
                del self._cache[oldest_key]
            self._cache[key] = (result, time.time())


_cache = ResultCache()


class OpenCodeClient:
    def __init__(self):
        self.client = get_client()

    def _call_api(self, messages: list, model_id: str, max_tokens: int,
                  provider: str, key: str, temperature: float = 0.7) -> str:
        """Make a single API call to the given provider with the given key."""
        cfg = PROVIDERS[provider]
        base_url = cfg["base_url"]

        body = {
            "model": model_id,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
        }
        headers = {
            "Content-Type": "application/json",
            **cfg["extra_headers"],
        }
        if not cfg.get("no_auth"):
            headers["Authorization"] = f"Bearer {key}"

        km = get_key_manager(provider)
        resp = self.client.post(f"{base_url}/chat/completions", json=body, headers=headers)

        if resp.status_code == 429:
            km.report_failure(key, rate_limited=True)
            raise RateLimitError(f"Rate limited on {provider} key ...{key[-6:]}")

        if resp.status_code == 402:
            km.report_failure(key, rate_limited=True)
            raise TokenExhaustedError(f"Tokens exhausted on {provider} key ...{key[-6:]}")

        if resp.status_code == 401:
            km.report_failure(key, rate_limited=True)
            raise AuthError(f"Invalid {provider} key ...{key[-6:]}")

        resp.raise_for_status()
        data = resp.json()

        choices = data.get("choices", [])
        if not choices:
            raise EmptyResponseError("No choices in response")

        content = choices[0].get("message", {}).get("content", "")
        if not content or not content.strip():
            raise EmptyResponseError("Empty content in response")

        km.report_success(key)
        return content.strip()

    def chat(self, prompt: str, system_prompt: str = "",
             title: str = "agent", agent_role: str = "strategist",
             use_cache: bool = True) -> str:
        full_prompt = (
            f"{system_prompt}\n\n---\n\n{prompt}" if system_prompt else prompt
        )

        if use_cache:
            cached = _cache.get(system_prompt, prompt)
            if cached is not None:
                try:
                    from backend.metrics import CACHE_HITS
                    CACHE_HITS.inc()
                except ImportError:
                    pass
                return cached
            try:
                from backend.metrics import CACHE_MISSES
                CACHE_MISSES.inc()
            except ImportError:
                pass

        model_cfg = MODEL_MAP.get(agent_role, MODEL_MAP["strategist"])
        models = model_cfg["models"]
        max_tokens = model_cfg["max_tokens"]

        messages = [
            {"role": "user", "content": full_prompt}
        ]

        last_err = None
        total_attempts = 0
        max_attempts = len(models) * 4

        for provider, model_id in models:
            if total_attempts >= max_attempts:
                break

            km = get_key_manager(provider)
            keys_tried = set()
            while total_attempts < max_attempts:
                key = km.get_key()
                if key is None:
                    last_err = f"All {provider} keys on cooldown"
                    print(f"[FALLBACK] All {provider} keys exhausted, waiting...", flush=True)
                    time.sleep(5)
                    continue

                key_sig = key[-8:]
                if key_sig in keys_tried:
                    break
                keys_tried.add(key_sig)

                total_attempts += 1
                try:
                    if total_attempts > len(models):
                        try:
                            from backend.metrics import MODEL_FALLBACKS
                            MODEL_FALLBACKS.labels(
                                agent=agent_role,
                                from_model=models[0][1],
                                to_model=model_id,
                            ).inc()
                        except ImportError:
                            pass

                    print(f"[{title.upper()}] Trying {provider}/{model_id} with key ...{key_sig} (attempt {total_attempts})", flush=True)
                    result = self._call_api(messages, model_id, max_tokens, provider, key)

                    if use_cache:
                        _cache.set(system_prompt, prompt, result)
                    return result

                except (RateLimitError, TokenExhaustedError, AuthError) as e:
                    last_err = str(e)
                    print(f"[FALLBACK] {e} — trying next key...", flush=True)
                    continue
                except EmptyResponseError as e:
                    last_err = str(e)
                    print(f"[FALLBACK] {model_id} returned empty — trying next key...", flush=True)
                    continue
                except Exception as e:
                    last_err = f"{model_id}: {e}"
                    print(f"[FALLBACK] {model_id} failed ({e}) — trying next key...", flush=True)
                    continue

            print(f"[FALLBACK] Moving to next model after {provider}/{model_id}", flush=True)

        raise RuntimeError("All API keys for all providers are rate limited, exhausted, or invalid. Please check your API keys or try again later.")


class RateLimitError(Exception):
    pass

class TokenExhaustedError(Exception):
    pass

class AuthError(Exception):
    pass

class EmptyResponseError(Exception):
    pass
