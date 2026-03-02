
import time
import logging
import yfinance as yf
import pandas as pd
import numpy as np
from fastapi import APIRouter, HTTPException

# CORRECCIÓN: Usar importación relativa para subir un nivel desde 'routers' a 'api'
from ..valuation_metrics import get_valuation_details

router = APIRouter()

CACHE = {}
CACHE_DURATION_SECONDS = 3600

# --- Funciones de Ayuda (copiadas del main.py original) ---

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

        OCF_KEYS = ['Operating Cash Flow', 'Total Cash From Operating Activities']
        CAPEX_KEYS = ['Capital Expenditure', 'Change In Fixed Assets & Intangibles']

        ocf = _find_and_sum_from_df(cashflow_df, OCF_KEYS) if not cashflow_df.empty else 0.0
        capex = _find_and_sum_from_df(cashflow_df, CAPEX_KEYS) if not cashflow_df.empty else 0.0
        fcfe = ocf + capex if ocf != 0.0 else 0.0

        processed_data = {
            "name": info.get("longName"), "ticker": ticker,
            "revenue": info.get("totalRevenue"), "marketCap": info.get("marketCap"),
            "fcf": fcfe, "capex": capex, "totalDebt": info.get("totalDebt"),
            "totalCash": info.get("totalCash"),
            "sharesOutstanding": info.get("sharesOutstanding"), "beta": info.get("beta"),
        }
        
        # Limpiar valores nulos o de tipo numpy
        for key, value in processed_data.items():
            if value is None or pd.isnull(value):
                processed_data[key] = 0
            elif isinstance(value, (np.number)):
                processed_data[key] = value.item()

        return processed_data

    except Exception as e:
        logging.error(f"Error processing yfinance data for {ticker}: {e}", exc_info=True)
        # Devolver un diccionario vacío o con ceros es más seguro que fallar
        return {k: 0 for k in ["name", "ticker", "revenue", "marketCap", "fcf", "capex", "totalDebt", "totalCash", "sharesOutstanding", "beta"]}

# --- Endpoints de la API ---

@router.get("/stock/{ticker}", tags=["stock"])
def get_stock_data_endpoint(ticker: str):
    ticker_upper = ticker.upper()
    if ticker_upper in CACHE and (time.time() - CACHE[ticker_upper]['timestamp'] < CACHE_DURATION_SECONDS):
        return CACHE[ticker_upper]["data"]
    try:
        stock = yf.Ticker(ticker_upper)
        if not stock.info or stock.info.get('quoteType') == "NONE":
            raise ValueError(f"Ticker '{ticker_upper}' not found via yfinance.")
        
        final_data = process_stock_data(stock, ticker_upper)
        if final_data.get("marketCap") == 0: # Chequeo extra de sanidad
            raise ValueError(f"Incomplete data received for '{ticker_upper}'.")

        CACHE[ticker_upper] = {"data": final_data, "timestamp": time.time()}
        return final_data
    except Exception as e:
        logging.error(f"Failed to get stock data for {ticker}: {e}", exc_info=True)
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/valuation/{ticker}", tags=["stock"])
def get_valuation_endpoint(ticker: str):
    ticker_upper = ticker.upper()
    try:
        valuation_data = get_valuation_details(ticker_upper)
        if "error" in valuation_data:
            raise HTTPException(status_code=404, detail=valuation_data["error"])
        return valuation_data
    except Exception as e:
        logging.error(f"Failed to get valuation for {ticker}: {e}", exc_info=True)
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during valuation: {str(e)}")

@router.get("/treasury-yield", tags=["stock"])
def get_treasury_yield_endpoint():
    try:
        tnx = yf.Ticker("^TNX")
        last_price = tnx.history(period="1d")['Close'].iloc[0]
        if pd.isnull(last_price):
             raise ValueError("Could not retrieve treasury yield price.")
        
        yield_decimal = float(last_price) / 100
        return {"yield": yield_decimal}
    except Exception as e:
        logging.error(f"Failed to fetch treasury yield: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch 10-Year Treasury Yield.")
