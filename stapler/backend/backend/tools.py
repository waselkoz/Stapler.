import io
import base64
import re
from typing import Optional


def extract_colors_from_screenshot(screenshot_b64: str, num_colors: int = 5) -> list[dict]:
    """Extract dominant colors from a base64-encoded screenshot."""
    try:
        from pylette import extract_colors
        img_bytes = base64.b64decode(screenshot_b64)
        palette = extract_colors(img_bytes, palette_size=num_colors, resize=256)
        return [
            {
                "hex": c.hex,
                "rgb": list(c.rgb),
                "frequency": round(c.frequency, 3),
            }
            for c in palette
        ]
    except Exception as e:
        return [{"error": str(e)}]


def extract_colors_from_html(html: str) -> list[dict]:
    """Extract colors mentioned in CSS/HTML (hex, rgb, rgba)."""
    hex_colors = re.findall(r'#(?:[0-9a-fA-F]{3}){1,2}\b', html)
    rgb_colors = re.findall(r'rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)', html)
    rgba_colors = re.findall(r'rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)', html)

    seen = set()
    unique = []
    for c in hex_colors + rgb_colors + rgba_colors:
        normalized = c.lower().strip()
        if normalized not in seen and normalized not in ('#fff', '#ffffff', '#000', '#000000', '#ffffff', '#fff'):
            seen.add(normalized)
            unique.append({"value": normalized, "type": "hex" if c.startswith("#") else "rgb"})
    return unique[:20]


def analyze_sentiment(text: str) -> dict:
    """Analyze sentiment of text using VADER."""
    try:
        from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
        analyzer = SentimentIntensityAnalyzer()
        scores = analyzer.polarity_scores(text)

        if scores['compound'] >= 0.05:
            label = 'positive'
        elif scores['compound'] <= -0.05:
            label = 'negative'
        else:
            label = 'neutral'

        return {
            "compound": round(scores['compound'], 3),
            "positive": round(scores['pos'], 3),
            "negative": round(scores['neg'], 3),
            "neutral": round(scores['neu'], 3),
            "label": label,
        }
    except Exception as e:
        return {"error": str(e)}


def analyze_emotional_dimensions(text: str) -> dict:
    """Score text on luxury, trust, confidence, innovation perception."""
    try:
        from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
        analyzer = SentimentIntensityAnalyzer()

        dimensions = {
            "luxury": ["premium", "exclusive", "elegant", "sophisticated", "luxury", "refined",
                       "bespoke", "curated", "artisan", "craft", "heritage", "timeless",
                       "exquisite", "opulent", "deluxe", "plush", "velvet", "marble", "gold"],
            "trust": ["trust", "secure", "reliable", "guaranteed", "certified", "proven",
                      "safe", "protect", "confident", "committed", "honest", "transparent",
                      "authentic", "genuine", "warranty", " insured", "accredited"],
            "confidence": ["bold", "powerful", "strong", "leadership", "expert", "authority",
                          "leading", "innovative", "pioneer", "visionary", "master",
                          "unmatched", "unrivaled", "exceptional", "superior", "best"],
            "innovation": ["innovative", "cutting-edge", "next-gen", "modern", "future",
                          "advanced", "pioneering", "revolutionary", "transformative",
                          "digital", "smart", "intelligent", "automated", "disrupt"],
        }

        text_lower = text.lower()
        scores = {}
        for dim, keywords in dimensions.items():
            hits = sum(1 for kw in keywords if kw in text_lower)
            score = min(10, max(1, int((hits / len(keywords)) * 10) + 1))
            scores[dim] = {
                "score": score,
                "keywords_found": [kw for kw in keywords if kw in text_lower][:5],
            }

        sentiment = analyzer.polarity_scores(text[:512])
        scores["overall_sentiment"] = {
            "compound": round(sentiment['compound'], 3),
            "label": "positive" if sentiment['compound'] > 0.05 else ("negative" if sentiment['compound'] < -0.05 else "neutral"),
        }
        return scores
    except Exception as e:
        return {"error": str(e)}


