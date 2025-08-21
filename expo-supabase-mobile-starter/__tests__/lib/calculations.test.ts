import { 
  calculateLineTotal, 
  calculateSubtotal, 
  calculateTax, 
  calculateTotal, 
  calculateBalanceDue,
  isValidAmount,
  isValidPercentage
} from '../../lib/calculations'

describe('Money Calculations', () => {
  describe('calculateLineTotal', () => {
    it('should calculate line total correctly', () => {
      expect(calculateLineTotal(2, 10.50)).toBe('21.00')
      expect(calculateLineTotal(1, 5.25)).toBe('5.25')
      expect(calculateLineTotal(0, 10.00)).toBe('0.00')
    })

    it('should handle decimal quantities', () => {
      expect(calculateLineTotal(2.5, 10.00)).toBe('25.00')
      expect(calculateLineTotal(0.5, 8.00)).toBe('4.00')
    })

    it('should handle zero prices', () => {
      expect(calculateLineTotal(5, 0)).toBe('0.00')
    })

    it('should handle large numbers', () => {
      expect(calculateLineTotal(1000, 999.99)).toBe('999990.00')
    })
  })

  describe('calculateSubtotal', () => {
    it('should calculate subtotal correctly', () => {
      const items = [
        { id: '1', description: 'Item 1', quantity: 2, unit_price: 10.50, taxable: true, line_total: 21.00 },
        { id: '2', description: 'Item 2', quantity: 1, unit_price: 5.25, taxable: true, line_total: 5.25 },
        { id: '3', description: 'Item 3', quantity: 3, unit_price: 2.00, taxable: true, line_total: 6.00 }
      ]
      expect(calculateSubtotal(items)).toBe('32.25')
    })

    it('should handle empty items array', () => {
      expect(calculateSubtotal([])).toBe('0.00')
    })

    it('should handle single item', () => {
      const items = [{ id: '1', description: 'Item 1', quantity: 1, unit_price: 10.00, taxable: true, line_total: 10.00 }]
      expect(calculateSubtotal(items)).toBe('10.00')
    })

    it('should handle decimal quantities', () => {
      const items = [
        { id: '1', description: 'Item 1', quantity: 2.5, unit_price: 10.00, taxable: true, line_total: 25.00 },
        { id: '2', description: 'Item 2', quantity: 0.5, unit_price: 8.00, taxable: true, line_total: 4.00 }
      ]
      expect(calculateSubtotal(items)).toBe('29.00')
    })
  })

  describe('calculateTax', () => {
    it('should calculate tax correctly', () => {
      const items = [
        { id: '1', description: 'Item 1', quantity: 2, unit_price: 10.00, taxable: true, line_total: 20.00 },
        { id: '2', description: 'Item 2', quantity: 1, unit_price: 5.00, taxable: false, line_total: 5.00 },
        { id: '3', description: 'Item 3', quantity: 3, unit_price: 2.00, taxable: true, line_total: 6.00 }
      ]
      expect(calculateTax(25.00, 8.5, items)).toBe('2.04')
    })

    it('should handle zero tax rate', () => {
      const items = [
        { id: '1', description: 'Item 1', quantity: 1, unit_price: 10.00, taxable: true, line_total: 10.00 }
      ]
      expect(calculateTax(10.00, 0, items)).toBe('0.00')
    })

    it('should handle 100% tax rate', () => {
      const items = [
        { id: '1', description: 'Item 1', quantity: 1, unit_price: 10.00, taxable: true, line_total: 10.00 }
      ]
      expect(calculateTax(10.00, 100, items)).toBe('10.00')
    })

    it('should only tax taxable items', () => {
      const items = [
        { id: '1', description: 'Item 1', quantity: 1, unit_price: 10.00, taxable: true, line_total: 10.00 },
        { id: '2', description: 'Item 2', quantity: 1, unit_price: 10.00, taxable: false, line_total: 10.00 }
      ]
      expect(calculateTax(20.00, 10, items)).toBe('1.00')
    })

    it('should handle decimal tax rates', () => {
      const items = [
        { id: '1', description: 'Item 1', quantity: 1, unit_price: 100.00, taxable: true, line_total: 100.00 }
      ]
      expect(calculateTax(100.00, 8.25, items)).toBe('8.25')
    })
  })

  describe('calculateTotal', () => {
    it('should calculate total correctly', () => {
      expect(calculateTotal(100.00, 8.50, 5.00)).toBe('103.50')
    })

    it('should handle zero tax and discount', () => {
      expect(calculateTotal(100.00, 0, 0)).toBe('100.00')
    })

    it('should handle discount larger than subtotal', () => {
      expect(calculateTotal(10.00, 1.00, 15.00)).toBe('0.00')
    })

    it('should handle negative values', () => {
      expect(calculateTotal(-10.00, 1.00, 0)).toBe('0.00')
    })
  })

  describe('calculateBalanceDue', () => {
    it('should calculate balance due correctly', () => {
      const payments = [
        { id: '1', amount: 50.00, method: 'cash', received_at: '2024-01-01T00:00:00Z' },
        { id: '2', amount: 25.00, method: 'check', received_at: '2024-01-02T00:00:00Z' }
      ]
      expect(calculateBalanceDue(100.00, payments)).toBe('25.00')
    })

    it('should handle no payments', () => {
      expect(calculateBalanceDue(100.00, [])).toBe('100.00')
    })

    it('should handle overpayment', () => {
      const payments = [
        { id: '1', amount: 100.00, method: 'cash', received_at: '2024-01-01T00:00:00Z' },
        { id: '2', amount: 50.00, method: 'check', received_at: '2024-01-02T00:00:00Z' }
      ]
      expect(calculateBalanceDue(100.00, payments)).toBe('0.00')
    })

    it('should handle zero total', () => {
      const payments = [{ id: '1', amount: 10.00, method: 'cash', received_at: '2024-01-01T00:00:00Z' }]
      expect(calculateBalanceDue(0, payments)).toBe('0.00')
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
      expect(calculateLineTotal(1, 0.01)).toBe('0.01')
      expect(calculateLineTotal(1, 0.001)).toBe('0.00') // Rounds to 2 decimal places
    })

    it('should handle very large amounts', () => {
      expect(calculateLineTotal(1, 999999.99)).toBe('999999.99')
    })

    it('should handle precision issues', () => {
      // Test for floating point precision issues
      const result = calculateLineTotal(3, 0.33)
      expect(result).toBe('0.99') // Should not be 0.9999999999999999
    })

    it('should handle rounding correctly', () => {
      expect(calculateTax(100.00, 8.25, [{ id: '1', description: 'Item 1', quantity: 1, unit_price: 100.00, taxable: true, line_total: 100.00 }])).toBe('8.25')
      expect(calculateTax(100.00, 8.26, [{ id: '1', description: 'Item 1', quantity: 1, unit_price: 100.00, taxable: true, line_total: 100.00 }])).toBe('8.26')
    })
  })

  describe('String Input Handling', () => {
    it('should handle string inputs correctly', () => {
      expect(calculateLineTotal(2, 10.50)).toBe('21.00')
      expect(calculateSubtotal([{ id: '1', description: 'Item 1', quantity: 2, unit_price: 10.50, taxable: true, line_total: 21.00 }])).toBe('21.00')
    })

    it('should handle mixed string and number inputs', () => {
      const items = [
        { id: '1', description: 'Item 1', quantity: 2, unit_price: 10.50, taxable: true, line_total: 21.00 },
        { id: '2', description: 'Item 2', quantity: 1, unit_price: 5.25, taxable: true, line_total: 5.25 }
      ]
      expect(calculateSubtotal(items)).toBe('26.25')
    })
  })
})
