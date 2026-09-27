import asyncio
import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from backend.stapler_graph import stapler_graph

async def test_graph():
    config = {"configurable": {"thread_id": "test_thread_1"}}
    try:
        from langgraph.types import Command
        res = await asyncio.to_thread(stapler_graph.invoke, {"input_idea": "I want to sell computers", "screenshot_b64": None, "iterations": 0}, config)
        print("Initial Success!")
        print(res.get("messages", [])[-1])
        
        # Now resume!
        res2 = await asyncio.to_thread(stapler_graph.invoke, Command(resume="I live in Texas and have $500"), config)
        print("Resume Success!")
        print(res2)
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_graph())
