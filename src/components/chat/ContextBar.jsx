import { usePageContextStore } from '../../stores/usePageContextStore'
import { useCartStore } from '../../stores/useCartStore'

export default function ContextBar() {
  const viewingProduct = usePageContextStore((s) => s.viewingProduct)
  const viewingCategory = usePageContextStore((s) => s.viewingCategory)
  const cartCount = useCartStore((s) => s.itemCount())

  if (!viewingProduct && !viewingCategory && cartCount === 0) return null

  return (
    <div className="flex items-center gap-2 px-3 py-2 mb-2 bg-stone-50 rounded-lg text-xs">
      {viewingProduct && (
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <img src={viewingProduct.image} alt="" className="w-7 h-7 rounded object-cover shrink-0" />
          <span className="text-stone-500 truncate">
            Viewing: <span className="text-stone-700 font-medium">{viewingProduct.name}</span>
          </span>
        </div>
      )}
      {!viewingProduct && viewingCategory && (
        <span className="text-stone-500 flex-1">
          Browsing: <span className="text-stone-700 font-medium capitalize">{viewingCategory}</span>
        </span>
      )}
      {cartCount > 0 && (
        <span className="text-stone-400 shrink-0">
          Cart: {cartCount} item{cartCount > 1 ? 's' : ''}
        </span>
      )}
    </div>
  )
}
