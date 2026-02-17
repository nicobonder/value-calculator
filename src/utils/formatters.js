/**
 * Formats a number as a currency string (e.g., $1,234.56).
 * @param {number} value The number to format.
 * @returns {string} The formatted currency string.
 */
export const formatCurrency = (value) => {
  if (typeof value !== 'number') return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Formats a large number with commas (e.g., 1,234,567).
 * @param {number} value The number to format.
 * @returns {string} The formatted number string.
 */
export const formatNumber = (value) => {
  if (typeof value !== 'number') return 'N/A';
  return new Intl.NumberFormat('en-US').format(value);
};

/**
 * Formats a number as a percentage string (e.g., 5.25%).
 * @param {number} value The number to format (should be in decimal form, e.g., 0.0525).
 * @returns {string} The formatted percentage string.
 */
export const formatPercentage = (value) => {
  if (typeof value !== 'number') return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
