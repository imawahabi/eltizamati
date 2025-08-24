/**
 * Utility functions for money formatting and calculations
 * Specific to Kuwait (KWD) with 3 decimal places
 */

export function formatCurrency(amount: number, currency: string = 'د.ك'): string {
  // Use Bankers Rounding for 3 decimal places
  const rounded = Math.round(amount * 1000) / 1000;
  
  // Format with thousands separator and 3 decimal places
  const formatted = rounded.toLocaleString('en-US', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
  
  return `${formatted} ${currency}`;
}

export function parseCurrency(text: string): number {
  // Remove currency symbols and parse
  const cleaned = text.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
}

export function calculateInterest(principal: number, apr: number, days: number): number {
  if (apr <= 0) return 0;
  return (principal * (apr / 100) / 365) * days;
}

export function bankersRounding(value: number, decimals: number = 3): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function addAmounts(...amounts: number[]): number {
  const sum = amounts.reduce((total, amount) => total + amount, 0);
  return bankersRounding(sum);
}

export function subtractAmounts(minuend: number, ...subtrahends: number[]): number {
  const sum = subtrahends.reduce((total, amount) => total + amount, 0);
  return bankersRounding(minuend - sum);
}