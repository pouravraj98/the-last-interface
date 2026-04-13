import { Link } from 'react-router-dom'
import { useWishlistStore } from '../stores/useWishlistStore'
import { useCartStore } from '../stores/useCartStore'
import { getProductById } from '../data/products'
import { toast } from '../components/ui/Toast'

export default function WishlistPage() {
  const wishlistIds = useWishlistStore((s) => s.items)
  const removeItem = useWishlistStore((s) => s.removeItem)
  const addToCart = useCartStore((s) => s.addItem)

  const products = wishlistIds.map((id) => getProductById(id)).filter(Boolean)

  if (products.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h1 className="font-serif text-4xl text-stone-900 mb-4">Your Wishlist</h1>
        <p className="text-stone-500 mb-8">Save items you love for later.</p>
        <Link to="/shop" className="inline-block bg-stone-900 text-white px-8 py-3 text-sm font-semibold hover:bg-stone-800 transition-colors rounded-md">
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="font-serif text-4xl text-stone-900 mb-10">Your Wishlist</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {products.map((product) => (
          <div key={product.id} className="group">
            <Link to={`/product/${product.id}`}>
              <div className="aspect-[3/4] bg-stone-100 rounded-lg overflow-hidden mb-3">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
              <h3 className="text-sm font-medium text-stone-900 mb-1">{product.name}</h3>
              <p className="text-sm font-semibold text-stone-900">${product.price}</p>
            </Link>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => {
                  addToCart(product, product.sizes[Math.floor(product.sizes.length / 2)], product.colors[0]?.name)
                  toast(`${product.name} added to cart`, 'success')
                }}
                className="flex-1 text-xs font-semibold bg-stone-900 text-white py-2 rounded-md hover:bg-stone-800 transition-colors"
              >
                Add to Cart
              </button>
              <button
                onClick={() => removeItem(product.id)}
                className="text-xs text-stone-400 hover:text-red-500 px-3 py-2 border border-stone-200 rounded-md transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
