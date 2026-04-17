import { create } from 'zustand'

export const useChatStore = create((set, get) => ({
  isOpen: false,
  compactBar: true,
  messages: [],
  conversationHistory: [],
  isTyping: false,
  voiceEnabled: true,
  voiceMode: true,
  isListening: false,
  isSpeaking: false,
  highlightedProductId: null,
  navigateTo: null,
  latestResults: [],
  latestNonProductResults: [],
  activeShowcaseIndex: 0,
  voiceTranscript: '',
  hasGreeted: false,
  // Checkout tracking (context-driven, not rigid)
  couponOffered: false,
  addressSelected: null,
  shippingExplicitlySet: false,

  open: () => set({ isOpen: true }),
  toggleBarStyle: () => set((s) => ({ compactBar: !s.compactBar })),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),

  addMessage: (msg) => set((s) => ({
    messages: [...s.messages, { ...msg, id: Date.now() + Math.random(), timestamp: Date.now() }],
  })),

  removeLastTyping: () => set((s) => ({
    messages: s.messages.filter((m, i) => !(m.type === 'typing' && i === s.messages.length - 1)),
  })),

  setTyping: (val) => set({ isTyping: val }),
  setVoiceEnabled: (val) => set({ voiceEnabled: val }),
  setVoiceMode: (val) => set({ voiceMode: val, voiceEnabled: val }),
  setListening: (val) => set({ isListening: val }),
  setSpeaking: (val) => set({ isSpeaking: val }),
  setVoiceTranscript: (val) => set({ voiceTranscript: val }),
  setLatestResults: (results) => set({ latestResults: results, activeShowcaseIndex: 0 }),
  setLatestNonProductResults: (results) => set({ latestNonProductResults: results }),
  clearLatestResults: () => set({ latestResults: [], latestNonProductResults: [], activeShowcaseIndex: 0 }),
  setActiveShowcaseIndex: (idx) => set({ activeShowcaseIndex: idx }),
  setHasGreeted: (val) => set({ hasGreeted: val }),
  setCouponOffered: (val) => set({ couponOffered: val }),
  setAddressSelected: (val) => set({ addressSelected: val }),
  setShippingExplicitlySet: (val) => set({ shippingExplicitlySet: val }),

  highlightProduct: (productId) => {
    set({ highlightedProductId: productId })
    setTimeout(() => set({ highlightedProductId: null }), 4000)
  },

  setNavigateTo: (path) => set({ navigateTo: path }),
  clearNavigateTo: () => set({ navigateTo: null }),

  pushToHistory: (entry) => set((s) => ({
    conversationHistory: [...s.conversationHistory, entry],
  })),

  resetConversation: () => set({
    messages: [],
    conversationHistory: [],
    isTyping: false,
    latestResults: [],
    latestNonProductResults: [],
    activeShowcaseIndex: 0,
    voiceTranscript: '',
    highlightedProductId: null,
    navigateTo: null,
    hasGreeted: false,
    couponOffered: false,
    addressSelected: null,
    shippingExplicitlySet: false,
    isListening: false,
    isSpeaking: false,
  }),
}))
