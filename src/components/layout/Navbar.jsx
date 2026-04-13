import { Link } from 'react-router-dom'
import { useCartStore } from '../../stores/useCartStore'

export default function Navbar() {
  const itemCount = useCartStore((s) => s.itemCount())

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-serif text-2xl tracking-tight text-stone-900">
          FORMA
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/shop" className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors">
            Shop
          </Link>
          <Link to="/shop/footwear" className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors">
            Footwear
          </Link>
          <Link to="/shop/tops" className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors">
            Tops
          </Link>
          <Link to="/shop/bottoms" className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors">
            Bottoms
          </Link>
          <Link to="/shop/dresses" className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors">
            Dresses
          </Link>
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-5">
          {/* Search */}
          <button className="text-stone-500 hover:text-stone-900 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </button>

          {/* Wishlist */}
          <Link to="/wishlist" className="text-stone-500 hover:text-stone-900 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </Link>

          {/* Cart */}
          <Link to="/cart" className="relative text-stone-500 hover:text-stone-900 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 w-4.5 h-4.5 bg-accent-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Account */}
          <Link to="/account" className="text-stone-500 hover:text-stone-900 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </Link>
        </div>
      </div>
    </nav>
  )
}
