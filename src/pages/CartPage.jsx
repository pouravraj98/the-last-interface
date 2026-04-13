import { Link } from 'react-router-dom'
import { useCartStore } from '../stores/useCartStore'

export default function CartPage() {
  const items = useCartStore((s) => s.items)
  const subtotal = useCartStore((s) => s.subtotal())
  const tax = useCartStore((s) => s.tax())
  const shipping = useCartStore((s) => s.shipping())
  const total = useCartStore((s) => s.total())
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h1 className="font-serif text-4xl text-stone-900 mb-4">Your cart is empty</h1>
        <p className="text-stone-500 mb-8">Looks like you haven't added anything yet.</p>
        <Link to="/shop" className="inline-block bg-stone-900 text-white px-8 py-3 text-sm font-semibold hover:bg-stone-800 transition-colors rounded-md">
          Shop Now
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="font-serif text-4xl text-stone-900 mb-10">Your Cart</h1>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={`${item.productId}-${item.size}`} className="flex gap-4 bg-white rounded-lg border border-stone-200 p-4">
              <Link to={`/product/${item.productId}`} className="w-24 h-24 bg-stone-100 rounded-md overflow-hidden shrink-0">
                <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <div>
                    <Link to={`/product/${item.productId}`} className="text-sm font-semibold text-stone-900 hover:text-accent-500 transition-colors">
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Size: {item.size}{item.color ? ` · ${item.color}` : ''}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-stone-900">${(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-stone-200 rounded-md">
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-900 transition-colors"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-900 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.size)}
                    className="text-xs text-stone-400 hover:text-red-500 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg border border-stone-200 p-6 h-fit sticky top-24">
          <h2 className="font-semibold text-stone-900 mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-stone-900 pt-3 border-t border-stone-200">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          {shipping > 0 && (
            <p className="text-xs text-stone-400 mt-3">
              Free shipping on orders over $75 — add ${(75 - subtotal).toFixed(2)} more
            </p>
          )}
          <Link
            to="/checkout"
            className="block w-full mt-6 bg-stone-900 text-white py-3 text-sm font-semibold text-center hover:bg-stone-800 transition-colors rounded-md"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  )
}
