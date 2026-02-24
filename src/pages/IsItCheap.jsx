import React from 'react';
import { useIsItCheap } from '../hooks/useIsItCheap';
import '../styles/IsItCheap.css';

const IsItCheap = () => {
  const {
    ticker,
    data,
    loading,
    error,
    searchResults,
    updateTicker,
    handleTickerSelection,
    clearSearchResults,
  } = useIsItCheap();

  const handleInputBlur = () => {
    // Use a timeout to allow the click on a search result to register
    setTimeout(() => {
      clearSearchResults();
    }, 200);
  };

  const getRatingClass = (rating) => {
    switch (rating) {
      case 'Very Cheap': return 'rating-very-cheap';
      case 'Fair Price': return 'rating-fair-price';
      case 'Expensive': return 'rating-expensive';
      case 'Very Expensive': return 'rating-very-expensive';
      default: return 'rating-na';
    }
  };

  const getOverallRatingClass = (rating) => {
    if (!rating) return 'overall-unknown';
    if (rating.includes('Cheap')) return 'overall-cheap';
    if (rating.includes('Fair Price')) return 'overall-fair';
    if (rating.includes('Expensive')) return 'overall-expensive';
    return 'overall-unknown';
  };

  return (
    <div className="valuation-view">
      <h1>Is It Cheap?</h1>

      {/* This is the new search bar, matching the other pages */}
      <div className="search-container" onBlur={handleInputBlur}>
        <div className="ticker-search-wrapper">
          <input
            type="text"
            value={ticker}
            onChange={(e) => updateTicker(e.target.value)}
            placeholder="Enter Ticker or Company Name (e.g., WMT)"
            disabled={loading}
            autoComplete="off"
          />
          {searchResults.length > 0 && (
            <ul className="search-results">
              {searchResults.map((item) => (
                <li key={item.ticker} onMouseDown={() => handleTickerSelection(item)}>
                  <span className="ticker-symbol">{item.ticker}</span>
                  <span className="company-name">{item.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {error && <p className="error-message">Error: {error}</p>}

      {data && (
        <div className="results-container fade-in">
          <div className="results-summary">
            <h2>{data.companyName} ({data.ticker})</h2>
            <div className={`overall-rating ${getOverallRatingClass(data.overallRating)}`}>
              <p>Overall Score: <strong>{data.finalScore}</strong></p>
              <p>Verdict: <strong>{data.overallRating}</strong></p>
            </div>
          </div>

          <table className="metrics-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
                <th>Score</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {data.metrics.map((item, index) => (
                <tr key={index}>
                  <td>{item.metric}</td>
                  <td>{item.value}</td>
                  <td className={getRatingClass(item.rating)}>{item.score}</td>
                  <td className={`rating-cell ${getRatingClass(item.rating)}`}>
                    {item.rating}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default IsItCheap;