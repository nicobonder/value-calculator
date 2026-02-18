
import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getTickerData, getTreasuryYield } from '../services/api';

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

  const fetchTickerData = useCallback(async (tickerToFetch) => {
    if (!tickerToFetch) {
      toast.error("Please enter a ticker first.");
      return;
    }
    setLoading(true);
    setResult(null);
    setApiData(null);
    const toastId = toast.loading(`Fetching data for ${tickerToFetch.toUpperCase()}...`);

    try {
      const [tickerInfo, treasuryYield] = await Promise.all([
        getTickerData(tickerToFetch),
        getTreasuryYield(),
      ]);

      const requiredData = {
        fcf: tickerInfo.fcf, // Note: This is labeled as OCF in the UI
        capex: tickerInfo.capex,
        fcfe: tickerInfo.fcfe,
        totalDebt: tickerInfo.totalDebt,
        cash: tickerInfo.totalCash,
        sharesOutstanding: tickerInfo.sharesOutstanding, // User pointed out this needs correction
        beta: tickerInfo.beta,
        riskFreeRate: treasuryYield,
      };

      setApiData(requiredData);
      toast.success(`Data loaded for ${tickerToFetch.toUpperCase()}`, { id: toastId });

    } catch (error) {
      console.error("Failed to fetch DCF data:", error);
      toast.error(error.message || `Could not fetch all data for ${tickerToFetch}.`, { id: toastId });
      setApiData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (apiData) {
      const { riskFreeRate, beta } = apiData;
      const erp = assumptions.equityRiskPremium / 100;
      const discountRate = (riskFreeRate + beta * erp) * 100;
      updateAssumption('discountRate', discountRate.toFixed(2));
    }
  }, [apiData, assumptions.equityRiskPremium]);

  // Function to update fetched financial data
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

    const fcfe0 = apiData.fcfe;
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
    ticker, setTicker,
    apiData, updateApiData, // Export the new function
    assumptions, updateAssumption,
    result, loading, fetchTickerData, calculateFairValue,
  };
};
