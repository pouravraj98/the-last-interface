import { Link } from 'react-router-dom'
import { useOrderStore } from '../stores/useOrderStore'

export default function OrderHistoryPage() {
  const orders = useOrderStore((s) => s.orders)

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="font-serif text-4xl text-stone-900 mb-10">Order History</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-stone-400">No orders yet.</p>
          <Link to="/shop" className="text-accent-500 text-sm font-semibold mt-2 inline-block">Start shopping &rarr;</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/account/orders/${order.id}`}
              className="block bg-white rounded-lg border border-stone-200 p-5 hover:shadow-card-hover transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-stone-900">Order #{order.id}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{order.createdAt}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                  order.status === 'delivered' ? 'bg-green-50 text-success' :
                  order.status === 'in_transit' ? 'bg-blue-50 text-info' :
                  'bg-orange-50 text-warning'
                }`}>
                  {order.status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {order.items.slice(0, 3).map((item, i) => (
                    item.image && <img key={i} src={item.image} alt="" className="w-10 h-10 rounded-md object-cover border-2 border-white" />
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-stone-600 truncate">
                    {order.items.map((i) => i.name).join(', ')}
                  </p>
                </div>
                <p className="text-sm font-semibold text-stone-900">${order.total.toFixed(2)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
