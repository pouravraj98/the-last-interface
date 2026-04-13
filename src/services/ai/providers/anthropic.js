/**
 * Anthropic (Claude) Provider Adapter
 * Uses Vite dev proxy at /api/anthropic to avoid CORS
 */
import { aiConfig } from '../../../config/ai'

// In dev: proxied via vite.config.js. In prod: use a Cloudflare Worker
const API_URL = '/api/anthropic/v1/messages'

/** Convert unified tools to Claude tools format */
function convertTools(tools) {
  return tools.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.parameters,
  }))
}

/** Convert unified message history to Claude messages format */
function convertHistory(history) {
  return history.filter((m) => m.role !== 'system').map((msg) => {
    if (msg.rawParts?._anthropic) {
      return msg.rawParts._anthropic
    }

    if (msg.role === 'user') {
      const content = []
      if (msg.image) {
        content.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: msg.image.mimeType || 'image/jpeg',
            data: msg.image.base64,
          },
        })
      }
      content.push({ type: 'text', text: msg.content || '' })
      return { role: 'user', content }
    }

    return { role: 'assistant', content: msg.content || '' }
  })
}

/** Send message to Claude API */
export async function sendMessage(history, systemPrompt, tools, config = {}) {
  const model = config.model || aiConfig.models.anthropic
  const key = aiConfig.keys.anthropic

  const body = {
    model,
    max_tokens: config.maxTokens ?? aiConfig.maxTokens,
    system: systemPrompt,
    messages: convertHistory(history),
  }

  if (tools && tools.length > 0) {
    body.tools = convertTools(tools)
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Anthropic API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const content = data.content || []

  // Normalize to unified format
  const textParts = []
  const toolCalls = []

  for (const block of content) {
    if (block.type === 'text') textParts.push(block.text)
    if (block.type === 'tool_use') {
      toolCalls.push({
        name: block.name,
        args: block.input || {},
      })
    }
  }

  return {
    textParts,
    toolCalls,
    rawParts: { role: 'assistant', content: data.content, _anthropic: { role: 'assistant', content: data.content } },
  }
}

/** Format a user message for Claude history */
export function formatUserMessage(text, image = null) {
  return { role: 'user', content: text, image }
}

/** Format an assistant response for history */
export function formatAssistantMessage(rawParts) {
  return { role: 'assistant', content: '', rawParts }
}
