
import React from 'react';
import '../styles/HelpModal.css';

// Renamed component to be specific to DCF view
const HelpModalDCF = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>About the DCF Calculator</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <div className="modal-body">
          <h4>How It Works</h4>
          <p>
            This tool uses a <strong>Discounted Cash Flow (DCF)</strong> model to estimate a stock's intrinsic value. Specifically, it uses the <strong>Free Cash Flow to Equity (FCFE)</strong> method.
          </p>
          <ol>
            <li>It projects the company's future FCFE for the next 5 years based on your growth rate assumption.</li>
            <li>It calculates a "Terminal Value," representing all cash flows after the 5-year period.</li>
            <li>It discounts all these future cash flows back to their present value using the "Discount Rate".</li>
            <li>The sum of these present values gives the total <strong>Equity Value</strong>. Dividing this by the number of shares gives the estimated <strong>Fair Price</strong>.</li>
          </ol>

          <hr />

          <h4>Guidance on Your Assumptions</h4>
          <p>Your assumptions are critical to the valuation. Here are some recommendations:</p>
          <ul>
            <li>
              <strong>FCF Growth Rate (5y):</strong> Your most subjective and impactful input. Research the company's historical growth, analyst estimates, and industry trends.
              <ul>
                <li><em>Mature, stable companies:</em> 5-10%</li>
                <li><em>High-growth companies:</em> 15-25% (use with caution)</li>
              </ul>
            </li>
            <li>
              <strong>Discount Rate (r):</strong> This is auto-calculated using the standard CAPM formula. <strong>It's recommended to stick with this value.</strong> You can override it if you have a specific required rate of return, but be aware this deviates from the standard model.
            </li>
            <li>
              <strong>Equity Risk Premium (ERP):</strong> The excess return investors expect from the market over the risk-free rate. A range of <strong>4.5% to 6.5%</strong> is typical. Only change this if you have a strong macroeconomic reason.
            </li>
            <li>
              <strong>Terminal Growth (g_t):</strong> The perpetual growth rate. This value <strong>must be low and conservative</strong>. It should not be higher than the expected long-term GDP growth (e.g., <strong>2% to 3%</strong> for the US). A high value here will significantly inflate the fair price.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Updated export name
export default HelpModalDCF;
