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
    }
    if (nonProductToolResults.length > 0) {
      useChatStore.getState().setLatestNonProductResults(nonProductToolResults)
    }

    // 11. Fallback: if voice mode and AI showed products but gave no/minimal text, generate spoken description
    if (voiceEnabled && toolResults.length > 0 && fullText.length < 20) {
      const productResults = toolResults.filter(r =>
        r.type === 'productCard' || r.type === 'productCards' || r.type === 'productDetail'
      )
      if (productResults.length > 0) {
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
