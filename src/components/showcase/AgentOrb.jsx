/**
 * Agent Orb — pinwheel/petal orb with three agent states.
 * SVG-based: 6 teardrop petals with gradient fills, rotated around center.
 * State drives palette, rotation speed, and petal scale pattern.
 */

const PALETTES = {
  idle: {
    baseFrom: '#7b9bc9', baseTo: '#4a6d9f',
    ringFrom: 'rgba(123,155,201,0.25)', ringTo: 'rgba(123,155,201,0)',
    tip: 'rgba(255,255,255,0.9)',
    spin: '22s',
  },
  listening: {
    baseFrom: '#d4a574', baseTo: '#a8865a',
    ringFrom: 'rgba(212,165,116,0.3)', ringTo: 'rgba(212,165,116,0)',
    tip: 'rgba(255,255,255,0.92)',
    spin: '10s',
  },
  talking: {
    baseFrom: '#7b8494', baseTo: '#4a5161',
    ringFrom: 'rgba(123,132,148,0.3)', ringTo: 'rgba(123,132,148,0)',
    tip: 'rgba(255,255,255,0.88)',
    spin: '5s',
  },
}

// Petal scale patterns — listening/talking are slightly asymmetric so the
// pinwheel doesn't feel static; idle is uniform.
const PETAL_SCALES = {
  idle: [1, 1, 1, 1, 1, 1],
  listening: [1.05, 0.92, 1.08, 0.9, 1.06, 0.94],
  talking: [1.12, 0.85, 1.1, 0.88, 1.14, 0.82],
}

export default function AgentOrb({ state = 'idle', size = 160 }) {
  const p = PALETTES[state] ?? PALETTES.idle
  const scales = PETAL_SCALES[state] ?? PETAL_SCALES.idle
  const gradId = `agent-orb-petal-${state}`
  const ringId = `agent-orb-ring-${state}`

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Soft outer ring */}
      <div
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle, ${p.ringFrom} 55%, ${p.ringTo} 75%)`,
          filter: 'blur(2px)',
        }}
      />
      {/* Inner disk (cream base, like the screenshot) */}
      <div
        className="absolute rounded-full bg-[#faf6ef] shadow-[inset_0_2px_6px_rgba(0,0,0,0.04),0_4px_14px_rgba(0,0,0,0.06)]"
        style={{ width: size * 0.78, height: size * 0.78 }}
      />

      {/* SVG petals */}
      <svg
        viewBox="-60 -60 120 120"
        width={size * 0.74}
        height={size * 0.74}
        className="relative"
        style={{
          animation: `orb-spin ${p.spin} linear infinite`,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
        }}
      >
        <defs>
          <radialGradient id={gradId} cx="50%" cy="20%" r="80%">
            <stop offset="0%" stopColor={p.tip} />
            <stop offset="35%" stopColor={p.baseFrom} />
            <stop offset="100%" stopColor={p.baseTo} />
          </radialGradient>
          <radialGradient id={ringId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={p.baseFrom} stopOpacity="0.5" />
            <stop offset="100%" stopColor={p.baseFrom} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Petals — 6 teardrops rotated 60° apart */}
        {scales.map((scale, i) => (
          <path
            key={i}
            d="M 0,0 C -10,-18 -8,-36 0,-48 C 8,-36 10,-18 0,0 Z"
            fill={`url(#${gradId})`}
            transform={`rotate(${i * 60}) scale(${scale})`}
            opacity={0.88}
            style={{
              transition: 'transform 400ms ease-out',
              transformOrigin: '0 0',
            }}
          />
        ))}

        {/* Center soft highlight */}
        <circle r="10" fill={`url(#${ringId})`} />
      </svg>
    </div>
  )
}
