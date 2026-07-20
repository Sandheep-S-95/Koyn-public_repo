from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from mangum import Mangum
import os
import asyncio
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr
# pyrefly: ignore [missing-import]
from motor.motor_asyncio import AsyncIOMotorClient
# pyrefly: ignore [missing-import]
from bson import ObjectId
import httpx
import random
import time
from dotenv import load_dotenv

# Load environment variables (useful for local dev)
load_dotenv()

app = FastAPI(
    title="Koyn Microservice API",
    description="Python backend for Koyn stock tracker",
    version="1.0.0"
)

# Configure CORS to allow Next.js frontend to communicate with this backend
# In production, we will replace "*" with the actual domain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Setup and Verification Dependency
import jwt
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()
BETTER_AUTH_SECRET = os.getenv("BETTER_AUTH_SECRET")
if not BETTER_AUTH_SECRET:
    raise RuntimeError("BETTER_AUTH_SECRET environment variable is not set")

def verify_jwt(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    token = credentials.credentials
    try:
        # Decode and verify the signature using the HS256 algorithm
        payload = jwt.decode(token, BETTER_AUTH_SECRET, algorithms=["HS256"])
        email = payload.get("email")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return email
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Connect to MongoDB
MONGODB_URI = os.getenv("MONGODB_URI")
if not MONGODB_URI:
    print("WARNING: MONGODB_URI is not set in environment variables.")

# Async Motor client initialization
client = AsyncIOMotorClient(MONGODB_URI) if MONGODB_URI else None
db = client.get_default_database(default="test") if client else None

# Finnhub API constants
FINNHUB_BASE_URL = "https://finnhub.io/api/v1"
FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY") or os.getenv("NEXT_PUBLIC_FINNHUB_API_KEY") or ""

POPULAR_STOCK_SYMBOLS = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'ORCL', 'CRM',
    'ADBE', 'INTC', 'AMD', 'PYPL', 'UBER', 'ZOOM', 'SPOT', 'SQ', 'SHOP', 'ROKU',
    'SNOW', 'PLTR', 'COIN', 'RBLX', 'DDOG', 'CRWD', 'NET', 'OKTA', 'TWLO', 'ZM',
    'DOCU', 'PTON', 'PINS', 'SNAP', 'LYFT', 'DASH', 'ABNB', 'RIVN', 'LCID', 'NIO',
    'XPEV', 'LI', 'BABA', 'JD', 'PDD', 'TME', 'BILI', 'DIDI', 'GRAB', 'SE'
]

# Pydantic Schemas
class ToggleWatchlistBody(BaseModel):
    email: EmailStr
    symbol: str
    company: str
    isAdding: bool

class CreateAlertBody(BaseModel):
    email: EmailStr
    symbol: str
    company: str
    alertName: str
    alertType: str # "upper" or "lower"
    threshold: float

class UpdateAlertBody(BaseModel):
    email: EmailStr
    alertName: str
    alertType: str # "upper" or "lower"
    threshold: float

# Helper function to format market capitalization
def format_market_cap(market_cap_usd: float) -> str:
    if not market_cap_usd or market_cap_usd <= 0:
        return "N/A"
    if market_cap_usd >= 1e12:
        return f"${market_cap_usd / 1e12:.2f}T"
    if market_cap_usd >= 1e9:
        return f"${market_cap_usd / 1e9:.2f}B"
    if market_cap_usd >= 1e6:
        return f"${market_cap_usd / 1e6:.2f}M"
    return f"${market_cap_usd:.2f}"

# Fetch helper for Finnhub stock details
async def fetch_stock_data(symbol: str, client_http: httpx.AsyncClient) -> dict:
    if not FINNHUB_API_KEY:
        return {"currentPrice": 0, "changePercent": 0, "marketCap": "N/A", "peRatio": "N/A"}

    upper_sym = symbol.upper()
    quote_url = f"{FINNHUB_BASE_URL}/quote?symbol={upper_sym}&token={FINNHUB_API_KEY}"
    profile_url = f"{FINNHUB_BASE_URL}/stock/profile2?symbol={upper_sym}&token={FINNHUB_API_KEY}"
    metric_url = f"{FINNHUB_BASE_URL}/stock/metric?symbol={upper_sym}&metric=all&token={FINNHUB_API_KEY}"

    current_price = 0.0
    change_percent = 0.0
    market_cap_val = 0.0
    pe_ratio_val = 0.0

    try:
        # Quote request
        quote_res = await client_http.get(quote_url)
        if quote_res.status_code == 200:
            quote_data = quote_res.json()
            current_price = quote_data.get("c") or 0.0
            change_percent = quote_data.get("dp") or 0.0
    except Exception as e:
        print(f"Error fetching quote for {upper_sym}: {e}")

    try:
        # Profile request
        profile_res = await client_http.get(profile_url)
        if profile_res.status_code == 200:
            profile_data = profile_res.json()
            # marketCapitalization is returned in millions
            market_cap_val = (profile_data.get("marketCapitalization") or 0.0) * 1_000_000
    except Exception as e:
        print(f"Error fetching profile for {upper_sym}: {e}")

    try:
        # Metrics request
        metric_res = await client_http.get(metric_url)
        if metric_res.status_code == 200:
            metric_data = metric_res.json()
            metrics = metric_data.get("metric") or {}
            pe_ratio_val = metrics.get("peBasicExclExtraTTM") or metrics.get("peTTM") or 0.0
    except Exception as e:
        print(f"Error fetching metrics for {upper_sym}: {e}")

    return {
        "currentPrice": current_price,
        "changePercent": change_percent,
        "marketCap": format_market_cap(market_cap_val) if market_cap_val > 0 else "N/A",
        "peRatio": f"{pe_ratio_val:.1f}" if pe_ratio_val > 0 else "N/A"
    }

