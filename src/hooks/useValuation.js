import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getTickerData, searchTickers } from '../services/api';
import { calculateScenarios } from '../utils/valuationLogic';
import _ from 'lodash'; // We need lodash for debouncing

export const useValuation = () => {
  const [dataEntry, setDataEntry] = useState({ ticker: '', revenue: '', marketCap: '', fcf: '', horizon: 7 });
  const [scenarios, setScenarios] = useState({
    conservative: { growth: 15, margin: 20, multiple: 14 },
    base: { growth: 22, margin: 20, multiple: 18 },
    optimistic: { growth: 30, margin: 20, multiple: 20 }
  });
  const [analysis, setAnalysis] = useState({ results: null, timeline: [] });
  const [searchResults, setSearchResults] = useState([]);

  // Debounced search function
  const debouncedSearch = useCallback(
    _.debounce(async (query) => {
      if (query) {
        try {
          const results = await searchTickers(query);
          setSearchResults(results);
        } catch (error) {
          console.error("Search failed:", error);
          setSearchResults([]); // Clear results on error
        }
      } else {
        setSearchResults([]);
      }
    }, 300), // 300ms delay
    []
  );

  const updateDataEntry = (field, value) => {
    setDataEntry(prev => ({ ...prev, [field]: value }));
    if (field === 'ticker') {
      debouncedSearch(value);
    }
  };

  const updateScenario = (key, field, value) => 
    setScenarios(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));

  const handleTickerSelection = async (ticker) => {
    const loading = toast.loading('Fetching data...');
    setSearchResults([]); // Hide dropdown
    setDataEntry(prev => ({...prev, ticker: ticker.toUpperCase()})); // Update input field

    try {
      const data = await getTickerData(ticker);
      setDataEntry(prev => ({ ...prev, revenue: data.revenue, marketCap: data.marketCap, fcf: data.fcf }));
      toast.success('Data loaded!', { id: loading });
    } catch (err) {
      toast.error("Could not fetch data. Please fill manually.", { id: loading });
    }
  };

  const calculate = () => {
    if (!dataEntry.revenue || !dataEntry.marketCap) {
      return toast.error("Revenue and Market Cap are required.");
    }
    const result = calculateScenarios(dataEntry, scenarios);
    setAnalysis(result);
    toast.success("Projection updated!");
  };

  const clearSearchResults = () => {
    setSearchResults([]);
  };

  return { 
    dataEntry, 
    scenarios, 
    analysis, 
    searchResults, 
    updateDataEntry, 
    updateScenario, 
    handleTickerSelection, // New function for handling selection
    calculate, 
    clearSearchResults // New function to clear results
  };
};