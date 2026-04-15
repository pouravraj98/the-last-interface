import { useState } from 'react'
import { Link } from 'react-router-dom'
import { sendChatMessage } from '../../services/chat/index'
import { useChatStore } from '../../stores/useChatStore'
import { useUserStore } from '../../stores/useUserStore'

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 bg-stone-300 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
        />
      ))}
    </div>
  )
}

/** Clickable product card — sends "Tell me more" instead of navigating */
function ProductCard({ product }) {
  function handleClick() {
    sendChatMessage(`Tell me more about the ${product.name}`)
  }

  return (
    <button
      onClick={handleClick}
      className="flex gap-3 bg-white rounded-lg border border-stone-200 p-3 hover:shadow-card-hover transition-shadow w-full text-left cursor-pointer"
    >
      <img src={product.image} alt={product.name} className="w-16 h-16 rounded-md object-cover shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-900 truncate">{product.name}</p>
        <p className="text-xs text-stone-400">★ {product.rating} · {product.reviewCount} reviews</p>
        <p className="text-sm font-semibold text-stone-900 mt-1">${product.price}</p>
      </div>
      <svg className="w-4 h-4 text-stone-300 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
      </svg>
    </button>
  )
}

/** Get the user's preferred size for a product category */
function getPreferredSize(product) {
  const user = useUserStore.getState().user
  const cat = product.category
  const sub = product.subcategory

  if (cat === 'footwear') return user.shoeSize
  if (cat === 'tops' || cat === 'outerwear' || cat === 'dresses') return user.clothingSize
  if (cat === 'bottoms') {
    // Chinos/jeans use waist size, joggers/shorts use clothing size
    if (sub === 'chinos' || sub === 'jeans') return user.bottomSize
    return user.clothingSize
  }
  return null
}

