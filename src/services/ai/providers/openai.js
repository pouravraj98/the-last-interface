/**
 * OpenAI Provider Adapter
 *
 * OpenAI has strict conversation history requirements:
 * 1. System message first
 * 2. When assistant returns tool_calls, the NEXT messages MUST be tool-role results
 * 3. Each tool_call needs a matching tool result with the same tool_call_id
 *
 * Our approach: store raw OpenAI messages in history so they replay exactly.
 */
import { aiConfig } from '../../../config/ai'

const API_URL = 'https://api.openai.com/v1/chat/completions'

/** Convert unified tools to OpenAI tools format */
function convertTools(tools) {
  return tools.map((t) => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }))
}

/**
 * Convert unified message history to OpenAI messages format
 * Each history entry can contain multiple raw OpenAI messages (e.g. assistant + tool results)
 */
function convertHistory(history, systemPrompt) {
  const messages = [{ role: 'system', content: systemPrompt }]

  for (const msg of history) {
    // If we stored raw OpenAI messages, replay them exactly
    if (msg._openaiRaw) {
      for (const rawMsg of msg._openaiRaw) {
        messages.push(rawMsg)
      }
      continue
    }

    // User messages
    if (msg.role === 'user') {
      if (msg.image) {
        messages.push({
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${msg.image.mimeType || 'image/jpeg'};base64,${msg.image.base64}`,
                detail: 'auto',
              },
            },
            { type: 'text', text: msg.content || 'What is in this image?' },
          ],
        })
      } else {
        messages.push({ role: 'user', content: msg.content })
      }
    } else if (msg.role === 'assistant' && !msg._openaiRaw) {
      // Plain assistant message (no tool calls)
      messages.push({ role: 'assistant', content: msg.content || '' })
    }
  }

  return messages
}

/** Send message to OpenAI API */
export async function sendMessage(history, systemPrompt, tools, config = {}) {
  const model = config.model || aiConfig.models.openai
  const key = aiConfig.keys.openai

  const body = {
    model,
    messages: convertHistory(history, systemPrompt),
    temperature: config.temperature ?? aiConfig.temperature,
    max_tokens: config.maxTokens ?? aiConfig.maxTokens,
  }

  if (tools && tools.length > 0) {
    body.tools = convertTools(tools)
    body.tool_choice = 'auto'
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const choice = data.choices?.[0]
  const message = choice?.message

  // Extract text and tool calls
  const textParts = message?.content ? [message.content] : []
  const toolCalls = (message?.tool_calls || []).map((tc) => ({
    name: tc.function.name,
    args: JSON.parse(tc.function.arguments || '{}'),
    _openaiId: tc.id,
  }))

  // Build raw OpenAI messages for history replay
  // This includes the assistant message AND tool result messages
  const rawMessages = []

  if (message?.tool_calls?.length > 0) {
    // Assistant message with tool_calls (must include tool_calls field)
    rawMessages.push({
      role: 'assistant',
      content: message.content || null,
      tool_calls: message.tool_calls,
    })
    // Tool result for each call — OpenAI requires these
    for (const tc of message.tool_calls) {
      rawMessages.push({
        role: 'tool',
        tool_call_id: tc.id,
        content: JSON.stringify({ success: true }),
      })
    }
  } else {
    // Plain assistant message (no tool calls)
    rawMessages.push({
      role: 'assistant',
      content: message?.content || '',
    })
  }

  return {
    textParts,
    toolCalls,
    rawParts: {
      role: 'assistant',
      content: message?.content || '',
      _openaiRaw: rawMessages,
    },
  }
}

/** Format a user message for OpenAI history */
export function formatUserMessage(text, image = null) {
  return { role: 'user', content: text, image }
}

/** Format an assistant response for history */
export function formatAssistantMessage(rawParts) {
  return {
    role: 'assistant',
    content: rawParts?.content || '',
    _openaiRaw: rawParts?._openaiRaw || null,
  }
}
