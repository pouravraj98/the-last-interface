import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChatStore } from '../../stores/useChatStore'
import { usePageContextStore } from '../../stores/usePageContextStore'
import { sendChatMessage } from '../../services/chat/index'
import { useVoice } from '../../hooks/useVoice'
import { isSTTSupported } from '../../services/stt'
import { stop as stopAllAudio } from '../../services/tts'
import ChatHeader from './ChatHeader'
import ChatMessages from './ChatMessages'
import ChatInput from './ChatInput'
import VoiceMode from './VoiceMode'

export default function ChatWidget() {
  const isOpen = useChatStore((s) => s.isOpen)
  const open = useChatStore((s) => s.open)
  const close = useChatStore((s) => s.close)
  const voiceMode = useChatStore((s) => s.voiceMode)
  const messages = useChatStore((s) => s.messages)
  const hasGreeted = useChatStore((s) => s.hasGreeted)
  const setHasGreeted = useChatStore((s) => s.setHasGreeted)
  const latestResults = useChatStore((s) => s.latestResults)
  const navigateTo = useChatStore((s) => s.navigateTo)
  const clearNavigateTo = useChatStore((s) => s.clearNavigateTo)
  const navigate = useNavigate()

  const voice = useVoice()

  // Fall back to text mode if browser doesn't support speech
  useEffect(() => {
    if (voiceMode && !isSTTSupported()) {
      useChatStore.getState().setVoiceMode(false)
    }
  }, [voiceMode])

  // Close = full reset. Fresh start every time chat reopens.
  useEffect(() => {
    if (!isOpen) {
      // Immediately kill all audio — direct call, no hooks
      stopAllAudio()
      voice.stopSpeaking()
      voice.stopListening()
      // Reset conversation so next open is fresh
      useChatStore.getState().resetConversation()
    }
  }, [isOpen])

  // Handle AI navigation requests — close chat when navigating so user sees the page
  useEffect(() => {
    if (navigateTo) {
      voice.stopSpeaking()
      voice.stopListening()
      close()
      navigate(navigateTo)
      clearNavigateTo()
    }
  }, [navigateTo, navigate, clearNavigateTo, close])

  // Auto-greet with voice when chat opens fresh
  useEffect(() => {
    if (isOpen && voiceMode && messages.length === 0 && !hasGreeted) {
      setHasGreeted(true)
      // Read context FRESH at this moment
      setTimeout(() => {
        const viewingProduct = usePageContextStore.getState().viewingProduct
        const category = usePageContextStore.getState().viewingCategory
        let greeting
        if (viewingProduct) {
          greeting = `Greet me briefly and tell me about the ${viewingProduct.name}`
        } else if (category) {
          greeting = `Greet me briefly. I'm browsing ${category}.`
        } else {
          greeting = `Greet me briefly and ask what I'm looking for.`
        }
        sendChatMessage(greeting, null, { hidden: true }).then((text) => {
          if (text) voice.speakText(text)
        })
      }, 300)
    }
  }, [isOpen, voiceMode, hasGreeted, messages.length])

  // Detect if we have product results (for split view width)
  const hasProductResults = latestResults.some(r =>
    r.type === 'productCard' || r.type === 'productCards' || r.type === 'productDetail'
  )

  // Lock body scroll when chat is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleSend = useCallback(async (text, image) => {
    if (!text?.trim() && !image) return
    const responseText = await sendChatMessage(text?.trim() || '', image || null)
    // Auto-speak AI response only in voice mode
    if (responseText && useChatStore.getState().voiceMode) {
      voice.speakText(responseText)
    }
  }, [voice.speakText])

  return (
    <>
      {/* Floating AI Bar (visible when chat is closed) */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[520px] transition-all duration-300 ${
          isOpen
            ? 'opacity-0 pointer-events-none translate-y-4'
            : 'opacity-100 translate-y-0'
        }`}
      >
        <div className="bg-stone-900 rounded-2xl shadow-chat overflow-hidden">
          {/* Top row: avatar + name + status */}
          <div
            className="flex items-center gap-3 px-5 pt-4 pb-3 cursor-pointer"
            onClick={open}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #c8a97e, #a8865a)' }}>
              <span className="text-white text-sm font-bold">F</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-white text-sm font-semibold">FORMA AI</span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  <span className="text-green-400 text-[11px] font-medium">Online</span>
                </span>
              </div>
              <p className="text-stone-400 text-xs mt-0.5 truncate">
                Find products, identify items from a photo, or get styled
              </p>
            </div>
          </div>

          {/* Search-style input */}
          <div className="px-4 pb-4">
            <div
              className="flex items-center gap-2.5 bg-stone-800 rounded-xl px-4 py-2.5 cursor-text"
              onClick={open}
            >
              <svg className="w-4 h-4 text-stone-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <span className="text-stone-500 text-sm">Ask me anything...</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat popup (visible when open) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={close} />

          {/* Chat window — width expands for voice+product split view */}
          <div className={`relative w-full h-[80vh] max-h-[600px] bg-white rounded-2xl shadow-chat flex flex-col overflow-hidden animate-slide-up transition-all duration-300 ${
            voiceMode && hasProductResults ? 'max-w-[900px]' : 'max-w-[680px]'
          }`}>
            <ChatHeader />

            {voiceMode ? (
              /* Voice Mode — full takeover */
              <VoiceMode voice={voice} onSend={handleSend} />
            ) : (
              /* Text Mode — standard chat */
              <>
                <ChatMessages onQuickAction={handleSend} />
                <ChatInput onSend={handleSend} voice={voice} />
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