# Helper to look up user id by email
async def get_user_id_by_email(email: str) -> Optional[str]:
    if db is None:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    user = await db["user"].find_one({"email": email})
    if not user:
        return None
    return user.get("id") or str(user.get("_id"))

# Standard endpoints
@app.get("/")
def read_root():
    return {"message": "Koyn FastAPI Microservice is running!"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "fastapi-lambda"}

# Watchlist Endpoints
@app.get("/api/watchlist/symbols")
async def get_watchlist_symbols(email: str = Query(...), verified_email: str = Depends(verify_jwt)):
    if email != verified_email:
        raise HTTPException(status_code=403, detail="Access denied: Email mismatch")
    user_id = await get_user_id_by_email(email)
    if not user_id:
        return []

    cursor = db["watchlists"].find({"userId": user_id}, {"symbol": 1})
    items = await cursor.to_list(length=None)
    return [str(item["symbol"]) for item in items]

@app.get("/api/watchlist")
async def get_watchlist(email: str = Query(...), verified_email: str = Depends(verify_jwt)):
    if email != verified_email:
        raise HTTPException(status_code=403, detail="Access denied: Email mismatch")
    user_id = await get_user_id_by_email(email)
    if not user_id:
        return []

    # Get watchlist items sorted by addedAt descending
    cursor = db["watchlists"].find({"userId": user_id}).sort("addedAt", -1)
    items = await cursor.to_list(length=None)

    if not items:
        return []

    # Fetch real-time Finnhub details in parallel
    async with httpx.AsyncClient() as client_http:
        tasks = [fetch_stock_data(item["symbol"], client_http) for item in items]
        stock_details = await asyncio.gather(*tasks)

    results = []
    for item, details in zip(items, stock_details):
        results.append({
            "userId": str(item["userId"]),
            "symbol": str(item["symbol"]),
            "company": str(item["company"]),
            "addedAt": item.get("addedAt"),
            **details
        })

    return results

@app.post("/api/watchlist/toggle")
async def toggle_watchlist(body: ToggleWatchlistBody, verified_email: str = Depends(verify_jwt)):
    if body.email != verified_email:
        raise HTTPException(status_code=403, detail="Access denied: Email mismatch")
    user_id = await get_user_id_by_email(body.email)
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")

    symbol = body.symbol.upper()
    if body.isAdding:
        await db["watchlists"].update_one(
            {"userId": user_id, "symbol": symbol},
            {"$set": {"company": body.company, "addedAt": datetime.utcnow()}},
            upsert=True
        )
    else:
        await db["watchlists"].delete_one({"userId": user_id, "symbol": symbol})

    return {"success": True}

# Alerts Endpoints
@app.get("/api/alerts")
async def get_alerts(email: str = Query(...), verified_email: str = Depends(verify_jwt)):
    if email != verified_email:
        raise HTTPException(status_code=403, detail="Access denied: Email mismatch")
    user_id = await get_user_id_by_email(email)
    if not user_id:
        return []

    cursor = db["alerts"].find({"userId": user_id}).sort("createdAt", -1)
    items = await cursor.to_list(length=None)

    if not items:
        return []

    # Fetch current quote prices for unique symbols to cache
    unique_symbols = list(set(str(item["symbol"]).upper() for item in items))
    price_cache = {}

    if FINNHUB_API_KEY:
        async with httpx.AsyncClient() as client_http:
            for sym in unique_symbols:
                try:
                    url = f"{FINNHUB_BASE_URL}/quote?symbol={sym}&token={FINNHUB_API_KEY}"
                    res = await client_http.get(url)
                    if res.status_code == 200:
                        data = res.json()
                        price_cache[sym] = {
                            "price": data.get("c") or 0.0,
                            "change": data.get("dp") or 0.0
                        }
                except Exception as e:
                    print(f"Error fetching quote for alert cache symbol {sym}: {e}")

    results = []
    for item in items:
        sym = str(item["symbol"]).upper()
        cache_data = price_cache.get(sym, {"price": 0.0, "change": 0.0})
        results.append({
            "id": str(item["_id"]),
            "symbol": sym,
            "company": str(item["company"]),
            "alertName": str(item["alertName"]),
            "alertType": str(item["alertType"]),
            "threshold": float(item["threshold"]),
            "currentPrice": cache_data["price"],
            "changePercent": cache_data["change"]
        })

    return results

