import { BorderBeam } from 'border-beam'

/**
 * FORMA AI ask bar — 5 preset variants.
 *
 *  - 'default'     — expanded with tagline + search + ⌘K shortcut
 *  - 'compact'     — condensed pill
 *  - 'pro'         — search only, no branding row
 *  - 'minimal'     — compact, no status dot / mic
 *  - 'voice-first' — expanded with prominent glowing mic in place of search
 */
export default function ShowcaseAskBar({
  theme = 'dark',
  variant = 'default',
  name = 'FORMA AI',
  tagline = 'Find products, identify items from a photo, or get styled',
  placeholder = 'Ask me anything...',
  colorVariant = 'colorful',
  beamSize,
  strength = 1,
  duration = 2,
  beamActive = true,
  brightness = 1.6,
  saturation = 1.35,
}) {
  const isDark = theme === 'dark'
  const size = beamSize || (variant === 'compact' || variant === 'minimal' ? 'sm' : 'md')

  // Palette
  const surface = isDark ? 'bg-stone-950/95' : 'bg-white/95'
  const nameColor = isDark ? 'text-white' : 'text-stone-900'
  const taglineColor = isDark ? 'text-stone-400' : 'text-stone-500'
  const subtleColor = isDark ? 'text-stone-500' : 'text-stone-500'
  const searchSurface = isDark
    ? 'bg-stone-900/80 border-stone-700/50 hover:border-stone-600/50'
    : 'bg-stone-50 border-stone-200 hover:border-stone-300'
  const searchText = isDark ? 'text-stone-500' : 'text-stone-400'
  const kbdBorder = isDark ? 'border-stone-700 text-stone-600' : 'border-stone-300 text-stone-400'

  return (
    <>
      {/* sparkle gradient def (id scoped to theme to allow multiple instances) */}
      <svg className="absolute w-0 h-0" aria-hidden>
        <defs>
          <linearGradient id="showcase-sparkle" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
      </svg>

      <div
        className="rounded-2xl"
        style={{
          boxShadow: isDark
            ? '0 18px 50px -8px rgba(0,0,0,0.5), 0 6px 16px -4px rgba(0,0,0,0.25)'
            : '0 18px 50px -8px rgba(30,20,60,0.18), 0 6px 16px -4px rgba(30,20,60,0.08)',
        }}
      >
        <BorderBeam
          size={size}
          colorVariant={colorVariant}
          duration={duration}
          strength={strength}
          active={beamActive}
          theme="light"
          brightness={isDark ? 1.9 : 1.5}
          saturation={isDark ? 1.5 : 1.3}
        >
          <div className={`${surface} backdrop-blur-xl rounded-2xl`}>
          {variant === 'pro' ? (
            <ProLayout theme={theme} placeholder={placeholder} />
          ) : (
            <>
              <TopRow
                theme={theme}
                variant={variant}
                name={name}
                tagline={tagline}
                nameColor={nameColor}
                taglineColor={taglineColor}
                subtleColor={subtleColor}
              />
              {variant === 'default' && (
                <SearchRow
                  placeholder={placeholder}
                  searchSurface={searchSurface}
                  searchText={searchText}
                  kbdBorder={kbdBorder}
                />
              )}
              {variant === 'voice-first' && (
                <VoiceRow theme={theme} />
              )}
            </>
          )}
          </div>
        </BorderBeam>
      </div>
    </>
  )
}

/* ─── Building blocks ─── */

function Sparkle() {
  return (
    <svg className="w-8 h-8 shrink-0" viewBox="0 0 24 24" fill="url(#showcase-sparkle)" stroke="none">
      <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
    </svg>
  )
}

function TopRow({ variant, name, tagline, nameColor, taglineColor, subtleColor }) {
  const showStatus = variant !== 'minimal'
  const showTrailingIcon = variant === 'default' || variant === 'compact' || variant === 'voice-first'
  const isCompact = variant === 'compact' || variant === 'minimal'

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Sparkle />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`${nameColor} text-sm font-semibold`}>{name}</span>
          {showStatus && (
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
              <span className="text-green-400 text-[11px] font-medium">Online</span>
            </span>
          )}
        </div>
        {!isCompact && <p className={`${taglineColor} text-xs mt-0.5 truncate`}>{tagline}</p>}
        {variant === 'compact' && <p className={`${subtleColor} text-xs mt-0.5`}>Ask me anything</p>}
      </div>

      {showTrailingIcon && (variant === 'voice-first' ? null : (
        variant === 'compact' ? (
          <svg className={`w-5 h-5 ${subtleColor} shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
          </svg>
        ) : (
          <svg className={`w-5 h-5 ${subtleColor} shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
          </svg>
        )
      ))}
    </div>
  )
}

function SearchRow({ placeholder, searchSurface, searchText, kbdBorder }) {
  return (
    <div className="px-4 pb-3">
      <div className={`flex items-center gap-2.5 ${searchSurface} border rounded-xl px-4 py-2.5 transition-colors`}>
        <svg className={`w-4 h-4 ${searchText} shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <span className={`${searchText} text-sm`}>{placeholder}</span>
        <span className={`ml-auto text-[10px] ${kbdBorder} border rounded px-1.5 py-0.5`}>⌘K</span>
      </div>
    </div>
  )
}

function VoiceRow({ theme }) {
  const isDark = theme === 'dark'
  const text = isDark ? 'text-stone-300' : 'text-stone-700'
  const hint = isDark ? 'text-stone-500' : 'text-stone-400'

  return (
    <div className="px-4 pb-4">
      <button className="w-full flex items-center gap-3 group">
        <span className="relative flex items-center justify-center w-12 h-12 rounded-full bg-violet-500 shrink-0 shadow-[0_0_24px_rgba(139,92,246,0.5)] group-hover:scale-105 transition-transform">
          <span className="absolute inset-0 rounded-full bg-violet-400/35 animate-ping" />
          <svg className="w-5 h-5 text-white relative" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
          </svg>
        </span>
        <div className="flex-1 text-left">
          <p className={`text-sm font-medium ${text}`}>Tap to speak</p>
          <p className={`text-[11px] ${hint}`}>Or hold space to record</p>
        </div>
      </button>
    </div>
  )
}

function ProLayout({ theme, placeholder }) {
  const isDark = theme === 'dark'
  const searchText = isDark ? 'text-stone-400' : 'text-stone-500'
  const inputBg = isDark ? 'bg-stone-900/60' : 'bg-stone-50'
  const kbdBorder = isDark ? 'border-stone-700 text-stone-500' : 'border-stone-300 text-stone-400'

  return (
    <div className="px-3 py-3">
      <div className={`flex items-center gap-3 ${inputBg} rounded-xl px-4 py-3`}>
        <svg className={`w-5 h-5 ${searchText} shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <span className={`flex-1 text-sm ${searchText}`}>{placeholder}</span>
        <span className={`text-[10px] font-mono ${kbdBorder} border rounded px-1.5 py-0.5`}>⌘K</span>
      </div>
    </div>
  )
}
