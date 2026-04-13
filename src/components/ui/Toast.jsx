import { useState, useEffect, useCallback } from 'react'
import { create } from 'zustand'

// Global toast store
export const useToastStore = create((set) => ({
  toasts: [],
  add: (message, type = 'default') => {
    const id = Date.now() + Math.random()
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, 3000)
  },
}))

export function toast(message, type = 'default') {
  useToastStore.getState().add(message, type)
}

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg animate-slide-up pointer-events-auto ${
            t.type === 'success' ? 'bg-stone-900 text-white' :
            t.type === 'error' ? 'bg-red-500 text-white' :
            'bg-white text-stone-900 border border-stone-200'
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
