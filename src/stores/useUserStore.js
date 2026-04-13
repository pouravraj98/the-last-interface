import { create } from 'zustand'

export const useUserStore = create((set, get) => ({
  user: {
    id: 'usr_001',
    name: 'Alex Johnson',
    email: 'alex@email.com',
    shoeSize: '10',
    clothingSize: 'M',
    bottomSize: '32',
    gender: 'male',
    preferredColors: ['Black', 'White', 'Navy'],
    stylePreference: 'Clean, minimal, versatile',
  },
  addresses: [
    { id: 'addr_home', label: 'Home', name: 'Alex Johnson', line1: '456 Oak Ave, Apt 2B', city: 'Austin', state: 'TX', zip: '78701', isDefault: true },
    { id: 'addr_office', label: 'Office', name: 'Alex Johnson', line1: '200 Congress Ave, Suite 400', city: 'Austin', state: 'TX', zip: '78701', isDefault: false },
  ],
  paymentMethods: [
    { id: 'pm_1', type: 'visa', last4: '4242', expiry: '09/28', isDefault: true },
  ],
  notifyList: [],
  addNotify: (productId) => set((s) => ({
    notifyList: s.notifyList.includes(productId) ? s.notifyList : [...s.notifyList, productId],
  })),
  updateProfile: (fields) => set((s) => ({ user: { ...s.user, ...fields } })),
  addAddress: (address) => set((s) => ({
    addresses: [...s.addresses, { ...address, id: `addr_${Date.now()}`, isDefault: false }],
  })),
  removeAddress: (id) => set((s) => ({
    addresses: s.addresses.filter((a) => a.id !== id),
  })),
  setDefaultAddress: (id) => set((s) => ({
    addresses: s.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
  })),
}))
