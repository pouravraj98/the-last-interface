import { useParams, Link } from 'react-router-dom'
import { useOrderStore } from '../stores/useOrderStore'

export default function OrderDetailPage() {
  const { orderId } = useParams()
  const order = useOrderStore((s) => s.getOrder(orderId))

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h1 className="font-serif text-4xl text-stone-900 mb-4">Order not found</h1>
        <Link to="/account/orders" className="text-accent-500 text-sm font-semibold">View all orders &rarr;</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link to="/account/orders" className="text-sm text-stone-400 hover:text-stone-600 mb-6 inline-block">&larr; All Orders</Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-serif text-4xl text-stone-900">Order #{order.id}</h1>
          <p className="text-stone-400 mt-1">Placed {order.createdAt}</p>
        </div>
        <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
          order.status === 'delivered' ? 'bg-green-50 text-success' :
          order.status === 'in_transit' ? 'bg-blue-50 text-info' :
          'bg-orange-50 text-warning'
        }`}>
          {order.status.replace('_', ' ')}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Timeline */}
        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-400 mb-5">Tracking</h2>
          <div className="space-y-5">
            {order.timeline.map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${
                    step.state === 'done' ? 'bg-success' :
                    step.state === 'current' ? 'bg-accent-400 animate-pulse' :
                    'bg-stone-200'
                  }`} />
                  {i < order.timeline.length - 1 && (
                    <div className={`w-0.5 h-8 mt-1 ${
                      step.state === 'done' ? 'bg-success/30' : 'bg-stone-100'
                    }`} />
                  )}
                </div>
                <div className="-mt-0.5">
                  <p className={`text-sm font-medium ${step.state === 'pending' ? 'text-stone-300' : 'text-stone-900'}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">{step.date}</p>
                </div>
              </div>
            ))}
          </div>
          {order.trackingNumber && (
            <p className="text-xs text-stone-400 mt-6 pt-4 border-t border-stone-100">
              Tracking: {order.trackingNumber}
            </p>
          )}
        </div>

        {/* Items + total */}
        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-400 mb-5">Items</h2>
          <div className="space-y-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                {item.image && <img src={item.image} alt="" className="w-14 h-14 rounded-md object-cover" />}
                <div className="flex-1">
                  <p className="text-sm font-medium text-stone-900">{item.name}</p>
                  <p className="text-xs text-stone-400">Size {item.size} · {item.color} · ×{item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-stone-900">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-5 pt-4 border-t border-stone-100 font-semibold text-stone-900">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
          {order.estimatedDelivery && (
            <p className="text-xs text-stone-400 mt-3">
              {order.status === 'delivered' ? `Delivered ${order.deliveredAt}` : `Estimated delivery: ${order.estimatedDelivery}`}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
