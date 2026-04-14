/**
 * Brand Configuration
 * Change these to re-skin the demo for a different brand/vertical
 */
export const brand = {
  name: 'FORMA',
  tagline: 'Modern essentials, considered design.',
  description: 'Premium fashion & apparel. Clean lines, quality materials, timeless style.',
  currency: 'USD',
  currencySymbol: '$',
  taxRate: 0.0825,
  freeShippingThreshold: 75,

  shippingOptions: [
    { id: 'standard', name: 'Standard Shipping', price: 5.95, days: [5, 7], freeAbove: 75, description: '5-7 business days' },
    { id: 'express', name: 'Express Shipping', price: 9.95, days: [2, 3], freeAbove: null, description: '2-3 business days' },
    { id: 'nextday', name: 'Next Day Delivery', price: 14.95, days: [1, 1], freeAbove: null, description: 'Next business day, order by 2 PM', cutoff: '14:00' },
  ],

  coupons: [
    { code: 'FORMA10', type: 'percent', value: 0.10, label: '10% off', minOrder: 0 },
    { code: 'FORMA15', type: 'percent', value: 0.15, label: '15% off', minOrder: 100 },
    { code: 'WELCOME20', type: 'percent', value: 0.20, label: '20% off first order', minOrder: 0, firstOrderOnly: true },
  ],

  returnPolicy: {
    window: 30,
    freeReturns: true,
    freeExchanges: true,
    refundMethod: 'Original payment method',
    refundDays: '5-7 business days after item received',
  },
}

/** Get estimated delivery date range for a shipping option */
export function getDeliveryEstimate(shippingId = 'standard') {
  const option = brand.shippingOptions.find(o => o.id === shippingId)
  if (!option) return { from: '', to: '', label: '' }

  const now = new Date()
  const addBusinessDays = (date, days) => {
    const result = new Date(date)
    let added = 0
    while (added < days) {
      result.setDate(result.getDate() + 1)
      if (result.getDay() !== 0 && result.getDay() !== 6) added++
    }
    return result
  }

  const from = addBusinessDays(now, option.days[0])
  const to = addBusinessDays(now, option.days[1])

  const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return {
    from: fmt(from),
    to: fmt(to),
    label: from.getTime() === to.getTime() ? fmt(from) : `${fmt(from)} - ${fmt(to)}`,
    iso: to.toISOString().split('T')[0],
  }
}
