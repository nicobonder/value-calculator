
import yfinance as yf
import pandas as pd
import re
import datetime

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
    """Calculates the score and rating for a given metric and value."""
    if value is None or pd.isna(value) or value < 0:
        return 0, "N/A"
    
    thresholds = METRIC_THRESHOLDS.get(metric_name, [])
    
    for limit, score in thresholds:
        if value < limit:
            return score, SCORE_RATINGS.get(score, "N/A")
            
    return 0, SCORE_RATINGS[0]

def _find_df_value(df, keys, index=0):
    """Helper to find the first valid value for a list of possible keys in a DataFrame."""
    for key in keys:
        if key in df.index:
            value = df.loc[key].iloc[index]
            if pd.notnull(value):
                return float(value)
    return 0.0

def _find_and_sum_quarters(df, keys, num_quarters=4):
    """Finds the first valid key and sums the last N quarters."""
    for key in keys:
        if key in df.index:
            values = df.loc[key].iloc[:num_quarters]
            if values.any():
                return float(values.sum())
    return 0.0

def get_valuation_details(ticker_symbol: str) -> dict:
    """
    Fetches financial data for a ticker and calculates valuation metrics and scores.
    """
    try:
        stock = yf.Ticker(ticker_symbol)
        info = stock.info
        
        if not info or info.get('quoteType') == "NONE" or not info.get('longName'):
             raise ValueError(f"Invalid ticker or no data found: {ticker_symbol}")

        financials = stock.financials
        quarterly_cashflow = stock.quarterly_cashflow

        # --- Base Data ---
        market_cap = info.get("marketCap", 0)

        # --- Direct Metrics from yfinance ---
        ps_trailing = info.get("priceToSalesTrailing12Months")
        pe_forward = info.get("forwardPE")
        pe_trailing = info.get("trailingPE")
        
        # --- FORWARD P/S CALCULATION ---
        ps_forward = None
        forward_revenue = None
        
        try:
            revenue_estimate_table = stock.revenue_estimate
            if revenue_estimate_table is not None and not revenue_estimate_table.empty:
                # The target is the row '+1y' (Next Year) and the column 'avg' (Average Estimate).
                if '+1y' in revenue_estimate_table.index and 'avg' in revenue_estimate_table.columns:
                    forward_revenue = revenue_estimate_table.loc['+1y', 'avg']
                else:
                    pass
        # else: The table is not available.
        except Exception as e:
            # The attribute might not exist for some tickers, which is an acceptable failure.
            pass

        if market_cap and forward_revenue and forward_revenue > 0:
            print("Market cap: ", market_cap)
            print("Forward revenue: ", forward_revenue)
            ps_forward = market_cap / forward_revenue

        # Price to Gross Profit (P/GP)
        revenue = _find_df_value(financials, ['Total Revenue', 'Revenue'])
        cost_of_revenue = _find_df_value(financials, ['Cost Of Revenue'])
        gross_profit = revenue - cost_of_revenue if revenue and cost_of_revenue else 0
        p_gp = market_cap / gross_profit if gross_profit > 0 else None

        # Price to Free Cash Flow (P/FCF)
        ocf_ttm = _find_and_sum_quarters(quarterly_cashflow, ['Total Cash From Operating Activities', 'Operating Cash Flow'])
        capex_ttm = _find_and_sum_quarters(quarterly_cashflow, ['Capital Expenditure'])
        fcf_ttm = ocf_ttm + capex_ttm if ocf_ttm and capex_ttm else 0
        p_fcf = market_cap / fcf_ttm if fcf_ttm > 0 else None
        
        # Forward Price to Free Cash Flow (F P/FCF)
        analyst_growth = info.get("earningsGrowth")
        p_fcf_forward = None
        if fcf_ttm > 0 and analyst_growth is not None:
            forward_fcf = fcf_ttm * (1 + analyst_growth)
            if forward_fcf > 0:
                p_fcf_forward = market_cap / forward_fcf

        all_metrics = {
            "Price to Sales (P/S)": ps_trailing,
            "Price to Gross Profit (P/GP)": p_gp,
            "Price to Earnings (P/E)": pe_trailing,
            "Price to Free Cash Flow (P/FCF)": p_fcf,
            "Forward Price to Sales (F P/S)": ps_forward,
            "Forward Price to Earnings (F P/E)": pe_forward,
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
            if value is not None and pd.notna(value) and value > 0:
                total_score += score
                valid_metrics_count += 1
        
        final_score = total_score / valid_metrics_count if valid_metrics_count > 0 else 0
        overall_rating = "Unknown"
        if final_score >= 4:
            overall_rating = "Cheap 😃"
        elif final_score >= 2.5:
            overall_rating = "Fair Price 👍"
        elif final_score > 0:
            overall_rating = "Expensive 🤒"

        return {
            "ticker": ticker_symbol,
            "companyName": info.get("longName", "N/A"),
            "metrics": results,
            "finalScore": f"{final_score:.2f}",
            "overallRating": overall_rating,
        }
    except Exception as e:
        return {"error": str(e)}
