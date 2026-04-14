import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProductById, getProductsByCategory } from '../data/products'
import { useCartStore } from '../stores/useCartStore'
import { useChatStore } from '../stores/useChatStore'
import { usePageContextStore } from '../stores/usePageContextStore'
import { sendChatMessage } from '../services/chat/index'
import { stop as stopTTS } from '../services/tts'
import { toast } from '../components/ui/Toast'
import { getReviewsForProduct, getReviewSummary } from '../data/reviews'
import ProductGrid from '../components/product/ProductGrid'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const product = getProductById(slug)
  const addItem = useCartStore((s) => s.addItem)

  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]?.name || null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [added, setAdded] = useState(false)

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h1 className="font-serif text-4xl text-stone-900 mb-4">Product not found</h1>
        <Link to="/shop" className="text-accent-500 text-sm font-semibold">Back to shop &rarr;</Link>
      </div>
    )
  }

  const related = getProductsByCategory(product.category)
    .filter((p) => p.id !== product.id)
    .slice(0, 4)

  function handleAddToCart() {
    if (!selectedSize) return
    // Check per-size stock
    if (product.sizeStock && product.sizeStock[selectedSize] === false) {
      toast(`Size ${selectedSize} is currently out of stock`, 'error')
      return
    }
    addItem(product, selectedSize, selectedColor)
    setAdded(true)
    toast(`${product.name} added to cart`, 'success')
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-stone-400 mb-8">
          <Link to="/" className="hover:text-stone-600">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-stone-600">Shop</Link>
          <span>/</span>
          <Link to={`/shop/${product.category}`} className="hover:text-stone-600 capitalize">{product.category}</Link>
          <span>/</span>
          <span className="text-stone-600">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="aspect-square bg-stone-100 rounded-lg overflow-hidden mb-3">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                      selectedImage === idx ? 'border-stone-900' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div>
            {product.badge && (
              <span className={`inline-block px-2.5 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider mb-3 ${
                product.badge === 'Sale' ? 'bg-accent-400 text-white'
                : product.badge === 'New' ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-700'
              }`}>
                {product.badge}
              </span>
            )}

            <h1 className="font-serif text-3xl text-stone-900 mb-2">{product.name}</h1>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                <span className="text-sm text-stone-600">★ {product.rating}</span>
                <span className="text-sm text-stone-400">({product.reviewCount} reviews)</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-semibold text-stone-900">${product.price}</span>
              {product.compareAtPrice && (
                <span className="text-lg text-stone-400 line-through">${product.compareAtPrice}</span>
              )}
            </div>

            <p className="text-stone-600 leading-relaxed mb-8">{product.description}</p>

            {/* Color selector */}
            {product.colors.length > 1 && (
              <div className="mb-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
                  Color: {selectedColor}
                </h3>
                <div className="flex gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === color.name ? 'border-stone-900 scale-110' : 'border-stone-200'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {product.inStock ? (
              <>
                {/* Size selector */}
                <div className="mb-8">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => {
                      const sizeAvail = product.sizeStock ? product.sizeStock[size] !== false : true
                      return (
                        <button
                          key={size}
                          onClick={() => sizeAvail ? setSelectedSize(size) : null}
                          className={`min-w-[44px] h-11 px-3 rounded-md border text-sm font-medium transition-all ${
                            !sizeAvail
                              ? 'border-stone-100 text-stone-300 line-through cursor-not-allowed'
                              : selectedSize === size
                              ? 'border-stone-900 bg-stone-900 text-white'
                              : 'border-stone-200 text-stone-700 hover:border-stone-400'
                          }`}
                          title={!sizeAvail ? `Size ${size} out of stock` : ''}
                        >
                          {size}
                        </button>
                      )
                    })}
                  </div>
                  {!selectedSize && (
                    <p className="text-xs text-stone-400 mt-2">Select a size to add to cart</p>
                  )}
                  {product.sizeStock && Object.values(product.sizeStock).some(v => !v) && (
                    <p className="text-xs text-accent-500 mt-2">
                      Some sizes are out of stock.{' '}
                      <button onClick={() => toast('We\'ll notify you when your size is back!', 'success')} className="font-semibold hover:text-accent-400 underline">
                        Get notified
                      </button>
                    </p>
                  )}
                </div>

                {/* Add to cart + Ask AI */}
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={!selectedSize}
                    className={`flex-1 py-3.5 rounded-md text-sm font-semibold transition-all ${
                      added
                        ? 'bg-success text-white'
                        : selectedSize
                        ? 'bg-stone-900 text-white hover:bg-stone-800'
                        : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    }`}
                  >
                    {added ? '✓ Added to Cart' : 'Add to Cart'}
                  </button>
                  <button
                    onClick={() => {
                      stopTTS()
                      useChatStore.getState().resetConversation()
                      usePageContextStore.getState().setViewingProduct(product)
                      useChatStore.getState().open()
                    }}
                    className="px-5 py-3.5 rounded-md text-sm font-semibold border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
                    </svg>
                    Ask AI
                  </button>
                </div>
              </>
            ) : (
              /* Out of stock — full product */
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4 px-4 py-3 bg-orange-50 rounded-lg border border-orange-200">
                  <svg className="w-5 h-5 text-orange-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-orange-800">Currently Out of Stock</p>
                    <p className="text-xs text-orange-600">This item is temporarily unavailable.</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => toast('We\'ll notify you at alex@email.com when this is back!', 'success')}
                    className="w-full py-3.5 rounded-md text-sm font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors"
                  >
                    Notify Me When Available
                  </button>
                  <button
                    onClick={() => {
                      stopTTS()
                      useChatStore.getState().resetConversation()
                      usePageContextStore.getState().setViewingProduct(product)
                      useChatStore.getState().open()
                    }}
                    className="w-full py-3.5 rounded-md text-sm font-semibold border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
                    </svg>
                    Ask AI About This
                  </button>
                </div>
              </div>
            )}

            {/* Product Details — Accordions */}
            <div className="mt-10 pt-8 border-t border-stone-200">
              {/* Key Features (always open) */}
              {product.features && (
                <div className="mb-6">
                  <ul className="space-y-2">
                    {product.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-stone-600">
                        <svg className="w-4 h-4 text-success shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Accordion title="Product Specifications" defaultOpen>
                <div className="grid grid-cols-2 gap-x-8 gap-y-0">
                  {product.fabricComposition && <SpecRow label="Fabric" value={product.fabricComposition} />}
                  {product.fit && <SpecRow label="Fit" value={product.fit} />}
                  {product.trueToSize && <SpecRow label="Sizing" value={product.trueToSize} />}
                  {product.weight && <SpecRow label="Weight" value={product.weight} />}
                  {product.stretch && <SpecRow label="Stretch" value={product.stretch} />}
                  {product.closure && <SpecRow label="Closure" value={product.closure} />}
                  {product.neckline && <SpecRow label="Neckline" value={product.neckline} />}
                  {product.sleeveType && <SpecRow label="Sleeve" value={product.sleeveType} />}
                  {product.length && <SpecRow label="Length" value={product.length} />}
                  {product.pockets && <SpecRow label="Pockets" value={product.pockets} />}
                  {product.lining && <SpecRow label="Lining" value={product.lining} />}
                  {product.countryOfOrigin && <SpecRow label="Made in" value={product.countryOfOrigin.replace('Made in ', '')} />}
                </div>
                {product.modelInfo && (
                  <p className="text-xs text-stone-400 mt-4 italic">{product.modelInfo}</p>
                )}
              </Accordion>

              {product.careInstructions && (
                <Accordion title="Care Instructions">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>
                    <p className="text-sm text-stone-600 leading-relaxed">{product.careInstructions}</p>
                  </div>
                </Accordion>
              )}

              <Accordion title="Shipping & Returns">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0H6.375c-.621 0-1.125-.504-1.125-1.125V14.25m0 0h11.25m0 0V11.625m0 2.625H5.25m11.25 0V4.875c0-.621-.504-1.125-1.125-1.125H5.25" /></svg>
                    <div>
                      <p className="text-sm font-medium text-stone-800">Free Standard Shipping</p>
                      <p className="text-xs text-stone-500">On orders over $75. Delivery in 5-7 business days.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-info shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
                    <div>
                      <p className="text-sm font-medium text-stone-800">Express & Next Day Available</p>
                      <p className="text-xs text-stone-500">Express $9.95 (2-3 days) · Next Day $14.95 (order by 2 PM)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" /></svg>
                    <div>
                      <p className="text-sm font-medium text-stone-800">Free 30-Day Returns & Exchanges</p>
                      <p className="text-xs text-stone-500">Free return shipping label included. Refund within 5-7 business days.</p>
                    </div>
                  </div>
                </div>
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <ProductReviews productId={product.id} />

      {/* Related products */}
      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16 border-t border-stone-200">
          <h2 className="font-serif text-2xl text-stone-900 mb-8">You may also like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  )
}

function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-stone-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className="text-sm font-semibold text-stone-900 group-hover:text-stone-700 transition-colors">{title}</span>
        <svg
          className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      <div className={`overflow-hidden transition-all duration-200 ${open ? 'max-h-[500px] pb-5' : 'max-h-0'}`}>
        {children}
      </div>
    </div>
  )
}

