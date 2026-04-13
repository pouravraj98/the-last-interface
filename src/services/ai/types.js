/**
 * Unified AI message/tool/response types
 * All providers normalize to and from these formats
 */

/**
 * @typedef {Object} UnifiedMessage
 * @property {'user'|'assistant'|'system'} role
 * @property {string} content
 * @property {{base64: string, mimeType: string}|null} [image]
 * @property {Array} [rawParts] - Provider-specific parts for history
 */

/**
 * @typedef {Object} UnifiedToolCall
 * @property {string} name
 * @property {Object} args
 */

/**
 * @typedef {Object} UnifiedResponse
 * @property {string[]} textParts - Text segments from the response
 * @property {UnifiedToolCall[]} toolCalls - Tool/function calls
 * @property {*} rawParts - Provider-specific raw response (for conversation history)
 */

/**
 * @typedef {Object} UnifiedTool
 * @property {string} name
 * @property {string} description
 * @property {Object} parameters - JSON Schema for parameters
 */

/**
 * Create a user message in unified format
 */
export function createUserMessage(text, image = null) {
  return { role: 'user', content: text, image }
}

/**
 * Create an assistant message from raw provider parts
 */
export function createAssistantMessage(content, rawParts = null) {
  return { role: 'assistant', content, rawParts }
}
