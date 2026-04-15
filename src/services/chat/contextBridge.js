/**
 * Context Bridge — Multimodal Awareness Engine
 * Reads all Zustand stores and builds a context string for the AI
 * Injected into the system prompt on every AI call
 */
import { useCartStore } from '../../stores/useCartStore'
import { useUserStore } from '../../stores/useUserStore'
import { useWishlistStore } from '../../stores/useWishlistStore'
import { usePageContextStore } from '../../stores/usePageContextStore'
import { useChatStore } from '../../stores/useChatStore'
import { products } from '../../data/products'

export function buildContextString() {
  const cart = useCartStore.getState()
  const user = useUserStore.getState()
  const chatState = useChatStore.getState()
  const wishlist = useWishlistStore.getState()
  const pageCtx = usePageContextStore.getState()

  const lines = ['## Current Browsing Context']

  // Voice showcase awareness — what product is the user CURRENTLY viewing in the split view
  if (chatState.voiceMode && chatState.latestResults.length > 0) {
    const showcaseProducts = []
    for (const r of chatState.latestResults) {
      if (r.type === 'productCards' && r.data?.products) showcaseProducts.push(...r.data.products)
      else if (r.type === 'productCard' && r.data?.product) showcaseProducts.push(r.data.product)
      else if (r.type === 'productDetail' && r.data?.product) showcaseProducts.push(r.data.product)
    }
    if (showcaseProducts.length > 0) {
      const activeIdx = chatState.activeShowcaseIndex || 0
      const activeProduct = showcaseProducts[activeIdx] || showcaseProducts[0]
      lines.push(`- Voice showcase: user is currently viewing "${activeProduct.name}" ($${activeProduct.price}, ${activeProduct.category}/${activeProduct.subcategory})`)
      lines.push(`  Product details: ${activeProduct.description}`)
      lines.push(`  Colors: ${activeProduct.colors.map(c => c.name).join(', ')} | Sizes: ${activeProduct.sizes.join(', ')}`)
      lines.push(`  When the user says "this one", "this product", "it", or "this" — they mean ${activeProduct.name}.`)
      if (showcaseProducts.length > 1) {
        lines.push(`  Other products in showcase (${showcaseProducts.length} total): ${showcaseProducts.filter((_, i) => i !== activeIdx).map(p => p.name).join(', ')}`)
      }
    }
  }

  // Page awareness
  if (pageCtx.viewingProduct) {
    const p = pageCtx.viewingProduct
    lines.push(`- Page: Product Detail — "${p.name}" ($${p.price})`)
    lines.push(`  The user is currently viewing this product. They can see the images, price, sizes [${p.sizes.join(', ')}], and colors [${p.colors.map(c => c.name).join(', ')}].`)
  } else if (pageCtx.viewingCategory) {
    lines.push(`- Page: Product Listing — category "${pageCtx.viewingCategory}"`)
    lines.push(`  The user is browsing ${pageCtx.viewingCategory} products.`)
  } else if (pageCtx.currentPage) {
    lines.push(`- Page: ${pageCtx.currentPage}`)
  }

  // Cart awareness — detailed so AI knows exactly what to remove
  const items = cart.items
  if (items.length > 0) {
    const cartTotal = cart.subtotal()
    lines.push(`- Cart: ${items.length} item(s), $${cartTotal.toFixed(2)} subtotal`)
    items.forEach((item) => {
      lines.push(`  · product_id="${item.productId}", ${item.product.name}, Size ${item.size}${item.color ? ', Color ' + item.color : ''}, Qty ${item.quantity}, $${(item.product.price * item.quantity).toFixed(2)}`)
    })
    lines.push(`  To remove an item, use remove_from_cart with the exact product_id and size shown above.`)
    if (cart.appliedCoupon) {
      lines.push(`  Applied coupon: ${cart.appliedCoupon.code} (${cart.appliedCoupon.label})`)
    }
  } else {
    lines.push('- Cart: Empty — nothing to check out. Suggest products first.')
  }

  // Wishlist
  const wishlistItems = wishlist.items
  if (wishlistItems.length > 0) {
    const names = wishlistItems
      .map((id) => products.find((p) => p.id === id)?.name)
      .filter(Boolean)
    lines.push(`- Wishlist: ${names.join(', ')}`)
  }

  // User preferences
  lines.push(`- Customer: ${user.user.name}, shoe size ${user.user.shoeSize}, clothing size ${user.user.clothingSize}`)
  lines.push(`- Style preference: ${user.user.stylePreference}`)

  return lines.join('\n')
}