def check_accessibility(html: str) -> dict:
    """Run WCAG accessibility checks on HTML content using BeautifulSoup."""
    from bs4 import BeautifulSoup
    issues = []
    try:
        soup = BeautifulSoup(html, 'html.parser')

        # Check images for alt text
        imgs = soup.find_all('img')
        for img in imgs:
            src = img.get('src', '')
            if not img.get('alt'):
                issues.append({"severity": "major", "description": f"Missing alt text on <img src='{src[:40]}...'>", "element": f"img[src='{src[:40]}']", "recommendation": "Add descriptive alt attribute"})

        # Check form inputs for labels
        inputs = soup.find_all(['input', 'textarea', 'select'])
        for inp in inputs:
            inp_id = inp.get('id')
            if inp_id:
                label = soup.find('label', attrs={'for': inp_id})
                if not label and not inp.get('aria-label'):
                    name = inp.get('name', '') or inp.get('type', '')
                    issues.append({"severity": "major", "description": f"Form input '{name}' has no associated label", "element": f"input[name='{name}']", "recommendation": "Add <label for='{inp_id}'> or aria-label"})

        # Check link text
        links = soup.find_all('a')
        for link in links:
            text = link.get_text(strip=True)
            if not text and not link.get('aria-label'):
                href = link.get('href', '')[:40]
                issues.append({"severity": "minor", "description": f"Empty link text: <a href='{href}'>", "element": f"a[href='{href}']", "recommendation": "Add link text or aria-label"})

        # Check heading hierarchy
        headings = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
        if headings:
            first_h = headings[0]
            if first_h.name != 'h1':
                issues.append({"severity": "minor", "description": f"First heading is <{first_h.name}>, should be <h1>", "element": str(first_h.name), "recommendation": "Start heading hierarchy with <h1>"})
            for i in range(1, len(headings)):
                prev = int(headings[i-1].name[1])
                curr = int(headings[i].name[1])
                if curr > prev + 1:
                    issues.append({"severity": "minor", "description": f"Heading jump from <{headings[i-1].name}> to <{headings[i].name}>", "element": str(headings[i].name), "recommendation": "Avoid skipping heading levels"})

        # Check for ARIA landmarks
        landmarks = soup.find_all(['nav', 'main', 'header', 'footer', 'aside'])
        if not landmarks:
            issues.append({"severity": "minor", "description": "No semantic landmarks found (<nav>, <main>, <header>, <footer>)", "element": "body", "recommendation": "Use semantic HTML5 elements for better screen reader navigation"})

        score = max(0, 100 - len(issues) * 8)
        return {"score": score, "issues_count": len(issues), "issues": issues[:20], "level": "AA"}
    except Exception as e:
        return {"score": 0, "error": str(e), "issues_count": 0, "issues": []}


def extract_text_from_html(html: str) -> str:
    """Extract visible text from HTML for sentiment analysis."""
    from bs4 import BeautifulSoup
    try:
        soup = BeautifulSoup(html, 'html.parser')
        for tag in soup(['script', 'style', 'meta', 'link', 'noscript']):
            tag.decompose()
        text = soup.get_text(separator=' ', strip=True)
        return text[:3000]
    except Exception:
        return ""


def extract_ctas_from_html(html: str) -> list[dict]:
    """Extract call-to-action elements from HTML."""
    from bs4 import BeautifulSoup
    try:
        soup = BeautifulSoup(html, 'html.parser')
        ctas = []

        for btn in soup.find_all(['button', 'a']):
            text = btn.get_text(strip=True)
            href = btn.get('href', '')
            classes = ' '.join(btn.get('class', []))

            if text and len(text) < 50:
                ctas.append({
                    "text": text,
                    "href": href,
                    "classes": classes,
                    "tag": btn.name,
                })
        return ctas[:15]
    except Exception:
        return []


