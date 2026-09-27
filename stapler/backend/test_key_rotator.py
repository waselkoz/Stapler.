"""
Test suite for the OpenRouter + Groq API Key Rotator.
Tests per-provider rotation, cooldown, failure handling, recovery, and status.
"""
import sys
import time
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.api_key_manager import APIKeyManager
from backend.opencode_client import get_key_manager, PROVIDERS

PASS = 0
FAIL = 0

def check(name, condition, detail=""):
    global PASS, FAIL
    if condition:
        PASS += 1
        print(f"  [PASS] {name}")
    else:
        FAIL += 1
        print(f"  [FAIL] {name} — {detail}")


def test_round_robin():
    print("\n--- Test: Round-Robin Rotation ---")
    km = APIKeyManager(["key-a", "key-b", "key-c"], cooldown_seconds=60)
    check("loaded 3 keys", km.count == 3)

    k1 = km.get_key()
    k2 = km.get_key()
    k3 = km.get_key()
    k4 = km.get_key()

    check("rotation cycles through keys", k1 == "key-a" and k2 == "key-b" and k3 == "key-c")
    check("wraps around to first key", k4 == "key-a")


def test_failure_cooldown():
    print("\n--- Test: Failure & Cooldown ---")
    km = APIKeyManager(["key-a", "key-b"], cooldown_seconds=5)

    km.report_failure("key-a")
    km.report_failure("key-a")
    s = km.status()
    check("2 failures: all still available (below threshold)", s["available"] == 2)

    km.report_failure("key-a")
    s = km.status()
    check("3 failures: key-a on cooldown", s["cooldown"] == 1)
    check("3 failures: key-b still available", s["available"] == 1)

    k = km.get_key()
    check("get_key returns the available key", k == "key-b")


def test_rate_limit_immediate_cooldown():
    print("\n--- Test: Rate Limit Triggers Immediate Cooldown ---")
    km = APIKeyManager(["key-a", "key-b"], cooldown_seconds=10)

    km.report_failure("key-a", rate_limited=True)
    s = km.status()
    check("rate_limit=true: immediate cooldown", s["cooldown"] == 1)
    check("rate_limit=true: key-b available", s["available"] == 1)

    k = km.get_key()
    check("get_key skips rate-limited key", k == "key-b")


def test_success_resets_key():
    print("\n--- Test: Success Resets Key ---")
    km = APIKeyManager(["key-a"], cooldown_seconds=60)

    km.report_failure("key-a")
    km.report_failure("key-a")
    km.report_failure("key-a")
    s = km.status()
    check("3 failures: key-a on cooldown", s["cooldown"] == 1)

    km.report_success("key-a")
    s = km.status()
    check("success resets cooldown", s["cooldown"] == 0)
    check("success resets to available", s["available"] == 1)

    k = km.get_key()
    check("key usable after success", k == "key-a")


def test_all_keys_on_cooldown():
    print("\n--- Test: All Keys on Cooldown ---")
    km = APIKeyManager(["key-a", "key-b"], cooldown_seconds=300)

    km.report_failure("key-a", rate_limited=True)
    km.report_failure("key-b", rate_limited=True)

    s = km.status()
    check("both keys on cooldown", s["cooldown"] == 2)
    check("no keys available", s["available"] == 0)

    k = km.get_key()
    check("get_key returns earliest-expiring key when all exhausted", k is not None)


def test_cooldown_expiration():
    print("\n--- Test: Cooldown Expiration ---")
    km = APIKeyManager(["key-a"], cooldown_seconds=1)

    km.report_failure("key-a", rate_limited=True)
    s = km.status()
    check("key on cooldown immediately", s["cooldown"] == 1)

    time.sleep(2)

    s = km.status()
    check("key available after cooldown expires", s["available"] == 1)

    k = km.get_key()
    check("get_key returns key after cooldown", k == "key-a")


def test_exponential_cooldown():
    print("\n--- Test: Exponential Cooldown ---")
    km = APIKeyManager(["key-a"], cooldown_seconds=10)

    km.report_failure("key-a")
    km.report_failure("key-a")
    km.report_failure("key-a")
    s = km.status()
    check("3 failures: cooldown=30s", s["cooldown"] == 1)

    km.report_success("key-a")
    for i in range(4):
        km.report_failure("key-a")
    s = km.status()
    check("4 failures: key on cooldown", s["cooldown"] == 1)

    km.report_success("key-a")
    for i in range(11):
        km.report_failure("key-a")
    k = km.get_key()
    check("exponential cooldown caps at 10x", k is not None)


