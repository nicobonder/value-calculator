import React, { useState } from 'react';
import { useDcfValuation } from '../hooks/useDcfValuation';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import HelpModalDCF from '../components/HelpModalDCF';
import DcfDataEntry from '../components/DcfDataEntry'; // IMPORT THE CORRECT COMPONENT

const DCF = () => {
  // All the logic is handled by the hook
  const {
    ticker,
    apiData, 
    updateApiData,
    assumptions, 
    updateAssumption,
    result,
    loading,
    calculateFairValue,
    searchResults,
    updateDcfEntry,
    handleTickerSelection,
    clearSearchResults,
  } = useDcfValuation();

  const [isHelpModalOpen, setHelpModalOpen] = useState(false);

  // This parent component now only renders the general layout and passes props down.
  return (
    <div className="container dcf-view">
      {isHelpModalOpen && <HelpModalDCF onClose={() => setHelpModalOpen(false)} />}

      <div className="header-line">
        <h1>Discounted Cash Flow (DCF)</h1>
      </div>

      <div className="dcf-grid">
        {/* 
          HERE IS THE KEY CHANGE:
          The hardcoded data entry form is replaced by the DcfDataEntry component.
          All the necessary state and functions are passed as props.
        */}
        <DcfDataEntry
          ticker={ticker}
          apiData={apiData}
          updateApiData={updateApiData}
          loading={loading}
          searchResults={searchResults}
          handleTickerSelection={handleTickerSelection}
          clearSearchResults={clearSearchResults}
          updateDcfEntry={updateDcfEntry}
        />

        {/* The assumptions card remains here */}
        <div className="assumptions-dcf card">
          <div className="assumptions-header">
            <h2>Your Assumptions</h2>
            <button className="help-button" onClick={() => setHelpModalOpen(true)}>?</button>
          </div>
          <div className="input-group-dcf">
            <label className='assumption-label'>FCF Growth Rate (5y)</label>
            <div>
              <input className='assumption-input' type="number" value={assumptions.growthRate} onChange={(e) => updateAssumption('growthRate', e.target.value)} />
              <span>%</span>
            </div>
          </div>
          <div className="input-group-dcf">
            <label className='assumption-label'>Discount Rate (r)</label>
            <div>
              <input className='assumption-input' type="number" value={assumptions.discountRate} onChange={(e) => updateAssumption('discountRate', e.target.value)} />
              <span>%</span>
            </div>
          </div>
          <div className="input-group-dcf auto-field">
            <label className='assumption-label'>Risk-Free Rate (Rf)</label>
            <span>{apiData ? formatPercentage(apiData.riskFreeRate) : 'N/A'}</span>
          </div>
          <div className="input-group-dcf">
            <label className='assumption-label'>Equity Risk Premium (ERP)</label>
            <div>
              <input className='assumption-input' type="number" value={assumptions.equityRiskPremium} onChange={(e) => updateAssumption('equityRiskPremium', e.target.value)} />
              <span>%</span>
            </div>
          </div>
          <div className="input-group-dcf default-field">
            <label className='assumption-label'>Terminal Growth (g_t)</label>
            <div>
              <input className='assumption-input' type="number" value={assumptions.terminalGrowth} onChange={(e) => updateAssumption('terminalGrowth', e.target.value)} />
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