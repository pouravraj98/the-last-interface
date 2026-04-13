import { create } from 'zustand'

const DJ = 'https://cdn.dummyjson.com/product-images'

export const useOrderStore = create((set, get) => ({
  orders: [
    {
      id: 'FM-4821',
      items: [{ name: 'Off-White Sport Sneaker', size: '10', color: 'Off-White/Red', price: 55, quantity: 1, image: `${DJ}/mens-shoes/sports-sneakers-off-white-&-red/thumbnail.webp` }],
      status: 'delivered',
      total: 59.49,
      createdAt: '2026-03-15',
      deliveredAt: '2026-03-20',
      estimatedDelivery: '2026-03-21',
      trackingNumber: '1Z999AA10123456784',
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
      total: 131.23,
      createdAt: '2026-03-28',
      deliveredAt: null,
      estimatedDelivery: '2026-04-14',
      trackingNumber: '1Z999AA10123456785',
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
      total: 53.91,
      createdAt: '2026-04-08',
      deliveredAt: null,
      estimatedDelivery: '2026-04-18',
      trackingNumber: null,
      timeline: [
        { label: 'Order placed', date: 'Apr 8', state: 'done' },
        { label: 'Processing', date: 'Apr 9', state: 'current' },
        { label: 'Shipping', date: 'Pending', state: 'pending' },
        { label: 'Delivery', date: 'Apr 18 (est)', state: 'pending' },
      ],
    },
  ],

  placeOrder: (cartItems, addressId, paymentId) => {
    const orderId = `FM-${Math.floor(Math.random() * 9000) + 1000}`
    const total = cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0) * 1.0825
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
      total: Math.round(total * 100) / 100,
      createdAt: new Date().toISOString().split('T')[0],
      deliveredAt: null,
      estimatedDelivery: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      trackingNumber: null,
      timeline: [
        { label: 'Order placed', date: 'Just now', state: 'done' },
        { label: 'Processing', date: 'In progress', state: 'current' },
        { label: 'Shipping', date: 'Pending', state: 'pending' },
        { label: 'Delivery', date: 'Estimated', state: 'pending' },
      ],
    }
    set((s) => ({ orders: [newOrder, ...s.orders] }))
    return orderId
  },

  getOrder: (orderId) => get().orders.find((o) => o.id === orderId),
}))
