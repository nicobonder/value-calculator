import { useState } from 'react';
import toast from 'react-hot-toast';
import { getTickerData } from '../services/api';
import { calculateScenarios } from '../utils/valuationLogic';

export const useValuation = () => {
  const [dataEntry, setDataEntry] = useState({ ticker: '', revenue: '', marketCap: '', fcf: '', horizon: 7 });
  const [scenarios, setScenarios] = useState({
    conservative: { growth: 15, margin: 20, multiple: 14 },
    base: { growth: 22, margin: 20, multiple: 18 },
    optimistic: { growth: 30, margin: 20, multiple: 20 }
  });
  const [analysis, setAnalysis] = useState({ results: null, timeline: [] });

  const updateDataEntry = (field, value) => setDataEntry(prev => ({ ...prev, [field]: value }));
  
  const updateScenario = (key, field, value) => 
    setScenarios(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));

  const fetchTicker = async () => {
    if (!dataEntry.ticker) return;
    const loading = toast.loading('Fetching data...');
    try {
      const data = await getTickerData(dataEntry.ticker);
      setDataEntry(prev => ({ ...prev, revenue: data.revenue, marketCap: data.marketCap, fcf: data.fcf }));
      toast.success('Data loaded!', { id: loading });
    } catch (err) {
      toast.error("Ticker not found. Please fill manually.", { id: loading });
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

  return { dataEntry, scenarios, analysis, updateDataEntry, updateScenario, fetchTicker, calculate };
};