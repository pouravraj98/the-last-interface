/**
 * AI Service — Provider Router
 * Picks the right provider based on VITE_AI_PROVIDER config
 * Exposes a unified interface regardless of which LLM is behind it
 */
import { aiConfig } from '../../config/ai'
import * as gemini from './providers/gemini'
import * as openai from './providers/openai'
import * as anthropic from './providers/anthropic'

const providers = { gemini, openai, anthropic }

function getProvider() {
  const provider = providers[aiConfig.provider]
  if (!provider) {
    throw new Error(`Unknown AI provider: "${aiConfig.provider}". Valid: gemini, openai, anthropic`)
  }
  return provider
}

/**
 * Send a message to the configured AI provider
 * @param {Array} history - Conversation history in unified format
 * @param {string} systemPrompt - System prompt text
 * @param {Array} tools - Unified tool definitions
 * @param {Object} [config] - Optional overrides (model, temperature, maxTokens)
 * @returns {Promise<{textParts: string[], toolCalls: Array, rawParts: *}>}
 */
export async function sendMessage(history, systemPrompt, tools, config = {}) {
  const provider = getProvider()
  return provider.sendMessage(history, systemPrompt, tools, config)
}

/**
 * Create a formatted user message for the current provider's history
 */
export function formatUserMessage(text, image = null) {
  const provider = getProvider()
  return provider.formatUserMessage(text, image)
}

/**
 * Create a formatted assistant message for the current provider's history
 */
export function formatAssistantMessage(rawParts) {
  const provider = getProvider()
  return provider.formatAssistantMessage(rawParts)
}

/** Get current provider name */
export function getProviderName() {
  return aiConfig.provider
}
