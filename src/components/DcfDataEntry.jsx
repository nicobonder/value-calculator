import React from 'react';

// CORRECTED: This component will now receive `updateDcfEntry` instead of `setTicker`.
const DcfDataEntry = ({ 
    ticker, 
    apiData, 
    updateApiData, 
    loading, 
    searchResults, 
    handleTickerSelection, 
    clearSearchResults,
    updateDcfEntry // The correct prop to trigger search
}) => {

    // This handler ensures the search results disappear when the user clicks away.
    const handleLocalBlur = () => {
        setTimeout(() => {
            clearSearchResults();
        }, 200); // A small delay allows the click on a search result to register.
    };

    const getDisplayValue = (field, rawValue) => {
        if (rawValue === null || rawValue === undefined || rawValue === '') return '';
        if (field === 'beta') return rawValue;
        return new Intl.NumberFormat('en-US').format(Math.trunc(rawValue));
    };
    
    const renderDataInput = (field, label) => {
        const value = apiData?.[field] ?? '';
        return (
          <div className="input-group-dcf" key={field}>
            <label>{label}</label>
            <input
              type="text"
              value={getDisplayValue(field, value)}
              onChange={(e) => updateApiData(field, e.target.value.replace(/,/g, ''))}
              disabled={!apiData}
            />
          </div>
        );
      };

    return (
        <div className="data-entry-dcf card">
            <h2>Key Data</h2>
            <div className="input-group-dcf">
                <label><strong>Ticker or Company Name</strong></label>
                <div className="ticker-search-wrapper" onBlur={handleLocalBlur}>
                    <input 
                        type="text" 
                        id="ticker"
                        value={ticker}
                        // CORRECTED: The onChange now calls the function that triggers the search.
                        onChange={(e) => updateDcfEntry('ticker', e.target.value)}
                        placeholder="e.g., AAPL or Apple Inc."
                        disabled={loading}
                        autoComplete="off"
                    />
                    {/* This JSX for displaying results is correct and remains unchanged. */}
                    {searchResults.length > 0 && (
                        <ul className="search-results card">
                            {searchResults.map((item) => (
                                <li key={item.ticker} onMouseDown={() => handleTickerSelection(item)}>
                                    <strong>{item.ticker}</strong> - {item.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            
            {apiData && (
                <>
                  <div className="data-summary">
                    <p><strong>Company:</strong> {apiData.name} ({apiData.ticker})</p>
                  </div>
    
                  {renderDataInput('fcf', 'Free Cash Flow (TTM)')}
                  {renderDataInput('totalDebt', 'Total Debt')}
                  {renderDataInput('cash', 'Cash & Equivalents')}
                  {renderDataInput('sharesOutstanding', 'Shares Outstanding')}
                  {renderDataInput('beta', 'Beta')}
                </>
              )}
        </div>
    );
}

export default DcfDataEntry;