import asyncio
import json
from backend.graph_agent import graph

async def main():
    try:
        config = {"configurable": {"thread_id": "test"}}
        async for event in graph.astream({"url": "https://example.com", "iterations": 0, "use_tinykit": False}, config, stream_mode="updates"):
            for node, state in event.items():
                print(f"Node: {node}, state type: {type(state)}")
                if state is None:
                    print(f"BINGO! Node {node} returned None!")
    except Exception as e:
        print(f"Exception raised: {type(e).__name__}: {str(e)}")

asyncio.run(main())
