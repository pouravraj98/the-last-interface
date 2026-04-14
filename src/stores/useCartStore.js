import { create } from 'zustand'
import { brand } from '../config/brand'

export const useCartStore = create((set, get) => ({
  items: [],
  selectedShipping: 'standard',

  // Computed
  itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
  subtotal: () => get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  tax: () => get().subtotal() * brand.taxRate,
  shipping: () => {
    const option = brand.shippingOptions.find(o => o.id === get().selectedShipping)
    if (!option) return 5.95
    // Free standard shipping above threshold
    if (option.freeAbove && get().subtotal() >= option.freeAbove) return 0
    return option.price
  },
  total: () => get().subtotal() + get().tax() + get().shipping(),
  shippingOption: () => brand.shippingOptions.find(o => o.id === get().selectedShipping) || brand.shippingOptions[0],

  // Actions
  setShipping: (id) => set({ selectedShipping: id }),

  addItem: (product, size, color = null, quantity = 1) => set((state) => {
    const existing = state.items.find(
      (i) => i.productId === product.id && i.size === size && i.color === color
    )
    if (existing) {
      return {
        items: state.items.map((i) =>
          i.productId === product.id && i.size === size && i.color === color
            ? { ...i, quantity: i.quantity + quantity }
            : i
        ),
      }
    }
    return {
      items: [...state.items, { productId: product.id, product, size, color, quantity }],
    }
  }),

  removeItem: (productId, size) => set((state) => ({
    items: state.items.filter((i) => !(i.productId === productId && i.size === size)),
  })),

  updateQuantity: (productId, size, quantity) => set((state) => ({
    items: quantity <= 0
      ? state.items.filter((i) => !(i.productId === productId && i.size === size))
      : state.items.map((i) =>
          i.productId === productId && i.size === size ? { ...i, quantity } : i
        ),
  })),

  clearCart: () => set({ items: [], selectedShipping: 'standard' }),
}))
