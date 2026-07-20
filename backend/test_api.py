import jwt
import httpx
import time
import asyncio

import os

URL = os.getenv("LAMBDA_API_URL") or "http://127.0.0.1:8000"
SECRET = os.getenv("BETTER_AUTH_SECRET")
if not SECRET:
    raise RuntimeError("BETTER_AUTH_SECRET environment variable is not set")
EMAIL = "lootpool01@gmail.com"

async def main():
    token = jwt.encode({"email": EMAIL}, SECRET, algorithm="HS256")
    headers = {"Authorization": f"Bearer {token}"}
    
    print("Testing /api/stocks/search...")
    start = time.time()
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{URL}/api/stocks/search", headers=headers, timeout=60.0)
    end = time.time()
    print(f"Status: {res.status_code}")
    print(f"Duration: {end - start:.2f} seconds")
    print(f"Response: {res.text[:500]}")
    
    print("\nTesting /api/watchlist...")
    start = time.time()
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{URL}/api/watchlist?email={EMAIL}", headers=headers, timeout=60.0)
    end = time.time()
    print(f"Status: {res.status_code}")
    print(f"Duration: {end - start:.2f} seconds")
    print(f"Response: {res.text[:500]}")

if __name__ == "__main__":
    asyncio.run(main())
