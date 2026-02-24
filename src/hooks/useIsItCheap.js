import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import _ from 'lodash';
import { getValuationData, searchTickers } from '../services/api';

export const useIsItCheap = () => {
  const [ticker, setTicker] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  const debouncedSearch = useCallback(
    _.debounce(async (query) => {
      if (query) {
        try {
          const results = await searchTickers(query);
          setSearchResults(results);
        } catch (error) {
          console.error("Search failed:", error);
          toast.error("Ticker search failed.");
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    }, 300),
    []
  );

  const updateTicker = (value) => {
    setTicker(value);
    debouncedSearch(value);
  };

  const clearSearchResults = useCallback(() => {
    setSearchResults([]);
  }, []);

  const handleFetch = useCallback(async (tickerToFetch) => {
    if (!tickerToFetch) {
      const msg = 'Please enter a ticker symbol.';
      toast.error(msg);
      setError(msg);
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);
    setSearchResults([]);
    const toastId = toast.loading(`Analyzing ${tickerToFetch.toUpperCase()}...`);

    try {
      const result = await getValuationData(tickerToFetch);
      setData(result);
      setTicker(result.ticker);
      toast.success(`Analysis complete for ${result.companyName}`, { id: toastId });
    } catch (err) {
      setError(err.message);
      toast.error(err.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleTickerSelection = useCallback((selected) => {
    setTicker(selected.ticker);
    setSearchResults([]);
    handleFetch(selected.ticker);
  }, [handleFetch]);

  return {
    ticker,
    data,
    loading,
    error,
    searchResults,
    updateTicker,
    handleTickerSelection,
    clearSearchResults,
  };
};