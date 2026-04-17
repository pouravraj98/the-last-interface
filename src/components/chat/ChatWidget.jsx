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
          greeting = `Say hi casually about the ${viewingProduct.name} I'm looking at and SHOW it using show_product_detail tool. One friendly sentence plus the tool call.`
        } else if (category) {
          greeting = `Say hi casually — I'm browsing ${category}. One sentence, friendly.`
        } else {
          greeting = `Say hi like a friend walking up in a store. One short warm sentence. Don't list what you can do.`
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
      {/* Floating AI Bar — Futuristic with border beam */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[520px] transition-all duration-500 ${
          isOpen
            ? 'opacity-0 pointer-events-none translate-y-4 scale-95'
            : 'opacity-100 translate-y-0 scale-100'
        }`}
      >
        {/* Outer glow */}
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-accent-400/20 via-transparent to-accent-400/20 blur-sm" />

        {/* Border beam container */}
        <div className="relative rounded-2xl overflow-hidden">
          {/* Animated border beam */}
          <div className="absolute inset-0 rounded-2xl" style={{ padding: '1px' }}>
            <div
              className="absolute w-20 h-20 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(224,125,75,0.6) 0%, transparent 70%)',
                animation: 'borderBeam 4s linear infinite',
                top: '-10px',
                left: '-10px',
              }}
            />
          </div>

          {/* Main content */}
          <div className="relative bg-stone-950/95 backdrop-blur-xl rounded-2xl border border-stone-800/50">
            {/* Top row: avatar + name + status */}
            <div
              className="flex items-center gap-3 px-5 pt-4 pb-3 cursor-pointer group"
              onClick={open}
            >
              {/* Animated avatar with glow */}
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-accent-400/40 to-amber-400/40 blur-sm opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c8a97e, #a8865a)' }}>
                  <span className="text-white text-sm font-bold">F</span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-semibold">FORMA AI</span>
                  <span className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                    </span>
                    <span className="text-green-400 text-[11px] font-medium">Online</span>
                  </span>
                </div>
                <p className="text-stone-400 text-xs mt-0.5 truncate">
                  Find products, identify items from a photo, or get styled
                </p>
              </div>

              {/* Mic icon hint */}
              <div className="w-8 h-8 rounded-full bg-stone-800/50 flex items-center justify-center group-hover:bg-accent-400/20 transition-colors">
                <svg className="w-4 h-4 text-stone-500 group-hover:text-accent-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                </svg>
              </div>
            </div>

            {/* Search input with subtle gradient border */}
            <div className="px-4 pb-4">
              <div
                className="flex items-center gap-2.5 bg-stone-900/80 border border-stone-700/50 rounded-xl px-4 py-2.5 cursor-text hover:border-stone-600/50 transition-colors group"
                onClick={open}
              >
                <svg className="w-4 h-4 text-stone-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <span className="text-stone-500 text-sm">Ask me anything...</span>
                <span className="ml-auto text-[10px] text-stone-600 border border-stone-700 rounded px-1.5 py-0.5">⌘K</span>
              </div>
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
