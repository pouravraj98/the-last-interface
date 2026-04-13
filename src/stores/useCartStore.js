import { create } from 'zustand'

export const useCartStore = create((set, get) => ({
  items: [],

  // Computed (called as functions since Zustand doesn't auto-compute)
  itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
  subtotal: () => get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  tax: () => get().subtotal() * 0.0825,
  shipping: () => get().subtotal() >= 75 ? 0 : 5.95,
  total: () => get().subtotal() + get().tax() + get().shipping(),

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

  clearCart: () => set({ items: [] }),
}))
