import os
from urllib.parse import urlparse
from playwright.async_api import async_playwright

BREAKPOINTS = {
    "desktop": {"width": 1440, "height": 900},
    "tablet": {"width": 768, "height": 1024},
    "mobile": {"width": 375, "height": 812},
}

BLOCKED_HOSTS = {
    "localhost", "127.0.0.1", "0.0.0.0", "::1",
    "169.254.169.254", "metadata.google.internal", "100.100.100.200",
}


def _validate_url(url: str) -> str | None:
    """Return error message if URL is unsafe, None if OK."""
    try:
        parsed = urlparse(url)
    except Exception:
        return "Invalid URL"

    if parsed.scheme not in ("http", "https"):
        return f"Only http/https URLs allowed, got '{parsed.scheme}'"

    hostname = (parsed.hostname or "").lower()
    if not hostname:
        return "No hostname in URL"
    if hostname in BLOCKED_HOSTS:
        return f"Access to '{hostname}' is blocked"

    private_prefixes = ("10.", "172.16.", "172.17.", "172.18.", "172.19.",
                        "172.20.", "172.21.", "172.22.", "172.23.", "172.24.",
                        "172.25.", "172.26.", "172.27.", "172.28.", "172.29.",
                        "172.30.", "172.31.", "192.168.")
    if hostname.startswith(private_prefixes):
        return f"Access to private IP '{hostname}' is blocked"

    return None


async def scrape_website(url: str, output_dir="tmp"):
    os.makedirs(output_dir, exist_ok=True)
    screenshots = {}

    error = _validate_url(url)
    if error:
        return {"html": None, "screenshots": {}, "screenshot_path": None, "error": error}

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        try:
            # Desktop — get HTML + screenshot
            page = await browser.new_page(viewport=BREAKPOINTS["desktop"])
            await page.goto(url, wait_until="domcontentloaded", timeout=30000)
            await page.wait_for_timeout(1500)
            html_content = await page.content()
            screenshots["desktop"] = os.path.join(output_dir, "screenshot_desktop.png")
            await page.screenshot(path=screenshots["desktop"], full_page=False)
            await page.close()

            # Tablet
            page = await browser.new_page(viewport=BREAKPOINTS["tablet"])
            await page.goto(url, wait_until="domcontentloaded", timeout=20000)
            await page.wait_for_timeout(1000)
            screenshots["tablet"] = os.path.join(output_dir, "screenshot_tablet.png")
            await page.screenshot(path=screenshots["tablet"], full_page=False)
            await page.close()

            # Mobile
            page = await browser.new_page(viewport=BREAKPOINTS["mobile"])
            await page.goto(url, wait_until="domcontentloaded", timeout=20000)
            await page.wait_for_timeout(1000)
            screenshots["mobile"] = os.path.join(output_dir, "screenshot_mobile.png")
            await page.screenshot(path=screenshots["mobile"], full_page=False)
            await page.close()

            return {
                "html": html_content,
                "screenshots": screenshots,
                "screenshot_path": screenshots["desktop"],
                "error": None
            }
        except Exception as e:
            return {"html": None, "screenshots": {}, "screenshot_path": None, "error": str(e)}
        finally:
            await browser.close()
