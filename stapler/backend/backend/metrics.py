"""
Prometheus Metrics — request counts, latency, agent performance
"""

import time
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from fastapi import Request, Response

REQUEST_COUNT = Counter(
    "api_requests_total",
    "Total API requests",
    ["method", "endpoint", "status"],
)

REQUEST_LATENCY = Histogram(
    "api_request_latency_seconds",
    "Request latency in seconds",
    ["endpoint"],
    buckets=[5, 10, 30, 60, 120, 180, 300, 600],
)

AGENT_CALLS = Counter(
    "agent_calls_total",
    "Total agent calls",
    ["agent", "status"],
)

AGENT_LATENCY = Histogram(
    "agent_latency_seconds",
    "Agent call latency",
    ["agent"],
    buckets=[10, 30, 60, 120, 180, 300],
)

ACTIVE_REQUESTS = Gauge(
    "active_requests",
    "Number of requests currently being processed",
)

MODEL_FALLBACKS = Counter(
    "model_fallbacks_total",
    "Number of model fallbacks triggered",
    ["agent", "from_model", "to_model"],
)

SCRAPE_DURATION = Histogram(
    "scrape_duration_seconds",
    "Website scrape duration",
    buckets=[5, 10, 20, 30, 60, 90],
)

CACHE_HITS = Counter(
    "cache_hits_total",
    "Result cache hits",
)

CACHE_MISSES = Counter(
    "cache_misses_total",
    "Result cache misses",
)


class MetricsMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)

        request = Request(scope, receive)
        path = request.url.path

        if path == "/metrics":
            return await self.app(scope, receive, send)

        ACTIVE_REQUESTS.inc()
        start = time.time()
        status = 500

        async def send_wrapper(message):
            nonlocal status
            if message["type"] == "http.response.start":
                status = message.get("status", 500)
            await send(message)

        try:
            await self.app(scope, receive, send_wrapper)
        finally:
            elapsed = time.time() - start
            REQUEST_COUNT.labels(method=request.method, endpoint=path, status=status).inc()
            REQUEST_LATENCY.labels(endpoint=path).observe(elapsed)
            ACTIVE_REQUESTS.dec()

            if path == "/api/analyze":
                REQUEST_LATENCY.labels(endpoint="analyze").observe(elapsed)
            elif path == "/api/branding":
                REQUEST_LATENCY.labels(endpoint="branding").observe(elapsed)


def metrics_endpoint():
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)
