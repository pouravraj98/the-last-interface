import { useChatStore } from '../../stores/useChatStore'
import { usePageContextStore } from '../../stores/usePageContextStore'
import { sendChatMessage } from '../../services/chat/index'
import { stop as stopTTS } from '../../services/tts'

export default function AskAiPill({ product }) {
  const open = useChatStore((s) => s.open)
  const setViewingProduct = usePageContextStore((s) => s.setViewingProduct)

  function handleClick(e) {
    e.preventDefault()
    e.stopPropagation()
    // Stop any ongoing audio
    stopTTS()
    // Fresh start — clear old conversation + results
    useChatStore.getState().resetConversation()
    // Set new product context
    setViewingProduct(product)
    open()
    // Send message after context is set
    setTimeout(() => {
      sendChatMessage(`Tell me about the ${product.name}`)
    }, 200)
  }

  return (
    <button
      onClick={handleClick}
      className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full text-[11px] font-semibold text-white bg-stone-900/90 backdrop-blur-sm opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 hover:bg-stone-800 flex items-center gap-1.5 shadow-lg"
    >
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
      </svg>
      Ask AI
    </button>
  )
}
