/**
 * Tool Handlers — Maps AI tool calls to store mutations and UI messages
 * Runs OUTSIDE React — uses Zustand getState()/setState()
 */
import { products, getProductByIndex } from '../../data/products'
import { brand } from '../../config/brand'
import { getReviewsForProduct, getReviewSummary } from '../../data/reviews'
import { useCartStore } from '../../stores/useCartStore'
import { useWishlistStore } from '../../stores/useWishlistStore'
import { useOrderStore } from '../../stores/useOrderStore'
import { useUserStore } from '../../stores/useUserStore'
import { useChatStore } from '../../stores/useChatStore'

/**
 * Execute a tool call and return a chat message to display
 * @param {{name: string, args: Object}} tool
 * @returns {{type: string, data?: any} | null}
 */
export function handleToolCall(tool) {
  const { name, args } = tool

  // Get user preferences for auto-sizing
  const user = useUserStore.getState().user

  switch (name) {
    case 'show_product': {
      const product = getProductByIndex(args.product_index)
      if (!product) return null
      return { type: 'productCard', data: { product } }
    }

    case 'show_product_detail': {
      const product = getProductByIndex(args.product_index)
      if (!product) return null
      return { type: 'productDetail', data: { product } }
    }

    case 'show_products': {
      const prods = (args.product_indices || [])
        .map((i) => getProductByIndex(i))
        .filter(Boolean)
      if (prods.length === 0) return null
      return { type: 'productCards', data: { products: prods } }
    }

    case 'add_to_cart': {
      const product = getProductByIndex(args.product_index)
      if (!product) return null
      const color = args.color || product.colors[0]?.name || null
      useCartStore.getState().addItem(product, args.size, color)
      return { type: 'cartUpdate', data: { product, size: args.size, color, action: 'added' } }
    }

    case 'remove_from_cart': {
      useCartStore.getState().removeItem(args.product_id, args.size)
      return { type: 'cartUpdate', data: { productId: args.product_id, size: args.size, action: 'removed' } }
    }

    case 'show_order_summary': {
      const cart = useCartStore.getState()
      const shippingOpt = cart.shippingOption()
      return {
        type: 'orderSummary',
        data: {
          items: cart.items,
          subtotal: cart.subtotal(),
          discount: cart.discount(),
          couponCode: cart.appliedCoupon?.code || null,
          tax: cart.tax(),
          shipping: cart.shipping(),
          shippingMethod: shippingOpt?.name || 'Standard',
          shippingDescription: shippingOpt?.description || '5-7 business days',
          total: cart.total(),
        },
      }
    }

    case 'show_address': {
      const addresses = useUserStore.getState().addresses
      const addr = addresses.find((a) => a.label.toLowerCase() === args.type?.toLowerCase())
        || addresses.find((a) => a.label.toLowerCase().includes(args.type?.toLowerCase()))
        || addresses.find((a) => a.isDefault)
      if (!addr) return null
      useChatStore.getState().setAddressSelected(addr.label)
      return { type: 'addressCard', data: { address: addr } }
    }

    case 'show_payment': {
      const pm = useUserStore.getState().paymentMethods[0]
      if (!pm) return null
      return { type: 'paymentCard', data: { payment: pm } }
    }

    case 'process_order': {
      const cart = useCartStore.getState()
      const shippingOpt = cart.shippingOption()
      const items = cart.items.map(i => ({ name: i.product.name, size: i.size, image: i.product.image }))
      const total = cart.total()
      const couponCode = cart.appliedCoupon?.code || null
      const discount = cart.discount()
      const orderId = useOrderStore.getState().placeOrder(cart.items, 'addr_home', 'pm_1', cart.selectedShipping, cart.appliedCoupon)
      const order = useOrderStore.getState().getOrder(orderId)
      cart.clearCart()
      return {
        type: 'confirmation',
        data: {
          orderId,
          items,
          total,
          couponCode,
          discount,
          shippingMethod: shippingOpt?.name || 'Standard',
          estimatedDelivery: order?.estimatedDelivery || '',
        },
      }
    }

    case 'show_order_status': {
      const order = useOrderStore.getState().getOrder(args.order_id)
      if (!order) return null
      return { type: 'orderStatus', data: { order } }
    }

    case 'show_all_orders': {
      const orders = useOrderStore.getState().orders
      return { type: 'allOrders', data: { orders } }
    }

    case 'add_to_wishlist': {
      const product = getProductByIndex(args.product_index)
      if (!product) return null
      useWishlistStore.getState().addItem(product.id)
      return { type: 'wishlistUpdate', data: { product, action: 'added' } }
    }

    case 'navigate_to': {
      useChatStore.getState().setNavigateTo(args.path)
      return { type: 'navigation', data: { path: args.path } }
    }

    case 'highlight_product': {
      useChatStore.getState().highlightProduct(args.product_id)
      return null // No chat message needed
    }

    case 'show_reviews': {
      const product = getProductByIndex(args.product_index)
      if (!product) return null
      const reviewList = getReviewsForProduct(product.id)
      const summary = getReviewSummary(product.id)
      if (reviewList.length === 0) return { type: 'ai', text: `No reviews yet for the ${product.name}.` }
      return { type: 'reviewCard', data: { product, reviews: reviewList, summary } }
    }

    case 'initiate_return': {
      const order = useOrderStore.getState().getOrder(args.order_id)
      if (!order) return null
      const item = order.items.find((i) => i.name.toLowerCase().includes(args.item_name.toLowerCase()))
      if (!item) return null
      const reasonLabels = {
        doesnt_fit: "Doesn't fit",
        not_as_expected: 'Not as expected',
        changed_mind: 'Changed mind',
        defective: 'Defective/damaged',
        other: 'Other',
      }
      const returnId = `RET-${Math.floor(Math.random() * 9000) + 1000}`
      return {
        type: 'returnConfirmation',
        data: {
          returnId,
          orderId: args.order_id,
          item,
          reason: reasonLabels[args.reason] || args.reason,
          refundAmount: item.price * item.quantity,
          refundMethod: 'Original payment method (Visa ····4242)',
          estimatedRefund: '5-7 business days after item received',
        },
      }
    }

    case 'initiate_exchange': {
      const order = useOrderStore.getState().getOrder(args.order_id)
      if (!order) return null
      const item = order.items.find((i) => i.name.toLowerCase().includes(args.item_name.toLowerCase()))
      if (!item) return null
      const exchangeId = `EXC-${Math.floor(Math.random() * 9000) + 1000}`
      return {
        type: 'exchangeConfirmation',
        data: {
          exchangeId,
          orderId: args.order_id,
          item,
          newSize: args.new_size,
          newColor: args.new_color || item.color,
          estimatedDelivery: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        },
      }
    }

    case 'notify_restock': {
      const product = getProductByIndex(args.product_index)
      if (!product) return null
      useUserStore.getState().addNotify(product.id)
      return { type: 'notifyRestock', data: { product } }
    }

    case 'set_shipping': {
      const method = args.method || 'standard'
      useCartStore.getState().setShipping(method)
      useChatStore.getState().setShippingExplicitlySet(true)
      const opt = useCartStore.getState().shippingOption()
      const newShipping = useCartStore.getState().shipping()
      return {
        type: 'shippingUpdated',
        data: {
          method: opt?.name || 'Standard',
          cost: newShipping,
          description: opt?.description || '',
        },
      }
    }

    case 'apply_coupon': {
      const coupon = brand.coupons.find(c => c.code.toUpperCase() === args.code?.toUpperCase())
      if (!coupon) return { type: 'ai', text: `Sorry, "${args.code}" isn't a valid coupon code.` }
      const cart = useCartStore.getState()
      if (coupon.minOrder > 0 && cart.subtotal() < coupon.minOrder) {
        return { type: 'ai', text: `The ${coupon.code} code requires a minimum order of $${coupon.minOrder}. Your subtotal is $${cart.subtotal().toFixed(2)}.` }
      }
      if (coupon.firstOrderOnly && useOrderStore.getState().orders.length > 0) {
        return { type: 'ai', text: `The ${coupon.code} code is only valid for first-time orders. Let me try FORMA10 for 10% off instead.` }
      }
      cart.applyCoupon(coupon)
      useChatStore.getState().setCouponOffered(true)
      const discountAmount = cart.discount()
      return {
        type: 'couponApplied',
        data: {
          code: coupon.code,
          label: coupon.label,
          discountAmount,
          newTotal: cart.total(),
        },
      }
    }

    case 'show_saved_addresses': {
      const addresses = useUserStore.getState().addresses
      return { type: 'savedAddresses', data: { addresses } }
    }

    case 'save_address': {
      const addr = {
        label: args.label,
        name: args.name,
        line1: args.line1,
        city: args.city,
        state: args.state,
        zip: args.zip,
      }
      useUserStore.getState().addAddress(addr)
      return { type: 'addressSaved', data: { address: addr } }
    }

    default:
      console.warn(`Unknown tool: ${name}`)
      return null
  }
}
