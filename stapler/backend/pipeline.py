import sys, asyncio, json, time, webbrowser

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from backend.scraper import scrape_website
from backend.agents import run_strategist, run_branding, run_designer, run_developer, run_qa
from backend.tools import run_all_tools
from backend.guardrails import validate_code, sanitize_output

def log(step, msg):
    t = time.strftime("%H:%M:%S")
    print(f"  [{t}] [{step}] {msg}")

async def run_pipeline(url):
    if not url.startswith("http"):
        url = "https://" + url

    print(f"\n{'='*50}")
    print(f"  PIPELINE: {url}")
    print(f"{'='*50}\n")

    # 1. SCRAPE
    log("SCRAPE", "Fetching website...")
    t0 = time.time()
    result = await asyncio.wait_for(scrape_website(url), timeout=90)
    html = result.get("html", "")
    log("SCRAPE", f"{len(html)} chars fetched ({round(time.time() - t0, 1)}s)")

    if not html:
        print("  ERROR: No content scraped")
        return

    # 2. TOOLS
    log("TOOLS", "Running analysis tools...")
    t0 = time.time()
    tool_data = run_all_tools(html)
    log("TOOLS", f"Done ({round(time.time() - t0, 1)}s)")

    # 3. STRATEGIST
    log("STRATEGIST", "Analyzing strategy...")
    t0 = time.time()
    core = html[:1500]
    strategy = run_strategist(f"URL: {url}\n{core}")
    log("STRATEGIST", f"Done ({round(time.time() - t0, 1)}s)")

    # 4. BRANDING
    log("BRANDING", "Defining brand identity...")
    t0 = time.time()
    branding = run_branding(f"URL: {url}\n\nStrategy:\n{strategy[:3000]}")
    log("BRANDING", f"Done ({round(time.time() - t0, 1)}s)")

    # 5. DESIGNER
    log("DESIGNER", "Generating design plan...")
    t0 = time.time()
    design = run_designer(f"Strategy:\n{strategy[:2000]}\n\nBrand:\n{branding}")
    log("DESIGNER", f"Done ({round(time.time() - t0, 1)}s)")

    # 6. DEVELOPER
    log("DEVELOPER", "Building pages...")
    t0 = time.time()
    code = run_developer(f"Design:\n{design}\n\nOriginal HTML:\n{html[:5000]}")
    log("DEVELOPER", f"Done ({round(time.time() - t0, 1)}s)")

    code_check = validate_code(code)
    if not code_check:
        code = sanitize_output(code)

    # 7. QA
    log("QA", "Running quality review...")
    t0 = time.time()
    qa = run_qa(f"Design:\n{design[:1500]}\n\nCode:\n{code[:2000]}")
    log("QA", f"Done ({round(time.time() - t0, 1)}s)")

    print(f"\n{'='*50}")
    print("  PIPELINE COMPLETE")
    print(f"{'='*50}\n")

    # Save result
    out = {
        "url": url,
        "strategy": strategy,
        "branding": branding,
        "design": design,
        "code": code,
        "qa": qa,
    }

    import os
    out_path = os.path.join(os.path.dirname(__file__), "output.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
    log("SAVE", f"Output saved to {out_path}")

    # Open in browser (Next.js dev server)
    webbrowser.open(f"http://localhost:3000/dashboard")

    print(f"\n  Code length: {len(code)} chars")
    print(f"  QA verdict: {'APPROVED' if 'APPROVED' in qa else 'HAS ISSUES'}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        url = sys.argv[1]
    else:
        url = input("Enter URL: ").strip()

    asyncio.run(run_pipeline(url))
