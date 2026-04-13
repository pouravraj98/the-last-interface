import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import ProductGrid from '../components/product/ProductGrid'
import { products, getProductsByCategory, getCategories } from '../data/products'

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Newest', value: 'newest' },
  { label: 'Top Rated', value: 'rating' },
]

export default function ProductListingPage() {
  const { category } = useParams()
  const categories = getCategories()
  const [sort, setSort] = useState('featured')
  const [priceRange, setPriceRange] = useState([0, 200])
  const [selectedCategory, setSelectedCategory] = useState(category || '')

  const filtered = useMemo(() => {
    let result = selectedCategory
      ? getProductsByCategory(selectedCategory)
      : [...products]

    // Price filter
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])

    // Sort
    switch (sort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        result.sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
        result.sort((a, b) => (b.badge === 'New' ? 1 : 0) - (a.badge === 'New' ? 1 : 0))
        break
    }

    return result
  }, [selectedCategory, sort, priceRange])

  // Sync URL param
  useMemo(() => {
    if (category && category !== selectedCategory) {
      setSelectedCategory(category)
    }
  }, [category])

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-stone-900 mb-2 capitalize">
          {selectedCategory || 'All Products'}
        </h1>
        <p className="text-stone-500">{filtered.length} products</p>
      </div>

      <div className="flex gap-10">
        {/* Sidebar filters */}
        <aside className="hidden lg:block w-56 shrink-0">
          {/* Category filter */}
          <div className="mb-8">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">Category</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`text-sm transition-colors ${!selectedCategory ? 'text-stone-900 font-semibold' : 'text-stone-500 hover:text-stone-900'}`}
                >
                  All Products
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-sm capitalize transition-colors ${selectedCategory === cat ? 'text-stone-900 font-semibold' : 'text-stone-500 hover:text-stone-900'}`}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Price filter */}
          <div className="mb-8">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">Price</h3>
            <div className="space-y-2">
              {[
                { label: 'All', range: [0, 200] },
                { label: 'Under $50', range: [0, 50] },
                { label: '$50 - $100', range: [50, 100] },
                { label: '$100+', range: [100, 200] },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setPriceRange(opt.range)}
                  className={`block text-sm transition-colors ${
                    priceRange[0] === opt.range[0] && priceRange[1] === opt.range[1]
                      ? 'text-stone-900 font-semibold'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main grid */}
        <div className="flex-1">
          {/* Sort bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2 lg:hidden">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-sm border border-stone-200 rounded-md px-3 py-2 bg-white"
              >
                <option value="">All</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="capitalize">{cat}</option>
                ))}
              </select>
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-sm border border-stone-200 rounded-md px-3 py-2 bg-white ml-auto"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {filtered.length > 0 ? (
            <ProductGrid products={filtered} />
          ) : (
            <div className="text-center py-20">
              <p className="text-stone-400 text-lg">No products match your filters.</p>
              <button
                onClick={() => { setSelectedCategory(''); setPriceRange([0, 200]) }}
                className="mt-4 text-sm text-accent-500 font-semibold hover:text-accent-400"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
