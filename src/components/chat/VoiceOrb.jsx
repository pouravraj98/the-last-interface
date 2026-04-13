/**
 * VoiceOrb — Animated orb with visual states
 * Supports two sizes: 'lg' (96px, default) and 'sm' (64px, for split view)
 */

export default function VoiceOrb({ state = 'idle', size = 'lg' }) {
  const sm = size === 'sm'
  const orbCls = sm ? 'w-16 h-16' : 'w-24 h-24'
  const ringCls = sm ? 'w-16 h-16' : 'w-24 h-24'
  const spinCls = sm ? 'w-20 h-20' : 'w-28 h-28'
  const iconCls = sm ? 'w-5 h-5' : 'w-8 h-8'
  const barCls = sm ? 'w-[2px]' : 'w-[3px]'
  const barH = sm ? 'h-5' : 'h-8'

  const colors = {
    idle: { bg: 'bg-stone-300', glow: 'rgba(168,162,158,.15)' },
    listening: { bg: 'bg-red-400', glow: 'rgba(248,113,113,.2)' },
    processing: { bg: 'bg-stone-400', glow: 'rgba(168,162,158,.15)' },
    speaking: { bg: 'bg-accent-400', glow: 'rgba(224,125,75,.2)' },
  }
  const c = colors[state] || colors.idle

  return (
    <div className="relative flex items-center justify-center">
      {state === 'listening' && (
        <>
          <div className={`absolute ${ringCls} rounded-full border-2 border-red-400/40 animate-orb-ripple`} />
          <div className={`absolute ${ringCls} rounded-full border-2 border-red-400/30 animate-orb-ripple-delay`} />
        </>
      )}

      {state === 'speaking' && (
        <>
          <div className={`absolute ${ringCls} rounded-full border-2 border-accent-400/30 animate-orb-wave`} />
          <div className={`absolute ${ringCls} rounded-full border-2 border-accent-400/20 animate-orb-wave-delay`} />
        </>
      )}

      {state === 'processing' && (
        <div className={`absolute ${spinCls} rounded-full border border-stone-300/40 border-t-stone-500/60 animate-orb-spin`} />
      )}

      <div
        className={`${orbCls} rounded-full flex items-center justify-center transition-colors duration-500 ${
          state === 'idle' ? 'animate-orb-breathe' : ''
        } ${c.bg}`}
        style={{ boxShadow: `0 0 ${sm ? '24px 8px' : '40px 12px'} ${c.glow}` }}
      >
        {state === 'idle' && (
          <svg className={`${iconCls} text-white/80`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
          </svg>
        )}
        {state === 'listening' && (
          <div className={`flex items-end gap-[3px] ${barH}`}>
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className={`${barCls} bg-white/80 rounded-full`} style={{ animation: `waveform 0.8s ease-in-out infinite ${i * 0.1}s` }} />
            ))}
          </div>
        )}
        {state === 'processing' && (
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <span key={i} className={`${sm ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-white/60 rounded-full animate-bounce`} style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }} />
            ))}
          </div>
        )}
        {state === 'speaking' && (
          <svg className={`${iconCls} text-white/80`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
          </svg>
        )}
      </div>
    </div>
  )
}
