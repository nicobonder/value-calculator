import React from 'react';

// Helper to format numbers as USD currency
const formatCurrency = (value) => {
  // The value from the logic might already be a string with commas, so we clean it
  const cleanedValue = String(value).replace(/,/g, '');
  const number = Number(cleanedValue);

  if (isNaN(number)) {
    return value; // Return original value if it's not a valid number
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(number);
};

const ResultsGrid = ({ results }) => {
  return (
    <section className="results-grid">
      {Object.keys(results).map(key => (
        <div key={key} className="card result-card">
          <h4>{key.toUpperCase()}</h4>
          <p>Future Mkt Cap: <span className="highlight">{formatCurrency(results[key].futureMktCap)}</span></p>
          <p>Expected CAGR: <span className="highlight">{results[key].cagr}%</span></p>
        </div>
      ))}
    </section>
  );
};

export default ResultsGrid;
