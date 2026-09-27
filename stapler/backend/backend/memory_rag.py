import json
import os
import time

MEMORY_FILE = os.path.join(os.path.dirname(__file__), "..", "agent_memory.json")

# Simulated RAG (Vector DB) Gold Standards for Few-Shot Prompting
GOLD_STANDARDS = {
    "ecommerce": {
        "roast_example": "Your landing page looks like a 2014 Shopify dropshipping scam. The ATC (Add to Cart) button is buried below the fold, and your contrast ratio makes the text unreadable.",
        "hook_example": "POV: You just found the only skincare brand that actually posts their unedited lab results.",
        "funnel_example": ["TikTok Top-of-Funnel organic hook", "Retargeting FB ad with 20% discount", "Email capture popup on exit intent"]
    },
    "saas": {
        "roast_example": "You have 5 different pricing tiers and no clear value prop above the fold. Users have 3 seconds to understand what you do, and right now, they think you're an IT consulting firm.",
        "hook_example": "We automated the one task you spend 10 hours a week avoiding.",
        "funnel_example": ["LinkedIn thought-leadership post", "Lead magnet gated PDF", "Automated email sequence pushing to booked demo"]
    }
}

def load_memory():
    if os.path.exists(MEMORY_FILE):
        try:
            with open(MEMORY_FILE, "r") as f:
                return json.load(f)
        except:
            return []
    return []

def save_memory(idea: str, roast: str):
    mem = load_memory()
    mem.append({"timestamp": time.time(), "idea": idea, "roast": roast})
    mem = mem[-10:] # Keep recent 10
    with open(MEMORY_FILE, "w") as f:
        json.dump(mem, f)

def get_relevant_gold_standard(idea: str) -> str:
    idea_lower = idea.lower()
    if "ecommerce" in idea_lower or "shop" in idea_lower or "store" in idea_lower or "product" in idea_lower:
        return json.dumps(GOLD_STANDARDS["ecommerce"], indent=2)
    return json.dumps(GOLD_STANDARDS["saas"], indent=2)

def get_past_context() -> str:
    mem = load_memory()
    if not mem: return ""
    return "\n--- MEM0 PAST AGENT MEMORY ---\nDo not repeat past generic mistakes. Here is what we did recently:\n" + "\n".join([f"Past Idea: {m['idea'][:50]}... -> Past Roast: {m['roast'][:100]}..." for m in mem[-3:]])
