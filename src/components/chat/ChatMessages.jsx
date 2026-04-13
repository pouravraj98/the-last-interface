import { useEffect, useRef } from 'react'
import { useChatStore } from '../../stores/useChatStore'
import { usePageContextStore } from '../../stores/usePageContextStore'
import { useCartStore } from '../../stores/useCartStore'
import ChatBubble from './ChatBubble'
import ContextBar from './ContextBar'

function getWelcome(pageCtx, cartCount) {
  const product = pageCtx.viewingProduct
  const category = pageCtx.viewingCategory
  const page = pageCtx.currentPage

  if (product) {
    return {
      text: `I see you're looking at the ${product.name}. Want to know about sizing, similar styles, or how to pair it?`,
      actions: [
        { label: `Tell me about ${product.name}`, icon: '👟' },
        { label: 'Find something similar', icon: '🔍' },
        { label: 'What goes well with this?', icon: '👔' },
      ],
    }
  }

  if (category) {
    return {
      text: `Browsing ${category}? I can help you narrow it down — what's the occasion, budget, or style you're going for?`,
      actions: [
        { label: `Best ${category} under $60`, icon: '💰' },
        { label: 'Something for everyday wear', icon: '☀️' },
        { label: 'Upload a photo to match', icon: '📸' },
      ],
    }
  }

  if (page === 'cart') {
    return {
      text: cartCount > 0
        ? `You have ${cartCount} item${cartCount > 1 ? 's' : ''} in your cart. Want to check out, or should I suggest something to complete the look?`
        : `Your cart is empty. Want me to help you find something?`,
      actions: cartCount > 0
        ? [
            { label: 'Let\'s check out', icon: '🛒' },
            { label: 'Suggest matching items', icon: '👔' },
            { label: 'Show me bestsellers', icon: '🔥' },
          ]
        : [
            { label: 'Show me bestsellers', icon: '🔥' },
            { label: 'I need outfit ideas', icon: '👔' },
          ],
    }
  }

  if (page === 'account' || page === 'orders') {
    return {
      text: `Need help with your account or orders? I can track a package or help with returns.`,
      actions: [
        { label: 'Track my order', icon: '📦' },
        { label: 'Show all my orders', icon: '📋' },
        { label: 'Back to shopping', icon: '🛍️' },
      ],
    }
  }

  // Default — homepage or other
  return {
    text: `Hey! I'm your FORMA stylist. I can find products, identify items from a photo, put together a look, or help you check out. What can I help with?`,
    actions: [
      { label: 'Show me bestsellers', icon: '🔥' },
      { label: 'I need outfit ideas', icon: '👔' },
      { label: 'Track my order', icon: '📦' },
      { label: 'Upload a photo to find similar', icon: '📸' },
    ],
  }
}

export default function ChatMessages({ onQuickAction }) {
  const messages = useChatStore((s) => s.messages)
  const pageCtx = usePageContextStore()
  const cartCount = useCartStore((s) => s.itemCount())
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const welcome = getWelcome(pageCtx, cartCount)

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
      <ContextBar />

      {messages.length === 0 && (
        <div className="py-6">
          {/* Welcome */}
          <div className="flex gap-3 mb-5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #c8a97e, #a8865a)' }}>
              <span className="text-white text-xs font-bold">F</span>
            </div>
            <div className="bg-stone-100 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[85%]">
              <p className="text-sm text-stone-800 leading-relaxed">
                {welcome.text}
              </p>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2 pl-11">
            {welcome.actions.map((action) => (
              <button
                key={action.label}
                onClick={() => onQuickAction?.(action.label)}
                className="text-xs px-3 py-2 rounded-full border border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300 transition-colors"
              >
                <span className="mr-1">{action.icon}</span> {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {messages.map((msg) => (
        <ChatBubble key={msg.id} message={msg} />
      ))}

      <div ref={endRef} />
    </div>
  )
}
