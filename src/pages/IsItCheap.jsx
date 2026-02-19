
import React, { useState } from 'react';
import { getValuationData } from '../services/api';
import './IsItCheap.css'; // We'll create this file next for styling.

const IsItCheap = () => {
  const [ticker, setTicker] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFetch = async () => {
    if (!ticker) {
      setError('Please enter a ticker symbol.');
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await getValuationData(ticker);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

  // --- UPDATED: Make the class detection more flexible ---
  const getOverallRatingClass = (rating) => {
    if (!rating) return 'overall-unknown';
    if (rating.includes('Cheap')) return 'overall-cheap';
    if (rating.includes('Fair Price')) return 'overall-fair';
    if (rating.includes('Expensive')) return 'overall-expensive';
    return 'overall-unknown';
  };
  // --- END UPDATE ---

  return (
    <div className="container valuation-view">
      <h1>Is It Cheap? Valuation Tool</h1>
      
      <div className="search-bar">
        <input
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          onKeyPress={(e) => e.key === 'Enter' && handleFetch()}
          placeholder="Enter Ticker (e.g., WMT)"
        />
        <button onClick={handleFetch} disabled={loading}>
          {loading ? 'Fetching...' : 'Analyze'}
        </button>
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
