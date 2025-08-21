import Decimal from 'decimal.js-light'

// Configure Decimal.js for money calculations
Decimal.set({
  precision: 20,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -7,
  toExpPos: 21
})

export interface LineItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  taxable: boolean
  line_total: number
}

export interface Payment {
  id: string
  amount: number
  method: string
  received_at: string
}

export interface CalculationResult {
  subtotal: number
  tax_total: number
  discount_amount: number
  total: number
  balance_due: number
}

/**
 * Convert string to Decimal for safe math operations
 */
export const toDecimal = (value: string | number | Decimal): Decimal => {
  if (value instanceof Decimal) return value
  if (typeof value === 'string') {
    // Handle empty strings
    if (value.trim() === '') return new Decimal(0)
    return new Decimal(value)
  }
  return new Decimal(value)
}

/**
 * Convert Decimal back to string for database storage
 */
export const toString = (value: Decimal): string => {
  return value.toString()
}

/**
 * Calculate line total for a single item
 */
export const calculateLineTotal = (quantity: number, unitPrice: number): number => {
  const qty = toDecimal(quantity)
  const price = toDecimal(unitPrice)
  const total = qty.mul(price)
  return total.toNumber()
}

/**
 * Calculate subtotal from line items
 */
export const calculateSubtotal = (items: LineItem[]): number => {
  const subtotal = items.reduce((sum, item) => {
    const lineTotal = toDecimal(item.line_total)
    return sum.plus(lineTotal)
  }, new Decimal(0))
  
  return subtotal.toNumber()
}

/**
 * Calculate tax amount based on tax rate and taxable items
 */
export const calculateTax = (
  subtotal: number, 
  taxRate: number, 
  taxableItems: LineItem[]
): number => {
  const rate = toDecimal(taxRate).div(100) // Convert percentage to decimal
  const taxableSubtotal = taxableItems.reduce((sum, item) => {
    if (item.taxable) {
      return sum.plus(toDecimal(item.line_total))
    }
    return sum
  }, new Decimal(0))
  
  const taxAmount = taxableSubtotal.mul(rate)
  return taxAmount.toNumber()
}

/**
 * Calculate total with tax and discount
 */
export const calculateTotal = (
  subtotal: number, 
  taxTotal: number, 
  discount: number
): number => {
  const sub = toDecimal(subtotal)
  const tax = toDecimal(taxTotal)
  const disc = toDecimal(discount)
  
  const total = sub.plus(tax).minus(disc)
  return total.toNumber()
}

/**
 * Calculate balance due from total and payments
 */
export const calculateBalanceDue = (total: number, payments: Payment[]): number => {
  const totalAmount = toDecimal(total)
  const paymentsTotal = payments.reduce((sum, payment) => {
    return sum.plus(toDecimal(payment.amount))
  }, new Decimal(0))
  
  const balance = totalAmount.minus(paymentsTotal)
  return balance.toNumber()
}

/**
 * Calculate percentage discount
 */
export const calculatePercentageDiscount = (subtotal: number, discountPercent: number): number => {
  const sub = toDecimal(subtotal)
  const percent = toDecimal(discountPercent).div(100)
  const discount = sub.mul(percent)
  return discount.toNumber()
}

/**
 * Calculate discount amount from percentage
 */
export const calculateDiscountFromPercentage = (
  subtotal: number, 
  taxTotal: number, 
  discountPercent: number
): number => {
  const sub = toDecimal(subtotal)
  const tax = toDecimal(taxTotal)
  const percent = toDecimal(discountPercent).div(100)
  
  // Apply discount to subtotal + tax
  const totalBeforeDiscount = sub.plus(tax)
  const discount = totalBeforeDiscount.mul(percent)
  return discount.toNumber()
}

/**
 * Calculate tax rate from tax amount and taxable subtotal
 */
export const calculateTaxRate = (taxAmount: number, taxableSubtotal: number): number => {
  if (taxableSubtotal === 0) return 0
  
  const tax = toDecimal(taxAmount)
  const subtotal = toDecimal(taxableSubtotal)
  const rate = tax.div(subtotal).mul(100)
  return rate.toNumber()
}

/**
 * Calculate all totals for a quote or invoice
 */
export const calculateAllTotals = (
  items: LineItem[],
  taxRate: number,
  discountAmount: number,
  payments: Payment[] = []
): CalculationResult => {
  // Calculate subtotal
  const subtotal = calculateSubtotal(items)
  
  // Get taxable items
  const taxableItems = items.filter(item => item.taxable)
  
  // Calculate tax
  const taxTotal = calculateTax(subtotal, taxRate, taxableItems)
  
  // Calculate total
  const total = calculateTotal(subtotal, taxTotal, discountAmount)
  
  // Calculate balance due
  const balanceDue = calculateBalanceDue(total, payments)
  
  return {
    subtotal,
    tax_total: taxTotal,
    discount_amount: discountAmount,
    total,
    balance_due: balanceDue
  }
}

/**
 * Round to 2 decimal places for currency display
 */
export const roundToCurrency = (value: number): number => {
  return toDecimal(value).toDecimalPlaces(2).toNumber()
}

/**
 * Format currency for display
 */
export const formatCurrency = (
  amount: number, 
  currency: string = 'USD', 
  locale: string = 'en-US'
): string => {
  const rounded = roundToCurrency(amount)
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(rounded)
}

