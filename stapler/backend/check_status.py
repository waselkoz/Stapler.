import requests, json

# Check traces
r = requests.get("http://localhost:5001/api/traces?limit=10", timeout=5)
traces = r.json().get("traces", [])
print("=== RECENT TRACES ===")
for t in traces[:8]:
    agent = t.get("agent", "?")
    dur = t.get("duration", 0)
    status = t.get("status", "?")
    print(f"  {agent}: {dur:.1f}s ({status})")
print(f"Total: {len(traces)} traces")

# Check states
r2 = requests.get("http://localhost:5001/api/states?limit=5", timeout=5)
states = r2.json().get("states", [])
print("\n=== RECENT STATES ===")
for s in states[:5]:
    sid = s.get("id", "?")[:12]
    url = s.get("url", "?")
    status = s.get("status", "?")
    print(f"  {sid} - {url} - {status}")
print(f"Total: {len(states)} states")
