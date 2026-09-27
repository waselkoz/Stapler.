"""SVG Logo Generator — zero dependencies, pure Python SVG templates."""

import hashlib
import math

ACCENT_COLORS = [
    "#2563eb", "#7c3aed", "#059669", "#d97706",
    "#dc2626", "#db2777", "#0891b2", "#4f46e5",
]

def _accent_from_name(name: str) -> str:
    idx = int(hashlib.md5(name.encode()).hexdigest(), 16) % len(ACCENT_COLORS)
    return ACCENT_COLORS[idx]

def _initials(name: str) -> str:
    parts = name.strip().split()
    if len(parts) >= 2:
        return (parts[0][0] + parts[-1][0]).upper()
    return name[:2].upper() if name else "BR"

def wordmark_logo(brand_name: str, color: str = "#2563eb", dark_bg: bool = False) -> str:
    """Wordmark with a decorative accent line."""
    text_color = "#ffffff" if dark_bg else "#1a1a2e"
    accent = color or _accent_from_name(brand_name)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100" width="400" height="100">
  <defs>
    <linearGradient id="wg-{hashlib.md5(brand_name.encode()).hexdigest()[:8]}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="{accent}" />
      <stop offset="100%" stop-color="{accent}dd" />
    </linearGradient>
  </defs>
  <rect x="0" y="68" width="120" height="3" rx="1.5" fill="url(#wg-{hashlib.md5(brand_name.encode()).hexdigest()[:8]})" />
  <text x="0" y="52" font-family="Georgia, 'Times New Roman', serif" font-size="38" font-weight="700" fill="{text_color}" letter-spacing="-0.5">{brand_name}</text>
</svg>'''

def dual_tone_logo(brand_name: str, color: str = "#2563eb", dark_bg: bool = False) -> str:
    """Two-tone gradient wordmark — feels premium like Stripe/Airbnb."""
    text_color = "#ffffff" if dark_bg else "#1a1a2e"
    accent = color or _accent_from_name(brand_name)
    c2 = _accent_from_name(brand_name + "_alt")
    uid = hashlib.md5(brand_name.encode()).hexdigest()[:8]
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 80" width="400" height="80">
  <defs>
    <linearGradient id="dt-{uid}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{accent}" />
      <stop offset="100%" stop-color="{c2}" />
    </linearGradient>
  </defs>
  <text x="0" y="52" font-family="Georgia, 'Times New Roman', serif" font-size="40" font-weight="800" fill="url(#dt-{uid})" letter-spacing="-1">{brand_name}</text>
</svg>'''

def mark_logo(brand_name: str, color: str = "#2563eb", dark_bg: bool = False) -> str:
    """Abstract geometric mark + company name."""
    text_color = "#ffffff" if dark_bg else "#1a1a2e"
    accent = color or _accent_from_name(brand_name)
    initials = _initials(brand_name)
    uid = hashlib.md5(brand_name.encode()).hexdigest()[:8]
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100" width="400" height="100">
  <defs>
    <linearGradient id="ac-{uid}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{accent}" />
      <stop offset="100%" stop-color="{accent}bb" />
    </linearGradient>
  </defs>
  <circle cx="40" cy="40" r="36" fill="url(#ac-{uid})" />
  <text x="40" y="48" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#ffffff" text-anchor="middle">{initials}</text>
  <text x="95" y="46" font-family="Georgia, 'Times New Roman', serif" font-size="34" font-weight="700" fill="{text_color}" letter-spacing="-0.5">{brand_name}</text>
</svg>'''

def icon_logo(brand_name: str, color: str = "#2563eb", dark_bg: bool = False) -> str:
    """Minimal icon mark — just the initials in a colored circle."""
    accent = color or _accent_from_name(brand_name)
    initials = _initials(brand_name)
    uid = hashlib.md5(brand_name.encode()).hexdigest()[:8]
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
  <defs>
    <linearGradient id="ic-{uid}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{accent}" />
      <stop offset="100%" stop-color="{accent}aa" />
    </linearGradient>
  </defs>
  <circle cx="40" cy="40" r="38" fill="url(#ic-{uid})" />
  <text x="40" y="46" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#ffffff" text-anchor="middle">{initials}</text>
</svg>'''


def generate_all_logos(brand_name: str, color: str = "", dark_bg: bool = False) -> dict:
    return {
        "wordmark": wordmark_logo(brand_name, color, dark_bg),
        "dual_tone": dual_tone_logo(brand_name, color, dark_bg),
        "mark": mark_logo(brand_name, color, dark_bg),
        "icon": icon_logo(brand_name, color, dark_bg),
    }
