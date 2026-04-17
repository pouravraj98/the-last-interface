import ShowcaseWidgetHeader from './ShowcaseWidgetHeader'
import ShowcaseVoiceOrb from './ShowcaseVoiceOrb'
import Orb from './Orb'
import AgentOrb from './AgentOrb'

/**
 * Voice widget — 5 preset variants.
 *  - 'classic'         — original orb + header (idle/listening/speaking/processing)
 *  - 'react-bits-orb'  — WebGL Orb (hue/hoverIntensity/rotate/forceHover)
 *  - 'transcript'      — classic orb + live transcript caption
 *  - 'waveform'        — audio bars (no orb)
 *  - 'minimal'         — small orb, no header, centered on surface
 */
export default function ShowcaseVoiceWidget({
  theme = 'light',
  variant = 'classic',
  orbState = 'processing',
  name = 'FORMA AI',
  status = 'ONLINE · OPENAI',
  orb = {},              // { hue, hoverIntensity, rotateOnHover, forceHoverState, backgroundColor }
  transcript = "Let me pull a few clean white sneakers in your size — one sec.",
}) {
  const isDark = theme === 'dark'
  const surface = isDark ? 'bg-stone-950' : 'bg-white'
  const statusColor = isDark ? 'text-stone-500' : 'text-stone-400'
  const transcriptBg = isDark ? 'bg-stone-900/80 text-stone-200 border-stone-800' : 'bg-stone-50 text-stone-700 border-stone-100'

  const showHeader = variant !== 'minimal'

  return (
    <div className={`${surface} rounded-2xl shadow-chat overflow-hidden w-full max-w-[720px] h-[520px] flex flex-col`}>
      {showHeader && <ShowcaseWidgetHeader theme={theme} name={name} status={status} mode="voice" />}

      {variant === 'react-bits-orb' ? (
        <ReactBitsOrbBody theme={theme} orb={orb} orbState={orbState} />
      ) : variant === 'agent-orb' ? (
        <AgentOrbBody theme={theme} orbState={orbState} />
      ) : variant === 'waveform' ? (
        <WaveformBody theme={theme} />
      ) : variant === 'transcript' ? (
        <TranscriptBody theme={theme} orbState={orbState} transcript={transcript} transcriptBg={transcriptBg} statusColor={statusColor} />
      ) : variant === 'minimal' ? (
        <MinimalBody theme={theme} orbState={orbState} />
      ) : (
        <ClassicBody orbState={orbState} statusColor={statusColor} />
      )}
    </div>
  )
}

/* ─── Variant bodies ─── */

function AgentOrbBody({ theme, orbState }) {
  const isDark = theme === 'dark'
  // Map voice states → agent states (AgentOrb has idle / listening / talking)
  const agentState =
    orbState === 'speaking' ? 'talking' :
    orbState === 'listening' ? 'listening' :
    'idle'

  const label = {
    idle: 'Idle',
    listening: 'Listening',
    talking: 'Talking',
  }[agentState]

  const pillOn = isDark
    ? 'bg-stone-100 text-stone-900'
    : 'bg-stone-900 text-white'
  const pillOff = isDark
    ? 'bg-stone-800/60 text-stone-500 border border-stone-700'
    : 'bg-white text-stone-400 border border-stone-200'

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
      <AgentOrb state={agentState} size={180} />
      <div className="flex items-center gap-2">
        {['idle', 'listening', 'talking'].map((s) => (
          <span
            key={s}
            className={`text-[11px] font-medium px-3 py-1 rounded-full ${s === agentState ? pillOn : pillOff}`}
          >
            {s === 'idle' ? 'Idle' : s === 'listening' ? 'Listening' : 'Talking'}
          </span>
        ))}
      </div>
    </div>
  )
}

function ClassicBody({ orbState, statusColor }) {
  const isTalking = orbState === 'speaking'
  const isThinking = orbState === 'processing'
  const isListening = orbState === 'listening'

  const statusText = {
    idle: 'Click to talk',
    listening: 'Listening…',
    processing: 'Thinking…',
    speaking: 'Talking…',
  }[orbState]

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
      <ShowcaseVoiceOrb state={orbState} size="lg" />
      <div className="flex flex-col items-center gap-1.5">
        <p className={`text-sm font-medium ${isThinking || isListening ? 'animate-pulse' : ''} ${statusColor}`}>
          {statusText}
        </p>
        {orbState === 'idle' && (
          <p className="text-[11px] text-stone-400">or press space to hold-to-record</p>
        )}
        {isTalking && (
          <p className="text-[11px] text-stone-400">Tap the orb to interrupt</p>
        )}
        {isThinking && (
          <p className="text-[11px] text-stone-400">Processing your request</p>
        )}
      </div>
    </div>
  )
}

