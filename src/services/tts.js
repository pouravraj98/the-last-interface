/**
 * Text-to-Speech Service
 * Priority: ElevenLabs → OpenAI TTS → Browser fallback
 */
import { aiConfig } from '../config/ai'

let currentAudio = null
let playing = false

export async function speak(text, options = {}) {
  if (!text?.trim()) return
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
      model_id: 'eleven_flash_v2_5',
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.3 },
    }),
  })

  if (!res.ok) throw new Error(`ElevenLabs ${res.status}`)

  const blob = await res.blob()
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

  if (!res.ok) throw new Error(`OpenAI TTS ${res.status}`)

  const blob = await res.blob()
  return playBlob(blob)
}

/** Play an audio blob */
function playBlob(blob) {
  const url = URL.createObjectURL(blob)
  return new Promise((resolve) => {
    currentAudio = new Audio(url)
    currentAudio.onended = () => {
      playing = false
      URL.revokeObjectURL(url)
      currentAudio = null
      resolve()
    }
    currentAudio.onerror = () => {
      playing = false
      URL.revokeObjectURL(url)
      currentAudio = null
      resolve()
    }
    currentAudio.play().catch(() => {
      playing = false
      resolve()
    })
  })
}

/** Browser SpeechSynthesis fallback */
function speakBrowser(text) {
  if (!window.speechSynthesis) return Promise.resolve()
  playing = true
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.onend = () => { playing = false; resolve() }
    utterance.onerror = () => { playing = false; resolve() }
    window.speechSynthesis.speak(utterance)
  })
}

export function stop() {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    currentAudio = null
  }
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
  playing = false
}

export function isPlaying() {
  return playing
}
