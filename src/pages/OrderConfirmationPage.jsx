import { useParams, Link } from 'react-router-dom'
import { useOrderStore } from '../stores/useOrderStore'

export default function OrderConfirmationPage() {
  const { orderId } = useParams()
  const order = useOrderStore((s) => s.getOrder(orderId))

  return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center">
      <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </div>
      <h1 className="font-serif text-4xl text-stone-900 mb-3">Order Confirmed</h1>
      <p className="text-stone-500 mb-2">Order #{orderId}</p>

      {order && (
        <div className="mt-8 text-left bg-white rounded-lg border border-stone-200 p-6">
          <h3 className="text-sm font-semibold text-stone-900 mb-4">Items</h3>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                {item.image && <img src={item.image} alt="" className="w-12 h-12 rounded object-cover" />}
                <div className="flex-1">
                  <p className="text-sm text-stone-900">{item.name}</p>
                  <p className="text-xs text-stone-400">Size {item.size} × {item.quantity}</p>
                </div>
                <p className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 pt-4 border-t border-stone-100 font-semibold text-stone-900">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
          <p className="text-xs text-stone-400 mt-3">Estimated delivery: {order.estimatedDelivery}</p>
        </div>
      )}

      <div className="mt-8 flex gap-4 justify-center">
        <Link to="/account/orders" className="text-sm font-semibold text-stone-600 hover:text-stone-900 transition-colors">
          View Orders
        </Link>
        <Link to="/shop" className="text-sm font-semibold text-accent-500 hover:text-accent-400 transition-colors">
          Continue Shopping &rarr;
        </Link>
      </div>
    </div>
  )
}
