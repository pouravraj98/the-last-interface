/**
 * VoiceProductShowcase — Left panel of split voice view
 * Full product detail: image carousel, info, size selector, buy/view buttons
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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

export default function VoiceProductShowcase({ product, productList, activeIndex, onNavigate }) {
  const preferred = getPreferredSize(product)
  const defaultSize = product.sizes?.includes(preferred) ? preferred : null
  const [selectedSize, setSelectedSize] = useState(defaultSize)
  const [currentImg, setCurrentImg] = useState(0)
  const [buying, setBuying] = useState(false)
  const close = useChatStore((s) => s.close)
  const navigate = useNavigate()

  // Reset state when product changes
  useEffect(() => {
    setCurrentImg(0)
    setBuying(false)
    const pref = getPreferredSize(product)
    setSelectedSize(product.sizes?.includes(pref) ? pref : null)
  }, [product.id])

  if (!product) return null

  const images = product.images?.length > 0 ? product.images : [product.image]
  const hasMultipleProducts = productList && productList.length > 1

  function handleBuy() {
    if (!selectedSize) return
    setBuying(true)
    sendChatMessage(`I want to buy the ${product.name} in size ${selectedSize}`)
  }

  function handleViewDetails() {
    close()
    navigate(`/product/${product.id}`)
  }

  function handleNext() {
    if (onNavigate && activeIndex < productList.length - 1) {
      setCurrentImg(0)
      setSelectedSize(null)
      setBuying(false)
      onNavigate(activeIndex + 1)
    }
  }

  function handlePrev() {
    if (onNavigate && activeIndex > 0) {
      setCurrentImg(0)
      setSelectedSize(null)
      setBuying(false)
      onNavigate(activeIndex - 1)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      {/* Multi-product nav */}
      {hasMultipleProducts && (
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={handlePrev}
            disabled={activeIndex === 0}
            className="w-7 h-7 rounded-full border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-50 disabled:opacity-30 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <span className="text-[11px] text-stone-400 font-medium">{activeIndex + 1} of {productList.length}</span>
          <button
            onClick={handleNext}
            disabled={activeIndex === productList.length - 1}
            className="w-7 h-7 rounded-full border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-50 disabled:opacity-30 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      )}

      {/* Main image */}
      <div className="relative rounded-lg overflow-hidden bg-stone-100 aspect-[4/3] mb-2">
        <img
          src={images[currentImg]}
          alt={product.name}
          className="w-full h-full object-contain bg-white"
        />
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/40 flex items-center justify-center">
            <span className="px-3 py-1 bg-stone-900/80 text-white text-[10px] font-bold uppercase rounded-sm">Out of Stock</span>
          </div>
        )}
        {images.length > 1 && (
          <span className="absolute top-2 right-2 bg-black/40 text-white text-[10px] px-1.5 py-0.5 rounded-full backdrop-blur-sm">
            {currentImg + 1}/{images.length}
          </span>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-1.5 mb-3">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrentImg(i)}
              className={`flex-1 aspect-square rounded-md overflow-hidden border-2 transition-all ${
                i === currentImg ? 'border-stone-900' : 'border-transparent opacity-50 hover:opacity-80'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-contain bg-white" />
            </button>
          ))}
        </div>
      )}

      {/* Product info */}
      <div className="mb-3">
        <div className="flex items-start justify-between">
          <div>
            {product.badge && (
              <span className={`inline-block px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider mb-1 ${
                product.badge === 'Sale' ? 'bg-accent-400 text-white' : product.badge === 'New' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'
              }`}>{product.badge}</span>
            )}
            <h3 className="text-sm font-semibold text-stone-900">{product.name}</h3>
          </div>
          <span className="text-lg font-bold text-stone-900">${product.price}</span>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-stone-500">★ {product.rating}</span>
          <span className="text-xs text-stone-300">·</span>
          <span className="text-xs text-stone-400">{product.reviewCount} reviews</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-stone-600 leading-relaxed mb-3">{product.description}</p>

      {/* Features */}
      {product.features && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {product.features.map((f, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 bg-stone-50 text-stone-500 rounded-full">{f}</span>
          ))}
        </div>
      )}

      {/* Size selector */}
      {product.inStock && (
        <>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Select Size</p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`min-w-[36px] h-8 px-2 rounded-md border text-xs font-medium transition-all ${
                  selectedSize === size
                    ? 'border-stone-900 bg-stone-900 text-white'
                    : 'border-stone-200 text-stone-600 hover:border-stone-400'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Action buttons */}
      <div className="space-y-2">
        {product.inStock ? (
          <button
            onClick={handleBuy}
            disabled={!selectedSize || buying}
            className={`w-full py-2.5 rounded-md text-xs font-semibold transition-all ${
              buying
                ? 'bg-success text-white'
                : selectedSize
                ? 'bg-stone-900 text-white hover:bg-stone-800'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            {buying ? '✓ Starting checkout...' : selectedSize ? `Buy with Agent — Size ${selectedSize}` : 'Select a size first'}
          </button>
        ) : (
          <button
            onClick={() => sendChatMessage(`Notify me when the ${product.name} is back in stock`)}
            className="w-full py-2.5 rounded-md text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors"
          >
            Notify Me When Available
          </button>
        )}
        <button
          onClick={handleViewDetails}
          className="w-full py-2 rounded-md text-xs font-medium border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors"
        >
          View Full Details on Site →
        </button>
      </div>
    </div>
  )
}
