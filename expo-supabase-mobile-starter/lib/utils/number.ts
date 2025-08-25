/**
 * Safe currency formatting utility
 */
export const formatCurrencySafe = (amount: number, currency: string = 'USD'): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  } catch {
    // Fallback formatting
    return `${currency} ${amount.toFixed(2)}`;
  }
};

/**
 * Safe number formatting utility
 */
export const formatNumberSafe = (value: number, options?: Intl.NumberFormatOptions): string => {
  try {
    return new Intl.NumberFormat('en-US', options).format(value);
  } catch {
    return value.toString();
  }
};

/**
 * Parse string to number safely
 */
export const parseNumberSafe = (value: string | number): number => {
  if (typeof value === 'number') return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Safe percentage formatting
 */
export function formatPercentSafe(amount: number, locale = 'en-US') {
  try {
    if (typeof Intl !== 'undefined' && Intl.NumberFormat) {
      return new Intl.NumberFormat(locale, { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount / 100);
    }
  } catch {
    // Intentionally empty - fallback handled below
  }
  // Fallback
  const rounded = (Number.isFinite(amount) ? amount : 0).toFixed(2);
  return `${rounded}%`;
}
