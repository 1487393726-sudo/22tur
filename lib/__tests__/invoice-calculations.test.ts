import {
  calculateLineSubtotal,
  calculateSubtotal,
  calculateTaxAmount,
  calculateTotalAmount,
  calculateInvoiceAmount,
  calculateInvoiceDetails,
  formatCurrency,
  validateInvoiceAmount,
  calculateDiscountAmount,
  calculatePayableAmount,
  calculateAmountBeforeTax,
  calculateInvoiceStats,
  InvoiceLineItem,
} from "../invoice-calculations"

describe("Invoice Calculations", () => {
  const sampleItems: InvoiceLineItem[] = [
    { description: "网站开发", quantity: 1, unitPrice: 10000 },
    { description: "UI设计", quantity: 2, unitPrice: 3000 },
    { description: "测试服务", quantity: 5, unitPrice: 500 },
  ]

  describe("calculateLineSubtotal", () => {
    it("should calculate line subtotal correctly", () => {
      expect(calculateLineSubtotal(2, 100)).toBe(200)
      expect(calculateLineSubtotal(1.5, 200)).toBe(300)
      expect(calculateLineSubtotal(3, 99.99)).toBe(299.97)
    })

    it("should handle decimal precision", () => {
      expect(calculateLineSubtotal(1, 10.555)).toBe(10.56)
    })
  })

  describe("calculateSubtotal", () => {
    it("should calculate total subtotal correctly", () => {
      const result = calculateSubtotal(sampleItems)
      // 10000 + 6000 + 2500 = 18500
      expect(result).toBe(18500)
    })

    it("should return 0 for empty items", () => {
      expect(calculateSubtotal([])).toBe(0)
    })
  })

  describe("calculateTaxAmount", () => {
    it("should calculate tax amount correctly", () => {
      expect(calculateTaxAmount(10000, 13)).toBe(1300)
      expect(calculateTaxAmount(18500, 13)).toBe(2405)
    })

    it("should handle 0% tax rate", () => {
      expect(calculateTaxAmount(10000, 0)).toBe(0)
    })

    it("should handle decimal tax rates", () => {
      expect(calculateTaxAmount(10000, 6.5)).toBe(650)
    })
  })

  describe("calculateTotalAmount", () => {
    it("should calculate total amount correctly", () => {
      expect(calculateTotalAmount(10000, 1300)).toBe(11300)
      expect(calculateTotalAmount(18500, 2405)).toBe(20905)
    })
  })

  describe("calculateInvoiceAmount", () => {
    it("should calculate complete invoice amount", () => {
      const result = calculateInvoiceAmount(sampleItems, 13)
      
      expect(result.subtotal).toBe(18500)
      expect(result.taxAmount).toBe(2405)
      expect(result.totalAmount).toBe(20905)
    })

    it("should work with different tax rates", () => {
      const result = calculateInvoiceAmount(sampleItems, 6)
      
      expect(result.subtotal).toBe(18500)
      expect(result.taxAmount).toBe(1110)
      expect(result.totalAmount).toBe(19610)
    })
  })

  describe("calculateInvoiceDetails", () => {
    it("should calculate detailed invoice information", () => {
      const result = calculateInvoiceDetails(sampleItems, 13)
      
      expect(result.items).toHaveLength(3)
      expect(result.items[0].subtotal).toBe(10000)
      expect(result.items[1].subtotal).toBe(6000)
      expect(result.items[2].subtotal).toBe(2500)
      expect(result.subtotal).toBe(18500)
      expect(result.taxAmount).toBe(2405)
      expect(result.totalAmount).toBe(20905)
      expect(result.taxRate).toBe(13)
    })
  })

  describe("formatCurrency", () => {
    it("should format currency with default symbol", () => {
      expect(formatCurrency(1000)).toBe("¥1000.00")
      expect(formatCurrency(1234.56)).toBe("¥1234.56")
    })

    it("should format currency with custom symbol", () => {
      expect(formatCurrency(1000, "$")).toBe("$1000.00")
      expect(formatCurrency(1234.56, "€")).toBe("€1234.56")
    })

    it("should handle decimal precision", () => {
      expect(formatCurrency(1234.567)).toBe("¥1234.57")
    })
  })

  describe("validateInvoiceAmount", () => {
    it("should validate correct invoice amount", () => {
      const result = validateInvoiceAmount(sampleItems, 13, 20905)
      expect(result).toBe(true)
    })

    it("should reject incorrect invoice amount", () => {
      const result = validateInvoiceAmount(sampleItems, 13, 20000)
      expect(result).toBe(false)
    })

    it("should allow small rounding errors", () => {
      const result = validateInvoiceAmount(sampleItems, 13, 20905.005)
      expect(result).toBe(true)
    })
  })

  describe("calculateDiscountAmount", () => {
    it("should calculate discount correctly", () => {
      expect(calculateDiscountAmount(1000, 10)).toBe(900)
      expect(calculateDiscountAmount(20905, 5)).toBe(19859.75)
    })

    it("should handle 0% discount", () => {
      expect(calculateDiscountAmount(1000, 0)).toBe(1000)
    })

    it("should handle 100% discount", () => {
      expect(calculateDiscountAmount(1000, 100)).toBe(0)
    })
  })

  describe("calculatePayableAmount", () => {
    it("should calculate payable amount without discount", () => {
      const result = calculatePayableAmount(sampleItems, 13)
      expect(result).toBe(20905)
    })

    it("should calculate payable amount with discount", () => {
      const result = calculatePayableAmount(sampleItems, 13, 10)
      expect(result).toBe(18814.5)
    })

    it("should ignore 0% discount", () => {
      const result = calculatePayableAmount(sampleItems, 13, 0)
      expect(result).toBe(20905)
    })
  })

  describe("calculateAmountBeforeTax", () => {
    it("should calculate amount before tax correctly", () => {
      expect(calculateAmountBeforeTax(11300, 13)).toBe(10000)
      expect(calculateAmountBeforeTax(20905, 13)).toBe(18500)
    })

    it("should handle 0% tax rate", () => {
      expect(calculateAmountBeforeTax(10000, 0)).toBe(10000)
    })
  })

  describe("calculateInvoiceStats", () => {
    it("should calculate invoice statistics", () => {
      const result = calculateInvoiceStats(sampleItems)
      
      expect(result.totalItems).toBe(3)
      expect(result.totalQuantity).toBe(8) // 1 + 2 + 5
      expect(result.averageUnitPrice).toBe(4500) // (10000 + 3000 + 500) / 3
    })

    it("should handle empty items", () => {
      const result = calculateInvoiceStats([])
      
      expect(result.totalItems).toBe(0)
      expect(result.totalQuantity).toBe(0)
      expect(result.averageUnitPrice).toBe(0)
    })
  })

  describe("Real-world scenarios", () => {
    it("should handle typical invoice calculation", () => {
      const items: InvoiceLineItem[] = [
        { description: "产品A", quantity: 10, unitPrice: 99.99 },
        { description: "产品B", quantity: 5, unitPrice: 199.99 },
        { description: "服务费", quantity: 1, unitPrice: 500 },
      ]

      const result = calculateInvoiceDetails(items, 13)
      
      expect(result.subtotal).toBe(2499.85)
      expect(result.taxAmount).toBe(324.98)
      expect(result.totalAmount).toBe(2824.83)
    })

    it("should handle invoice with discount", () => {
      const items: InvoiceLineItem[] = [
        { description: "咨询服务", quantity: 1, unitPrice: 5000 },
      ]

      const payable = calculatePayableAmount(items, 6, 15)
      
      // 5000 * 1.06 = 5300
      // 5300 * 0.85 = 4505
      expect(payable).toBe(4505)
    })
  })
})
