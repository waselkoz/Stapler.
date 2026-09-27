import sys
import asyncio
import uvicorn

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

def main():
    uvicorn.run("backend.api:app", host="0.0.0.0", port=313)

if __name__ == "__main__":
    main()
