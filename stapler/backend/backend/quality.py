import re
from typing import Optional


def validate_html_structure(html: str) -> dict:
    issues = []
    if not html:
        return {"valid": False, "issues": ["Empty HTML"], "score": 0}

    html_lower = html.lower()

    checks = {
        "doctype": "<!doctype html" in html_lower,
        "html_tag": "<html" in html_lower,
        "head_tag": "<head" in html_lower,
        "body_tag": "<body" in html_lower,
        "closing_html": "</html>" in html_lower,
        "closing_body": "</body>" in html_lower,
        "closing_head": "</head>" in html_lower,
        "viewport": 'name="viewport"' in html_lower or "name='viewport'" in html_lower,
        "charset": 'charset="utf-8"' in html_lower or "charset='utf-8'" in html_lower or 'charset="UTF-8"' in html_lower,
        "title": "<title>" in html_lower and "</title>" in html_lower,
    }

    for check, passed in checks.items():
        if not passed:
            issues.append(f"Missing {check}")

    stack = []
    self_closing = {"area", "base", "br", "col", "embed", "hr", "img", "input",
                    "link", "meta", "param", "source", "track", "wbr"}
    unclosed = re.findall(r'<(/?)(\w+)[^>]*>', html)
    for is_closing, tag in unclosed:
        tag = tag.lower()
        if tag in self_closing:
            continue
        if not is_closing:
            stack.append(tag)
        else:
            if stack and stack[-1] == tag:
                stack.pop()

    if stack:
        issues.append(f"Unclosed tags: {', '.join(stack[:5])}")

    score = max(0, 100 - len(issues) * 10)
    return {"valid": len(issues) == 0, "issues": issues, "score": score}


def check_responsive_css(html: str) -> dict:
    has_media = "@media" in html
    has_viewport = 'name="viewport"' in html.lower() or "name='viewport'" in html.lower()
    has_clamp = "clamp(" in html
    has_grid = "display: grid" in html or "display:grid" in html or "grid-template" in html
    has_flex = "display: flex" in html or "display:flex" in html
    has_rem = any(f"{n}rem" in html for n in range(1, 10)) or any(f"{n}.{m}rem" in html for n in range(1, 10) for m in range(0, 10))

    responsive_score = sum([has_media, has_viewport, has_clamp, has_grid, has_flex, has_rem]) * 16

    return {
        "responsive_score": min(100, responsive_score),
        "has_media_queries": has_media,
        "has_viewport_meta": has_viewport,
        "has_clamp": has_clamp,
        "has_css_grid": has_grid,
        "has_flexbox": has_flex,
        "has_rem_units": has_rem,
    }


def check_accessibility_html(html: str) -> dict:
    issues = []
    score = 100

    soup = None
    try:
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(html, 'html.parser')
    except Exception:
        return {"score": 50, "issues": ["Could not parse HTML for accessibility check"], "details": {}}

    if soup:
        images = soup.find_all('img')
        missing_alt = [img.get('src', 'unknown') for img in images if not img.get('alt')]
        if missing_alt:
            issues.append(f"{len(missing_alt)} images missing alt text")
            score -= len(missing_alt) * 5

        links = soup.find_all('a')
        empty_links = [a.get('href', '') for a in links if not a.get_text(strip=True) and a.get('href')]
        if empty_links:
            issues.append(f"{len(empty_links)} links have no text content")
            score -= len(empty_links) * 3

        buttons = soup.find_all('button')
        for btn in buttons:
            if not btn.get_text(strip=True) and not btn.get('aria-label'):
                issues.append("Button with no accessible name")
                score -= 5
                break

        headings = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
        h1_count = sum(1 for h in headings if h.name == 'h1')
        if h1_count == 0:
            issues.append("No h1 heading found")
            score -= 10
        elif h1_count > 1:
            issues.append(f"Multiple h1 headings ({h1_count})")
            score -= 5

        landmarks = {
            'nav': bool(soup.find('nav')),
            'main': bool(soup.find('main')),
            'footer_landmark': bool(soup.find('footer')),
            'header_landmark': bool(soup.find('header')),
        }
        missing_landmarks = [name for name, present in landmarks.items() if not present]
        if missing_landmarks:
            issues.append(f"Missing landmarks: {', '.join(missing_landmarks)}")
            score -= len(missing_landmarks) * 5

        form_inputs = soup.find_all(['input', 'textarea', 'select'])
        unlabeled = []
        for inp in form_inputs:
            inp_id = inp.get('id', '')
            if inp_id:
                label = soup.find('label', attrs={'for': inp_id})
                if not label and not inp.get('aria-label') and not inp.get('placeholder'):
                    unlabeled.append(inp_id or inp.get('name', 'unknown'))
            elif inp.get('type') not in ('hidden', 'submit', 'button', 'image'):
                if not inp.get('aria-label') and not inp.get('placeholder'):
                    unlabeled.append(inp.get('name', 'unknown'))
        if unlabeled:
            issues.append(f"{len(unlabeled)} form inputs lack labels")
            score -= len(unlabeled) * 3

    return {
        "score": max(0, score),
        "issues": issues,
        "details": {
            "images_missing_alt": len(missing_alt) if soup else 0,
            "empty_links": len(empty_links) if soup else 0,
            "h1_count": h1_count if soup else 0,
            "missing_landmarks": missing_landmarks if soup else [],
            "unlabeled_inputs": len(unlabeled) if soup else 0,
        }
    }


def check_performance_indicators(html: str) -> dict:
    score = 100
    findings = []

    inline_styles = len(re.findall(r'style\s*=\s*["\']', html))
    if inline_styles > 10:
        findings.append(f"{inline_styles} inline styles (use CSS classes instead)")
        score -= min(20, inline_styles)

    external_requests = len(re.findall(r'<link[^>]*href=["\']https?://', html, re.I))
    external_requests += len(re.findall(r'<script[^>]*src=["\']https?://', html, re.I))
    if external_requests > 15:
        findings.append(f"{external_requests} external requests may slow loading")
        score -= min(15, external_requests)

    total_size = len(html)
    if total_size > 100000:
        findings.append(f"HTML is large ({total_size/1000:.0f}KB)")
        score -= 10

    return {"performance_score": max(0, score), "findings": findings, "total_size_kb": round(total_size / 1000, 1)}


def full_quality_report(html: str) -> dict:
    structure = validate_html_structure(html)
    responsive = check_responsive_css(html)
    a11y = check_accessibility_html(html)
    perf = check_performance_indicators(html)

    overall = int((structure["score"] * 0.3 + responsive["responsive_score"] * 0.2 + a11y["score"] * 0.3 + perf["performance_score"] * 0.2))

    return {
        "overall_score": overall,
        "structure": structure,
        "responsive": responsive,
        "accessibility": a11y,
        "performance": perf,
    }
