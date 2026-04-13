/**
 * Voice Hook — Orchestrates STT + TTS with interruption handling
 */
import { useState, useRef, useCallback, useEffect } from 'react'
import { createSTTSession, isSTTSupported } from '../services/stt'
import { speak, stop as stopTTS, isPlaying } from '../services/tts'
import { useChatStore } from '../stores/useChatStore'

export function useVoice() {
  const voiceEnabled = useChatStore((s) => s.voiceEnabled)
  const setVoiceEnabled = useChatStore((s) => s.setVoiceEnabled)
  const setListening = useChatStore((s) => s.setListening)
  const setSpeaking = useChatStore((s) => s.setSpeaking)
  const isListening = useChatStore((s) => s.isListening)
  const isSpeaking = useChatStore((s) => s.isSpeaking)

  const [interimTranscript, setInterimTranscript] = useState('')
  const sttRef = useRef(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      sttRef.current?.abort()
      stopTTS()
    }
  }, [])

  const startListening = useCallback((onResult) => {
    if (!isSTTSupported()) return

    // If AI is speaking, stop it first (interruption)
    if (isPlaying()) {
      stopTTS()
      setSpeaking(false)
    }

    const session = createSTTSession()
    sttRef.current = session

    session.onInterim((text) => {
      setInterimTranscript(text)
    })

    session.onFinal((text) => {
      setInterimTranscript('')
      setListening(false)
      if (text.trim() && onResult) {
        onResult(text.trim())
      }
    })

    session.onError((err) => {
      console.warn('STT error:', err)
      setInterimTranscript('')
      setListening(false)
    })

    session.onEnd(() => {
      setListening(false)
      setInterimTranscript('')
    })

    setListening(true)
    session.start()
  }, [setListening, setSpeaking])

  const stopListening = useCallback(() => {
    sttRef.current?.stop()
    setListening(false)
    setInterimTranscript('')
  }, [setListening])

  const speakText = useCallback(async (text) => {
    if (!voiceEnabled || !text?.trim()) return
    setSpeaking(true)
    await speak(text)
    setSpeaking(false)
  }, [voiceEnabled, setSpeaking])

  const stopSpeaking = useCallback(() => {
    stopTTS()
    setSpeaking(false)
  }, [setSpeaking])

  const toggleVoice = useCallback(() => {
    const next = !voiceEnabled
    setVoiceEnabled(next)
    if (!next) {
      stopTTS()
      setSpeaking(false)
    }
  }, [voiceEnabled, setVoiceEnabled, setSpeaking])

  return {
    voiceEnabled,
    isListening,
    isSpeaking,
    interimTranscript,
    isSupported: isSTTSupported(),
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
    toggleVoice,
  }
}
