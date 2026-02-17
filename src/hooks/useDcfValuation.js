
import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getTickerData, getTreasuryYield } from '../services/api';

const DEFAULT_ASSUMPTIONS = {
  growthRate: 15,
  discountRate: 10,
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
      // THE FIX IS HERE: Renamed `treasuryYieldData` to `treasuryYield` to reflect it's a number.
      const [tickerInfo, treasuryYield] = await Promise.all([
        getTickerData(tickerToFetch),
        getTreasuryYield()
      ]);

      const requiredData = {
        fcf: tickerInfo.fcf,
        capex: tickerInfo.capex,
        fcfe: tickerInfo.fcfe,
        totalDebt: tickerInfo.totalDebt,
        cash: tickerInfo.totalCash, 
        sharesOutstanding: tickerInfo.sharesOutstanding,
        beta: tickerInfo.beta,
        // THE FIX IS HERE: Use the `treasuryYield` number directly, not `treasuryYield.yield`
        riskFreeRate: treasuryYield,
      };

      for (const [key, value] of Object.entries(requiredData)) {
        if (value === undefined || value === null) {
          if (key !== 'capex') { // Capex can sometimes be missing/zero
             throw new Error(`Missing required data point from API: ${key}`);
          }
        }
      }

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

  const updateAssumption = (field, value) => {
    setAssumptions(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const calculateFairValue = () => {
    if (!apiData) {
      toast.error("No financial data available. Please fetch data for a ticker first.");
      return;
    }

    const fcfe0 = apiData.fcfe;
    const g = assumptions.growthRate / 100;
    const gt = assumptions.terminalGrowth / 100;
    const r_input = assumptions.discountRate / 100;
    const erp = assumptions.equityRiskPremium / 100;
    const r = r_input > 0 ? r_input : apiData.riskFreeRate + apiData.beta * erp;

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
  }, [fetchTickerData]);


  return {
    ticker, setTicker,
    apiData,
    assumptions, updateAssumption,
    result,
    loading,
    fetchTickerData,
    calculateFairValue,
  };
};
