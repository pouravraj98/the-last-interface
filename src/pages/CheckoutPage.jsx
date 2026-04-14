import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../stores/useCartStore'
import { useUserStore } from '../stores/useUserStore'
import { useOrderStore } from '../stores/useOrderStore'

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const subtotal = useCartStore((s) => s.subtotal())
  const discount = useCartStore((s) => s.discount())
  const appliedCoupon = useCartStore((s) => s.appliedCoupon)
  const tax = useCartStore((s) => s.tax())
  const shipping = useCartStore((s) => s.shipping())
  const total = useCartStore((s) => s.total())
  const clearCart = useCartStore((s) => s.clearCart)
  const addresses = useUserStore((s) => s.addresses)
  const paymentMethods = useUserStore((s) => s.paymentMethods)
  const placeOrder = useOrderStore((s) => s.placeOrder)
  const navigate = useNavigate()

  const [selectedAddress, setSelectedAddress] = useState(addresses[0]?.id || '')
  const [processing, setProcessing] = useState(false)

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h1 className="font-serif text-4xl text-stone-900 mb-4">Nothing to check out</h1>
        <Link to="/shop" className="text-accent-500 text-sm font-semibold">Continue shopping &rarr;</Link>
      </div>
    )
  }

  async function handlePlaceOrder() {
    setProcessing(true)
    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 1500))
    const orderId = placeOrder(items, selectedAddress, paymentMethods[0]?.id)
    clearCart()
    navigate(`/order-confirmation/${orderId}`)
  }

  const pm = paymentMethods[0]

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="font-serif text-4xl text-stone-900 mb-10">Checkout</h1>

      <div className="grid md:grid-cols-5 gap-10">
        {/* Left: shipping + payment */}
        <div className="md:col-span-3 space-y-8">
          {/* Shipping */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-400 mb-4">Shipping Address</h2>
            <div className="space-y-3">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedAddress === addr.id ? 'border-stone-900 bg-stone-50' : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    value={addr.id}
                    checked={selectedAddress === addr.id}
                    onChange={() => setSelectedAddress(addr.id)}
                    className="mt-1 accent-stone-900"
                  />
                  <div>
                    <p className="text-sm font-medium text-stone-900">{addr.label}</p>
                    <p className="text-sm text-stone-600">{addr.line1}</p>
                    <p className="text-sm text-stone-600">{addr.city}, {addr.state} {addr.zip}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-400 mb-4">Payment Method</h2>
            {pm && (
              <div className="flex items-center gap-3 p-4 rounded-lg border border-stone-900 bg-stone-50">
                <div className="w-10 h-7 bg-stone-200 rounded flex items-center justify-center text-[10px] font-bold text-stone-500 uppercase">
                  {pm.type}
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-900 capitalize">{pm.type} ····{pm.last4}</p>
                  <p className="text-xs text-stone-400">Expires {pm.expiry}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: summary */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg border border-stone-200 p-6 sticky top-24">
            <h2 className="font-semibold text-stone-900 mb-4">Order Summary</h2>

            {/* Items */}
            <div className="space-y-3 mb-4">
              {items.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <img src={item.product.image} alt="" className="w-12 h-12 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-900 truncate">{item.product.name}</p>
                    <p className="text-xs text-stone-400">Size {item.size} × {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-stone-900">${(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-stone-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-stone-500">
                <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-success text-xs">
                  <span>Discount ({appliedCoupon?.code})</span><span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-500">
                <span>Tax</span><span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-stone-900 pt-2 border-t border-stone-100">
                <span>Total</span><span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={processing}
              className="w-full mt-6 bg-stone-900 text-white py-3.5 rounded-md text-sm font-semibold hover:bg-stone-800 transition-colors disabled:opacity-60"
            >
              {processing ? 'Processing...' : `Place Order — $${total.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