function ReactBitsOrbBody({ theme, orb, orbState }) {
  const isDark = theme === 'dark'
  const bg = isDark ? '#0c0a09' : '#ffffff'
  const primary = isDark ? 'text-white' : 'text-stone-900'
  const hint = isDark ? 'text-stone-500' : 'text-stone-400'

  // Normal state (thinking/idle) = natural orb, no hover distortion.
  // Hover state triggered only when AI is speaking or human is speaking.
  const isActive = orbState === 'speaking' || orbState === 'listening'
  const effectiveForceHover = isActive || (orb.forceHoverState ?? false)

  const effectiveIntensity =
    orbState === 'listening' ? Math.max(orb.hoverIntensity ?? 0.2, 0.45) :
    orbState === 'speaking' ? Math.max(orb.hoverIntensity ?? 0.2, 0.3) :
    orb.hoverIntensity ?? 0.2

  const statusMap = {
    idle: { label: 'Tap to speak', dot: 'bg-stone-400', tone: hint },
    listening: { label: 'Listening…', dot: 'bg-red-500', tone: 'text-red-500' },
    processing: { label: 'Thinking…', dot: 'bg-violet-400', tone: 'text-violet-400' },
    speaking: { label: 'AI speaking…', dot: 'bg-violet-500', tone: 'text-violet-400' },
  }
  const status = statusMap[orbState] ?? statusMap.idle
  const animatedDot = orbState === 'listening' || orbState === 'speaking' || orbState === 'processing'

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
      <div className="relative w-[320px] h-[320px]">
        <Orb
          hue={orb.hue ?? 298}
          hoverIntensity={effectiveIntensity}
          rotateOnHover={orb.rotateOnHover ?? true}
          forceHoverState={effectiveForceHover}
          backgroundColor={orb.backgroundColor ?? bg}
        />
      </div>

      <div className="mt-2 flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            {animatedDot && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status.dot}`} />}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${status.dot}`} />
          </span>
          <p className={`text-sm font-medium ${status.tone} ${orbState === 'listening' ? 'animate-pulse' : ''}`}>
            {status.label}
          </p>
        </div>
        <p className={`text-[11px] ${hint}`}>
          {isActive ? 'Hover state · orb distorts with voice' : 'Normal state · no distortion'}
        </p>
      </div>
    </div>
  )
}

function TranscriptBody({ theme, orbState, transcript, transcriptBg, statusColor }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-between px-6 py-8">
      <div className="flex-1 flex items-center">
        <ShowcaseVoiceOrb state={orbState} size="lg" />
      </div>
      <div className={`w-full max-w-[480px] border rounded-2xl px-4 py-3 ${transcriptBg}`}>
        <p className="text-[10px] uppercase tracking-wider font-semibold opacity-60 mb-1">Live transcript</p>
        <p className="text-sm leading-relaxed">
          {transcript}
          <span className="inline-block w-1.5 h-4 bg-current align-middle ml-1 animate-pulse" />
        </p>
      </div>
    </div>
  )
}

function WaveformBody({ theme }) {
  const isDark = theme === 'dark'
  const bar = isDark ? 'bg-violet-400' : 'bg-violet-500'
  const label = isDark ? 'text-stone-400' : 'text-stone-500'

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
      <div className="flex items-end gap-1 h-28">
        {Array.from({ length: 32 }).map((_, i) => (
          <span
            key={i}
            className={`w-[3px] ${bar} rounded-full`}
            style={{
              animation: `waveform 0.9s ease-in-out infinite ${(i % 8) * 0.08}s`,
              height: `${20 + ((i * 13) % 70)}px`,
              opacity: 0.35 + ((i * 17) % 60) / 100,
            }}
          />
        ))}
      </div>
      <p className={`text-xs ${label}`}>Listening…</p>
    </div>
  )
}

function MinimalBody({ theme, orbState }) {
  const isDark = theme === 'dark'
  const hint = isDark ? 'text-stone-500' : 'text-stone-400'
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4">
      <ShowcaseVoiceOrb state={orbState} size="sm" />
      <p className={`text-[11px] ${hint}`}>{orbState === 'speaking' ? 'Tap to interrupt' : 'Tap to speak'}</p>
    </div>
  )
}
