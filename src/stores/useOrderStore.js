import { create } from 'zustand'
import { brand, getDeliveryEstimate } from '../config/brand'

const DJ = 'https://cdn.dummyjson.com/product-images'

export const useOrderStore = create((set, get) => ({
  orders: [
    {
      id: 'FM-4821',
      items: [{ name: 'Off-White Sport Sneaker', size: '10', color: 'Off-White/Red', price: 55, quantity: 1, image: `${DJ}/mens-shoes/sports-sneakers-off-white-&-red/thumbnail.webp` }],
      status: 'delivered',
      shippingMethod: 'standard',
      shippingCost: 0,
      subtotal: 55,
      tax: 4.54,
      total: 59.54,
      createdAt: '2026-03-15',
      deliveredAt: '2026-03-20',
      estimatedDelivery: '2026-03-21',
      trackingNumber: '1Z999AA10123456784',
      shippingAddress: { label: 'Home', line1: '456 Oak Ave, Apt 2B', city: 'Austin', state: 'TX', zip: '78701' },
      timeline: [
        { label: 'Order placed', date: 'Mar 15', state: 'done' },
        { label: 'Shipped', date: 'Mar 17', state: 'done' },
        { label: 'In transit', date: 'Mar 19', state: 'done' },
        { label: 'Delivered', date: 'Mar 20', state: 'done' },
      ],
    },
    {
      id: 'FM-5102',
      items: [
        { name: 'Graphic Crew Tee', size: 'M', color: 'Black', price: 28, quantity: 2, image: `${DJ}/mens-shirts/gigabyte-aorus-men-tshirt/thumbnail.webp` },
        { name: 'Slim Chino', size: '32', color: 'Khaki', price: 68, quantity: 1, image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=200&q=80' },
      ],
      status: 'in_transit',
      shippingMethod: 'express',
      shippingCost: 9.95,
      subtotal: 124,
      tax: 10.23,
      total: 144.18,
      createdAt: '2026-03-28',
      deliveredAt: null,
      estimatedDelivery: '2026-04-14',
      trackingNumber: '1Z999AA10123456785',
      shippingAddress: { label: 'Office', line1: '200 Congress Ave, Suite 400', city: 'Austin', state: 'TX', zip: '78701' },
      timeline: [
        { label: 'Order placed', date: 'Mar 28', state: 'done' },
        { label: 'Shipped', date: 'Mar 30', state: 'done' },
        { label: 'In transit', date: 'Apr 5', state: 'current' },
        { label: 'Delivery', date: 'Apr 14 (est)', state: 'pending' },
      ],
    },
    {
      id: 'FM-5387',
      items: [{ name: 'Performance Jogger', size: 'M', color: 'Black', price: 48, quantity: 1, image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=200&q=80' }],
      status: 'processing',
      shippingMethod: 'nextday',
      shippingCost: 14.95,
      subtotal: 48,
      tax: 3.96,
      total: 66.91,
      createdAt: '2026-04-08',
      deliveredAt: null,
      estimatedDelivery: '2026-04-09',
      trackingNumber: null,
      shippingAddress: { label: 'Home', line1: '456 Oak Ave, Apt 2B', city: 'Austin', state: 'TX', zip: '78701' },
      timeline: [
        { label: 'Order placed', date: 'Apr 8', state: 'done' },
        { label: 'Processing', date: 'Apr 9', state: 'current' },
        { label: 'Shipping', date: 'Pending', state: 'pending' },
        { label: 'Delivery', date: 'Apr 9 (est)', state: 'pending' },
      ],
    },
  ],

  placeOrder: (cartItems, addressId, paymentId, shippingMethod = 'standard', coupon = null) => {
    const orderId = `FM-${Math.floor(Math.random() * 9000) + 1000}`
    const subtotal = cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
    const discount = coupon ? Math.round(subtotal * coupon.value * 100) / 100 : 0
    const shippingOption = brand.shippingOptions.find(o => o.id === shippingMethod) || brand.shippingOptions[0]
    const shippingCost = (shippingOption.freeAbove && (subtotal - discount) >= shippingOption.freeAbove) ? 0 : shippingOption.price
    const tax = (subtotal - discount) * brand.taxRate
    const total = Math.round((subtotal - discount + tax + shippingCost) * 100) / 100
    const delivery = getDeliveryEstimate(shippingMethod)

    const newOrder = {
      id: orderId,
      items: cartItems.map((i) => ({
        name: i.product.name,
        size: i.size,
        color: i.color,
        price: i.product.price,
        quantity: i.quantity,
        image: i.product.image,
      })),
      status: 'processing',
      shippingMethod,
      shippingCost,
      subtotal,
      discount,
      couponCode: coupon?.code || null,
      tax: Math.round(tax * 100) / 100,
      total,
      createdAt: new Date().toISOString().split('T')[0],
      deliveredAt: null,
      estimatedDelivery: delivery.label,
      trackingNumber: null,
      shippingAddress: null,
      timeline: [
        { label: 'Order placed', date: 'Just now', state: 'done' },
        { label: 'Processing', date: 'In progress', state: 'current' },
        { label: 'Shipping', date: 'Pending', state: 'pending' },
        { label: 'Delivery', date: delivery.label, state: 'pending' },
      ],
    }
    set((s) => ({ orders: [newOrder, ...s.orders] }))
    return orderId
  },

  getOrder: (orderId) => get().orders.find((o) => o.id === orderId),
}))