def test_from_env():
    print("\n--- Test: from_env Factory ---")
    os.environ["TEST_KEYS"] = "env-key-1,env-key-2,env-key-3"
    km = APIKeyManager.from_env(env_var="TEST_KEYS", cooldown=30)
    check("from_env loads 3 keys", km.count == 3)

    os.environ["TEST_KEYS"] = ""
    km2 = APIKeyManager.from_env(env_var="TEST_KEYS")
    check("from_env handles empty env", km2.count == 0)

    del os.environ["TEST_KEYS"]


def test_status():
    print("\n--- Test: Status Report ---")
    km = APIKeyManager(["a", "b", "c", "d"], cooldown_seconds=60)
    s = km.status()
    check("total=4", s["total"] == 4)
    check("available=4", s["available"] == 4)
    check("cooldown=0", s["cooldown"] == 0)

    km.report_failure("a", rate_limited=True)
    km.report_failure("b", rate_limited=True)
    s = km.status()
    check("after 2 rate-limits: total=4, available=2, cooldown=2",
          s["total"] == 4 and s["available"] == 2 and s["cooldown"] == 2)


def test_thread_safety():
    print("\n--- Test: Thread Safety ---")
    import threading
    km = APIKeyManager(["k1", "k2", "k3", "k4", "k5"], cooldown_seconds=60)
    results = []

    def get_keys(n):
        for _ in range(n):
            k = km.get_key()
            results.append(k)

    threads = [threading.Thread(target=get_keys, args=(50,)) for _ in range(10)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    check("500 concurrent gets returned keys", len(results) == 500)
    check("all returned keys are valid", all(k in ["k1", "k2", "k3", "k4", "k5"] for k in results))


def test_single_key():
    print("\n--- Test: Single Key Behavior ---")
    km = APIKeyManager(["only-key"], cooldown_seconds=60)

    k = km.get_key()
    check("single key returned", k == "only-key")

    km.report_failure("only-key", rate_limited=True)
    s = km.status()
    check("single key on cooldown", s["available"] == 0)

    k = km.get_key()
    check("single key still returned when on cooldown (within 300s)", k == "only-key")


def test_multi_provider():
    print("\n--- Test: Multi-Provider Key Managers ---")

    os.environ["OPENROUTER_API_KEYS"] = "or-key-1,or-key-2"
    os.environ["GROQ_API_KEYS"] = "gsk-key-1"

    # Reset the cache to test fresh initialization
    from backend import opencode_client
    opencode_client._provider_managers.clear()

    km_or = get_key_manager("openrouter")
    km_groq = get_key_manager("groq")

    check("openrouter has 2 keys", km_or.count == 2)
    check("groq has 1 key", km_groq.count == 1)

    or_key = km_or.get_key()
    groq_key = km_groq.get_key()
    check("openrouter key returned", or_key == "or-key-1")
    check("groq key returned", groq_key == "gsk-key-1")

    # Simulate failure on openrouter — groq should be unaffected
    km_or.report_failure("or-key-1", rate_limited=True)
    or_key2 = km_or.get_key()
    groq_key2 = km_groq.get_key()
    check("openrouter rotates past failed key", or_key2 == "or-key-2")
    check("groq unaffected by openrouter failure", groq_key2 == "gsk-key-1")

    # Simulate failure on groq — openrouter should be unaffected
    km_groq.report_failure("gsk-key-1", rate_limited=True)
    groq_key3 = km_groq.get_key()
    check("groq returns key when on cooldown (within 300s)", groq_key3 == "gsk-key-1")

    or_key3 = km_or.get_key()
    check("openrouter unaffected by groq failure", or_key3 is not None)

    # Clean up
    opencode_client._provider_managers.clear()
    del os.environ["OPENROUTER_API_KEYS"]
    del os.environ["GROQ_API_KEYS"]


def test_provider_registry():
    print("\n--- Test: Provider Registry ---")
    check("openrouter provider exists", "openrouter" in PROVIDERS)
    check("groq provider exists", "groq" in PROVIDERS)
    check("openrouter has base_url", "base_url" in PROVIDERS["openrouter"])
    check("groq has base_url", "base_url" in PROVIDERS["groq"])
    check("openrouter has extra_headers", "extra_headers" in PROVIDERS["openrouter"])


if __name__ == "__main__":
    print("=" * 50)
    print("  Multi-Provider API Key Rotator — Test Suite")
    print("=" * 50)

    test_round_robin()
    test_failure_cooldown()
    test_rate_limit_immediate_cooldown()
    test_success_resets_key()
    test_all_keys_on_cooldown()
    test_cooldown_expiration()
    test_exponential_cooldown()
    test_from_env()
    test_status()
    test_thread_safety()
    test_single_key()
    test_multi_provider()
    test_provider_registry()

    print("\n" + "=" * 50)
    print(f"  Results: {PASS} passed, {FAIL} failed")
    print("=" * 50)

    sys.exit(1 if FAIL > 0 else 0)
