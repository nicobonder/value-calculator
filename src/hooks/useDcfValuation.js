import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import _ from 'lodash';
import { getTickerData, getTreasuryYield, searchTickers } from '../services/api';

const DEFAULT_ASSUMPTIONS = {
  growthRate: 15,
  discountRate: 0, 
  terminalGrowth: 3,
  equityRiskPremium: 6,
};

export const useDcfValuation = () => {
  const [ticker, setTicker] = useState('');
  const [apiData, setApiData] = useState(null);
  const [assumptions, setAssumptions] = useState(DEFAULT_ASSUMPTIONS);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- START: SEARCH LOGIC (COPIED FROM WORKING HOOK) ---
  const [searchResults, setSearchResults] = useState([]);

  const debouncedSearch = useCallback(
    _.debounce(async (query) => {
      if (query) {
        try {
          const results = await searchTickers(query);
          setSearchResults(results);
        } catch (error) {
          console.error("Search failed:", error);
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    }, 300),
    []
  );

  const updateDcfEntry = (field, value) => {
    if (field === 'ticker') {
      setTicker(value);
      debouncedSearch(value);
    }
  };

  const clearSearchResults = useCallback(() => {
    setSearchResults([]);
  }, []);
  // --- END: SEARCH LOGIC ---

  const fetchTickerData = useCallback(async (tickerToFetch) => {
    if (!tickerToFetch) {
      toast.error("Please enter a ticker first.");
      return;
    }
    setLoading(true);
    setResult(null);
    setApiData(null);
    setSearchResults([]); // Clear results on new fetch
    const toastId = toast.loading(`Fetching data for ${tickerToFetch.toUpperCase()}...`);

    try {
      const [tickerInfo, treasuryYield] = await Promise.all([
        getTickerData(tickerToFetch),
        getTreasuryYield(),
      ]);

      const requiredData = {
        name: tickerInfo.name,
        ticker: tickerInfo.ticker,
        fcf: tickerInfo.fcf, 
        totalDebt: tickerInfo.totalDebt,
        cash: tickerInfo.totalCash,
        sharesOutstanding: tickerInfo.sharesOutstanding,
        beta: tickerInfo.beta,
        riskFreeRate: treasuryYield,
      };

      setApiData(requiredData);
      setTicker(tickerInfo.ticker); // Update ticker to official one
      toast.success(`Data loaded for ${tickerInfo.name || tickerToFetch.toUpperCase()}`, { id: toastId });

    } catch (error) {
      console.error("Failed to fetch DCF data:", error);
      toast.error(error.message || `Could not fetch all data for ${tickerToFetch}.`, { id: toastId });
      setApiData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- START: SELECTION LOGIC (COPIED FROM WORKING HOOK) ---
  const handleTickerSelection = useCallback((selected) => {
    setTicker(selected.ticker); 
    setSearchResults([]);
    fetchTickerData(selected.ticker);
  }, [fetchTickerData]);
  // --- END: SELECTION LOGIC ---

  // --- NO OTHER CHANGES BELOW THIS LINE ---

  useEffect(() => {
    if (apiData) {
      const { riskFreeRate, beta } = apiData;
      const erp = assumptions.equityRiskPremium / 100;
      const discountRate = (riskFreeRate + beta * erp) * 100;
      updateAssumption('discountRate', discountRate.toFixed(2));
    }
  }, [apiData, assumptions.equityRiskPremium]);

  const updateApiData = (field, value) => {
    setApiData(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const updateAssumption = (field, value) => {
    setAssumptions(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const calculateFairValue = () => {
    if (!apiData) {
      toast.error("No financial data available. Please fetch data first.");
      return;
    }

    const fcfe0 = apiData.fcf;
    const g = assumptions.growthRate / 100;
    const gt = assumptions.terminalGrowth / 100;
    const r = assumptions.discountRate / 100;

    if (r <= gt) {
      toast.error("Discount Rate must be greater than Terminal Growth Rate.");
      return;
    }

    let pvOfFcfeSum = 0;
    let lastProjectedFcfe = fcfe0;
    for (let t = 1; t <= 5; t++) {
      const fcfe_t = fcfe0 * Math.pow(1 + g, t);
      pvOfFcfeSum += fcfe_t / Math.pow(1 + r, t);
      if (t === 5) {
        lastProjectedFcfe = fcfe_t;
      }
    }

    const terminalValue = (lastProjectedFcfe * (1 + gt)) / (r - gt);
    const pvOfTerminalValue = terminalValue / Math.pow(1 + r, 5);
    const equityValue = pvOfFcfeSum + pvOfTerminalValue;
    const fairPrice = equityValue / apiData.sharesOutstanding;
    const netDebt = apiData.totalDebt - apiData.cash;
    const enterpriseValue = equityValue + netDebt;

    setResult({
      fairPrice,
      enterpriseValue,
      equityValue,
    });
    toast.success("Calculation complete!");
  };

  return {
    ticker, 
    apiData, updateApiData,
    assumptions, updateAssumption,
    result, loading, calculateFairValue,
    // --- EXPORT NEW FUNCTIONS ---
    searchResults,
    updateDcfEntry,
    handleTickerSelection,
    clearSearchResults,
  };
};