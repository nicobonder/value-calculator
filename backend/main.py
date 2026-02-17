
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import time
import pandas as pd
import numpy as np

app = FastAPI()

CACHE = {}
CACHE_DURATION_SECONDS = 3600

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def process_stock_data(stock: yf.Ticker, ticker: str) -> dict:
    try:
        info = stock.info
        # cashflow_df = stock.cashflow
        cashflow_df = stock.quarterly_cashflow

        ocf = 0.0
        capex = 0.0
        fcfe = 0.0

        if not cashflow_df.empty:
            # THE FIX: 'fcf' field will now be Operating Cash Flow (OCF) to serve as the baseline.
            try:
                #ocf_val = cashflow_df.loc['Operating Cash Flow'].iloc[0]
                ocf_val = cashflow_df.loc['Operating Cash Flow'].iloc[:4].sum()  # <-- TTM FIX
                if not pd.isnull(ocf_val):
                    ocf = float(ocf_val)
            except (KeyError, IndexError):
                pass # ocf remains 0.0

            # Capital Expenditure remains the same.
            try:
                # capex_val = cashflow_df.loc['Capital Expenditure'].iloc[0]
                capex_val = cashflow_df.loc['Capital Expenditure'].iloc[:4].sum()  # <-- TTM FIX
                if not pd.isnull(capex_val):
                    capex = float(capex_val)
            except (KeyError, IndexError):
                pass # capex remains 0.0

            # FCFE is calculated from the baseline OCF and Capex.
            # This makes the relationship between the fields clear.
            if ocf != 0.0 and capex != 0.0:
                fcfe = ocf + capex # Capex is negative, so adding it is correct.

        processed_data = {
            "name": info.get("longName"),
            "ticker": ticker,
            "revenue": info.get("totalRevenue"),
            "marketCap": info.get("marketCap"),
            # Rename `fcf` to `ocf` internally for clarity, but the frontend will receive it as `fcf`.
            "fcf": ocf,
            "capex": capex,
            "fcfe": fcfe,
            "totalDebt": info.get("totalDebt"),
            "totalCash": info.get("totalCash"),
            "sharesOutstanding": info.get("sharesOutstanding"),
            "beta": info.get("beta"),
        }

        for key, value in processed_data.items():
            if pd.isnull(value):
                processed_data[key] = 0
            elif isinstance(value, (np.number)):
                processed_data[key] = value.item()

        return processed_data

    except Exception as e:
        return {k: 0 for k in ["name", "ticker", "revenue", "marketCap", "fcf", "capex", "fcfe", "totalDebt", "totalCash", "sharesOutstanding", "beta"]}

@app.get("/api/stock/{ticker}")
def get_stock_data(ticker: str):
    ticker_upper = ticker.upper()
    # Cache is being re-enabled for stock data, assuming previous issues are resolved by the logic fix.
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

@app.get("/api/treasury-yield")
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
