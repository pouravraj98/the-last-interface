import { Link } from 'react-router-dom'
import { useUserStore } from '../stores/useUserStore'
import { useOrderStore } from '../stores/useOrderStore'

export default function AccountPage() {
  const user = useUserStore((s) => s.user)
  const addresses = useUserStore((s) => s.addresses)
  const paymentMethods = useUserStore((s) => s.paymentMethods)
  const orders = useOrderStore((s) => s.orders)

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="font-serif text-4xl text-stone-900 mb-10">My Account</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile */}
        <div className="bg-white rounded-lg border border-stone-200 p-6 shadow-card">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-4">Profile</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-stone-900 flex items-center justify-center">
              <span className="text-white font-bold">
                {user.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <p className="font-semibold text-stone-900">{user.name}</p>
              <p className="text-sm text-stone-500">{user.email}</p>
            </div>
          </div>
          <div className="space-y-1.5 text-sm text-stone-600">
            <p>Shoe size: {user.shoeSize}</p>
            <p>Clothing: {user.clothingSize}</p>
            <p>Style: {user.stylePreference}</p>
          </div>
        </div>

        {/* Orders */}
        <Link to="/account/orders" className="bg-white rounded-lg border border-stone-200 p-6 shadow-card hover:shadow-card-hover transition-shadow">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-4">Orders</h2>
          <p className="text-3xl font-serif text-stone-900 mb-1">{orders.length}</p>
          <p className="text-sm text-stone-500">
            {orders.filter(o => o.status !== 'delivered').length} in progress
          </p>
          <p className="text-sm text-accent-500 font-semibold mt-3">View all &rarr;</p>
        </Link>

        {/* Addresses */}
        <div className="bg-white rounded-lg border border-stone-200 p-6 shadow-card">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-4">Saved Addresses</h2>
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div key={addr.id} className="text-sm">
                <p className="font-medium text-stone-900">{addr.label} {addr.isDefault && <span className="text-xs text-stone-400">(Default)</span>}</p>
                <p className="text-stone-600">{addr.line1}</p>
                <p className="text-stone-600">{addr.city}, {addr.state} {addr.zip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white rounded-lg border border-stone-200 p-6 shadow-card">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-4">Payment Methods</h2>
          {paymentMethods.map((pm) => (
            <div key={pm.id} className="flex items-center gap-3">
              <div className="w-12 h-8 bg-stone-100 rounded flex items-center justify-center text-[10px] font-bold text-stone-500 uppercase">
                {pm.type}
              </div>
              <div>
                <p className="text-sm font-medium text-stone-900 capitalize">{pm.type} ····{pm.last4}</p>
                <p className="text-xs text-stone-400">Expires {pm.expiry}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
