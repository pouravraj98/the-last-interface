/**
 * Gemini Provider Adapter
 * Translates between unified format and Gemini API format
 */
import { aiConfig } from '../../../config/ai'

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

/** Convert unified tools to Gemini functionDeclarations */
function convertTools(tools) {
  return [{
    functionDeclarations: tools.map((t) => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    })),
  }]
}

/** Convert unified message history to Gemini contents format */
function convertHistory(history) {
  return history.map((msg) => {
    if (msg.rawParts) {
      // Already in Gemini format (from a previous response)
      return msg.rawParts
    }

    const parts = []
    if (msg.image) {
      parts.push({
        inlineData: {
          mimeType: msg.image.mimeType || 'image/jpeg',
          data: msg.image.base64,
        },
      })
    }
    if (msg.content) {
      parts.push({ text: msg.content })
    }

    return {
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts,
    }
  })
}

/** Send message to Gemini API */
export async function sendMessage(history, systemPrompt, tools, config = {}) {
  const model = config.model || aiConfig.models.gemini
  const key = aiConfig.keys.gemini
  const url = `${API_URL}/${model}:generateContent?key=${key}`

  const body = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: convertHistory(history),
    generationConfig: {
      temperature: config.temperature ?? aiConfig.temperature,
      maxOutputTokens: config.maxTokens ?? aiConfig.maxTokens,
    },
  }

  if (tools && tools.length > 0) {
    body.tools = convertTools(tools)
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const candidate = data.candidates?.[0]
  const parts = candidate?.content?.parts || []

  // Normalize to unified format
  const textParts = []
  const toolCalls = []

  for (const part of parts) {
    if (part.text) textParts.push(part.text)
    if (part.functionCall) {
      toolCalls.push({
        name: part.functionCall.name,
        args: part.functionCall.args || {},
      })
    }
  }

  return {
    textParts,
    toolCalls,
    rawParts: { role: 'model', parts },
  }
}

/** Format a user message for Gemini history */
export function formatUserMessage(text, image = null) {
  const parts = []
  if (image) {
    parts.push({ inlineData: { mimeType: image.mimeType || 'image/jpeg', data: image.base64 } })
  }
  if (text) parts.push({ text })
  return { role: 'user', content: text, image, rawParts: { role: 'user', parts } }
}

/** Format an assistant response for history */
export function formatAssistantMessage(rawParts) {
  return { role: 'assistant', content: '', rawParts }
}
