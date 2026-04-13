import { useState, useRef } from 'react'
import { useChatStore } from '../../stores/useChatStore'
import VoiceIndicator from './VoiceIndicator'

export default function ChatInput({ onSend, voice }) {
  const [text, setText] = useState('')
  const isTyping = useChatStore((s) => s.isTyping)
  const fileInputRef = useRef(null)

  const { isListening, isSpeaking, interimTranscript, isSupported: voiceSupported, startListening, stopListening } = voice || {}

  function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim() || isTyping) return
    onSend(text.trim())
    setText('')
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      const [header, base64] = dataUrl.split(',')
      const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg'
      onSend('I uploaded this image. Can you identify what product this is and find similar items?', { base64, mimeType })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function handleMicClick() {
    if (isListening) {
      stopListening?.()
    } else {
      startListening?.((transcript) => {
        onSend(transcript)
      })
    }
  }

  return (
    <div className="border-t border-stone-100 shrink-0">
      {/* Voice indicator (shown when listening or speaking) */}
      {(isListening || isSpeaking) && (
        <VoiceIndicator
          isListening={isListening}
          isSpeaking={isSpeaking}
          interimTranscript={interimTranscript}
        />
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-3">
        {/* Image upload */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-9 h-9 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-colors shrink-0"
          title="Upload image"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
          </svg>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Text input */}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={isListening ? 'Listening...' : 'Type a message...'}
          disabled={isTyping || isListening}
          className="flex-1 text-sm bg-stone-50 rounded-full px-4 py-2.5 border-none outline-none placeholder:text-stone-400 disabled:opacity-50"
        />

        {/* Mic button */}
        {voiceSupported && (
          <button
            type="button"
            onClick={handleMicClick}
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
              isListening
                ? 'bg-red-50 text-red-500 animate-pulse-ring'
                : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'
            }`}
            title={isListening ? 'Stop listening' : 'Voice input'}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
            </svg>
          </button>
        )}

        {/* Send */}
        <button
          type="submit"
          disabled={!text.trim() || isTyping}
          className="w-9 h-9 rounded-full bg-stone-900 text-white flex items-center justify-center shrink-0 disabled:opacity-30 hover:bg-stone-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
          </svg>
        </button>
      </form>
    </div>
  )
}