@app.post("/api/alerts")
async def create_alert(body: CreateAlertBody, verified_email: str = Depends(verify_jwt)):
    if body.email != verified_email:
        raise HTTPException(status_code=403, detail="Access denied: Email mismatch")
    user_id = await get_user_id_by_email(body.email)
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")

    await db["alerts"].insert_one({
        "userId": user_id,
        "symbol": body.symbol.upper(),
        "company": body.company,
        "alertName": body.alertName,
        "alertType": body.alertType,
        "threshold": body.threshold,
        "isTriggered": False,
        "createdAt": datetime.utcnow()
    })

    return {"success": True}

@app.put("/api/alerts/{alert_id}")
async def update_alert(alert_id: str, body: UpdateAlertBody, verified_email: str = Depends(verify_jwt)):
    if body.email != verified_email:
        raise HTTPException(status_code=403, detail="Access denied: Email mismatch")
    user_id = await get_user_id_by_email(body.email)
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        obj_id = ObjectId(alert_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Alert ID")

    res = await db["alerts"].update_one(
        {"_id": obj_id, "userId": user_id},
        {"$set": {
            "alertName": body.alertName,
            "alertType": body.alertType,
            "threshold": body.threshold,
            "isTriggered": False
        }}
    )

    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")

    return {"success": True}

@app.delete("/api/alerts/{alert_id}")
async def delete_alert(alert_id: str, email: str = Query(...), verified_email: str = Depends(verify_jwt)):
    if email != verified_email:
        raise HTTPException(status_code=403, detail="Access denied: Email mismatch")
    user_id = await get_user_id_by_email(email)
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        obj_id = ObjectId(alert_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Alert ID")

    res = await db["alerts"].delete_one({"_id": obj_id, "userId": user_id})

    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")

    return {"success": True}

@app.get("/api/alerts/user/{user_id}")
async def get_alerts_by_user_id(user_id: str, verified_email: str = Depends(verify_jwt)):
    cursor = db["alerts"].find({"userId": user_id, "isTriggered": False})
    items = await cursor.to_list(length=None)
    results = []
    for item in items:
        results.append({
            "id": str(item["_id"]),
            "userId": str(item["userId"]),
            "symbol": str(item["symbol"]),
            "company": str(item["company"]),
            "alertName": str(item["alertName"]),
            "alertType": str(item["alertType"]),
            "threshold": float(item["threshold"]),
            "isTriggered": bool(item.get("isTriggered", False)),
            "createdAt": item.get("createdAt")
        })
    return results

# Finnhub Actions
@app.get("/api/news")
async def get_news(symbols: Optional[List[str]] = Query(None), verified_email: str = Depends(verify_jwt)):
    if not FINNHUB_API_KEY:
        raise HTTPException(status_code=500, detail="Finnhub API key not configured")

    # Filter/clean symbols
    clean_symbols = []
    if symbols:
        # FastAPI allows symbols to be query params like ?symbols=AAPL&symbols=MSFT
        # support comma separated as well: ?symbols=AAPL,MSFT
        flat_list = []
        for s in symbols:
            flat_list.extend(s.split(","))
        clean_symbols = [s.strip().upper() for s in flat_list if s and s.strip()]

    max_articles = 6
    # Date range for 5 days ago to today
    to_date_str = datetime.utcnow().strftime("%Y-%m-%d")
    from_date_str = (datetime.utcnow() - timedelta(days=5)).strftime("%Y-%m-%d")

    async with httpx.AsyncClient() as client_http:
        if clean_symbols:
            per_symbol_articles = {}

            # Fetch in parallel
            async def fetch_company_news(sym: str):
                try:
                    url = f"{FINNHUB_BASE_URL}/company-news?symbol={sym}&from={from_date_str}&to={to_date_str}&token={FINNHUB_API_KEY}"
                    res = await client_http.get(url)
                    if res.status_code == 200:
                        articles = res.json()
                        # Validate
                        per_symbol_articles[sym] = [
                            a for a in articles 
                            if a.get("headline") and a.get("summary") and a.get("url") and a.get("datetime")
                        ]
                    else:
                        per_symbol_articles[sym] = []
                except Exception as e:
                    print(f"Error fetching company news for {sym}: {e}")
                    per_symbol_articles[sym] = []

            await asyncio.gather(*[fetch_company_news(sym) for sym in clean_symbols])

            collected = []
            # Round robin
            for round_idx in range(max_articles):
                for sym in clean_symbols:
                    lst = per_symbol_articles.get(sym, [])
                    if lst:
                        a = lst.pop(0)
                        collected.append({
                            "id": float(time.time() * 1000 + random.random()),
                            "headline": str(a["headline"]).strip(),
                            "summary": str(a["summary"]).strip()[:200] + "...",
                            "source": a.get("source") or "Company News",
                            "url": str(a["url"]),
                            "datetime": int(a["datetime"]),
                            "image": a.get("image") or "",
                            "category": "company",
                            "related": sym
                        })
                        if len(collected) >= max_articles:
                            break
                if len(collected) >= max_articles:
                    break

            if collected:
                # Sort by datetime desc
                collected.sort(key=lambda x: x["datetime"], reverse=True)
                return collected[:max_articles]

        # General news fallback
        try:
            url = f"{FINNHUB_BASE_URL}/news?category=general&token={FINNHUB_API_KEY}"
            res = await client_http.get(url)
            if res.status_code == 200:
                general = res.json()
                seen = set()
                unique = []
                for idx, a in enumerate(general):
                    if a.get("headline") and a.get("summary") and a.get("url") and a.get("datetime"):
                        key = f"{a.get('id')}-{a.get('url')}-{a.get('headline')}"
                        if key not in seen:
                            seen.add(key)
                            unique.append({
                                "id": a.get("id") or (idx + 1),
                                "headline": str(a["headline"]).strip(),
                                "summary": str(a["summary"]).strip()[:150] + "...",
                                "source": a.get("source") or "Market News",
                                "url": str(a["url"]),
                                "datetime": int(a["datetime"]),
                                "image": a.get("image") or "",
                                "category": a.get("category") or "general",
                                "related": a.get("related") or ""
                            })
                            if len(unique) >= 20:
                                break
                return unique[:max_articles]
        except Exception as e:
            print(f"Error fetching general news: {e}")

    return []

@app.get("/api/stocks/search")
async def search_stocks(query: Optional[str] = Query(None), verified_email: str = Depends(verify_jwt)):
    if not FINNHUB_API_KEY:
        return []

    trimmed = query.strip() if query else ""

    async with httpx.AsyncClient() as client_http:
        if not trimmed:
            # Popular symbols list
            top_symbols = POPULAR_STOCK_SYMBOLS[:10]
            profiles = []

            # Fetch popular stocks profile2 info in parallel
            async def fetch_profile(sym: str):
                try:
                    url = f"{FINNHUB_BASE_URL}/stock/profile2?symbol={sym}&token={FINNHUB_API_KEY}"
                    res = await client_http.get(url)
                    if res.status_code == 200:
                        p = res.json()
                        if p and (p.get("name") or p.get("ticker")):
                            profiles.append({
                                "symbol": sym.upper(),
                                "name": p.get("name") or p.get("ticker"),
                                "exchange": p.get("exchange") or "US",
                                "type": "Common Stock",
                                "isInWatchlist": False
                            })
                except Exception as e:
                    print(f"Error fetching profile for search fallback {sym}: {e}")

            await asyncio.gather(*[fetch_profile(sym) for sym in top_symbols])
            return profiles[:15]

        else:
            # Search query
            try:
                url = f"{FINNHUB_BASE_URL}/search?q={trimmed}&token={FINNHUB_API_KEY}"
                res = await client_http.get(url)
                if res.status_code == 200:
                    data = res.json()
                    results = data.get("result") or []
                    mapped = []
                    for r in results:
                        symbol = str(r.get("symbol", "")).upper()
                        name = r.get("description") or symbol
                        exchange = r.get("displaySymbol") or "US"
                        mapped.append({
                            "symbol": symbol,
                            "name": name,
                            "exchange": str(exchange),
                            "type": r.get("type") or "Stock",
                            "isInWatchlist": False
                        })
                    return mapped[:15]
            except Exception as e:
                print(f"Error during search for query {trimmed}: {e}")

    return []

# Mangum wrapper for AWS Lambda compatibility
handler = Mangum(app)

if __name__ == "__main__":
    import uvicorn
    # Run the server locally on port 8000
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
