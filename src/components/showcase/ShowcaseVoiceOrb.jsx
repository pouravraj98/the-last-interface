import './ShowcaseVoiceOrb.css'

/**
 * ChatGPT-style orb — pearlescent sphere with drifting color swirls inside.
 * Colored base radial + drifting blobs + bright white center highlight + glass rim.
 */

const PALETTES = {
  idle: {
    // cool pearlescent — violet/blue/pink
    base: 'radial-gradient(circle at 50% 55%, #e9e4ff 0%, #c7bce8 45%, #8b7fb0 100%)',
    blobs: [
      { color: '#a78bfa', x: 25, y: 30, size: 80 },
      { color: '#7dd3fc', x: 70, y: 60, size: 90 },
      { color: '#f9a8d4', x: 55, y: 75, size: 75 },
    ],
    aura: 'rgba(167,139,250,0.3)',
    rim: 'rgba(255,255,255,0.5)',
    speed: { a: '14s', b: '16s', c: '18s' },
  },
  listening: {
    // warm — pink/peach/rose
    base: 'radial-gradient(circle at 50% 55%, #fff1f2 0%, #fecdd3 40%, #e11d48 100%)',
    blobs: [
      { color: '#fda4af', x: 30, y: 30, size: 85 },
      { color: '#fb923c', x: 65, y: 50, size: 80 },
      { color: '#ec4899', x: 45, y: 75, size: 90 },
    ],
    aura: 'rgba(251,113,133,0.45)',
    rim: 'rgba(255,220,225,0.55)',
    speed: { a: '5s', b: '6s', c: '7s' },
  },
  processing: {
    // cool blue/teal/violet — "thinking"
    base: 'radial-gradient(circle at 50% 55%, #eff6ff 0%, #bfdbfe 40%, #4f46e5 100%)',
    blobs: [
      { color: '#60a5fa', x: 25, y: 28, size: 85 },
      { color: '#67e8f9', x: 72, y: 52, size: 80 },
      { color: '#a78bfa', x: 50, y: 78, size: 85 },
    ],
    aura: 'rgba(96,165,250,0.4)',
    rim: 'rgba(230,240,255,0.5)',
    speed: { a: '7s', b: '8.5s', c: '10s' },
  },
  speaking: {
    // vivid — violet/magenta/pink
    base: 'radial-gradient(circle at 50% 55%, #faf5ff 0%, #e9d5ff 40%, #7e22ce 100%)',
    blobs: [
      { color: '#d8b4fe', x: 28, y: 30, size: 90 },
      { color: '#f0abfc', x: 70, y: 48, size: 85 },
      { color: '#fb7185', x: 50, y: 75, size: 90 },
    ],
    aura: 'rgba(192,132,252,0.5)',
    rim: 'rgba(250,230,255,0.55)',
    speed: { a: '4s', b: '5s', c: '6s' },
  },
}

export default function ShowcaseVoiceOrb({ state = 'idle', size = 'lg' }) {
  const sm = size === 'sm'
  const dim = sm ? 110 : 180
  const auraDim = Math.round(dim * 1.6)
  const p = PALETTES[state] ?? PALETTES.idle

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: auraDim, height: auraDim, animation: 'orb-breathe-soft 4.5s ease-in-out infinite' }}
    >
      {/* Outer aura — wide soft glow */}
      <div
        className="absolute rounded-full blur-3xl"
        style={{
          width: auraDim,
          height: auraDim,
          background: `radial-gradient(circle, ${p.aura} 0%, transparent 60%)`,
        }}
      />

      {/* Sphere body */}
      <div
        className="relative rounded-full overflow-hidden"
        style={{
          width: dim,
          height: dim,
          background: p.base,
          boxShadow: `0 0 ${sm ? 30 : 50}px ${p.aura}, inset 0 0 30px rgba(255,255,255,0.3)`,
        }}
      >
        {/* Drifting color blobs — NOT screen-blended; regular alpha so they tint the base */}
        {p.blobs.map((b, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${b.size}%`,
              height: `${b.size}%`,
              left: `${b.x - b.size / 2}%`,
              top: `${b.y - b.size / 2}%`,
              background: `radial-gradient(circle, ${b.color} 0%, transparent 65%)`,
              filter: 'blur(16px)',
              opacity: 0.85,
              animation: `orb-blob-${i === 0 ? 'a' : i === 1 ? 'b' : 'c'} ${p.speed[i === 0 ? 'a' : i === 1 ? 'b' : 'c']} ease-in-out infinite`,
            }}
          />
        ))}

        {/* White center bloom — the pearlescent brightness */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 45%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.4) 25%, rgba(255,255,255,0) 55%)',
          }}
        />

        {/* Rim shimmer — slow rotating highlight band */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `conic-gradient(from 0deg, transparent 0deg, ${p.rim} 40deg, transparent 100deg, transparent 220deg, ${p.rim} 280deg, transparent 340deg)`,
            mixBlendMode: 'overlay',
            animation: `orb-rim-shimmer 12s linear infinite`,
          }}
        />

        {/* Top specular highlight */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            top: '8%', left: '22%', width: '40%', height: '25%',
            background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 70%)',
            filter: 'blur(4px)',
          }}
        />

        {/* Rim darkening for depth */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow: 'inset 0 0 30px rgba(30,10,60,0.25), inset 0 -24px 40px rgba(30,10,60,0.15)',
          }}
        />

        {/* State glyphs */}
        {state === 'listening' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`flex items-end gap-[3px] ${sm ? 'h-4' : 'h-6'}`} style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.7))' }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={`${sm ? 'w-[2px]' : 'w-[3px]'} bg-white/95 rounded-full`}
                  style={{ animation: `waveform 0.8s ease-in-out infinite ${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        )}
        {state === 'processing' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-1.5" style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.7))' }}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={`${sm ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-white/95 rounded-full animate-bounce`}
                  style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.9s' }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
