import asyncio
import json
import sys

import websockets


async def main():
    async with websockets.connect("ws://127.0.0.1:3003") as ws:
        await ws.send(json.dumps({"action": "status"}))
        print("status ->", await asyncio.wait_for(ws.recv(), 5))


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
