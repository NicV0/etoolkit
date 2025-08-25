/**
 * Calculation utilities for financial operations
 * Handles tax, discounts, totals, and other business calculations
 */

export interface CalculationItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountPct?: number;
  taxable?: boolean;
}

export interface CalculationResult {
  subtotal: number;
  discountAmount: number;
  taxableSubtotal: number;
  taxAmount: number;
  total: number;
  itemCount: number;
  breakdown: {
    items: Array<{
      description: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      lineTotal: number;
      discountAmount: number;
      taxableAmount: number;
      taxAmount: number;
    }>;
    summary: {
      subtotal: number;
      discountAmount: number;
      taxableSubtotal: number;
      taxAmount: number;
      total: number;
    };
  };
}

export interface TaxConfig {
  rate: number; // Percentage as decimal (e.g., 0.08 for 8%)
  applyToShipping?: boolean;
  applyToDiscounts?: boolean;
}

export interface DiscountConfig {
  type: 'percentage' | 'fixed';
  value: number;
  applyToTax?: boolean;
}

/**
 * Calculate line total for a single item
 */
export const calculateLineTotal = (item: CalculationItem): number => {
  const { quantity, unitPrice, discountPct = 0 } = item;
  
  if (quantity <= 0 || unitPrice < 0) {
    throw new Error('Quantity must be positive and unit price must be non-negative');
  }

  const grossTotal = quantity * unitPrice;
  const discountAmount = grossTotal * (discountPct / 100);
  
  return Math.max(0, grossTotal - discountAmount);
};

/**
 * Calculate tax amount for a single item
 */
export const calculateItemTax = (
  item: CalculationItem,
  taxRate: number
): number => {
  if (taxRate < 0 || taxRate > 1) {
    throw new Error('Tax rate must be between 0 and 1');
  }

  if (!item.taxable) {
    return 0;
  }

  const lineTotal = calculateLineTotal(item);
  return lineTotal * taxRate;
};

/**
 * Calculate comprehensive totals for a list of items
 */
export const calculateTotals = (
  items: CalculationItem[],
  taxRate: number = 0,
  discountConfig?: DiscountConfig
): CalculationResult => {
  if (taxRate < 0 || taxRate > 1) {
    throw new Error('Tax rate must be between 0 and 1');
  }

  if (discountConfig && discountConfig.value < 0) {
    throw new Error('Discount value must be non-negative');
  }

  // Calculate line totals and tax for each item
  const calculatedItems = items.map(item => {
    const lineTotal = calculateLineTotal(item);
    const itemDiscountAmount = lineTotal * ((item.discountPct || 0) / 100);
    const taxableAmount = item.taxable ? lineTotal - itemDiscountAmount : 0;
    const itemTaxAmount = calculateItemTax(item, taxRate);

    return {
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      lineTotal,
      discountAmount: itemDiscountAmount,
      taxableAmount,
      taxAmount: itemTaxAmount,
    };
  });

  // Calculate subtotals
  const subtotal = calculatedItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const totalDiscountAmount = calculatedItems.reduce((sum, item) => sum + item.discountAmount, 0);
  const taxableSubtotal = calculatedItems.reduce((sum, item) => sum + item.taxableAmount, 0);

  // Apply global discount if configured
  let globalDiscountAmount = 0;
  let finalSubtotal = subtotal - totalDiscountAmount;

  if (discountConfig) {
    if (discountConfig.type === 'percentage') {
      globalDiscountAmount = finalSubtotal * (discountConfig.value / 100);
    } else {
      globalDiscountAmount = Math.min(discountConfig.value, finalSubtotal);
    }
    finalSubtotal -= globalDiscountAmount;
  }

  // Calculate tax
  let taxAmount = calculatedItems.reduce((sum, item) => sum + item.taxAmount, 0);
  
  // Apply tax to global discount if configured
  if (discountConfig?.applyToTax && globalDiscountAmount > 0) {
    const discountTaxAmount = globalDiscountAmount * taxRate;
    taxAmount = Math.max(0, taxAmount - discountTaxAmount);
  }

  const total = finalSubtotal + taxAmount;

  return {
    subtotal,
    discountAmount: totalDiscountAmount + globalDiscountAmount,
    taxableSubtotal,
    taxAmount,
    total,
    itemCount: items.length,
    breakdown: {
      items: calculatedItems,
      summary: {
        subtotal,
        discountAmount: totalDiscountAmount + globalDiscountAmount,
        taxableSubtotal,
        taxAmount,
        total,
      },
    },
  };
};

/**
 * Calculate simple subtotal (no tax or discounts)
 */
export const calculateSubtotal = (items: CalculationItem[]): number => {
  return items.reduce((sum, item) => {
    return sum + calculateLineTotal(item);
  }, 0);
};

/**
 * Calculate tax amount for a subtotal
 */
export const calculateTax = (subtotal: number, taxRate: number): number => {
  if (taxRate < 0 || taxRate > 1) {
    throw new Error('Tax rate must be between 0 and 1');
  }

  return subtotal * taxRate;
};

/**
 * Calculate total with tax
 */
