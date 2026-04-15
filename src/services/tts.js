/**
 * Text-to-Speech Service
 * Priority: ElevenLabs → OpenAI TTS → Browser fallback
 * All audio tracked for guaranteed cleanup on stop()
 */
import { aiConfig } from '../config/ai'

// Track ALL active audio elements so stop() kills everything
const activeAudios = new Set()
let playing = false
let currentResolve = null

export async function speak(text, options = {}) {
  if (!text?.trim()) return

  // ALWAYS stop everything before starting new speech
  stop()

  // Try ElevenLabs first
  if (aiConfig.elevenlabs.key && aiConfig.elevenlabs.voiceId) {
    try {
      return await speakElevenLabs(text)
    } catch (e) {
      console.warn('ElevenLabs failed, trying OpenAI TTS:', e)
    }
  }

  // Try OpenAI TTS second
  if (aiConfig.keys.openai) {
    try {
      return await speakOpenAI(text)
    } catch (e) {
      console.warn('OpenAI TTS failed, falling back to browser:', e)
    }
  }

  // Browser fallback (last resort)
  return speakBrowser(text)
}

/** ElevenLabs TTS */
async function speakElevenLabs(text) {
  const { key, voiceId } = aiConfig.elevenlabs
  playing = true

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'xi-api-key': key },
    body: JSON.stringify({
      text,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: { stability: 0.5, similarity_boost: 0.85, style: 0.4 },
    }),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`ElevenLabs ${res.status}: ${errText.substring(0, 100)}`)
  }

  const blob = await res.blob()
  // Verify it's actual audio, not an error response
  if (blob.size < 100) throw new Error('ElevenLabs returned empty/tiny response')
  return playBlob(blob)
}

/** OpenAI TTS */
async function speakOpenAI(text) {
  playing = true

  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${aiConfig.keys.openai}`,
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: text,
      voice: 'shimmer',
      response_format: 'opus',
      speed: 1.05,
    }),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`OpenAI TTS ${res.status}: ${errText.substring(0, 100)}`)
  }

  const blob = await res.blob()
  if (blob.size < 100) throw new Error('OpenAI TTS returned empty response')
  return playBlob(blob)
}

/** Play an audio blob — tracked for cleanup */
function playBlob(blob) {
  const url = URL.createObjectURL(blob)
  const audio = new Audio(url)

  // Track this audio element
  activeAudios.add(audio)

  return new Promise((resolve) => {
    currentResolve = resolve

    const cleanup = () => {
      playing = false
      activeAudios.delete(audio)
      URL.revokeObjectURL(url)
      currentResolve = null
      resolve()
    }

    audio.onended = cleanup
    audio.onerror = cleanup
    audio.play().catch(cleanup)
  })
}

/** Browser SpeechSynthesis fallback */
function speakBrowser(text) {
  if (!window.speechSynthesis) return Promise.resolve()
  playing = true
  return new Promise((resolve) => {
    currentResolve = resolve
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.onend = () => { playing = false; currentResolve = null; resolve() }
    utterance.onerror = () => { playing = false; currentResolve = null; resolve() }
    window.speechSynthesis.speak(utterance)
  })
}

/** Stop ALL audio immediately — no orphaned audio elements */
export function stop() {
  // Kill every tracked audio element
  for (const audio of activeAudios) {
    try {
      audio.pause()
      audio.currentTime = 0
      audio.src = ''
    } catch (e) {}
  }
  activeAudios.clear()

  // Kill browser speech
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }

  // Resolve any pending promise so speakText doesn't hang
  if (currentResolve) {
    currentResolve()
    currentResolve = null
  }

  playing = false
}

export function isPlaying() {
  return playing
}
