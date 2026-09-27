import requests, json, time

# Check most recent state details
r = requests.get("http://localhost:5001/api/states?limit=5", timeout=5)
states = r.json().get("states", [])
if states:
    for s in states[:3]:
        sid = s.get("id", "").strip()
        url = s.get("url", "?")
        if sid:
            r2 = requests.get(f"http://localhost:5001/api/states/{sid}", timeout=5)
            data = r2.json()
            summary = data.get("summary", {})
            print(f"State: {sid[:16]} - {url}")
            print(f"  Status: {summary}")
            print()
print("Done")
