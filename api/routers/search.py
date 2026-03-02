
import time
import requests
import logging
from fastapi import APIRouter, HTTPException

router = APIRouter()

SEARCH_CACHE = {}
CACHE_DURATION_SECONDS = 3600

@router.get("/search/{query}", tags=["search"])
def search_ticker(query: str):
    """
    API endpoint to search for stock tickers and names.
    This endpoint is called by the frontend to populate the search dropdown.
    """
    query_lower = query.lower()
    if query_lower in SEARCH_CACHE and (time.time() - SEARCH_CACHE[query_lower]['timestamp'] < CACHE_DURATION_SECONDS):
        return SEARCH_CACHE[query_lower]["data"]

    try:
        url = f"https://query2.finance.yahoo.com/v1/finance/search?q={query}"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
        }
        response = requests.get(url, headers=headers)

        if response.status_code != 200:
            logging.error(f"Yahoo search API failed with status {response.status_code}: {response.text[:500]}")
            raise HTTPException(status_code=503, detail=f"External search service rejected the request.")

        try:
            data = response.json()
        except requests.exceptions.JSONDecodeError:
            logging.error(f"Yahoo search API returned non-JSON response: {response.text[:500]}")
            raise HTTPException(status_code=502, detail="Invalid response from external search service.")

        results = []
        for item in data.get("quotes", []):
            if item.get("symbol") and item.get("longname"):
                if item.get("quoteType") == "EQUITY":
                    results.append({
                        "ticker": item["symbol"],
                        "name": item["longname"]
                    })

        SEARCH_CACHE[query_lower] = {"data": results, "timestamp": time.time()}
        return results

    except requests.exceptions.RequestException as e:
        logging.error(f"Network request to Yahoo failed: {e}")
        raise HTTPException(status_code=503, detail="Could not connect to external search service.")
    except HTTPException as e:
        raise e # Re-raise HTTPException
    except Exception as e:
        logging.error(f"An unexpected error occurred in search_ticker: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An internal server error occurred during search.")
