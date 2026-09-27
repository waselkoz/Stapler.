import requests, json, time

t0 = time.time()
print("Testing full graph pipeline...\n")
resp = requests.post(
    "http://localhost:5001/api/analyze",
    json={"url": "https://example.com", "use_tinykit": False},
    timeout=900,
    stream=True,
)

for line in resp.iter_lines():
    if line:
        line = line.decode().strip()
        if line.startswith("data: "):
            data = json.loads(line[6:])
            elapsed = time.time() - t0
            if "step" in data and data["step"] != "Initializing pipeline for https://example.com":
                print(f"  [{elapsed:5.1f}s] {data['step']}")
            if "error" in data:
                print(f"  ERROR: {data['error']}")
                break
            if data.get("done"):
                state = data.get("full_state", {})
                print(f"\n=== PIPELINE DONE in {elapsed:.1f}s ===")
                for k in ["strategy", "marketing", "branding", "design", "logos", "charts", "code"]:
                    v = state.get(k, "")
                    print(f"  {k}: {len(v)} chars")
                print(f"  qa_passed: {state.get('qa_passed')}")
                print(f"  qa: {state.get('qa','')[:150]}")
                break

print(f"\nTotal wall time: {time.time()-t0:.1f}s")