def analyze_heatmap_zones(html: str) -> list[dict]:
    """Predict attention zones based on HTML structure and CSS."""
    from bs4 import BeautifulSoup
    try:
        soup = BeautifulSoup(html, 'html.parser')
        zones = []

        hero = soup.find(['section', 'div'], class_=re.compile(r'hero|banner|header|main.*hero', re.I))
        if hero:
            zones.append({
                "zone": "Hero / Above the fold",
                "attention": "High",
                "reason": "First visual element visitors see. Large text and imagery draw immediate attention.",
                "elements": len(hero.find_all(['h1', 'h2', 'img', 'button'])),
            })

        nav = soup.find('nav')
        if nav:
            links = nav.find_all('a')
            zones.append({
                "zone": "Navigation bar",
                "attention": "Medium-High",
                "reason": "Users scan nav first to orient themselves. {} links detected.".format(len(links)),
                "elements": len(links),
            })

        forms = soup.find_all('form')
        for i, form in enumerate(forms[:2]):
            inputs = form.find_all(['input', 'textarea', 'select'])
            zones.append({
                "zone": "Form / Contact area {}".format(i + 1),
                "attention": "Medium",
                "reason": "Forms attract attention when positioned prominently. {} input fields.".format(len(inputs)),
                "elements": len(inputs),
            })

        images = soup.find_all('img')
        if images:
            zones.append({
                "zone": "Visual content area",
                "attention": "High",
                "reason": "{} images found. Visual content naturally draws eye movement.".format(len(images)),
                "elements": len(images),
            })

        cta_buttons = soup.find_all(['button', 'a'], class_=re.compile(r'btn|button|cta|call.*action', re.I))
        if cta_buttons:
            zones.append({
                "zone": "CTA buttons",
                "attention": "High (if well-placed)",
                "reason": "{} CTA elements detected. Color contrast and placement determine click likelihood.".format(len(cta_buttons)),
                "elements": len(cta_buttons),
            })

        sections = soup.find_all(['section', 'div'], class_=re.compile(r'section|feature|benefit|content', re.I))
        if sections:
            zones.append({
                "zone": "Below-fold content sections",
                "attention": "Low-Medium",
                "reason": "{} content sections found. Scroll probability depends on hero effectiveness.".format(len(sections)),
                "elements": len(sections),
            })

        footer = soup.find('footer')
        if footer:
            links = footer.find_all('a')
            zones.append({
                "zone": "Footer",
                "attention": "Low",
                "reason": "{} footer links. Mostly used for navigation fallback, contact info, legal.".format(len(links)),
                "elements": len(links),
            })

        return zones
    except Exception:
        return []


