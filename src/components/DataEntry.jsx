import React from 'react';

// Helper to format numbers as USD currency
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

// Helper to parse currency string back to a number-compatible string
const parseCurrency = (value) => {
  if (typeof value !== 'string') return value;
  // Remove currency symbols and commas
  return value.replace(/[\$\s,]/g, '');
};

const DataEntry = ({ data, onChange, onBlur }) => {
  const fields = [
    { name: 'ticker', label: 'Ticker', type: 'text' },
    { name: 'marketCap', label: 'Market Cap', type: 'number', isCurrency: true },
    { name: 'revenue', label: 'Revenue', type: 'number', isCurrency: true },
    { name: 'fcf', label: 'Current FCF', type: 'number', isCurrency: true },
    { name: 'horizon', label: 'Horizon (Years)', type: 'number' },
  ];

  const handleChange = (name, value, isCurrency) => {
    if (isCurrency) {
      const parsed = parseCurrency(value);
      // Allow only digits or an empty string
      if (/^[0-9]*$/.test(parsed)) {
        const numericValue = parsed === '' ? '' : Number(parsed);
        onChange(name, numericValue);
      }
    } else {
      onChange(name, value);
    }
  };

  return (
    <section className="card data-entry">
      <h2>Data Entry</h2>
      <div className="grid-inputs">
        {fields.map(f => (
          <div className="input-data" key={f.name}>
            <label>{f.label}</label>
            <input 
              type={f.isCurrency ? 'text' : f.type} // Use text type to display formatted string
              value={f.isCurrency ? formatCurrency(data[f.name]) : data[f.name]}
              onChange={(e) => handleChange(f.name, e.target.value, f.isCurrency)}
              onBlur={f.name === 'ticker' ? onBlur : null}
              placeholder={f.name === 'ticker' ? "e.g. GOOG" : ""}
              className="input-field" // Added for consistency
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default DataEntry;
