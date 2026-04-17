import { Link } from 'react-router-dom'
import ProductGrid from '../components/product/ProductGrid'
import { getProductsByCollection, products } from '../data/products'

export default function HomePage() {
  const bestsellers = getProductsByCollection('bestsellers')
  const newArrivals = getProductsByCollection('new-arrivals')

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[76vh] min-h-[520px] bg-stone-900 flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80"
          alt="Fashion editorial"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="relative z-10 text-center px-6">
          <h1 className="font-serif text-6xl md:text-8xl text-white mb-4 tracking-tight">
            FORMA
          </h1>
          <p className="text-lg md:text-xl text-stone-300 mb-8 max-w-lg mx-auto">
            Modern essentials, considered design. Quality materials, timeless style.
          </p>
          <Link
            to="/shop"
            className="inline-block bg-white text-stone-900 px-8 py-3.5 text-sm font-semibold tracking-wide hover:bg-stone-100 transition-colors"
          >
            Shop Collection
          </Link>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap justify-center gap-8 md:gap-16">
          {['Free Shipping Over $75', '30-Day Returns', 'Sustainable Materials'].map((text) => (
            <div key={text} className="flex items-center gap-2 text-sm text-stone-500">
              <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              {text}
            </div>
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-serif text-4xl text-stone-900 mb-2">Bestsellers</h2>
            <p className="text-stone-500">The pieces our customers keep coming back for.</p>
          </div>
          <Link to="/shop" className="text-sm font-semibold text-accent-500 hover:text-accent-400 transition-colors hidden md:block">
            View all &rarr;
          </Link>
        </div>
        <ProductGrid products={bestsellers} />
      </section>

      {/* New Arrivals */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-serif text-4xl text-stone-900 mb-2">New Arrivals</h2>
              <p className="text-stone-500">Fresh additions to the collection.</p>
            </div>
            <Link to="/shop" className="text-sm font-semibold text-accent-500 hover:text-accent-400 transition-colors hidden md:block">
              View all &rarr;
            </Link>
          </div>
          <ProductGrid products={newArrivals} />
        </div>
      </section>

      {/* Brand story */}
      <section className="bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-serif text-4xl mb-4">Designed to last.</h2>
            <p className="text-stone-400 leading-relaxed mb-6">
              Every FORMA piece starts with a question: will this still feel right a year from now?
              We use premium materials, clean construction, and restrained design to create clothes
              that work harder and last longer.
            </p>
            <Link to="/shop" className="text-accent-400 text-sm font-semibold hover:text-accent-300 transition-colors">
              Explore the collection &rarr;
            </Link>
          </div>
          <div className="aspect-[4/3] bg-stone-800 rounded-lg overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80"
              alt="Clothing details"
              className="w-full h-full object-cover opacity-80"
            />
          </div>
        </div>
      </section>

      {/* Category grid */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="font-serif text-4xl text-stone-900 mb-10 text-center">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Footwear', slug: 'footwear', image: 'https://cdn.dummyjson.com/product-images/mens-shoes/puma-future-rider-trainers/thumbnail.webp' },
            { name: 'Tops', slug: 'tops', image: 'https://cdn.dummyjson.com/product-images/mens-shirts/men-check-shirt/thumbnail.webp' },
            { name: 'Dresses', slug: 'dresses', image: 'https://cdn.dummyjson.com/product-images/womens-dresses/black-women\'s-gown/thumbnail.webp' },
            { name: 'Accessories', slug: 'accessories', image: 'https://cdn.dummyjson.com/product-images/womens-bags/heshe-women\'s-leather-bag/thumbnail.webp' },
          ].map((cat) => (
            <Link
              key={cat.slug}
              to={`/shop/${cat.slug}`}
              className="group relative aspect-[3/4] rounded-lg overflow-hidden"
            >
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-white font-semibold text-lg">{cat.name}</h3>
                <p className="text-white/60 text-sm">Shop now &rarr;</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
