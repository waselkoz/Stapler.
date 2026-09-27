"""
API Key Manager — rotates through multiple keys on failure.
Tracks which keys are exhausted/rate-limited and auto-recovers.
"""

import os
import time
import threading
from typing import List, Optional


class KeyState:
    __slots__ = ("key", "failures", "last_failure", "cooldown_until", "total_failures")

    def __init__(self, key: str):
        self.key = key
        self.failures = 0
        self.last_failure = 0.0
        self.cooldown_until = 0.0
        self.total_failures = 0


class APIKeyManager:
    def __init__(self, keys: List[str], cooldown_seconds: int = 60):
        self._keys = [KeyState(k) for k in keys if k and k.strip()]
        self._cooldown = cooldown_seconds
        self._idx = 0
        self._lock = threading.Lock()

    @classmethod
    def from_env(cls, env_var: str = "OPENROUTER_API_KEYS", cooldown: int = 60) -> "APIKeyManager":
        raw = os.getenv(env_var, "")
        keys = [k.strip() for k in raw.split(",") if k.strip()]
        return cls(keys, cooldown)

    @property
    def count(self) -> int:
        return len(self._keys)

    def get_key(self) -> Optional[str]:
        """Return the next available key, or None if all are on cooldown."""
        with self._lock:
            now = time.time()
            for _ in range(len(self._keys)):
                ks = self._keys[self._idx % len(self._keys)]
                self._idx += 1
                if ks.cooldown_until < now:
                    return ks.key
            # All on cooldown — pick the one whose cooldown expires soonest
            earliest = min(self._keys, key=lambda k: k.cooldown_until)
            if earliest.cooldown_until < now + 300:
                return earliest.key
        return None

    def report_failure(self, key: str, rate_limited: bool = False):
        with self._lock:
            for ks in self._keys:
                if ks.key == key:
                    ks.failures += 1
                    ks.total_failures += 1
                    ks.last_failure = time.time()
                    cooldown = 5 if ks.failures <= 2 else self._cooldown * min(ks.failures, 5)
                    ks.cooldown_until = time.time() + cooldown
                    print(f"[KEY-MGR] Key ...{key[-6:]} on cooldown for {cooldown}s (failure #{ks.failures})", flush=True)
                    return

    def report_success(self, key: str):
        with self._lock:
            for ks in self._keys:
                if ks.key == key:
                    ks.failures = 0
                    ks.cooldown_until = 0
                    return

    def status(self) -> dict:
        with self._lock:
            now = time.time()
            return {
                "total": len(self._keys),
                "available": sum(1 for ks in self._keys if ks.cooldown_until < now),
                "cooldown": sum(1 for ks in self._keys if ks.cooldown_until >= now),
            }
