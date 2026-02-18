
import React, { useState } from 'react';
import { useDcfValuation } from '../hooks/useDcfValuation';
import { formatCurrency, formatNumber, formatPercentage } from '../utils/formatters';
import HelpModalDCF from '../components/HelpModalDCF';

const DCF = () => {
  const {
    ticker, setTicker,
    apiData, updateApiData, // Import updateApiData
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

  // Helper to render an input for financial data
  const renderDataInput = (field, label) => (
    <div className="input-group-dcf">
      <label>{label}</label>
      <input
        type="number"
        value={apiData && apiData[field] !== null ? apiData[field] : ''}
        onChange={(e) => updateApiData(field, e.target.value)}
        disabled={!apiData}
        className={field === 'fcfe' ? 'highlight' : ''}
      />
    </div>
  );

  return (
    <div className="container dcf-view">
      {isHelpModalOpen && <HelpModalDCF onClose={() => setHelpModalOpen(false)} />}

      <div className="header-line">
        <h1>Discounted Cash Flow (DCF)</h1>
      </div>

      <div className="dcf-grid">
        <div className="data-entry-dcf card">
          <h2>Data Entry</h2>
          <div className="input-group-dcf">
            <label>Ticker</label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input 
                type="text" 
                value={ticker} 
                onChange={handleTickerChange}
                placeholder="e.g. WMT"
                style={{ width: '100px'}}
              />
              <button onClick={handleFetchClick} disabled={loading} className="btn-fetch">Fetch</button>
            </div>
          </div>
          
          {/* Render editable inputs for financial data */}
          {renderDataInput('fcf', 'Operating Cash Flow (OCF)')}
          {renderDataInput('capex', 'Capital Expenditure')}
          {renderDataInput('fcfe', 'Levered FCF (for DCF)')}
          {renderDataInput('totalDebt', 'Total Debt')}
          {renderDataInput('cash', 'Cash & Equivalents')}
          {renderDataInput('sharesOutstanding', 'Shares Outstanding')}
          {renderDataInput('beta', 'Beta')}
        </div>

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
            {/* This remains a span as it's from an external, non-editable source */}
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
