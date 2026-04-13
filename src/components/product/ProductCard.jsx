import { Link } from 'react-router-dom'
import { useChatStore } from '../../stores/useChatStore'
import AskAiPill from '../chat/AskAiPill'

export default function ProductCard({ product }) {
  const highlightedId = useChatStore((s) => s.highlightedProductId)
  const isHighlighted = highlightedId === product.id

  return (
    <div className={`group relative transition-all duration-500 ${
      isHighlighted ? 'ring-2 ring-accent-400 rounded-lg shadow-lg scale-[1.02]' : ''
    }`}>
      {/* Highlighted label */}
      {isHighlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 px-2.5 py-0.5 bg-accent-400 text-white text-[10px] font-bold uppercase tracking-wider rounded-full animate-fade-in">
          AI Recommended
        </div>
      )}

      <Link to={`/product/${product.id}`} className="block">
        {/* Image */}
        <div className="relative aspect-[3/4] bg-stone-100 rounded-lg overflow-hidden mb-3">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-white/40 flex items-center justify-center">
              <span className="px-3 py-1 bg-stone-900/80 text-white text-[10px] font-bold uppercase tracking-wider rounded-sm">Out of Stock</span>
            </div>
          )}
          {product.badge && product.inStock && (
            <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
              product.badge === 'Sale'
                ? 'bg-accent-400 text-white'
                : product.badge === 'New'
                ? 'bg-stone-900 text-white'
                : 'bg-white/90 text-stone-900 backdrop-blur-sm'
            }`}>
              {product.badge}
            </span>
          )}

          {/* Ask AI pill — appears on hover */}
          <AskAiPill product={product} />
        </div>

        {/* Info */}
        <h3 className="text-sm font-medium text-stone-900 mb-1 group-hover:text-accent-500 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-stone-900">
            ${product.price}
          </span>
          {product.compareAtPrice && (
            <span className="text-xs text-stone-400 line-through">
              ${product.compareAtPrice}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-stone-400">★ {product.rating}</span>
          <span className="text-xs text-stone-300">·</span>
          <span className="text-xs text-stone-400">{product.reviewCount} reviews</span>
        </div>
      </Link>
    </div>
  )
}
