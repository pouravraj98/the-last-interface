/**
 * Chat Service — Public API
 * Orchestrates: context bridge → system prompt → AI provider → tool handlers → UI messages
 */
import { sendMessage, formatUserMessage, formatAssistantMessage } from '../ai/index'
import { buildSystemPrompt } from './systemPrompt'
import { tools } from './tools'
import { handleToolCall } from './toolHandlers'
import { useChatStore } from '../../stores/useChatStore'

/**
 * Send a chat message through the full pipeline
 * @param {string} text - User's message text
 * @param {{base64: string, mimeType: string}|null} image - Optional image
 * @returns {Promise<string>} - Combined AI text response (for TTS)
 */
export async function sendChatMessage(text, image = null, options = {}) {
  const store = useChatStore.getState()

  // 1. Add user message to UI (skip if hidden — used for auto-greet)
  if (!options.hidden) {
    store.addMessage({
      type: 'user',
      text,
      image: image ? `data:${image.mimeType || 'image/jpeg'};base64,${image.base64}` : null,
    })
  }

  // 2. Format and push to conversation history
  const userMsg = formatUserMessage(text, image)
  store.pushToHistory(userMsg)

  // 3. Show typing indicator
  store.setTyping(true)
  store.addMessage({ type: 'typing' })

  try {
    // 4. Build system prompt with live context
    const systemPrompt = buildSystemPrompt()

    // 5. Send to AI provider (more tokens for voice mode to be descriptive)
    const voiceEnabled = useChatStore.getState().voiceEnabled
    const history = useChatStore.getState().conversationHistory
    const response = await sendMessage(history, systemPrompt, tools, {
      maxTokens: voiceEnabled ? 2048 : 1024,
    })

    // 6. Push assistant response to history
    const assistantMsg = formatAssistantMessage(response.rawParts)
    store.pushToHistory(assistantMsg)

    // 7. Remove typing indicator
    useChatStore.getState().removeLastTyping()
    store.setTyping(false)

    // 8. Render text parts as AI messages
    let fullText = ''
    for (const text of response.textParts) {
      const trimmed = text.trim()
      if (trimmed) {
        useChatStore.getState().addMessage({ type: 'ai', text: trimmed })
        fullText += (fullText ? ' ' : '') + trimmed
      }
    }

    // 9. Handle tool calls + collect results for voice carousel
    const toolResults = []
    for (const toolCall of response.toolCalls) {
      const result = handleToolCall(toolCall)
      if (result) {
        useChatStore.getState().addMessage(result)
        toolResults.push(result)
      }
    }

    // 10. Split results: products go to showcase, non-products go to separate display
    const productToolResults = toolResults.filter(r =>
      r.type === 'productCard' || r.type === 'productCards' || r.type === 'productDetail'
    )
    const nonProductToolResults = toolResults.filter(r =>
      r.type !== 'productCard' && r.type !== 'productCards' && r.type !== 'productDetail'
    )
    if (productToolResults.length > 0) {
      useChatStore.getState().setLatestResults(productToolResults)
      // Clear non-product results when new products arrive (so cart update doesn't block showcase)
      useChatStore.getState().setLatestNonProductResults([])
    }
    if (nonProductToolResults.length > 0) {
      useChatStore.getState().setLatestNonProductResults(nonProductToolResults)
    }

    // 11. Fallback: if AI gave NO text with tool calls, generate conversational text
    // Works in BOTH text and voice mode — cards should never appear without words
    if (toolResults.length > 0 && fullText.length < 5) {
      let fallback = ''

      // Find what tools were called
      const types = toolResults.map(r => r.type)

      if (types.includes('cartUpdate')) {
        const added = toolResults.find(r => r.type === 'cartUpdate' && r.data?.action === 'added')
        const removed = toolResults.find(r => r.type === 'cartUpdate' && r.data?.action === 'removed')
        if (added?.data?.product) {
          const p = added.data.product
          const pair = p.category === 'footwear' ? 'a top' : p.category === 'tops' ? 'some bottoms' : p.category === 'dresses' ? 'shoes or a bag' : 'something to go with it'
          fallback = `Done, ${p.name} is in your cart! Want me to find ${pair} to match, or ready to check out?`
        } else if (removed?.data?.product) {
          fallback = `Removed the ${removed.data.product.name}. Anything else you want to change?`
        } else {
          fallback = 'Updated your cart!'
        }
      } else if (types.includes('allOrders')) {
        fallback = "Here's what's going on with your orders!"
      } else if (types.includes('orderStatus')) {
        const order = toolResults.find(r => r.type === 'orderStatus')?.data?.order
        fallback = order ? `Here's the latest on order ${order.id}!` : "Here's your order status!"
      } else if (types.includes('orderSummary')) {
        const summary = toolResults.find(r => r.type === 'orderSummary')?.data
        fallback = summary ? `Your total comes to $${summary.total.toFixed(2)}. Where should I send it?` : "Here's your order summary!"
      } else if (types.includes('couponApplied')) {
        const coupon = toolResults.find(r => r.type === 'couponApplied')?.data
        fallback = coupon ? `Nice, ${coupon.code} applied — you're saving $${coupon.discountAmount.toFixed(2)}!` : 'Coupon applied!'
      } else if (types.includes('savedAddresses')) {
        fallback = 'Which address works for you?'
      } else if (types.includes('addressCard')) {
        const addr = toolResults.find(r => r.type === 'addressCard')?.data?.address
        fallback = addr ? `Sending it to ${addr.label}! Ready to confirm?` : 'Got the address!'
      } else if (types.includes('addressSaved')) {
        fallback = 'Saved that address for you!'
      } else if (types.includes('paymentCard')) {
        fallback = "I'll put it on your Visa ending 4242. Say confirm when you're ready!"
      } else if (types.includes('confirmation')) {
        const conf = toolResults.find(r => r.type === 'confirmation')?.data
        fallback = conf ? `Order ${conf.orderId} confirmed! ${conf.estimatedDelivery ? `Arriving ${conf.estimatedDelivery}.` : ''} Enjoy!` : 'Order confirmed!'
      } else if (types.includes('reviewCard')) {
        fallback = "Here's what people are saying!"
      } else if (types.includes('shippingUpdated')) {
        const ship = toolResults.find(r => r.type === 'shippingUpdated')?.data
        fallback = ship ? `Switched to ${ship.method}!` : 'Shipping updated!'
      } else if (types.includes('productCard') || types.includes('productCards') || types.includes('productDetail')) {
        fallback = 'Check this out!'
      } else if (types.includes('notifyRestock')) {
        fallback = "I'll let you know as soon as it's back!"
      } else if (types.includes('wishlistUpdate')) {
        fallback = 'Saved to your wishlist!'
      } else if (types.includes('returnConfirmation')) {
        fallback = "Return started — you'll get your refund soon!"
      } else if (types.includes('exchangeConfirmation')) {
        fallback = "Exchange set up — new size on the way!"
      }

      if (fallback) {
        fullText = fallback
        useChatStore.getState().addMessage({ type: 'ai', text: fallback })
      }
    }

    return fullText
  } catch (err) {
    // Remove typing indicator on error
    useChatStore.getState().removeLastTyping()
    store.setTyping(false)

    // If it's a history format error, reset conversation to recover
    const isHistoryError = err.message?.includes('tool_call') || err.message?.includes('messages')
    if (isHistoryError) {
      useChatStore.getState().addMessage({
        type: 'ai',
        text: `I had a conversation sync issue. Let me reset — please try your question again.`,
      })
      // Clear only the conversation history, keep UI messages
      useChatStore.setState({ conversationHistory: [] })
    } else {
      useChatStore.getState().addMessage({
        type: 'ai',
        text: `Sorry, I ran into an issue. Please try again. (${err.message})`,
      })
    }
    console.error('Chat error:', err)
    return ''
  }
}

/**
 * Reset the conversation
 */
export function resetChat() {
  useChatStore.getState().resetConversation()
}
