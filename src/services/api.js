export const getTickerData = async (ticker) => {
  try {
    // The request now goes to the Vite proxy
    const response = await fetch(`/api/stock/${ticker}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.detail || 'Ticker not found or data is missing.';
      throw new Error(errorMessage);
    }
    
    return await response.json();

  } catch (error) {
    console.error("Error fetching ticker data:", error);
    throw new Error(error.message || 'Failed to connect to the backend.');
  }
};
