"""
Guardrails — validate agent output before it hits the system
"""

import re
from typing import Optional
from html.parser import HTMLParser


DANGEROUS_PATTERNS = [
    (r"DROP\s+TABLE", "Database drop command detected"),
    (r"DELETE\s+FROM\s+_tk_projects", "Project deletion attempt detected"),
    (r"TRUNCATE", "Truncate command detected"),
    (r"javascript:", "JavaScript URI detected"),
    (r"eval\s*\(", "eval() call detected"),
    (r"document\.(cookie|write)", "DOM manipulation detected"),
    (r"localStorage|sessionStorage", "Browser storage access detected"),
    (r"fetch\s*\(\s*['\"]http", "External HTTP request detected"),
]

HTML_MIN_LENGTH = 100
HTML_REQUIRED_TAGS = ["<html", "<head", "<body"]


class GuardrailResult:
    def __init__(self):
        self.passed = True
        self.issues = []

    def fail(self, issue: str):
        self.passed = False
        self.issues.append(issue)

    def __bool__(self):
        return self.passed

    def __str__(self):
        if self.passed:
            return "PASS"
        return f"FAIL: {'; '.join(self.issues)}"


class _HTMLValidator(HTMLParser):
    def __init__(self):
        super().__init__()
        self.errors = []
        self.tag_stack = []
        self.self_closing = {"area", "base", "br", "col", "embed", "hr", "img",
                             "input", "link", "meta", "param", "source", "track", "wbr"}
        self.found_doctype = False
        self.found_html = False
        self.found_head = False
        self.found_body = False

    def handle_starttag(self, tag, attrs):
        if tag == "html": self.found_html = True
        if tag == "head": self.found_head = True
        if tag == "body": self.found_body = True
        if tag not in self.self_closing:
            self.tag_stack.append(tag)

    def handle_endtag(self, tag):
        if tag in self.self_closing:
            return
        if self.tag_stack and self.tag_stack[-1] == tag:
            self.tag_stack.pop()
        elif tag in self.tag_stack:
            while self.tag_stack and self.tag_stack[-1] != tag:
                self.errors.append(f"Unclosed tag <{self.tag_stack[-1]}>")
                self.tag_stack.pop()
            if self.tag_stack:
                self.tag_stack.pop()

    def handle_decl(self, decl):
        if decl.upper().startswith("DOCTYPE"):
            self.found_doctype = True


def validate_html_structure(html: str) -> dict:
    """Validate HTML structure and return issues found."""
    parser = _HTMLValidator()
    try:
        parser.feed(html)
    except Exception as e:
        return {"valid": False, "issues": [f"Parse error: {e}"], "score": 0}

    issues = []
    if not parser.found_doctype:
        issues.append("Missing DOCTYPE declaration")
    if not parser.found_html:
        issues.append("Missing <html> tag")
    if not parser.found_head:
        issues.append("Missing <head> tag")
    if not parser.found_body:
        issues.append("Missing <body> tag")

    issues.extend(parser.errors)
    if parser.tag_stack:
        issues.append(f"Unclosed tags: {', '.join(parser.tag_stack[:5])}")

    score = max(0, 100 - len(issues) * 10)
    return {"valid": len(issues) == 0, "issues": issues, "score": score}


def validate_html(html: str) -> GuardrailResult:
    result = GuardrailResult()

    if not html or len(html.strip()) < HTML_MIN_LENGTH:
        result.fail(f"HTML too short ({len(html or '')} chars, min {HTML_MIN_LENGTH})")
        return result

    html_lower = html.lower()
    for tag in HTML_REQUIRED_TAGS:
        if tag not in html_lower:
            result.fail(f"Missing required tag: {tag}")

    for pattern, msg in DANGEROUS_PATTERNS:
        if re.search(pattern, html, re.I):
            result.fail(msg)

    if html.count("<") > 10000:
        result.fail("Suspiciously large HTML output")

    return result


def validate_code(code: str) -> GuardrailResult:
    result = GuardrailResult()

    if not code or len(code.strip()) < 50:
        result.fail(f"Code too short ({len(code or '')} chars)")
        return result

    for pattern, msg in DANGEROUS_PATTERNS:
        if re.search(pattern, code, re.I):
            result.fail(msg)

    return result


def validate_prompt(prompt: str) -> GuardrailResult:
    result = GuardrailResult()

    injection_patterns = [
        (r"ignore\s+(all\s+)?previous\s+instructions", "Prompt injection attempt"),
        (r"you\s+are\s+now\s+", "Role hijacking attempt"),
        (r"system\s*:\s*", "System prompt override attempt"),
        (r"<\|im_start\|>", "Token injection attempt"),
    ]

    for pattern, msg in injection_patterns:
        if re.search(pattern, prompt, re.I):
            result.fail(msg)

    return result


def sanitize_output(output: str) -> str:
    output = re.sub(r"<script[^>]*>.*?</script>", "", output, flags=re.I | re.S)
    output = re.sub(r"javascript:", "", output, flags=re.I)
    output = re.sub(r"on\w+\s*=\s*[\"'][^\"']*[\"']", "", output, flags=re.I)
    return output
