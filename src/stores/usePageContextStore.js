import { create } from 'zustand'

export const usePageContextStore = create((set) => ({
  currentPath: '/',
  currentPage: 'home',
  viewingProduct: null,
  viewingCategory: null,
  lastInteraction: null,

  setPage: (page, path) => set({ currentPage: page, currentPath: path }),
  setViewingProduct: (product) => set({ viewingProduct: product }),
  setViewingCategory: (category) => set({ viewingCategory: category }),
  clearViewingProduct: () => set({ viewingProduct: null }),
  recordInteraction: (type, data) => set({ lastInteraction: { type, data, timestamp: Date.now() } }),
}))
