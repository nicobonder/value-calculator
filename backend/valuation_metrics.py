
import yfinance as yf
import pandas as pd

METRIC_THRESHOLDS = {
    "Forward Price to Sales (F P/S)": [(5, 5), (10, 3), (15, 1)],
    "Price to Sales (P/S)": [(4, 5), (8, 3), (12, 1)],
    "Price to Gross Profit (P/GP)": [(8, 5), (12, 3), (18, 1)],
    "Forward Price to Earnings (F P/E)": [(15, 5), (25, 3), (35, 1)],
    "Price to Earnings (P/E)": [(16, 5), (25, 3), (35, 1)],
    "Forward Price to Free Cash Flow (F P/FCF)": [(15, 5), (25, 3), (40, 1)],
    "Price to Free Cash Flow (P/FCF)": [(12, 5), (18, 3), (30, 1)],
}

SCORE_RATINGS = {
    5: "Very Cheap",
    3: "Fair Price",
    1: "Expensive",
    0: "Very Expensive"
}

def get_score_and_rating(metric_name, value):
    if value is None or value < 0:
        return 0, "N/A"
    
    thresholds = METRIC_THRESHOLDS.get(metric_name, [])
    
    for limit, score in thresholds:
        if value < limit:
            return score, SCORE_RATINGS.get(score, "N/A")
            
    return 0, SCORE_RATINGS[0]

def _find_df_value(df, keys, index=0):
    for key in keys:
        if key in df.index:
            value = df.loc[key].iloc[index]
            if pd.notnull(value):
                return float(value)
    return 0.0

def _find_and_sum_quarters(df, keys, num_quarters=4):
    for key in keys:
        if key in df.index:
            values = df.loc[key].iloc[:num_quarters]
            if values.any():
                return float(values.sum())
    return 0.0

def get_valuation_details(ticker_symbol: str) -> dict:
    try:
        print(f"--- Fetching data for {ticker_symbol} ---")
        stock = yf.Ticker(ticker_symbol)
        info = stock.info
        
        # --- DEBUG: Print info object content ---
        print("yf.Ticker('...').info object:")
        print(info)
        # --- END DEBUG ---

        if not info or info.get('quoteType') == "NONE" or not info.get('longName'):
             # --- DEBUG: Log the reason for invalid ticker ---
             print(f"Validation failed: Ticker {ticker_symbol} is invalid or no data found.")
             # --- END DEBUG ---
             raise ValueError(f"Invalid ticker or no data found: {ticker_symbol}")

        financials = stock.financials
        quarterly_cashflow = stock.quarterly_cashflow

        market_cap = info.get("marketCap", 0)

        ps_trailing = info.get("priceToSalesTrailing12Months")
        pe_forward = info.get("forwardPE")
        pe_trailing = info.get("trailingPE")
        ps_forward = info.get("forwardPS")

        revenue = _find_df_value(financials, ['Total Revenue', 'Revenue'])
        cost_of_revenue = _find_df_value(financials, ['Cost Of Revenue'])
        gross_profit = revenue - cost_of_revenue if revenue and cost_of_revenue else 0
        p_gp = market_cap / gross_profit if gross_profit > 0 else None

        ocf_ttm = _find_and_sum_quarters(quarterly_cashflow, ['Total Cash From Operating Activities', 'Operating Cash Flow'])
        capex_ttm = _find_and_sum_quarters(quarterly_cashflow, ['Capital Expenditure'])
        fcf_ttm = ocf_ttm + capex_ttm if ocf_ttm and capex_ttm else 0
        p_fcf = market_cap / fcf_ttm if fcf_ttm > 0 else None
        
        analyst_growth = info.get("earningsGrowth")
        p_fcf_forward = None
        if fcf_ttm > 0 and analyst_growth is not None:
            forward_fcf = fcf_ttm * (1 + analyst_growth)
            if forward_fcf > 0:
                p_fcf_forward = market_cap / forward_fcf

        all_metrics = {
            "Price to Sales (P/S)": ps_trailing,
            "Forward Price to Sales (F P/S)": ps_forward,
            "Price to Gross Profit (P/GP)": p_gp,
            "Price to Earnings (P/E)": pe_trailing,
            "Forward Price to Earnings (F P/E)": pe_forward,
            "Price to Free Cash Flow (P/FCF)": p_fcf,
            "Forward Price to Free Cash Flow (F P/FCF)": p_fcf_forward,
        }
        
        results = []
        total_score = 0
        valid_metrics_count = 0

        for name, value in all_metrics.items():
            score, rating = get_score_and_rating(name, value)
            results.append({
                "metric": name,
                "value": f"{value:.2f}" if isinstance(value, (int, float)) else "N/A",
                "score": score,
                "rating": rating
            })
            if value is not None and value > 0:
                total_score += score
                valid_metrics_count += 1
        
        final_score = total_score / valid_metrics_count if valid_metrics_count > 0 else 0
        overall_rating = "Unknown"
        if final_score >= 4:
            overall_rating = "Cheap 🟢"
        elif final_score >= 2.5:
            overall_rating = "Fair Price 🟡"
        elif final_score > 0:
            overall_rating = "Expensive 🔴"

        return {
            "ticker": ticker_symbol,
            "companyName": info.get("longName", "N/A"),
            "metrics": results,
            "finalScore": f"{final_score:.2f}",
            "overallRating": overall_rating,
        }
    except Exception as e:
        # --- DEBUG: Print exception details ---
        print(f"An exception occurred: {e}")
        # --- END DEBUG ---
        return {"error": str(e)}
