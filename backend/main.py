# backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import time
import json

app = FastAPI()

# --- Application-level constants ---
CACHE = {}
CACHE_DURATION_SECONDS = 3600  # 1 hour

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def fetch_yfinance_info(ticker: str) -> dict:
    """Fetches data using the latest yfinance version, letting it handle sessions."""
    try:
        print(f"--- Fetching '{ticker}' with an updated yfinance library ---")
        # With the new yfinance version, we don't need to manage a session manually.
        # The library now handles it internally with curl_cffi.
        stock = yf.Ticker(ticker)
        info = stock.info
        
        if not info or info.get('quoteType') == "NONE" or not info.get('longName'):
            raise HTTPException(status_code=404, detail=f"Ticker '{ticker}' not found or data is unavailable.")
        
        return info

    except Exception as e:
        # Catching a broad exception because the underlying error could be varied.
        print(f"!!! An unexpected error occurred during fetch for '{ticker}': {e}")
        # The error message from yfinance is now quite descriptive.
        raise HTTPException(status_code=500, detail=f"Failed to fetch data from provider: {e}")

def process_stock_data(info: dict, ticker: str) -> dict:
    """Processes the raw info dict into the structure required by the frontend."""
    try:
        operating_cashflow = info.get("operatingCashflow")
        free_cashflow = info.get("freeCashflow")
        
        fcf = 0
        if free_cashflow is not None:
            fcf = free_cashflow
        elif operating_cashflow is not None:
            fcf = operating_cashflow * 0.8
        
        processed_data = {
            "name": info.get("longName"),
            "revenue": info.get("totalRevenue"),
            "marketCap": info.get("marketCap"),
            "fcf": fcf,
        }

        if not processed_data["revenue"] or not processed_data["marketCap"]:
            raise ValueError("Essential financial data is missing.")

        return processed_data
    except (ValueError, TypeError) as e:
        print(f"!!! Error processing data for '{ticker}': {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process financial data for '{ticker}'.")

@app.get("/api/stock/{ticker}")
def get_stock_data(ticker: str):
    """Main endpoint to get stock data, orchestrating cache, fetch, and processing."""
    if ticker in CACHE and (time.time() - CACHE[ticker]["timestamp"] < CACHE_DURATION_SECONDS):
        print(f"--- Serving '{ticker}' from cache ---")
        return CACHE[ticker]["data"]

    raw_info = fetch_yfinance_info(ticker)
    final_data = process_stock_data(raw_info, ticker)
    
    CACHE[ticker] = {"data": final_data, "timestamp": time.time()}
    return final_data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
