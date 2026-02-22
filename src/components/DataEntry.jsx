import React, { useState, useEffect, useRef } from 'react';

// --- Helper Functions for Formatting ---
const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') return '';
  const number = Number(value);
  if (isNaN(number)) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(number);
};

const parseCurrency = (value) => {
  if (typeof value !== 'string') return value;
  return value.replace(/[\$\s,]/g, '');
};

// --- Component ---
const DataEntry = ({ data, onChange, onSelectTicker, searchResults, onClearSearch }) => {
  const fields = [
    { name: 'ticker', label: 'Ticker or Company Name', type: 'text' },
    { name: 'marketCap', label: 'Market Cap', type: 'number', isCurrency: true },
    { name: 'revenue', label: 'Revenue', type: 'number', isCurrency: true },
    { name: 'fcf', label: 'Free Cash Flow (ttm)', type: 'number', isCurrency: true },
    { name: 'horizon', label: 'Horizon (Years)', type: 'number' },
  ];

  const searchRef = useRef(null); // Ref for the search container

  const handleChange = (name, value, isCurrency) => {
    if (isCurrency) {
      const parsed = parseCurrency(value);
      if (/^[0-9]*$/.test(parsed)) {
        const numericValue = parsed === '' ? '' : Number(parsed);
        onChange(name, numericValue);
      }
    } else {
      onChange(name, value);
    }
  };

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        onClearSearch();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClearSearch]);

  return (
    <section className="card data-entry">
      <h2>Data Entry</h2>
      <div className="grid-inputs">
        {fields.map(f => (
          <div 
            className={`input-data ${f.name === 'ticker' ? 'search-container' : ''}`}
            key={f.name}
            ref={f.name === 'ticker' ? searchRef : null}
          >
            <label>{f.label}</label>
            <input 
              type={f.isCurrency ? 'text' : f.type}
              value={f.isCurrency ? formatCurrency(data[f.name]) : data[f.name]}
              onChange={(e) => handleChange(f.name, e.target.value, f.isCurrency)}
              placeholder={f.name === 'ticker' ? "e.g., NVDA or Nvidia" : ""}
              className="input-field"
              autoComplete="off" // Disable browser autocomplete
            />
            {f.name === 'ticker' && searchResults.length > 0 && (
              <ul className="search-results">
                {searchResults.map((result) => (
                  <li 
                    key={result.ticker}
                    onClick={() => onSelectTicker(result.ticker)} // onSelectTicker is the new prop
                  >
                    <span className="ticker-symbol">{result.ticker}</span>
                    <span className="company-name">{result.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default DataEntry;
