/**
 * AI Provider Configuration
 * Switch LLM by changing VITE_AI_PROVIDER env var: 'gemini' | 'openai' | 'anthropic'
 */
export const aiConfig = {
  provider: import.meta.env.VITE_AI_PROVIDER || 'gemini',
  models: {
    gemini: 'gemini-2.5-flash',
    openai: 'gpt-4o',
    anthropic: 'claude-sonnet-4-20250514',
  },
  temperature: 0.7,
  maxTokens: 1024,
  keys: {
    gemini: import.meta.env.VITE_GEMINI_KEY || '',
    openai: import.meta.env.VITE_OPENAI_KEY || '',
    anthropic: import.meta.env.VITE_ANTHROPIC_KEY || '',
  },
  elevenlabs: {
    key: import.meta.env.VITE_ELEVENLABS_KEY || '',
    voiceId: import.meta.env.VITE_ELEVENLABS_VOICE || '',
  },
}

/** Get the current provider's API key */
export function getApiKey() {
  return aiConfig.keys[aiConfig.provider]
}

/** Get the current model name */
export function getModel() {
  return aiConfig.models[aiConfig.provider]
}
