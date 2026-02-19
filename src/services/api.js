
/**
 * Fetches comprehensive financial data for a given stock ticker.
 * The backend endpoint is expected to return all necessary metrics for valuation,
 * including revenue, market cap, free cash flow, debt, cash, shares, and beta.
 * @param {string} ticker The stock ticker symbol.
 * @returns {Promise<object>} A promise that resolves to the ticker's financial data.
 */
export const getTickerData = async (ticker) => {
  try {
    const response = await fetch(`/api/stock/${ticker}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.detail || 'Ticker not found or essential data is missing.';
      throw new Error(errorMessage);
    }
    
    return await response.json();

  } catch (error) {
    console.error("Error fetching ticker data:", error);
    throw new Error(error.message || 'Failed to connect to the backend.');
  }
};

/**
 * Fetches the latest 10-Year US Treasury Yield (^TNX).
 * @returns {Promise<number>} A promise that resolves to the treasury yield as a decimal (e.g., 0.0425 for 4.25%).
 */
export const getTreasuryYield = async () => {
  try {
    const response = await fetch(`/api/treasury-yield`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.detail || 'Could not retrieve treasury yield.';
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.yield;

  } catch (error) {
    console.error("Error fetching treasury yield:", error);
    throw new Error(error.message || 'Failed to connect to the backend for treasury data.');
  }
};

/**
 * Fetches valuation metrics and scores for a given stock ticker.
 * @param {string} ticker The stock ticker symbol.
 * @returns {Promise<object>} A promise that resolves to the valuation data, including metrics, scores, and overall rating.
 */
export const getValuationData = async (ticker) => {
  try {
    const response = await fetch(`/api/valuation/${ticker}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.detail || `Failed to get valuation for ${ticker}.`;
      throw new Error(errorMessage);
    }
    
    return await response.json();

  } catch (error) {
    console.error("Error fetching valuation data:", error);
    throw new Error(error.message || 'Failed to connect to the valuation service.');
  }
};
