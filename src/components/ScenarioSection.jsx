import React from 'react';

const ScenarioSection = ({ scenarios, onChange }) => {
  // Map internal state keys to display labels
  const scenarioFields = [
    { key: 'growth', label: 'Revenue CAGR' },
    { key: 'margin', label: 'FCF Margin' },
    { key: 'multiple', label: 'FCF multiple' }
  ];

  return (
    <section className="scenarios-grid">
      {Object.keys(scenarios).map((scenarioKey) => (
        <div key={scenarioKey} className="card scenario">
          <h3 className="cardTitle">{scenarioKey}</h3>
          {scenarioFields.map(field => (
            <div className="input-group" key={field.key}>
              <label className="capitalize">{field.label} {field.key !== 'multiple' ? '%' : ''}</label>
              <input 
                type="number" 
                value={scenarios[scenarioKey][field.key]} 
                onChange={(e) => onChange(scenarioKey, field.key, e.target.value)} 
              />
            </div>
          ))}
        </div>
      ))}
    </section>
  );
};

export default ScenarioSection;