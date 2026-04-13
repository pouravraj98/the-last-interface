import { useChatStore } from '../../stores/useChatStore'
import { resetChat } from '../../services/chat/index'
import { getProviderName } from '../../services/ai/index'
import { stop as stopTTS } from '../../services/tts'

export default function ChatHeader() {
  const close = useChatStore((s) => s.close)
  const voiceMode = useChatStore((s) => s.voiceMode)
  const setVoiceMode = useChatStore((s) => s.setVoiceMode)

  function handleModeSwitch() {
    stopTTS()
    // When switching to text, disable voice so pending speakText calls won't play
    if (voiceMode) {
      useChatStore.getState().setSpeaking(false)
      useChatStore.getState().setListening(false)
    }
    setVoiceMode(!voiceMode)
  }

  function handleReset() {
    stopTTS()
    resetChat()
  }

  function handleClose() {
    stopTTS()
    close()
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 shrink-0">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c8a97e, #a8865a)' }}>
          <span className="text-white text-xs font-bold">F</span>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-stone-900">FORMA AI</h3>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
            <span className="text-[10px] text-stone-400 uppercase tracking-wider">
              Online · {getProviderName()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Mode switch */}
        <button
          onClick={handleModeSwitch}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
            voiceMode
              ? 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              : 'bg-accent-50 text-accent-600 hover:bg-accent-100'
          }`}
        >
          {voiceMode ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
              </svg>
              Text
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
              </svg>
              Voice
            </>
          )}
        </button>

        {/* Reset */}
        <button
          onClick={handleReset}
          className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors"
          title="Reset conversation"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
          </svg>
        </button>

        {/* Close */}
        <button
          onClick={handleClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
