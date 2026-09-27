import requests
import time

url = "https://example.com"
print(f"Testing pipeline with: {url}")
print(f"Start time: {time.strftime('%H:%M:%S')}")

response = requests.post(
    "http://localhost:313/api/analyze",
    json={"url": url, "use_tinykit": False},
    timeout=300
)

print(f"Status: {response.status_code}")
print(f"End time: {time.strftime('%H:%M:%S')}")

if response.status_code == 200:
    data = response.json()
    print(f"\n=== STRATEGY ({len(data.get('strategy', ''))} chars) ===")
    print(data.get('strategy', '')[:500])
    print(f"\n=== DESIGN ({len(data.get('design', ''))} chars) ===")
    print(data.get('design', '')[:500])
    print(f"\n=== CODE ({len(data.get('code', ''))} chars) ===")
    print(data.get('code', '')[:300])
    print(f"\n=== Code is valid HTML: {'<!DOCTYPE html>' in data.get('code', '') or '<html' in data.get('code', '')} ===")
else:
    print(f"Error: {response.text}")
