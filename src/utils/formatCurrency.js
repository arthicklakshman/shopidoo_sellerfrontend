export const formatCurrency = (amount, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);
export const formatNumber = (num) => new Intl.NumberFormat('en-IN').format(num);
