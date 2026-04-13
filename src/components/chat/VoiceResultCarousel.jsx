/**
 * Voice Result Carousel — Horizontal scrollable cards for voice mode
 * Shows product cards with interactive size picker + add to cart
 * Also handles non-product results (order summary, address, etc.)
 */
import { useState } from 'react'
import { useChatStore } from '../../stores/useChatStore'
import { useUserStore } from '../../stores/useUserStore'
import { sendChatMessage } from '../../services/chat/index'

function getPreferredSize(product) {
  const user = useUserStore.getState().user
  if (product.category === 'footwear') return user.shoeSize
  if (product.category === 'tops' || product.category === 'outerwear' || product.category === 'dresses') return user.clothingSize
  if (product.subcategory === 'chinos' || product.subcategory === 'jeans') return user.bottomSize
  return user.clothingSize
}

function VoiceProductCard({ product }) {
  const preferred = getPreferredSize(product)
  const defaultSize = product.sizes.includes(preferred) ? preferred : null
  const [selectedSize, setSelectedSize] = useState(defaultSize)
  const [added, setAdded] = useState(false)

  function handleAdd() {
    if (!selectedSize) return
    sendChatMessage(`Add the ${product.name} in size ${selectedSize} to my cart`)
    setAdded(true)
  }

  function handleTellMore() {
    sendChatMessage(`Tell me everything about the ${product.name} — describe it, what makes it special, and what customers say about it`)
  }

  return (
    <div className="w-[240px] shrink-0 bg-white rounded-xl border border-stone-200 overflow-hidden shadow-card">
      <img src={product.image} alt={product.name} className="w-full h-36 object-cover" />
      <div className="p-3">
        <p className="text-xs font-semibold text-stone-900 truncate">{product.name}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm font-bold text-stone-900">${product.price}</span>
          <span className="text-[10px] text-stone-400">★ {product.rating} · {product.reviewCount}</span>
        </div>

        {/* Short description */}
        <p className="text-[10px] text-stone-500 mt-1.5 line-clamp-2 leading-relaxed">{product.description}</p>

        {/* Tell me more button */}
        <button
          onClick={handleTellMore}
          className="w-full mt-2 py-1.5 rounded-md text-[10px] font-medium text-accent-500 bg-accent-50 hover:bg-accent-100 transition-colors"
        >
          Tell me more about this →
        </button>

        {/* Compact size selector */}
        <div className="flex flex-wrap gap-1 mt-2 mb-2">
          {product.sizes.slice(0, 6).map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`min-w-[28px] h-6 px-1.5 rounded text-[10px] font-medium transition-all ${
                selectedSize === size
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        <button
          onClick={handleAdd}
          disabled={!selectedSize || added}
          className={`w-full py-1.5 rounded-md text-[11px] font-semibold transition-all ${
            added
              ? 'bg-success text-white'
              : selectedSize
              ? 'bg-stone-900 text-white hover:bg-stone-800'
              : 'bg-stone-100 text-stone-400'
          }`}
        >
          {added ? '✓ Added' : selectedSize ? `Add Size ${selectedSize}` : 'Select size'}
        </button>
      </div>
    </div>
  )
}

function VoiceGenericCard({ result }) {
  // Render non-product results as simple cards
  if (result.type === 'orderSummary') {
    return (
      <div className="w-[260px] shrink-0 bg-white rounded-xl border border-stone-200 p-4 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Order Summary</p>
        {result.data.items.map((item, i) => (
          <div key={i} className="flex justify-between text-xs mb-1">
            <span className="text-stone-600 truncate mr-2">{item.product.name}</span>
            <span className="text-stone-900 font-medium shrink-0">${(item.product.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="border-t border-stone-100 mt-2 pt-2 flex justify-between text-sm font-semibold text-stone-900">
          <span>Total</span><span>${result.data.total.toFixed(2)}</span>
        </div>
      </div>
    )
  }

  if (result.type === 'confirmation') {
    return (
      <div className="w-[220px] shrink-0 bg-success/5 rounded-xl border border-success/20 p-4 shadow-card text-center">
        <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-2">
          <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-stone-900">Order Confirmed!</p>
        <p className="text-xs text-stone-500 mt-1">#{result.data.orderId}</p>
      </div>
    )
  }

  if (result.type === 'cartUpdate' && result.data.product) {
    return (
      <div className="w-[200px] shrink-0 bg-success/5 rounded-xl border border-success/20 p-3 shadow-card">
        <div className="flex gap-2 items-center">
          <img src={result.data.product.image} alt="" className="w-10 h-10 rounded object-cover" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-stone-900 truncate">{result.data.product.name}</p>
            <p className="text-[10px] text-success font-medium mt-0.5">✓ Added to cart</p>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default function VoiceResultCarousel() {
  const latestResults = useChatStore((s) => s.latestResults)

  if (!latestResults || latestResults.length === 0) return null

  // Separate product and non-product results
  const productResults = latestResults.filter(
    (r) => r.type === 'productCard' || r.type === 'productCards' || r.type === 'productDetail'
  )
  const otherResults = latestResults.filter(
    (r) => r.type !== 'productCard' && r.type !== 'productCards' && r.type !== 'productDetail'
  )

  // Flatten products
  const products = []
  for (const r of productResults) {
    if (r.type === 'productCards' && r.data.products) {
      products.push(...r.data.products)
    } else if (r.data?.product) {
      products.push(r.data.product)
    }
  }

  return (
    <div className="animate-slide-up">
      {products.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {products.map((p) => (
            <VoiceProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
      {otherResults.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 px-1 mt-2 justify-center" style={{ scrollbarWidth: 'none' }}>
          {otherResults.map((r, i) => (
            <VoiceGenericCard key={i} result={r} />
          ))}
        </div>
      )}
    </div>
  )
}
