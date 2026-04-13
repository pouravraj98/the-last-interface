import { create } from 'zustand'

export const useWishlistStore = create((set, get) => ({
  items: [],
  addItem: (productId) => set((s) => ({
    items: s.items.includes(productId) ? s.items : [...s.items, productId],
  })),
  removeItem: (productId) => set((s) => ({
    items: s.items.filter((id) => id !== productId),
  })),
  toggleItem: (productId) => {
    const { items } = get()
    if (items.includes(productId)) {
      set({ items: items.filter((id) => id !== productId) })
    } else {
      set({ items: [...items, productId] })
    }
  },
  isWishlisted: (productId) => get().items.includes(productId),
}))