/** Rich interactive detail card — image carousel + size picker + add to cart inside chat */
function ProductDetailCard({ product }) {
  const preferred = getPreferredSize(product)
  const preferredAvail = preferred && product.sizes.includes(preferred) && (product.sizeStock ? product.sizeStock[preferred] !== false : true)
  const defaultSize = preferredAvail ? preferred : null
  const [selectedSize, setSelectedSize] = useState(defaultSize)
  const [added, setAdded] = useState(false)
  const [notified, setNotified] = useState(false)
  const [currentImg, setCurrentImg] = useState(0)
  const close = useChatStore((s) => s.close)
  const outOfStock = !product.inStock

  const images = product.images?.length > 0 ? product.images : [product.image]

  function handleAddToCart() {
    if (!selectedSize || outOfStock) return
    sendChatMessage(`Add the ${product.name} in size ${selectedSize} to my cart`)
    setAdded(true)
  }

  function handleNotify() {
    sendChatMessage(`Notify me when the ${product.name} is back in stock`)
    setNotified(true)
  }

  return (
    <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
      {/* Image carousel */}
      <div className="relative">
        <img src={images[currentImg]} alt={product.name} className="w-full h-52 object-cover" />

        {/* Arrow nav (only if multiple images) */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentImg((currentImg - 1 + images.length) % images.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-stone-600 hover:bg-white transition-colors shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentImg((currentImg + 1) % images.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-stone-600 hover:bg-white transition-colors shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </>
        )}

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentImg(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === currentImg ? 'bg-white w-4' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <span className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
            {currentImg + 1}/{images.length}
          </span>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-1.5 px-3 py-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrentImg(i)}
              className={`w-12 h-12 rounded-md overflow-hidden shrink-0 border-2 transition-all ${
                i === currentImg ? 'border-stone-900' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <p className="font-medium text-stone-900">{product.name}</p>
          <p className="text-sm font-bold text-stone-900">${product.price}</p>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <p className="text-xs text-stone-400">★ {product.rating} · {product.reviewCount} reviews</p>
          <button
            onClick={() => sendChatMessage(`Show me reviews for the ${product.name}`)}
            className="text-[10px] font-medium text-accent-500 hover:text-accent-400 transition-colors"
          >
            See reviews →
          </button>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed mb-4">{product.description}</p>

        {/* Features */}
        {product.features && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {product.features.slice(0, 3).map((f, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 bg-stone-50 text-stone-500 rounded-full">{f}</span>
            ))}
          </div>
        )}

        {outOfStock ? (
          /* Out of stock — notify me */
          <div>
            <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-orange-50 rounded-md">
              <span className="w-2 h-2 bg-orange-400 rounded-full" />
              <span className="text-xs font-medium text-orange-700">Currently out of stock</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleNotify}
                disabled={notified}
                className={`flex-1 py-2.5 rounded-md text-xs font-semibold transition-all ${
                  notified
                    ? 'bg-info/10 text-info'
                    : 'bg-stone-900 text-white hover:bg-stone-800'
                }`}
              >
                {notified ? '✓ We\'ll notify you' : 'Notify Me When Available'}
              </button>
              <Link
                to={`/product/${product.id}`}
                onClick={close}
                className="px-3 py-2.5 rounded-md text-xs font-medium border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors shrink-0"
              >
                View on site
              </Link>
            </div>
          </div>
        ) : (
          /* In stock — size selector + add to cart */
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Select Size</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {product.sizes.map((size) => {
                const sizeAvail = product.sizeStock ? product.sizeStock[size] !== false : true
                return (
                  <button
                    key={size}
                    onClick={() => sizeAvail ? setSelectedSize(size) : null}
                    className={`min-w-[36px] h-8 px-2 rounded-md border text-xs font-medium transition-all ${
                      !sizeAvail
                        ? 'border-stone-100 text-stone-300 line-through cursor-not-allowed'
                        : selectedSize === size
                        ? 'border-stone-900 bg-stone-900 text-white'
                        : 'border-stone-200 text-stone-600 hover:border-stone-400'
                    }`}
                    title={!sizeAvail ? `Size ${size} out of stock` : ''}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
            {product.sizeStock && Object.values(product.sizeStock).some(v => !v) && (
              <button
                onClick={() => {
                  const oosSize = product.sizes.find(s => product.sizeStock?.[s] === false)
                  sendChatMessage(`Notify me when the ${product.name} in size ${oosSize} is back in stock`)
                }}
                className="text-[10px] text-accent-500 font-medium mb-3 hover:text-accent-400 transition-colors"
              >
                Your size unavailable? Get notified →
              </button>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize || added}
                className={`flex-1 py-2.5 rounded-md text-xs font-semibold transition-all ${
                  added
                    ? 'bg-success text-white'
                    : selectedSize
                    ? 'bg-stone-900 text-white hover:bg-stone-800'
                    : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                }`}
              >
                {added ? '✓ Added to Cart' : selectedSize ? `Add Size ${selectedSize} to Cart` : 'Select a size'}
              </button>
              <Link
                to={`/product/${product.id}`}
                onClick={close}
                className="px-3 py-2.5 rounded-md text-xs font-medium border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors shrink-0"
              >
                View on site
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function OrderSummaryCard({ data }) {
  return (
    <div className="bg-white rounded-lg border border-stone-200 p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">Order Summary</h4>
      <div className="space-y-3 mb-3">
        {data.items.map((item, i) => (
          <div key={i} className="flex gap-3 items-center">
            <img src={item.product.image} alt={item.product.name} className="w-12 h-12 rounded-md object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-900 truncate">{item.product.name}</p>
              <p className="text-xs text-stone-400">Size {item.size}{item.color ? ` · ${item.color}` : ''} · ×{item.quantity}</p>
            </div>
            <p className="text-sm font-semibold text-stone-900 shrink-0">${(item.product.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-stone-100 pt-3 space-y-1 text-sm">
        <div className="flex justify-between text-stone-500"><span>Subtotal</span><span>${data.subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between text-stone-500"><span>{data.shippingMethod || 'Shipping'}</span><span>{data.shipping === 0 ? 'Free' : `$${data.shipping.toFixed(2)}`}</span></div>
        {data.shippingDescription && <div className="flex justify-between text-stone-400 text-[10px]"><span>Delivery</span><span>{data.shippingDescription}</span></div>}
        {data.discount > 0 && <div className="flex justify-between text-success"><span>Discount ({data.couponCode})</span><span>-${data.discount.toFixed(2)}</span></div>}
        <div className="flex justify-between text-stone-500"><span>Tax</span><span>${data.tax.toFixed(2)}</span></div>
        <div className="flex justify-between font-semibold text-stone-900 pt-2 border-t border-stone-100"><span>Total</span><span>${data.total.toFixed(2)}</span></div>
      </div>
    </div>
  )
}

function AddressCard({ address }) {
  return (
    <div className="bg-white rounded-lg border border-stone-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
        </svg>
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">{address.label}</span>
      </div>
      <p className="text-sm text-stone-900 font-medium">{address.name}</p>
      <p className="text-sm text-stone-600">{address.line1}</p>
      <p className="text-sm text-stone-600">{address.city}, {address.state} {address.zip}</p>
    </div>
  )
}

function PaymentCard({ payment }) {
  return (
    <div className="bg-white rounded-lg border border-stone-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
        </svg>
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Payment</span>
      </div>
      <p className="text-sm text-stone-900 font-medium capitalize">{payment.type} ····{payment.last4}</p>
      <p className="text-sm text-stone-500">Expires {payment.expiry}</p>
    </div>
  )
}

function ConfirmationCard({ data }) {
  return (
    <div className="bg-success/5 rounded-lg border border-success/20 p-4">
      <div className="text-center mb-4">
        <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-2">
          <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-stone-900">Order Confirmed!</p>
        <p className="text-xs text-stone-500">Order #{data.orderId}</p>
      </div>
      {data.items && data.items.length > 0 && (
        <div className="space-y-2 mb-3">
          {data.items.map((item, i) => (
            <div key={i} className="flex gap-2 items-center">
              {item.image && <img src={item.image} alt="" className="w-10 h-10 rounded object-cover" />}
              <div>
                <p className="text-xs font-medium text-stone-900">{item.name}</p>
                <p className="text-[10px] text-stone-400">Size {item.size}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="border-t border-success/20 pt-3 space-y-1.5 text-xs">
        {data.couponCode && (
          <div className="flex justify-between text-success">
            <span>Discount ({data.couponCode})</span>
            <span>-${data.discount?.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-stone-900 font-semibold">
          <span>Total</span>
          <span>${data.total?.toFixed(2)}</span>
        </div>
        {data.shippingMethod && (
          <div className="flex justify-between text-stone-500">
            <span>Shipping</span>
            <span>{data.shippingMethod}</span>
          </div>
        )}
        {data.estimatedDelivery && (
          <div className="flex justify-between text-stone-500">
            <span>Delivery</span>
            <span>{data.estimatedDelivery}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function OrderStatusCard({ order }) {
  return (
    <div className="bg-white rounded-lg border border-stone-200 p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-sm font-semibold text-stone-900">Order #{order.id}</p>
          <p className="text-xs text-stone-400">{order.items.map(i => i.name).join(', ')}</p>
        </div>
        <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase ${
          order.status === 'delivered' ? 'bg-success/10 text-success' :
          order.status === 'in_transit' ? 'bg-info/10 text-info' :
          'bg-warning/10 text-warning'
        }`}>{order.status.replace('_', ' ')}</span>
      </div>
      <div className="space-y-2">
        {order.timeline.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              step.state === 'done' ? 'bg-success' :
              step.state === 'current' ? 'bg-accent-400 animate-pulse' :
              'bg-stone-200'
            }`} />
            <div className="flex justify-between flex-1">
              <span className={`text-xs ${step.state === 'pending' ? 'text-stone-300' : 'text-stone-600'}`}>{step.label}</span>
              <span className="text-xs text-stone-400">{step.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AllOrdersCard({ orders }) {
  return (
    <div className="space-y-2">
      {orders.map((order) => (
        <OrderStatusCard key={order.id} order={order} />
      ))}
    </div>
  )
}

function ReviewCard({ data }) {
  const [showAll, setShowAll] = useState(false)
  const { product, reviews: reviewList, summary } = data
  const displayReviews = showAll ? reviewList : reviewList.slice(0, 3)
  const maxCount = Math.max(...Object.values(summary.distribution))

  return (
    <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <img src={product.image} alt="" className="w-10 h-10 rounded-md object-cover" />
          <div>
            <p className="text-sm font-medium text-stone-900">{product.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-sm font-bold text-stone-900">★ {summary.average}</span>
              <span className="text-xs text-stone-400">· {summary.count} reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rating distribution */}
      <div className="px-4 py-3 border-b border-stone-100">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = summary.distribution[star] || 0
          const pct = maxCount > 0 ? (count / maxCount) * 100 : 0
          return (
            <div key={star} className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] text-stone-400 w-8">{star} ★</span>
              <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-[10px] text-stone-400 w-4 text-right">{count}</span>
            </div>
          )
        })}
      </div>

      {/* Individual reviews */}
      <div className="divide-y divide-stone-50">
        {displayReviews.map((review, i) => (
          <div key={i} className="px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, s) => (
                  <span key={s} className={`text-[10px] ${s < review.rating ? 'text-amber-400' : 'text-stone-200'}`}>★</span>
                ))}
              </div>
              <span className="text-xs font-medium text-stone-700">{review.name}</span>
              {review.verified && (
                <span className="text-[9px] text-success font-medium flex items-center gap-0.5">
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Verified
                </span>
              )}
              <span className="text-[10px] text-stone-300 ml-auto">{review.date}</span>
            </div>
            <p className="text-xs font-semibold text-stone-800 mb-0.5">{review.title}</p>
            <p className="text-xs text-stone-500 leading-relaxed">{review.text}</p>
          </div>
        ))}
      </div>

      {/* Show all toggle */}
      {reviewList.length > 3 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-2.5 text-xs font-medium text-accent-500 hover:bg-stone-50 transition-colors border-t border-stone-100"
        >
          Show all {reviewList.length} reviews
        </button>
      )}
    </div>
  )
}

function CartUpdateCard({ data }) {
  if (data.action === 'added' && data.product) {
    return (
      <div className="rounded-lg border border-success/20 bg-success/5 p-3">
        <div className="flex gap-3 items-center">
          <img src={data.product.image} alt={data.product.name} className="w-12 h-12 rounded-md object-cover shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-stone-900 truncate">{data.product.name}</p>
            <p className="text-xs text-stone-400">Size {data.size}{data.color ? ` · ${data.color}` : ''}</p>
          </div>
          <div className="shrink-0 w-5 h-5 bg-success/20 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
        </div>
        <p className="text-xs text-success mt-2 font-medium">Added to cart</p>
        {/* Quick action buttons */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => sendChatMessage('Suggest something to go with what I just added')}
            className="flex-1 text-[10px] px-2 py-1.5 rounded-md border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
          >
            Complete the look
          </button>
          <button
            onClick={() => sendChatMessage("Let's check out")}
            className="flex-1 text-[10px] px-2 py-1.5 rounded-md bg-stone-900 text-white hover:bg-stone-800 transition-colors"
          >
            Check out
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
      <div className="flex gap-3 items-center">
        {data.product?.image && <img src={data.product.image} alt="" className="w-10 h-10 rounded-md object-cover shrink-0 opacity-50" />}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-stone-500 line-through">{data.product?.name || 'Item'}</p>
          {data.size && <p className="text-xs text-stone-400">Size {data.size}</p>}
        </div>
        <span className="text-xs text-stone-400">Removed</span>
      </div>
    </div>
  )
}

export default function ChatBubble({ message }) {
  const msg = message

  switch (msg.type) {
    case 'typing':
      return (
        <div className="flex justify-start">
          <div className="bg-stone-100 rounded-2xl rounded-bl-sm">
            <TypingDots />
          </div>
        </div>
      )

    case 'ai':
      return (
        <div className="flex justify-start animate-fade-in">
          <div className="max-w-[85%] bg-stone-100 rounded-2xl rounded-bl-sm px-4 py-2.5">
            <p className="text-sm text-stone-800 leading-relaxed whitespace-pre-wrap">{msg.text}</p>
          </div>
        </div>
      )

    case 'user':
      return (
        <div className="flex justify-end animate-fade-in">
          <div className="max-w-[85%]">
            {msg.image && (
              <div className="mb-1 flex justify-end">
                <img src={msg.image} alt="Uploaded" className="max-w-[200px] max-h-[200px] rounded-xl object-cover" />
              </div>
            )}
            <div className="bg-stone-900 rounded-2xl rounded-br-sm px-4 py-2.5">
              <p className="text-sm text-white leading-relaxed">{msg.text}</p>
            </div>
          </div>
        </div>
      )

    case 'productCard':
      return <div className="animate-fade-in"><ProductCard product={msg.data.product} /></div>

    case 'productCards':
      return (
        <div className="space-y-2 animate-fade-in">
          {msg.data.products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )

    case 'productDetail':
      return <div className="animate-fade-in"><ProductDetailCard product={msg.data.product} /></div>

    case 'orderSummary':
      return <div className="animate-fade-in"><OrderSummaryCard data={msg.data} /></div>

    case 'addressCard':
      return <div className="animate-fade-in"><AddressCard address={msg.data.address} /></div>

    case 'paymentCard':
      return <div className="animate-fade-in"><PaymentCard payment={msg.data.payment} /></div>

    case 'confirmation':
      return <div className="animate-fade-in"><ConfirmationCard data={msg.data} /></div>

    case 'orderStatus':
      return <div className="animate-fade-in"><OrderStatusCard order={msg.data.order} /></div>

    case 'allOrders':
      return <div className="animate-fade-in"><AllOrdersCard orders={msg.data.orders} /></div>

    case 'cartUpdate':
      return <div className="animate-fade-in"><CartUpdateCard data={msg.data} /></div>

    case 'reviewCard':
      return <div className="animate-fade-in"><ReviewCard data={msg.data} /></div>

    case 'returnConfirmation':
      return (
        <div className="animate-fade-in">
          <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
            <div className="bg-stone-50 px-4 py-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                </svg>
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Return Initiated</span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex gap-3 items-center mb-3">
                {msg.data.item.image && <img src={msg.data.item.image} alt="" className="w-12 h-12 rounded-md object-cover" />}
                <div className="flex-1">
                  <p className="text-sm font-medium text-stone-900">{msg.data.item.name}</p>
                  <p className="text-xs text-stone-400">Size {msg.data.item.size} · from Order #{msg.data.orderId}</p>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-stone-500">Return ID</span><span className="text-stone-900 font-medium">{msg.data.returnId}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Reason</span><span className="text-stone-900">{msg.data.reason}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Refund</span><span className="text-stone-900 font-semibold">${msg.data.refundAmount.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Refund to</span><span className="text-stone-900">{msg.data.refundMethod}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Timeline</span><span className="text-stone-900">{msg.data.estimatedRefund}</span></div>
              </div>
              <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-2 bg-accent-50 rounded-md px-3 py-2 -mx-1">
                <svg className="w-4 h-4 text-accent-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                <p className="text-[11px] text-accent-700">Return label sent to {useUserStore.getState().user.email}</p>
              </div>
            </div>
          </div>
        </div>
      )

    case 'exchangeConfirmation':
      return (
        <div className="animate-fade-in">
          <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
            <div className="bg-stone-50 px-4 py-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
                </svg>
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Exchange Initiated</span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex gap-3 items-center mb-3">
                {msg.data.item.image && <img src={msg.data.item.image} alt="" className="w-12 h-12 rounded-md object-cover" />}
                <div className="flex-1">
                  <p className="text-sm font-medium text-stone-900">{msg.data.item.name}</p>
                  <p className="text-xs text-stone-400">Order #{msg.data.orderId}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 text-center bg-stone-50 rounded-md py-2">
                  <p className="text-[10px] text-stone-400 uppercase">Current</p>
                  <p className="text-sm font-medium text-stone-600">Size {msg.data.item.size}</p>
                </div>
                <svg className="w-4 h-4 text-stone-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
                <div className="flex-1 text-center bg-info/5 rounded-md py-2">
                  <p className="text-[10px] text-info uppercase">New</p>
                  <p className="text-sm font-semibold text-info">Size {msg.data.newSize}</p>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-stone-500">Exchange ID</span><span className="text-stone-900 font-medium">{msg.data.exchangeId}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">No extra charge</span><span className="text-success font-medium">Free exchange</span></div>
                <div className="flex justify-between"><span className="text-stone-500">New delivery</span><span className="text-stone-900">{msg.data.estimatedDelivery}</span></div>
              </div>
              <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-2 bg-info/5 rounded-md px-3 py-2 -mx-1">
                <svg className="w-4 h-4 text-info shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                <p className="text-[11px] text-info">Return label + exchange confirmation sent to {useUserStore.getState().user.email}</p>
              </div>
            </div>
          </div>
        </div>
      )

    case 'notifyRestock':
      return (
        <div className="animate-fade-in">
          <div className="bg-white rounded-lg border border-stone-200 p-4">
            <div className="flex gap-3 items-center mb-3">
              <img src={msg.data.product.image} alt="" className="w-12 h-12 rounded-md object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-900 truncate">{msg.data.product.name}</p>
                <p className="text-xs text-stone-400">${msg.data.product.price} · Currently out of stock</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-info/5 rounded-md px-3 py-2">
              <svg className="w-4 h-4 text-info shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
              <p className="text-xs text-info font-medium">We'll notify you at {useUserStore.getState().user.email} when it's back</p>
            </div>
          </div>
        </div>
      )

    case 'shippingUpdated':
      return (
        <div className="animate-fade-in rounded-lg border border-info/20 bg-info/5 p-3 text-sm">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0H6.375c-.621 0-1.125-.504-1.125-1.125V14.25m0 0h11.25m0 0V11.625m0 2.625H5.25m11.25 0V4.875c0-.621-.504-1.125-1.125-1.125H5.25" /></svg>
            <span className="text-info font-medium">{msg.data.method}</span>
            <span className="text-stone-500">— {msg.data.cost === 0 ? 'Free' : `$${msg.data.cost.toFixed(2)}`}</span>
          </div>
          {msg.data.description && <p className="text-xs text-stone-400 mt-1 ml-6">{msg.data.description}</p>}
        </div>
      )

    case 'couponApplied':
      return (
        <div className="animate-fade-in">
          <div className="bg-success/5 rounded-lg border border-success/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <span className="text-sm font-semibold text-success">Coupon Applied!</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-600">Code</span>
                <span className="font-mono font-semibold text-stone-900">{msg.data.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Discount</span>
                <span className="text-success font-semibold">{msg.data.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">You save</span>
                <span className="text-success font-semibold">-${msg.data.discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-success/20">
                <span className="font-semibold text-stone-900">New Total</span>
                <span className="font-semibold text-stone-900">${msg.data.newTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )

    case 'savedAddresses':
      return (
        <div className="animate-fade-in space-y-2">
          <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Saved Addresses</p>
          {msg.data.addresses.map((addr) => (
            <button
              key={addr.id}
              onClick={() => sendChatMessage(`Ship to my ${addr.label.toLowerCase()}`)}
              className="w-full text-left bg-white rounded-lg border border-stone-200 p-3 hover:border-stone-400 transition-colors"
            >
              <p className="text-xs font-medium text-stone-900">{addr.label} {addr.isDefault ? '(Default)' : ''}</p>
              <p className="text-xs text-stone-500">{addr.line1}, {addr.city}, {addr.state} {addr.zip}</p>
            </button>
          ))}
          <button
            onClick={() => sendChatMessage('I want to ship to a different address')}
            className="w-full text-left text-xs text-accent-500 font-medium hover:text-accent-400 py-1"
          >
            + Use a different address
          </button>
        </div>
      )

    case 'addressSaved':
      return (
        <div className="animate-fade-in">
          <div className="bg-white rounded-lg border border-stone-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 bg-success/10 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Address Saved</span>
            </div>
            <p className="text-sm font-medium text-stone-900">{msg.data.address.label}</p>
            <p className="text-sm text-stone-600">{msg.data.address.name}</p>
            <p className="text-sm text-stone-600">{msg.data.address.line1}</p>
            <p className="text-sm text-stone-600">{msg.data.address.city}, {msg.data.address.state} {msg.data.address.zip}</p>
          </div>
        </div>
      )

    case 'wishlistUpdate':
      return (
        <div className="animate-fade-in rounded-lg border bg-accent-50 border-accent-200 p-3 text-sm text-accent-700">
          ♡ Added {msg.data.product?.name || 'item'} to wishlist
        </div>
      )

    case 'navigation':
      return (
        <div className="animate-fade-in text-xs text-stone-400 text-center py-1">
          Navigating to {msg.data.path}...
        </div>
      )

    default:
      return null
  }
}
