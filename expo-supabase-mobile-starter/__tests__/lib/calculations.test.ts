import { 
  calculateLineTotal, 
  calculateSubtotal, 
  calculateTax, 
  calculateTotal, 
  calculateBalanceDue,
  isValidAmount,
  isValidPercentage,
  type CalculationItem
} from '../../lib/calculations'

describe('Money Calculations', () => {
  describe('calculateLineTotal', () => {
    it('should calculate line total correctly', () => {
      const item1: CalculationItem = { description: 'Item 1', quantity: 2, unit: 'each', unitPrice: 10.50 };
      const item2: CalculationItem = { description: 'Item 2', quantity: 1, unit: 'each', unitPrice: 5.25 };
      const item3: CalculationItem = { description: 'Item 3', quantity: 0, unit: 'each', unitPrice: 10.00 };
      
      expect(calculateLineTotal(item1)).toBe(21.00)
      expect(calculateLineTotal(item2)).toBe(5.25)
      expect(calculateLineTotal(item3)).toBe(0)
    })

    it('should handle decimal quantities', () => {
      const item1: CalculationItem = { description: 'Item 1', quantity: 2.5, unit: 'each', unitPrice: 10.00 };
      const item2: CalculationItem = { description: 'Item 2', quantity: 0.5, unit: 'each', unitPrice: 8.00 };
      
      expect(calculateLineTotal(item1)).toBe(25.00)
      expect(calculateLineTotal(item2)).toBe(4.00)
    })

    it('should handle zero prices', () => {
      const item: CalculationItem = { description: 'Item 1', quantity: 5, unit: 'each', unitPrice: 0 };
      expect(calculateLineTotal(item)).toBe(0)
    })

    it('should handle large numbers', () => {
      const item: CalculationItem = { description: 'Item 1', quantity: 1000, unit: 'each', unitPrice: 999.99 };
      expect(calculateLineTotal(item)).toBe(999990.00)
    })
  })

  describe('calculateSubtotal', () => {
    it('should calculate subtotal correctly', () => {
      const items: CalculationItem[] = [
        { description: 'Item 1', quantity: 2, unit: 'each', unitPrice: 10.50 },
        { description: 'Item 2', quantity: 1, unit: 'each', unitPrice: 5.25 },
        { description: 'Item 3', quantity: 3, unit: 'each', unitPrice: 2.00 }
      ]
      expect(calculateSubtotal(items)).toBe(32.25)
    })

    it('should handle empty items array', () => {
      expect(calculateSubtotal([])).toBe(0)
    })

    it('should handle single item', () => {
      const items: CalculationItem[] = [{ description: 'Item 1', quantity: 1, unit: 'each', unitPrice: 10.00 }]
      expect(calculateSubtotal(items)).toBe(10.00)
    })

    it('should handle decimal quantities', () => {
      const items: CalculationItem[] = [
        { description: 'Item 1', quantity: 2.5, unit: 'each', unitPrice: 10.00 },
        { description: 'Item 2', quantity: 0.5, unit: 'each', unitPrice: 8.00 }
      ]
      expect(calculateSubtotal(items)).toBe(29.00)
    })
  })

  describe('calculateTax', () => {
    it('should calculate tax correctly', () => {
      expect(calculateTax(25.00, 0.085)).toBe(2.125)
    })

    it('should handle zero tax rate', () => {
      expect(calculateTax(10.00, 0)).toBe(0)
    })

    it('should handle 100% tax rate', () => {
      expect(calculateTax(10.00, 1.0)).toBe(10.00)
    })

    it('should handle decimal tax rates', () => {
      expect(calculateTax(100.00, 0.0825)).toBe(8.25)
    })
  })

  describe('calculateTotal', () => {
    it('should calculate total correctly', () => {
      expect(calculateTotal(100.00, 8.50)).toBe(108.50)
    })

    it('should handle zero tax', () => {
      expect(calculateTotal(100.00, 0)).toBe(100.00)
    })

    it('should handle negative tax', () => {
      expect(calculateTotal(100.00, -5.00)).toBe(95.00)
    })
  })

  describe('calculateBalanceDue', () => {
    it('should calculate balance due correctly', () => {
      const payments = [50.00, 25.00]
      expect(calculateBalanceDue(100.00, payments)).toBe(25.00)
    })

    it('should handle no payments', () => {
      expect(calculateBalanceDue(100.00, [])).toBe(100.00)
    })

    it('should handle overpayment', () => {
      const payments = [100.00, 50.00]
      expect(calculateBalanceDue(100.00, payments)).toBe(0)
    })

    it('should handle zero total', () => {
      const payments = [10.00]
      expect(calculateBalanceDue(0, payments)).toBe(0)
    })
  })

  describe('isValidAmount', () => {
    it('should validate positive amounts', () => {
      expect(isValidAmount(10.50)).toBe(true)
      expect(isValidAmount(0)).toBe(true)
      expect(isValidAmount(999999.99)).toBe(true)
    })

    it('should reject negative amounts', () => {
      expect(isValidAmount(-10.50)).toBe(false)
      expect(isValidAmount(-0.01)).toBe(false)
    })

    it('should reject invalid numbers', () => {
      expect(isValidAmount(NaN)).toBe(false)
      expect(isValidAmount(Infinity)).toBe(false)
      expect(isValidAmount(-Infinity)).toBe(false)
    })
  })

  describe('isValidPercentage', () => {
    it('should validate valid percentages', () => {
      expect(isValidPercentage(0)).toBe(true)
      expect(isValidPercentage(50)).toBe(true)
      expect(isValidPercentage(100)).toBe(true)
      expect(isValidPercentage(8.25)).toBe(true)
    })

    it('should reject negative percentages', () => {
      expect(isValidPercentage(-1)).toBe(false)
      expect(isValidPercentage(-50)).toBe(false)
    })

    it('should reject percentages over 100', () => {
      expect(isValidPercentage(101)).toBe(false)
      expect(isValidPercentage(200)).toBe(false)
    })

    it('should reject invalid numbers', () => {
      expect(isValidPercentage(NaN)).toBe(false)
      expect(isValidPercentage(Infinity)).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle very small amounts', () => {
      const item1: CalculationItem = { description: 'Item 1', quantity: 1, unit: 'each', unitPrice: 0.01 };
      const item2: CalculationItem = { description: 'Item 2', quantity: 1, unit: 'each', unitPrice: 0.001 };
      
      expect(calculateLineTotal(item1)).toBe(0.01)
      expect(calculateLineTotal(item2)).toBe(0.001)
    })

    it('should handle very large amounts', () => {
      const item: CalculationItem = { description: 'Item 1', quantity: 1, unit: 'each', unitPrice: 999999.99 };
      expect(calculateLineTotal(item)).toBe(999999.99)
    })

    it('should handle precision issues', () => {
      const item: CalculationItem = { description: 'Item 1', quantity: 3, unit: 'each', unitPrice: 0.33 };
      const result = calculateLineTotal(item)
      expect(result).toBe(0.99)
    })

    it('should handle rounding correctly', () => {
      expect(calculateTax(100.00, 0.0825)).toBe(8.25)
      expect(calculateTax(100.00, 0.0826)).toBe(8.26)
    })
  })
})
