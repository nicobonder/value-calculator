
import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getTickerData, getTreasuryYield } from '../services/api';

const DEFAULT_ASSUMPTIONS = {
  growthRate: 15,
  // discountRate is now calculated automatically
  discountRate: 0, 
  terminalGrowth: 3,
  equityRiskPremium: 6,
};

export const useDcfValuation = () => {
  const [ticker, setTicker] = useState('AAPL');
  const [apiData, setApiData] = useState(null);
  const [assumptions, setAssumptions] = useState(DEFAULT_ASSUMPTIONS);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTickerData = useCallback(async (tickerToFetch) => {
    if (!tickerToFetch) return;
    setLoading(true);
    setResult(null);
    const toastId = toast.loading(`Fetching data for ${tickerToFetch.toUpperCase()}...`);

    try {
      const [tickerInfo, treasuryYield] = await Promise.all([
        getTickerData(tickerToFetch),
        getTreasuryYield(),
      ]);

      const requiredData = {
        fcf: tickerInfo.fcf, // This is OCF now
        capex: tickerInfo.capex,
        fcfe: tickerInfo.fcfe, // The correctly calculated Levered FCF
        totalDebt: tickerInfo.totalDebt,
        cash: tickerInfo.totalCash,
        sharesOutstanding: tickerInfo.sharesOutstanding,
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

  // --- NEW: Automatically calculate Discount Rate using CAPM ---
  useEffect(() => {
    if (apiData) {
      const { riskFreeRate, beta } = apiData;
      const erp = assumptions.equityRiskPremium / 100;
      const discountRate = (riskFreeRate + beta * erp) * 100;
      
      // Update the discount rate in assumptions, rounding for a cleaner display
      updateAssumption('discountRate', discountRate.toFixed(2));
    }
  }, [apiData, assumptions.equityRiskPremium]); // Recalculate if ERP changes


  const updateAssumption = (field, value) => {
    setAssumptions(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const calculateFairValue = () => {
    if (!apiData) {
      toast.error("No financial data available.");
      return;
    }

    const fcfe0 = apiData.fcfe;
    const g = assumptions.growthRate / 100;
    const gt = assumptions.terminalGrowth / 100;
    // THE CHANGE: 'r' is now taken directly from assumptions, which is auto-calculated
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
  
  useEffect(() => {
    fetchTickerData(ticker);
  }, []); // Only run on initial load

  return {
    ticker, setTicker, apiData, assumptions, updateAssumption,
    result, loading, fetchTickerData, calculateFairValue,
  };
};
