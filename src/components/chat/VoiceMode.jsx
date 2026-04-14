/**
 * Voice Mode — Two states:
 * A) No product: orb centered (default)
 * B) Product showing: split view (product showcase left, orb right)
 *
 * Auto-listens after AI speaks. Pauses during checkout.
 * Non-product results (orders, addresses) show centered below orb.
 */
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useChatStore } from '../../stores/useChatStore'
import { sendChatMessage } from '../../services/chat/index'
import VoiceOrb from './VoiceOrb'
import VoiceProductShowcase from './VoiceProductShowcase'

// Result types that indicate checkout (pause auto-listen)
const CHECKOUT_TYPES = ['orderSummary', 'addressCard', 'paymentCard', 'confirmation']

export default function VoiceMode({ voice, onSend }) {
  const isTyping = useChatStore((s) => s.isTyping)
  const latestResults = useChatStore((s) => s.latestResults)
  const latestNonProductResults = useChatStore((s) => s.latestNonProductResults)
  const messages = useChatStore((s) => s.messages)
  const [activeIndex, setActiveIndex] = useState(0)
  const autoListenRef = useRef(true)
  const wasSpeakingRef = useRef(false)

  const { isListening, isSpeaking, interimTranscript, startListening, stopListening, stopSpeaking } = voice

  // Extract products from latestResults
  const products = []
  for (const r of latestResults) {
    if (r.type === 'productCards' && r.data?.products) products.push(...r.data.products)
    else if (r.type === 'productCard' && r.data?.product) products.push(r.data.product)
    else if (r.type === 'productDetail' && r.data?.product) products.push(r.data.product)
  }

  // Non-product results come from separate store field
  const nonProductResults = latestNonProductResults || []

  const hasCartUpdate = nonProductResults.some(r => r.type === 'cartUpdate')
  const hasProducts = products.length > 0 && !hasCartUpdate  // Collapse showcase after add-to-cart
  const activeProduct = products[activeIndex] || null
  const isCheckout = nonProductResults.some(r => CHECKOUT_TYPES.includes(r.type))

  // Reset active index when products change
  useEffect(() => {
    setActiveIndex(0)
  }, [latestResults])

  // Orb state
  let orbState = 'idle'
  if (isListening) orbState = 'listening'
  else if (isTyping) orbState = 'processing'
  else if (isSpeaking) orbState = 'speaking'

  // Auto-listen after AI finishes speaking (unless checkout)
  useEffect(() => {
    if (isSpeaking) wasSpeakingRef.current = true
    if (wasSpeakingRef.current && !isSpeaking && !isListening && !isTyping && autoListenRef.current && !isCheckout) {
      wasSpeakingRef.current = false
      const timer = setTimeout(() => {
        if (autoListenRef.current && !useChatStore.getState().isListening && !useChatStore.getState().isTyping) {
          doStartListening()
        }
      }, 1200)
      return () => clearTimeout(timer)
    }
  }, [isSpeaking, isListening, isTyping, isCheckout])

  const doStartListening = useCallback(() => {
    autoListenRef.current = true
    if (isSpeaking) stopSpeaking()
    startListening((transcript) => {
      useChatStore.getState().setVoiceTranscript(transcript)
      onSend(transcript)
    })
  }, [isSpeaking, startListening, stopSpeaking, onSend])

  const handleOrbClick = useCallback(() => {
    if (isListening) {
      stopListening()
      autoListenRef.current = false
    } else {
      doStartListening()
    }
  }, [isListening, stopListening, doStartListening])

  // When user navigates multi-product, speak about it directly (don't send chat message
  // which would overwrite latestResults and break the product list)
  function handleProductNavigate(newIndex) {
    setActiveIndex(newIndex)
    useChatStore.getState().setActiveShowcaseIndex(newIndex)
    const p = products[newIndex]
    if (p) {
      voice.stopSpeaking()
      setTimeout(() => {
        const desc = `Here's the ${p.name} at ${p.price} dollars. ${p.description}`
        voice.speakText(desc)
      }, 100)
    }
  }

  // Status text — minimal, only show when helpful
  let statusText = ''
  if (isListening) statusText = interimTranscript || ''
  else if (isTyping) statusText = ''
  else if (isSpeaking) statusText = 'Tap to interrupt'
  else if (messages.length > 0) statusText = isCheckout ? 'Tap to respond' : 'Tap to continue'
  else statusText = 'Tap to start'

  // ─── STATE B: Split view (product + orb) ───
  if (hasProducts) {
    return (
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Product showcase */}
        <div className="w-[55%] border-r border-stone-100 overflow-y-auto">
          <VoiceProductShowcase
            product={activeProduct}
            productList={products}
            activeIndex={activeIndex}
            onNavigate={handleProductNavigate}
          />
        </div>

        {/* Right: Voice panel */}
        <div className="w-[45%] flex flex-col items-center justify-center px-4 py-6 gap-5 overflow-y-auto">
          <button
            onClick={handleOrbClick}
            disabled={isTyping}
            className="focus:outline-none cursor-pointer transition-transform hover:scale-105 active:scale-95"
          >
            <VoiceOrb state={orbState} size="sm" />
          </button>

          <div className="text-center max-w-[200px]">
            {statusText && (
              <p className={`text-xs leading-relaxed ${
                isListening ? 'text-stone-500 italic' : 'text-stone-400'
              } ${isListening || isTyping ? 'animate-pulse' : ''}`}>
                {statusText}
              </p>
            )}
          </div>

          {/* Non-product results (order summary, address, etc.) */}
          {nonProductResults.length > 0 && (
            <div className="w-full space-y-2 mt-2">
              {nonProductResults.map((r, i) => (
                <NonProductCard key={i} result={r} />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ─── STATE A: Orb centered (no product) ───
  return (
    <div className="flex-1 flex flex-col items-center justify-between py-8 px-4 overflow-hidden">
      <div />

      <div className="flex flex-col items-center gap-6 max-w-full">
        <button
          onClick={handleOrbClick}
          disabled={isTyping}
          className="focus:outline-none cursor-pointer transition-transform hover:scale-105 active:scale-95"
        >
          <VoiceOrb state={orbState} size="lg" />
        </button>

        <div className="text-center max-w-md px-4 min-h-[40px]">
          {statusText && (
            <p className={`text-xs leading-relaxed ${
              isListening ? 'text-stone-500 italic' : 'text-stone-400'
            } ${isListening || isTyping ? 'animate-pulse' : ''}`}>
              {statusText}
            </p>
          )}
        </div>
      </div>

      {/* Non-product results centered below orb — more prominent */}
      <div className="w-full max-w-md px-4">
        {nonProductResults.length > 0 && (
          <div className="space-y-3 animate-slide-up">
            {nonProductResults.map((r, i) => (
              <NonProductCard key={i} result={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/** Full review card — same design as text chat */
function VoiceReviewCard({ data }) {
  const [showAll, setShowAll] = useState(false)
  const { product, reviews: reviewList, summary } = data
  const displayReviews = showAll ? reviewList : reviewList.slice(0, 3)
  const maxCount = Math.max(...Object.values(summary.distribution))

  return (
    <div className="bg-white rounded-lg border border-stone-200 overflow-hidden max-h-[300px] overflow-y-auto">
      {/* Header */}
      <div className="px-3 pt-3 pb-2 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <img src={product.image} alt="" className="w-8 h-8 rounded-md object-cover" />
          <div>
            <p className="text-xs font-medium text-stone-900">{product.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs font-bold text-stone-900">★ {summary.average}</span>
              <span className="text-[10px] text-stone-400">· {summary.count} reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rating distribution */}
      <div className="px-3 py-2 border-b border-stone-100">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = summary.distribution[star] || 0
          const pct = maxCount > 0 ? (count / maxCount) * 100 : 0
          return (
            <div key={star} className="flex items-center gap-2 mb-0.5">
              <span className="text-[9px] text-stone-400 w-6">{star} ★</span>
              <div className="flex-1 h-1 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-[9px] text-stone-400 w-3 text-right">{count}</span>
            </div>
          )
        })}
      </div>

      {/* Individual reviews */}
      <div className="divide-y divide-stone-50">
        {displayReviews.map((review, i) => (
          <div key={i} className="px-3 py-2">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, s) => (
                  <span key={s} className={`text-[9px] ${s < review.rating ? 'text-amber-400' : 'text-stone-200'}`}>★</span>
                ))}
              </div>
              <span className="text-[10px] font-medium text-stone-700">{review.name}</span>
              {review.verified && (
                <span className="text-[8px] text-success font-medium flex items-center gap-0.5">
                  <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Verified
                </span>
              )}
            </div>
            {review.title && <p className="text-[10px] font-semibold text-stone-800 mb-0.5">{review.title}</p>}
            <p className="text-[10px] text-stone-500 leading-relaxed">{review.text}</p>
          </div>
        ))}
      </div>

      {reviewList.length > 3 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-2 text-[10px] font-medium text-accent-500 hover:bg-stone-50 border-t border-stone-100"
        >
          Show all {reviewList.length} reviews
        </button>
      )}
    </div>
  )
}

/** Render non-product cards (checkout cards, order status, etc.) */
function NonProductCard({ result }) {
  const r = result

  if (r.type === 'orderSummary') {
    return (
      <div className="bg-white rounded-lg border border-stone-200 p-3 text-xs">
        <p className="font-semibold text-stone-400 uppercase tracking-wider mb-2">Order Summary</p>
        {r.data.items.map((item, i) => (
          <div key={i} className="flex justify-between mb-1">
            <span className="text-stone-600">{item.product.name} ×{item.quantity}</span>
            <span className="text-stone-900 font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="border-t border-stone-100 mt-2 pt-2 flex justify-between font-semibold text-stone-900">
          <span>Total</span><span>${r.data.total.toFixed(2)}</span>
        </div>
      </div>
    )
  }

  if (r.type === 'addressCard') {
    return (
      <div className="bg-white rounded-lg border border-stone-200 p-3 text-xs">
        <p className="font-semibold text-stone-400 uppercase tracking-wider mb-1">{r.data.address.label}</p>
        <p className="text-stone-900">{r.data.address.name}</p>
        <p className="text-stone-600">{r.data.address.line1}</p>
        <p className="text-stone-600">{r.data.address.city}, {r.data.address.state} {r.data.address.zip}</p>
      </div>
    )
  }

  if (r.type === 'paymentCard') {
    return (
      <div className="bg-white rounded-lg border border-stone-200 p-3 text-xs">
        <p className="font-semibold text-stone-400 uppercase tracking-wider mb-1">Payment</p>
        <p className="text-stone-900 capitalize">{r.data.payment.type} ····{r.data.payment.last4}</p>
      </div>
    )
  }

  if (r.type === 'confirmation') {
    return (
      <div className="bg-success/5 rounded-lg border border-success/20 p-4 text-center">
        <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-2">
          <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-stone-900">Order Confirmed!</p>
        <p className="text-xs text-stone-500">#{r.data.orderId}</p>
      </div>
    )
  }

  if (r.type === 'cartUpdate' && r.data?.product) {
    return (
      <div className="bg-success/5 rounded-xl border border-success/20 p-4">
        <div className="flex gap-3 items-center">
          <img src={r.data.product.image} alt="" className="w-14 h-14 rounded-lg object-cover" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-stone-900">{r.data.product.name}</p>
            <p className="text-xs text-stone-500">Size {r.data.size}{r.data.color ? ` · ${r.data.color}` : ''} · ${r.data.product.price}</p>
            <p className="text-xs text-success font-medium mt-1">✓ Added to cart</p>
          </div>
        </div>
      </div>
    )
  }

  if (r.type === 'reviewCard' && r.data) {
    return <VoiceReviewCard data={r.data} />
  }

  if (r.type === 'notifyRestock' && r.data?.product) {
    return (
      <div className="bg-info/5 rounded-lg border border-info/20 p-3 text-xs">
        <p className="text-stone-900 font-medium">{r.data.product.name}</p>
        <p className="text-info mt-1">We'll notify you when it's back in stock</p>
      </div>
    )
  }

  if (r.type === 'returnConfirmation' || r.type === 'exchangeConfirmation') {
    return (
      <div className="bg-white rounded-lg border border-stone-200 p-3 text-xs">
        <p className="text-stone-900 font-medium">
          {r.type === 'returnConfirmation' ? `Return #${r.data.returnId}` : `Exchange #${r.data.exchangeId}`}
        </p>
        <p className="text-stone-500 mt-1">{r.data.item?.name} — {r.type === 'returnConfirmation' ? `$${r.data.refundAmount?.toFixed(2)} refund` : `Size ${r.data.newSize}`}</p>
      </div>
    )
  }

  if (r.type === 'couponApplied' && r.data) {
    return (
      <div className="bg-success/5 rounded-lg border border-success/20 p-3 text-xs">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <span className="font-semibold text-success">Coupon Applied!</span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-stone-600">{r.data.code}</span>
          <span className="text-success font-semibold">-${r.data.discountAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between pt-1 border-t border-success/20">
          <span className="text-stone-900 font-medium">New Total</span>
          <span className="text-stone-900 font-semibold">${r.data.newTotal.toFixed(2)}</span>
        </div>
      </div>
    )
  }

  if (r.type === 'savedAddresses' && r.data?.addresses) {
    return (
      <div className="space-y-1.5">
        <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">Ship to:</p>
        {r.data.addresses.map((addr) => (
          <button
            key={addr.id}
            onClick={() => sendChatMessage(`Ship to my ${addr.label.toLowerCase()}`)}
            className="w-full text-left bg-white rounded-md border border-stone-200 p-2 hover:border-stone-400 transition-colors text-xs"
          >
            <p className="font-medium text-stone-900">{addr.label}</p>
            <p className="text-stone-500">{addr.line1}</p>
          </button>
        ))}
      </div>
    )
  }

  if (r.type === 'orderStatus' && r.data?.order) {
    const order = r.data.order
    return (
      <div className="bg-white rounded-lg border border-stone-200 p-3 text-xs max-h-[250px] overflow-y-auto">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-semibold text-stone-900">Order #{order.id}</p>
            <p className="text-stone-400">{order.items.map(i => i.name).join(', ')}</p>
          </div>
          <span className={`px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase ${
            order.status === 'delivered' ? 'bg-green-50 text-green-600' :
            order.status === 'in_transit' ? 'bg-blue-50 text-blue-600' :
            'bg-orange-50 text-orange-600'
          }`}>{order.status.replace('_', ' ')}</span>
        </div>
        <div className="space-y-1.5">
          {order.timeline.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full shrink-0 ${
                step.state === 'done' ? 'bg-green-500' :
                step.state === 'current' ? 'bg-accent-400 animate-pulse' :
                'bg-stone-200'
              }`} />
              <div className="flex justify-between flex-1">
                <span className={`${step.state === 'pending' ? 'text-stone-300' : 'text-stone-600'}`}>{step.label}</span>
                <span className="text-stone-400">{step.date}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-stone-900 font-semibold mt-2 pt-2 border-t border-stone-100">${order.total.toFixed(2)}</p>
      </div>
    )
  }

  if (r.type === 'allOrders' && r.data?.orders) {
    return (
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {r.data.orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg border border-stone-200 p-3 text-xs">
            <div className="flex justify-between items-start mb-1">
              <p className="font-semibold text-stone-900">#{order.id}</p>
              <span className={`px-1.5 py-0.5 rounded-sm text-[8px] font-bold uppercase ${
                order.status === 'delivered' ? 'bg-green-50 text-green-600' :
                order.status === 'in_transit' ? 'bg-blue-50 text-blue-600' :
                'bg-orange-50 text-orange-600'
              }`}>{order.status.replace('_', ' ')}</span>
            </div>
            <p className="text-stone-500 truncate">{order.items.map(i => i.name).join(', ')}</p>
            <p className="text-stone-900 font-medium mt-1">${order.total.toFixed(2)}</p>
          </div>
        ))}
      </div>
    )
  }

  if (r.type === 'wishlistUpdate') {
    return (
      <div className="bg-accent-50 rounded-lg border border-accent-200 p-3 text-xs text-accent-700">
        ♡ Added {r.data?.product?.name || 'item'} to wishlist
      </div>
    )
  }

  if (r.type === 'addressSaved') {
    return (
      <div className="bg-success/5 rounded-lg border border-success/20 p-3 text-xs">
        <p className="text-stone-900 font-medium">Address saved: {r.data.address.label}</p>
        <p className="text-stone-600">{r.data.address.line1}, {r.data.address.city}</p>
      </div>
    )
  }

  return null
}