export const calculateTotal = (subtotal: number, taxAmount: number): number => {
  return subtotal + taxAmount;
};

/**
 * Calculate discount amount
 */
export const calculateDiscount = (
  amount: number,
  discountType: 'percentage' | 'fixed',
  discountValue: number
): number => {
  if (discountValue < 0) {
    throw new Error('Discount value must be non-negative');
  }

  if (discountType === 'percentage') {
    if (discountValue > 100) {
      throw new Error('Percentage discount cannot exceed 100%');
    }
    return amount * (discountValue / 100);
  } else {
    return Math.min(discountValue, amount);
  }
};

/**
 * Calculate percentage change between two values
 */
export const calculatePercentageChange = (oldValue: number, newValue: number): number => {
  if (oldValue === 0) {
    return newValue > 0 ? 100 : 0;
  }

  return ((newValue - oldValue) / oldValue) * 100;
};

/**
 * Calculate profit margin
 */
export const calculateProfitMargin = (revenue: number, cost: number): number => {
  if (revenue <= 0) {
    return 0;
  }

  return ((revenue - cost) / revenue) * 100;
};

/**
 * Calculate markup percentage
 */
export const calculateMarkup = (cost: number, sellingPrice: number): number => {
  if (cost <= 0) {
    return 0;
  }

  return ((sellingPrice - cost) / cost) * 100;
};

/**
 * Round to specified decimal places (default 2 for currency)
 */
export const roundToDecimals = (value: number, decimals: number = 2): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

/**
 * Format currency value
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Parse currency string to number
 */
export const parseCurrency = (currencyString: string): number => {
  // Remove currency symbols and commas, then parse
  const cleaned = currencyString.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  
  if (isNaN(parsed)) {
    throw new Error('Invalid currency format');
  }
  
  return parsed;
};

/**
 * Calculate payment terms due date
 */
export const calculateDueDate = (
  invoiceDate: Date,
  paymentTermsDays: number
): Date => {
  const dueDate = new Date(invoiceDate);
  dueDate.setDate(dueDate.getDate() + paymentTermsDays);
  return dueDate;
};

/**
 * Check if invoice is overdue
 */
export const isOverdue = (dueDate: Date, currentDate: Date = new Date()): boolean => {
  return currentDate > dueDate;
};

/**
 * Calculate days overdue
 */
export const calculateDaysOverdue = (dueDate: Date, currentDate: Date = new Date()): number => {
  if (!isOverdue(dueDate, currentDate)) {
    return 0;
  }

  const timeDiff = currentDate.getTime() - dueDate.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

/**
 * Calculate late fee amount
 */
export const calculateLateFee = (
  invoiceAmount: number,
  lateFeeRate: number,
  daysOverdue: number
): number => {
  if (daysOverdue <= 0 || lateFeeRate <= 0) {
    return 0;
  }

  return invoiceAmount * (lateFeeRate / 100) * (daysOverdue / 30); // Monthly rate
};

/**
 * Validate calculation inputs
 */
export const validateCalculationInputs = (items: CalculationItem[]): string[] => {
  const errors: string[] = [];

  if (!Array.isArray(items) || items.length === 0) {
    errors.push('At least one item is required');
    return errors;
  }

  items.forEach((item, index) => {
    if (!item.description || item.description.trim() === '') {
      errors.push(`Item ${index + 1}: Description is required`);
    }

    if (item.quantity <= 0) {
      errors.push(`Item ${index + 1}: Quantity must be positive`);
    }

    if (item.unitPrice < 0) {
      errors.push(`Item ${index + 1}: Unit price must be non-negative`);
    }

    if (item.discountPct && (item.discountPct < 0 || item.discountPct > 100)) {
      errors.push(`Item ${index + 1}: Discount percentage must be between 0 and 100`);
    }

    if (!item.unit || item.unit.trim() === '') {
      errors.push(`Item ${index + 1}: Unit is required`);
    }
  });

  return errors;
};

/**
 * Calculate running totals for real-time updates
 */
export const calculateRunningTotals = (
  items: CalculationItem[],
  taxRate: number = 0
): {
  subtotal: number;
  taxAmount: number;
  total: number;
  itemCount: number;
} => {
  const subtotal = calculateSubtotal(items);
  const taxAmount = calculateTax(subtotal, taxRate);
  const total = calculateTotal(subtotal, taxAmount);

  return {
    subtotal: roundToDecimals(subtotal),
    taxAmount: roundToDecimals(taxAmount),
    total: roundToDecimals(total),
    itemCount: items.length,
  };
};

// Add missing exports that other modules are trying to import
export const isValidAmount = (amount: number): boolean => {
  return typeof amount === 'number' && !isNaN(amount) && isFinite(amount) && amount >= 0;
};

export const isValidPercentage = (percentage: number): boolean => {
  return typeof percentage === 'number' && !isNaN(percentage) && isFinite(percentage) && percentage >= 0 && percentage <= 100;
};

export const calculateBalanceDue = (total: number, payments: number[]): number => {
  const totalPayments = payments.reduce((sum, payment) => sum + payment, 0);
  return Math.max(0, total - totalPayments);
};
