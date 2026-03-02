
import logging
import time
import sys
import requests 
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import pandas as pd
import numpy as np
from valuation_metrics import get_valuation_details

# --- Logging Configuration (Console Only) ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
)

logging.info("--- Logging is configured. Backend starting. ---")

# --- App Initialization ---
app = FastAPI()
CACHE = {}
SEARCH_CACHE = {}
CACHE_DURATION_SECONDS = 3600

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Helper Functions ---

def _find_and_sum_from_df(df, keys, quarters=4):
    for key in keys:
        if key in df.index:
            try:
                value = df.loc[key].iloc[:quarters].sum()
                if not pd.isnull(value):
                    return float(value)
            except (IndexError, TypeError):
                continue
    return 0.0

def process_stock_data(stock: yf.Ticker, ticker: str) -> dict:
    try:
        info = stock.info
        cashflow_df = stock.quarterly_cashflow

        OCF_KEYS = [
            'Operating Cash Flow',
            'Total Cash From Operating Activities',
            'Cash Flow From Continuing Operating Activities'
        ]
        CAPEX_KEYS = [
            'Capital Expenditure',
            'Change In Fixed Assets & Intangibles'
        ]

        ocf = 0.0
        capex = 0.0
        fcfe = 0.0

        if not cashflow_df.empty:
            ocf = _find_and_sum_from_df(cashflow_df, OCF_KEYS)
            capex = _find_and_sum_from_df(cashflow_df, CAPEX_KEYS)
            if ocf != 0.0:
                fcfe = ocf + capex

        market_cap = info.get("marketCap")
        current_price = info.get("regularMarketPrice") or info.get("currentPrice")
        implied_shares = 0
        if market_cap and current_price and current_price > 0:
            implied_shares = market_cap / current_price
        else:
            implied_shares = info.get("sharesOutstanding")

        processed_data = {
            "name": info.get("longName"),
            "ticker": ticker,
            "revenue": info.get("totalRevenue"),
            "marketCap": market_cap,
            "fcf": fcfe,
            "capex": capex,
            "totalDebt": info.get("totalDebt"),
            "totalCash": info.get("totalCash"),
            "sharesOutstanding": implied_shares,
            "beta": info.get("beta"),
        }
        
        for key, value in processed_data.items():
            if pd.isnull(value):
                processed_data[key] = 0
            elif isinstance(value, (np.number)):
                processed_data[key] = value.item()

        return processed_data

    except Exception as e:
        logging.error(f"Error processing stock data for {ticker}: {e}")
        return {k: 0 for k in ["name", "ticker", "revenue", "marketCap", "fcf", "capex", "totalDebt", "totalCash", "sharesOutstanding", "beta"]}

# --- API Endpoints ---

@app.get("/search/{query}")
def search_ticker(query: str):
    query_lower = query.lower()
    if query_lower in SEARCH_CACHE and (time.time() - SEARCH_CACHE[query_lower]["timestamp"] < CACHE_DURATION_SECONDS):
        return SEARCH_CACHE[query_lower]["data"]

    try:
        url = f"https://query2.finance.yahoo.com/v1/finance/search?q={query}"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers)
        
        # --- NUEVA GESTIÓN DE ERRORES ---
        if response.status_code != 200:
            error_detail = f"Yahoo API failed with status {response.status_code}: {response.text}"
            logging.error(error_detail)
            raise HTTPException(status_code=503, detail=error_detail)
            
        data = response.json()

        results = []
        for item in data.get("quotes", []):
            if item.get("symbol") and (item.get("longname") or item.get("shortname")):
                if item.get("quoteType") in ["EQUITY", "ETF"]:
                    results.append({
                        "ticker": item["symbol"],
                        "name": item.get("longname") or item.get("shortname")
                    })

        SEARCH_CACHE[query_lower] = {"data": results, "timestamp": time.time()}
        return results

    except requests.exceptions.RequestException as e:
        logging.error(f"Network request to Yahoo failed: {e}")
        raise HTTPException(status_code=503, detail="Could not connect to external search service.")
    except Exception as e:
        # Capturamos la HTTPException que creamos arriba, o cualquier otro error
        if isinstance(e, HTTPException):
            raise e
        logging.error(f"An unexpected error occurred during ticker search: {e}")
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {str(e)}")


@app.get("/stock/{ticker}")
def get_stock_data(ticker: str):
    ticker_upper = ticker.upper()
    if ticker_upper in CACHE and (time.time() - CACHE[ticker_upper]["timestamp"] < CACHE_DURATION_SECONDS):
        return CACHE[ticker_upper]["data"]
    try:
        stock = yf.Ticker(ticker_upper)
        if not stock.info or stock.info.get('quoteType') == "NONE" or not stock.info.get('longName'):
            raise ValueError(f"Ticker '{ticker_upper}' not found or data is unavailable.")
        
        final_data = process_stock_data(stock, ticker_upper)
        CACHE[ticker_upper] = {"data": final_data, "timestamp": time.time()}
        return final_data
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/valuation/{ticker}")
def get_valuation(ticker: str):
    ticker_upper = ticker.upper()
    try:
        valuation_data = get_valuation_details(ticker_upper)
        if "error" in valuation_data:
            raise HTTPException(status_code=404, detail=valuation_data["error"])
        return valuation_data
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

@app.get("/treasury-yield")
def get_treasury_yield():
    ticker = "^TNX"
    try:
        tnx = yf.Ticker(ticker)
        info = tnx.info
        last_price = info.get('previousClose') or info.get('regularMarketPrice')
        if pd.isnull(last_price):
            last_price = 0
        
        yield_decimal = float(last_price) / 100
        data = {"yield": yield_decimal}
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch 10-Year Treasury Yield.")

# --- Main Execution ---
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
