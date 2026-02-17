import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{ 
        backgroundColor: '#1e1e1e',
        border: '1px solid #4caf50',
        borderRadius: '8px',
        padding: '10px'
      }}>
        <p className="label" style={{ color: '#4caf50', fontWeight: 'bold' }}>{`${label}`}</p>
        {payload.map((pld, index) => (
          <p key={index} style={{ color: pld.color }}>
            {`${pld.name}: ${(pld.value / 1000000).toFixed(0)}M`}
          </p>
        ))}
      </div>
    );
  }

  return null;
};


const GrowthChart = ({ data }) => {
  return (
    <section className="card chart-container">
      <h3>Market Cap Projection Timeline</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 20, right: 20, left: 50, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="year" stroke="#fff" />
          <YAxis 
            stroke="#fff" 
            tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`} 
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Line 
            name="Conservative"
            type="monotone" 
            dataKey="conservative" 
            stroke="#8884d8"
            strokeWidth={2} 
            dot={false} 
          />
          <Line 
            name="Base Case"
            type="monotone" 
            dataKey="base" 
            stroke="#4caf50"
            strokeWidth={3} 
            dot={{ r: 4, fill: '#4caf50' }} 
          />
          <Line 
            name="Optimistic"
            type="monotone" 
            dataKey="optimistic" 
            stroke="#82ca9d"
            strokeWidth={2} 
            strokeDasharray="5 5" 
            dot={false} 
          />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
};

export default GrowthChart;
