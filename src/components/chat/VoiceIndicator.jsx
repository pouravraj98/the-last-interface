/**
 * Voice Indicator — Waveform animation + transcript display
 */
export default function VoiceIndicator({ isListening, isSpeaking, interimTranscript }) {
  if (!isListening && !isSpeaking) return null

  return (
    <div className="flex items-center gap-3 px-4 py-2">
      {/* Waveform bars */}
      <div className="flex items-center gap-[3px] h-7">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`w-[3px] rounded-full transition-all ${
              isListening ? 'bg-red-400' : 'bg-accent-400'
            }`}
            style={{
              height: isListening || isSpeaking ? undefined : '8px',
              animation: (isListening || isSpeaking)
                ? `waveform 1.2s ease-in-out infinite ${i * 0.15}s`
                : 'none',
            }}
          />
        ))}
      </div>

      {/* Status text */}
      <div className="flex-1 min-w-0">
        {isListening && (
          <>
            <p className="text-xs font-medium text-red-500">Listening...</p>
            {interimTranscript && (
              <p className="text-sm text-stone-600 truncate italic mt-0.5">{interimTranscript}</p>
            )}
          </>
        )}
        {isSpeaking && !isListening && (
          <p className="text-xs font-medium text-accent-500">Speaking...</p>
        )}
      </div>

      {/* Stop button */}
      {isListening && (
        <div className="w-6 h-6 rounded-full bg-red-400 animate-pulse-ring" />
      )}
    </div>
  )
}
