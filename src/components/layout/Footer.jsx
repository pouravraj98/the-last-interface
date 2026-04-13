import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="font-serif text-2xl text-white mb-3">FORMA</h3>
            <p className="text-sm leading-relaxed">
              Modern essentials, considered design. Quality materials, timeless style.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-300 mb-4">Shop</h4>
            <ul className="space-y-2.5">
              <li><Link to="/shop" className="text-sm hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/shop/footwear" className="text-sm hover:text-white transition-colors">Footwear</Link></li>
              <li><Link to="/shop/tops" className="text-sm hover:text-white transition-colors">Tops</Link></li>
              <li><Link to="/shop/bottoms" className="text-sm hover:text-white transition-colors">Bottoms</Link></li>
              <li><Link to="/shop/dresses" className="text-sm hover:text-white transition-colors">Dresses</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-300 mb-4">Account</h4>
            <ul className="space-y-2.5">
              <li><Link to="/account" className="text-sm hover:text-white transition-colors">My Account</Link></li>
              <li><Link to="/account/orders" className="text-sm hover:text-white transition-colors">Orders</Link></li>
              <li><Link to="/wishlist" className="text-sm hover:text-white transition-colors">Wishlist</Link></li>
              <li><Link to="/cart" className="text-sm hover:text-white transition-colors">Cart</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-300 mb-4">Info</h4>
            <ul className="space-y-2.5">
              <li><span className="text-sm">Free shipping over $75</span></li>
              <li><span className="text-sm">30-day returns</span></li>
              <li><span className="text-sm">Sustainable materials</span></li>
              <li><span className="text-sm">Austin, TX</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-800 text-xs text-stone-500">
          &copy; 2026 FORMA. This is a prototype for The Last Interface by CometChat.
        </div>
      </div>
    </footer>
  )
}
