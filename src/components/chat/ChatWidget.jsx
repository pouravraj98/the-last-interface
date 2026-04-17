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
import { BorderBeam } from 'border-beam'

export default function ChatWidget() {
  const isOpen = useChatStore((s) => s.isOpen)
  const open = useChatStore((s) => s.open)
  const close = useChatStore((s) => s.close)
  const compactBar = useChatStore((s) => s.compactBar)
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
      {/* Gradient def for sparkle icon */}
      <svg className="absolute w-0 h-0">
        <defs>
          <linearGradient id="sparkleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
      </svg>

      {/* Floating AI Bar — toggleable between compact and expanded */}
      <div
        className={`fixed bottom-16 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
          compactBar ? 'w-[90%] max-w-[480px]' : 'w-[90%] max-w-[520px]'
        } ${
          isOpen
            ? 'opacity-0 pointer-events-none translate-y-4 scale-95'
            : 'opacity-100 translate-y-0 scale-100'
        }`}
      >
        <BorderBeam size={compactBar ? 'sm' : 'md'} colorVariant="colorful" duration={2.5} strength={0.6}>
          <div className="bg-stone-950/95 backdrop-blur-xl rounded-2xl">
            {/* Top row — always visible */}
            <div
              className="flex items-center gap-3 px-4 py-3 cursor-pointer group"
              onClick={open}
            >
              {/* AI icon — no box, just gradient sparkle */}
              <svg className="w-8 h-8 shrink-0" viewBox="0 0 24 24" fill="url(#sparkleGrad)" stroke="none">
                <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
              </svg>

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
                {compactBar ? (
                  <p className="text-stone-500 text-xs mt-0.5">Ask me anything</p>
                ) : (
                  <p className="text-stone-400 text-xs mt-0.5 truncate">Find products, identify items from a photo, or get styled</p>
                )}
              </div>

              {/* Arrow / mic icon — no box */}
              {compactBar ? (
                <svg className="w-5 h-5 text-stone-500 group-hover:text-stone-300 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-stone-500 group-hover:text-stone-300 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                </svg>
              )}
            </div>

            {/* Search input — only in expanded mode */}
            {!compactBar && (
              <div className="px-4 pb-3">
                <div
                  className="flex items-center gap-2.5 bg-stone-900/80 border border-stone-700/50 rounded-xl px-4 py-2.5 cursor-text hover:border-stone-600/50 transition-colors"
                  onClick={open}
                >
                  <svg className="w-4 h-4 text-stone-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                  <span className="text-stone-500 text-sm">Ask me anything...</span>
                  <span className="ml-auto text-[10px] text-stone-600 border border-stone-700 rounded px-1.5 py-0.5">⌘K</span>
                </div>
              </div>
            )}
          </div>
        </BorderBeam>
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