/**
 * Parse currency string to number
 */
export const parseCurrency = (currencyString: string): number => {
  // Remove currency symbols and commas
  const cleaned = currencyString.replace(/[^\d.-]/g, '')
  return toDecimal(cleaned).toNumber()
}

/**
 * Calculate profit margin
 */
export const calculateProfitMargin = (revenue: number, cost: number): number => {
  if (revenue === 0) return 0
  
  const rev = toDecimal(revenue)
  const cst = toDecimal(cost)
  const profit = rev.minus(cst)
  const margin = profit.div(rev).mul(100)
  return margin.toNumber()
}

/**
 * Calculate markup percentage
 */
export const calculateMarkup = (sellingPrice: number, costPrice: number): number => {
  if (costPrice === 0) return 0
  
  const selling = toDecimal(sellingPrice)
  const cost = toDecimal(costPrice)
  const markup = selling.minus(cost)
  const markupPercent = markup.div(cost).mul(100)
  return markupPercent.toNumber()
}

/**
 * Calculate compound interest
 */
export const calculateCompoundInterest = (
  principal: number,
  rate: number,
  time: number,
  compoundFrequency: number = 1
): number => {
  const p = toDecimal(principal)
  const r = toDecimal(rate).div(100)
  const t = toDecimal(time)
  const n = toDecimal(compoundFrequency)
  
  const amount = p.mul(
    toDecimal(1).plus(r.div(n)).pow(n.mul(t))
  )
  
  return amount.toNumber()
}

/**
 * Calculate simple interest
 */
export const calculateSimpleInterest = (
  principal: number,
  rate: number,
  time: number
): number => {
  const p = toDecimal(principal)
  const r = toDecimal(rate).div(100)
  const t = toDecimal(time)
  
  const interest = p.mul(r).mul(t)
  return interest.toNumber()
}

/**
 * Calculate payment amount for loan
 */
export const calculateLoanPayment = (
  principal: number,
  rate: number,
  term: number
): number => {
  const p = toDecimal(principal)
  const r = toDecimal(rate).div(100).div(12) // Monthly rate
  const n = toDecimal(term * 12) // Total payments
  
  if (r.equals(0)) {
    return p.div(n).toNumber()
  }
  
  const payment = p.mul(r).mul(toDecimal(1).plus(r).pow(n))
    .div(toDecimal(1).plus(r).pow(n).minus(1))
  
  return payment.toNumber()
}

/**
 * Validate monetary amount
 */
export const isValidAmount = (amount: number): boolean => {
  try {
    const dec = toDecimal(amount)
    return dec.gte(0)
  } catch {
    return false
  }
}

/**
 * Validate percentage
 */
export const isValidPercentage = (percentage: number): boolean => {
  try {
    const dec = toDecimal(percentage)
    return dec.gte(0) && dec.lte(100)
  } catch {
    return false
  }
}

/**
 * Compare two amounts with tolerance for floating point errors
 */
export const amountsEqual = (a: number, b: number, tolerance: number = 0.01): boolean => {
  const diff = toDecimal(a).minus(toDecimal(b)).abs()
  return diff.lte(toDecimal(tolerance))
}

/**
 * Calculate weighted average
 */
export const calculateWeightedAverage = (values: number[], weights: number[]): number => {
  if (values.length !== weights.length || values.length === 0) {
    throw new Error('Values and weights arrays must have the same length and be non-empty')
  }
  
  const totalWeight = weights.reduce((sum, weight) => sum.plus(toDecimal(weight)), new Decimal(0))
  const weightedSum = values.reduce((sum, value, index) => {
    return sum.plus(toDecimal(value).mul(toDecimal(weights[index])))
  }, new Decimal(0))
  
  return weightedSum.div(totalWeight).toNumber()
}

/**
 * Calculate tax inclusive price
 */
export const calculateTaxInclusivePrice = (price: number, taxRate: number): number => {
  const p = toDecimal(price)
  const rate = toDecimal(taxRate).div(100)
  const taxInclusive = p.mul(toDecimal(1).plus(rate))
  return taxInclusive.toNumber()
}

/**
 * Calculate tax exclusive price
 */
export const calculateTaxExclusivePrice = (taxInclusivePrice: number, taxRate: number): number => {
  const price = toDecimal(taxInclusivePrice)
  const rate = toDecimal(taxRate).div(100)
  const taxExclusive = price.div(toDecimal(1).plus(rate))
  return taxExclusive.toNumber()
}

/**
 * Calculate break-even point
 */
export const calculateBreakEvenPoint = (fixedCosts: number, unitPrice: number, unitCost: number): number => {
  if (unitPrice <= unitCost) {
    throw new Error('Unit price must be greater than unit cost')
  }
  
  const fixed = toDecimal(fixedCosts)
  const price = toDecimal(unitPrice)
  const cost = toDecimal(unitCost)
  const contribution = price.minus(cost)
  
  return fixed.div(contribution).toNumber()
}

/**
 * Calculate return on investment (ROI)
 */
export const calculateROI = (gain: number, cost: number): number => {
  if (cost === 0) return 0
  
  const g = toDecimal(gain)
  const c = toDecimal(cost)
  const roi = g.minus(c).div(c).mul(100)
  return roi.toNumber()
}