function SpecRow({ label, value }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-stone-50">
      <span className="text-xs text-stone-400">{label}</span>
      <span className="text-xs text-stone-700 text-right">{value}</span>
    </div>
  )
}

function ProductReviews({ productId }) {
  const reviewList = getReviewsForProduct(productId)
  const summary = getReviewSummary(productId)
  const [showAll, setShowAll] = useState(false)

  if (reviewList.length === 0) return null

  const displayReviews = showAll ? reviewList : reviewList.slice(0, 3)
  const maxCount = Math.max(...Object.values(summary.distribution))

  return (
    <section className="max-w-7xl mx-auto px-6 py-16 border-t border-stone-200">
      <div className="max-w-3xl">
        <h2 className="font-serif text-2xl text-stone-900 mb-2">Customer Reviews</h2>
        <div className="flex items-center gap-3 mb-8">
          <span className="text-3xl font-bold text-stone-900">★ {summary.average}</span>
          <span className="text-stone-500">Based on {summary.count} reviews</span>
        </div>

        {/* Rating distribution */}
        <div className="mb-8">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = summary.distribution[star] || 0
            const pct = maxCount > 0 ? (count / maxCount) * 100 : 0
            return (
              <div key={star} className="flex items-center gap-3 mb-1.5">
                <span className="text-sm text-stone-500 w-10">{star} ★</span>
                <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-sm text-stone-400 w-6 text-right">{count}</span>
              </div>
            )
          })}
        </div>

        {/* Individual reviews */}
        <div className="space-y-6">
          {displayReviews.map((review, i) => (
            <div key={i} className="pb-6 border-b border-stone-100 last:border-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <span key={s} className={`text-sm ${s < review.rating ? 'text-amber-400' : 'text-stone-200'}`}>★</span>
                  ))}
                </div>
                <span className="text-sm font-semibold text-stone-800">{review.name}</span>
                {review.verified && (
                  <span className="text-xs text-success font-medium flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    Verified Purchase
                  </span>
                )}
                <span className="text-xs text-stone-400 ml-auto">{review.date}</span>
              </div>
              <p className="text-sm font-semibold text-stone-900 mb-1">{review.title}</p>
              <p className="text-sm text-stone-600 leading-relaxed">{review.text}</p>
            </div>
          ))}
        </div>

        {reviewList.length > 3 && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="mt-4 text-sm font-semibold text-accent-500 hover:text-accent-400 transition-colors"
          >
            Show all {reviewList.length} reviews
          </button>
        )}
      </div>
    </section>
  )
}
