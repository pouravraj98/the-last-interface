/**
 * Context Bridge — Smart Context Engine
 * Reads all stores and computes a decision summary for the AI.
 * Determines shopping mode, checkout readiness, and next action.
 */
import { useCartStore } from '../../stores/useCartStore'
import { useUserStore } from '../../stores/useUserStore'
import { useWishlistStore } from '../../stores/useWishlistStore'
import { usePageContextStore } from '../../stores/usePageContextStore'
import { useChatStore } from '../../stores/useChatStore'
import { products } from '../../data/products'

/** Determine shopping mode from conversation + state */
function determineMode(messages, cart, chatState) {
  // Check if order was just confirmed
  const hasConfirmation = messages.some(m => m.type === 'confirmation')
  if (hasConfirmation) return 'POST_PURCHASE'

  // Check last 6 messages for checkout intent
  const recent = messages.slice(-6)
  const hasCheckoutIntent = recent.some(m => {
    const text = (m.text || '').toLowerCase()
    return text.includes('check out') || text.includes('checkout') ||
      text.includes('buy') || text.includes('purchase') ||
      text.includes('place order') || text.includes('proceed') ||
      text.includes('let\'s go') || text.includes('ready to pay')
  })

  // Also check if checkout tools have been used
  const hasCheckoutCards = messages.some(m =>
    m.type === 'orderSummary' || m.type === 'addressCard' ||
    m.type === 'paymentCard' || m.type === 'savedAddresses'
  )

  if ((hasCheckoutIntent || hasCheckoutCards) && cart.items.length > 0) return 'CHECKOUT'
  if (cart.items.length > 0) return 'CART'
  return 'BROWSING'
}

export function buildContextString() {
  const cart = useCartStore.getState()
  const user = useUserStore.getState()
  const wishlist = useWishlistStore.getState()
  const pageCtx = usePageContextStore.getState()
  const chatState = useChatStore.getState()

  const mode = determineMode(chatState.messages, cart, chatState)
  const lines = []

  // ─── Shopping Mode ────────────────────────────────────
  lines.push(`## Shopping State: ${mode}`)

  // ─── Voice Showcase Awareness ─────────────────────────
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
      lines.push(`- Voice showcase showing: "${activeProduct.name}" ($${activeProduct.price})`)
      lines.push(`  When user says "this", "it", "this one" → they mean ${activeProduct.name}`)
    }
  }

  // ─── Page Context ─────────────────────────────────────
  if (pageCtx.viewingProduct) {
    const p = pageCtx.viewingProduct
    lines.push(`- Viewing on site: "${p.name}" ($${p.price}) — ${p.category}`)
  } else if (pageCtx.viewingCategory) {
    lines.push(`- Browsing: ${pageCtx.viewingCategory} category`)
  }

  // ─── Cart Details ─────────────────────────────────────
  const items = cart.items
  if (items.length > 0) {
    lines.push(`\n## Cart: ${items.length} item(s)`)
    items.forEach((item) => {
      lines.push(`  · "${item.product.name}" | id="${item.productId}" | Size ${item.size}${item.color ? ' | ' + item.color : ''} | Qty ${item.quantity} | $${(item.product.price * item.quantity).toFixed(2)}`)
    })
    lines.push(`  Subtotal: $${cart.subtotal().toFixed(2)}`)
    if (cart.discount() > 0) {
      lines.push(`  Discount (${cart.appliedCoupon?.code}): -$${cart.discount().toFixed(2)}`)
    }
    lines.push(`  Shipping: ${cart.shippingOption()?.name} — ${cart.shipping() === 0 ? 'Free' : '$' + cart.shipping().toFixed(2)}`)
    lines.push(`  Tax: $${cart.tax().toFixed(2)}`)
    lines.push(`  TOTAL: $${cart.total().toFixed(2)}`)
    lines.push(`  (To remove: use exact product_id and size above)`)
  } else {
    lines.push(`\n## Cart: Empty`)
    if (mode === 'CHECKOUT') {
      lines.push(`  → Cannot checkout. Cart is empty. Help user find products.`)
    }
  }

  // ─── Checkout Readiness (only in CHECKOUT mode) ───────
  if (mode === 'CHECKOUT' && items.length > 0) {
    lines.push(`\n## Checkout Readiness`)
    lines.push(`  ✓ Cart has items ($${cart.subtotal().toFixed(2)})`)

    if (chatState.shippingExplicitlySet) {
      lines.push(`  ✓ Shipping: ${cart.shippingOption()?.name} — explicitly chosen`)
    } else {
      lines.push(`  ? Shipping: Standard (default) — user hasn't chosen yet, you can suggest Express/Next Day`)
    }

    if (chatState.addressSelected) {
      lines.push(`  ✓ Address: ${chatState.addressSelected}`)
    } else {
      lines.push(`  ✗ Address: NOT selected — need to ask`)
    }

    if (chatState.couponOffered || cart.appliedCoupon) {
      if (cart.appliedCoupon) {
        lines.push(`  ✓ Coupon: ${cart.appliedCoupon.code} applied (-$${cart.discount().toFixed(2)})`)
      } else {
        lines.push(`  ✓ Coupon: Offered but declined`)
      }
    } else {
      lines.push(`  ✗ Coupon: NOT offered yet — offer when the moment feels right`)
    }

    lines.push(`  ✓ Payment: Visa ····4242 on file`)

    // Compute next action
    const missing = []
    if (!chatState.addressSelected) missing.push('shipping address')
    if (!chatState.couponOffered && !cart.appliedCoupon) missing.push('coupon offer')

    if (missing.length === 0) {
      lines.push(`\n  → ALL READY. Ask user to confirm. Say the final total.`)
    } else {
      lines.push(`\n  → MISSING: ${missing.join(', ')}`)
      lines.push(`  → NEXT: Ask about ${missing[0]}`)
    }

    lines.push(`  → User can: add/remove items, change shipping, change address, ask questions, apply coupon, confirm, cancel`)
  }

  // ─── User Profile ─────────────────────────────────────
  lines.push(`\n## Customer`)
  lines.push(`- ${user.user.name} | Gender: ${user.user.gender} | Shoe: ${user.user.shoeSize} | Clothing: ${user.user.clothingSize} | Bottom: ${user.user.bottomSize}`)
  lines.push(`- Style: ${user.user.stylePreference} | Colors: ${user.user.preferredColors?.join(', ')}`)

  // ─── Wishlist ─────────────────────────────────────────
  const wishlistItems = wishlist.items
  if (wishlistItems.length > 0) {
    const names = wishlistItems.map(id => products.find(p => p.id === id)?.name).filter(Boolean)
    lines.push(`- Wishlist: ${names.join(', ')}`)
  }

  return lines.join('\n')
}