def analyze_seo(html: str, url: str = "") -> dict:
    """SEO analysis — meta tags, headings, images, links, keywords."""
    from bs4 import BeautifulSoup
    from urllib.parse import urlparse
    try:
        soup = BeautifulSoup(html, 'html.parser')
        issues = []
        score = 100

        # Title
        title_tag = soup.find('title')
        title = title_tag.get_text(strip=True) if title_tag else ""
        if not title:
            issues.append({"severity": "critical", "category": "meta", "description": "Missing <title> tag", "recommendation": "Add a unique, descriptive <title> (50-60 chars)"})
            score -= 15
        elif len(title) > 60:
            issues.append({"severity": "minor", "category": "meta", "description": f"Title too long ({len(title)} chars): '{title[:50]}...'", "recommendation": "Keep titles under 60 characters"})

        # Meta description
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        desc = meta_desc.get('content', '') if meta_desc else ""
        if not desc:
            issues.append({"severity": "major", "category": "meta", "description": "Missing meta description", "recommendation": "Add <meta name='description' content='...'> (120-160 chars)"})
            score -= 10
        elif len(desc) > 160:
            issues.append({"severity": "minor", "category": "meta", "description": f"Meta description too long ({len(desc)} chars)", "recommendation": "Keep meta descriptions under 160 characters"})

        # Viewport
        viewport = soup.find('meta', attrs={'name': 'viewport'})
        if not viewport:
            issues.append({"severity": "critical", "category": "meta", "description": "Missing viewport meta tag", "recommendation": "Add <meta name='viewport' content='width=device-width, initial-scale=1'>"})
            score -= 15

        # OG tags
        og_title = soup.find('meta', attrs={'property': 'og:title'})
        og_desc = soup.find('meta', attrs={'property': 'og:description'})
        og_image = soup.find('meta', attrs={'property': 'og:image'})
        if not og_title:
            issues.append({"severity": "major", "category": "social", "description": "Missing og:title", "recommendation": "Add Open Graph tags for better social sharing"})
            score -= 5
        if not og_image:
            issues.append({"severity": "minor", "category": "social", "description": "Missing og:image", "recommendation": "Add an Open Graph image for link previews"})
            score -= 3

        # Canonical
        canonical = soup.find('link', attrs={'rel': 'canonical'})
        if not canonical:
            issues.append({"severity": "minor", "category": "meta", "description": "Missing canonical link", "recommendation": "Add <link rel='canonical' href='...'> to prevent duplicate content issues"})
            score -= 3

        # Headings
        h1s = soup.find_all('h1')
        if len(h1s) == 0:
            issues.append({"severity": "major", "category": "structure", "description": "No <h1> heading found", "recommendation": "Each page should have exactly one <h1>"})
            score -= 10
        elif len(h1s) > 1:
            issues.append({"severity": "minor", "category": "structure", "description": f"Multiple <h1> tags ({len(h1s)}) found", "recommendation": "Use only one <h1> per page"})
            score -= 5

        # Images without alt
        imgs = soup.find_all('img')
        no_alt = [img for img in imgs if not img.get('alt')]
        if no_alt:
            issues.append({"severity": "major", "category": "accessibility", "description": f"{len(no_alt)} images missing alt text", "recommendation": "Add descriptive alt attributes to all images"})
            score -= min(15, len(no_alt) * 3)

        # Links
        links = soup.find_all('a', href=True)
        broken_links = [l for l in links if l['href'].startswith('#') and not soup.find(id=l['href'][1:])]
        if broken_links:
            issues.append({"severity": "minor", "category": "links", "description": f"{len(broken_links)} anchor links with no matching id", "recommendation": "Fix or remove broken anchor links"})
            score -= 3

        # Word count
        text = soup.get_text(separator=' ', strip=True)
        word_count = len(text.split())
        if word_count < 300:
            issues.append({"severity": "minor", "category": "content", "description": f"Thin content (~{word_count} words)", "recommendation": "Aim for at least 300 words per page for better SEO"})
            score -= 5

        # Schema.org
        schema = soup.find('script', attrs={'type': 'application/ld+json'})
        has_schema = bool(schema)
        if not has_schema:
            issues.append({"severity": "minor", "category": "structured_data", "description": "No structured data (JSON-LD) found", "recommendation": "Add Schema.org structured data for rich snippets"})
            score -= 3

        return {
            "score": max(0, score),
            "title": title,
            "description": desc[:160] if desc else "",
            "word_count": word_count,
            "has_schema": has_schema,
            "issues": issues[:25],
            "issues_count": len(issues),
        }
    except Exception as e:
        return {"score": 0, "error": str(e), "issues": []}


def run_all_tools(html: str, screenshot_b64: Optional[str] = None) -> dict:
    """Run all analysis tools and return structured results."""
    text = extract_text_from_html(html)
    colors_from_html = extract_colors_from_html(html)
    ctas = extract_ctas_from_html(html)
    heatmap_zones = analyze_heatmap_zones(html)

    colors_from_screenshot = []
    if screenshot_b64:
        colors_from_screenshot = extract_colors_from_screenshot(screenshot_b64)

    sentiment = {}
    emotional = {}
    if text:
        sentiment = analyze_sentiment(text)
        emotional = analyze_emotional_dimensions(text)

    accessibility = check_accessibility(html)

    try:
        from backend.quality import full_quality_report
        quality = full_quality_report(html)
    except Exception:
        quality = {"overall_score": 0, "error": "quality check failed"}

    return {
        "colors_from_html": colors_from_html,
        "colors_from_screenshot": colors_from_screenshot,
        "text_sentiment": sentiment,
        "emotional_dimensions": emotional,
        "accessibility": accessibility,
        "ctas_detected": ctas,
        "heatmap_zones": heatmap_zones,
        "text_sample": text[:500],
        "quality_score": quality.get("overall_score", 0),
        "quality_report": quality,
    }
