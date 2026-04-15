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
    store.addMessage({ type: 'user', text, image: image ? true : false })
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

    // 11. Fallback: if voice mode and AI gave NO text at all, generate spoken description
    const isVoice = useChatStore.getState().voiceMode
    if (isVoice && toolResults.length > 0 && fullText.length < 5) {
      // Cart update fallback
      const cartUpdate = toolResults.find(r => r.type === 'cartUpdate' && r.data?.action === 'added')
      if (cartUpdate?.data?.product) {
        const p = cartUpdate.data.product
        const category = p.category
        const pairSuggestion = category === 'footwear' ? 'a top to go with those'
          : category === 'tops' ? 'some bottoms to complete the look'
          : category === 'dresses' ? 'shoes or a bag to match'
          : category === 'bottoms' ? 'a shirt to pair with those'
          : 'anything else'
        fullText = `Done! I've added the ${p.name} in size ${cartUpdate.data.size} to your cart. Want me to suggest ${pairSuggestion}, or are you ready to check out?`
        useChatStore.getState().addMessage({ type: 'ai', text: fullText })
      }

      // Product results fallback
      const productResults = toolResults.filter(r =>
        r.type === 'productCard' || r.type === 'productCards' || r.type === 'productDetail'
      )
      if (!cartUpdate && productResults.length > 0) {
        const products = []
        for (const r of productResults) {
          if (r.type === 'productCards' && r.data.products) products.push(...r.data.products)
          else if (r.data?.product) products.push(r.data.product)
        }
        if (products.length > 0) {
          const desc = products.length === 1
            ? `Here's what I found — the ${products[0].name} at ${products[0].price} dollars. ${products[0].description} Want to know more or add it to your cart?`
            : `I found ${products.length} options for you. ${products.slice(0, 3).map(p => `The ${p.name} at ${p.price} dollars`).join(', and ')}. Which one catches your eye?`
          fullText = desc
          useChatStore.getState().addMessage({ type: 'ai', text: desc })
        }
      }

      // Checkout flow fallbacks — speak through each step
      if (!cartUpdate && productResults.length === 0) {
        const orderSummary = toolResults.find(r => r.type === 'orderSummary')
        const addressCard = toolResults.find(r => r.type === 'addressCard')
        const paymentCard = toolResults.find(r => r.type === 'paymentCard')
        const confirmation = toolResults.find(r => r.type === 'confirmation')
        const couponApplied = toolResults.find(r => r.type === 'couponApplied')
        const savedAddresses = toolResults.find(r => r.type === 'savedAddresses')

        if (couponApplied?.data) {
          fullText = `Great news! I've applied ${couponApplied.data.code} and you're saving ${couponApplied.data.discountAmount.toFixed(0)} dollars. Your new total is ${couponApplied.data.newTotal.toFixed(0)} dollars.`
          useChatStore.getState().addMessage({ type: 'ai', text: fullText })
        } else if (orderSummary?.data) {
          fullText = `Your order total is ${orderSummary.data.total.toFixed(0)} dollars. Where should I ship this?`
          useChatStore.getState().addMessage({ type: 'ai', text: fullText })
        } else if (savedAddresses?.data) {
          fullText = `I have your saved addresses. Which one should I ship to?`
          useChatStore.getState().addMessage({ type: 'ai', text: fullText })
        } else if (addressCard?.data) {
          fullText = `Shipping to ${addressCard.data.address.label}. I'll charge your Visa ending 4242. Ready to confirm?`
          useChatStore.getState().addMessage({ type: 'ai', text: fullText })
        } else if (paymentCard?.data) {
          fullText = `Charging your Visa ending 4242. Say confirm to place the order.`
          useChatStore.getState().addMessage({ type: 'ai', text: fullText })
        } else if (confirmation?.data) {
          fullText = `Your order ${confirmation.data.orderId} is confirmed! ${confirmation.data.estimatedDelivery ? `Arriving ${confirmation.data.estimatedDelivery}.` : ''} Thanks for shopping with FORMA!`
          useChatStore.getState().addMessage({ type: 'ai', text: fullText })
        }
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
