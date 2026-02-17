
import React, { useState } from 'react';
import { useDcfValuation } from '../hooks/useDcfValuation';
import { formatCurrency, formatNumber, formatPercentage } from '../utils/formatters';
import HelpModalDCF from '../components/HelpModalDCF'; // Use the new DCF-specific modal

const DCF = () => {
  const {
    ticker, setTicker,
    apiData,
    assumptions, updateAssumption,
    result,
    loading,
    fetchTickerData,
    calculateFairValue,
  } = useDcfValuation();

  const [isHelpModalOpen, setHelpModalOpen] = useState(false);

  const handleTickerChange = (e) => {
    setTicker(e.target.value.toUpperCase());
  };

  const handleFetchClick = () => {
    fetchTickerData(ticker);
  };

  return (
    <div className="container dcf-view">
      {/* Use the new HelpModalDCF component */}
      {isHelpModalOpen && <HelpModalDCF onClose={() => setHelpModalOpen(false)} />}

      <div className="header-line">
        <h1>Discounted Cash Flow (DCF)</h1>
      </div>

      <div className="dcf-grid">
        {/* ... Data Entry column remains the same ... */}
        <div className="data-entry-dcf card">
          <h2>Data Entry</h2>
          <div className="input-group-dcf">
            <label>Ticker</label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input type="text" value={ticker} onChange={handleTickerChange} style={{ width: '80px'}} />
              <button onClick={handleFetchClick} disabled={loading} className="btn-fetch">Fetch</button>
            </div>
          </div>
          <div className="input-group-dcf auto-field">
            <label>Operating Cash Flow (OCF)</label>
            <span>{apiData ? formatCurrency(apiData.fcf) : 'N/A'}</span>
          </div>
          <div className="input-group-dcf auto-field">
            <label>Capital Expenditure</label>
            <span>{apiData ? formatCurrency(apiData.capex) : 'N/A'}</span>
          </div>
          <div className="input-group-dcf auto-field">
            <label>Levered FCF (for DCF)</label>
            <span className="highlight">{apiData ? formatCurrency(apiData.fcfe) : 'N/A'}</span>
          </div>
          <div className="input-group-dcf auto-field">
            <label>Total Debt</label>
            <span>{apiData ? formatCurrency(apiData.totalDebt) : 'N/A'}</span>
          </div>
          <div className="input-group-dcf auto-field">
            <label>Cash & Equivalents</label>
            <span>{apiData ? formatCurrency(apiData.cash) : 'N/A'}</span>
          </div>
          <div className="input-group-dcf auto-field">
            <label>Shares Outstanding</label>
            <span>{apiData ? formatNumber(apiData.sharesOutstanding) : 'N/A'}</span>
          </div>
          <div className="input-group-dcf auto-field">
            <label>Beta</label>
            <span>{apiData ? apiData.beta.toFixed(2) : 'N/A'}</span>
          </div>
        </div>

        {/* Column 2: Assumptions with Help button*/}
        <div className="assumptions-dcf card">
          <div className="assumptions-header">
            <h2>Your Assumptions</h2>
            <button className="help-button" onClick={() => setHelpModalOpen(true)}>?</button>
          </div>

          <div className="input-group-dcf">
            <label>FCF Growth Rate (5y)</label>
            <div>
              <input type="number" value={assumptions.growthRate} onChange={(e) => updateAssumption('growthRate', e.target.value)} />
              <span>%</span>
            </div>
          </div>
          <div className="input-group-dcf">
            <label>Discount Rate (r)</label>
            <div>
              <input type="number" value={assumptions.discountRate} onChange={(e) => updateAssumption('discountRate', e.target.value)} />
              <span>%</span>
            </div>
          </div>
          <div className="input-group-dcf auto-field">
            <label>Risk-Free Rate (Rf)</label>
            <span>{apiData ? formatPercentage(apiData.riskFreeRate) : 'N/A'}</span>
          </div>
          <div className="input-group-dcf">
            <label>Equity Risk Premium (ERP)</label>
            <div>
              <input type="number" value={assumptions.equityRiskPremium} onChange={(e) => updateAssumption('equityRiskPremium', e.target.value)} />
              <span>%</span>
            </div>
          </div>
          <div className="input-group-dcf default-field">
            <label>Terminal Growth (g_t)</label>
            <div>
              <input type="number" value={assumptions.terminalGrowth} onChange={(e) => updateAssumption('terminalGrowth', e.target.value)} />
              <span>%</span>
            </div>
          </div>
        </div>
      </div>

      <button className="btn-calculate" onClick={calculateFairValue} disabled={loading || !apiData}>
        {loading ? 'Calculating...' : 'Calculate Fair Value'}
      </button>

      {result && (
        <div className="results-dcf card fade-in">
          <h2>Valuation Results</h2>
          <div className="result-item">
            <h3>Fair Price per Share:</h3>
            <p className="highlight-result">{formatCurrency(result.fairPrice)}</p>
          </div>
          <div className="result-details">
            <p><strong>Enterprise Value:</strong> {formatCurrency(result.enterpriseValue)}</p>
            <p><strong>Equity Value:</strong> {formatCurrency(result.equityValue)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DCF;
