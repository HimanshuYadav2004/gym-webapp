export const formatINR = (amount) =>
  `₹${Math.round(parseFloat(amount) || 0).toLocaleString('en-IN')}`;
