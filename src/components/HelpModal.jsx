
import React from 'react';
import '../styles/HelpModal.css';

const HelpModal = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>How It Works</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <p>This tool uses the Exit Multiple Method to project future market capitalization and determine the expected Compound Annual Growth Rate (CAGR) on different growth scenarios.</p>
          <ol>
            <li><strong>Enter Ticker:</strong> Start by entering a company's stock ticker (e.g., "AAPL") and press Tab or click away. The app will fetch the current Market Cap, Revenue, and Free Cash Flow (FCF). You can also enter these values manually.</li>
            <li><strong>Define Scenarios:</strong> Adjust the sliders for three scenarios: Conservative, Base, and Optimistic. For each, set the expected annual revenue growth, the future Free Cash Flow (FCF) margin, and the Price-to-FCF multiple you anticipate.</li>
            <li><strong>Calculate:</strong> Click the "Calculate Projection" button.</li>
            <li><strong>Analyze Results:</strong> The tool will display the projected future market cap and the compound annual growth rate (CAGR) for each scenario. It will also generate a chart showing the market cap's growth trajectory over your selected time horizon.</li>
          </ol>
        </div>
        
        <div className='disclaimer'>
          <h3>Disclaimer</h3>
          <p>The information provided by this tool is for educational purposes only and does not constitute financial or investment advice. Always perform your own due diligence before making any investment decisions.</p>
        </div>
      </div>
      

    </div>
  );
};

export default HelpModal;
