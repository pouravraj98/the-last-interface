import { Link } from 'react-router-dom'
import ShowcaseAskBar from '../components/showcase/ShowcaseAskBar'
import ShowcaseVoiceWidget from '../components/showcase/ShowcaseVoiceWidget'
import ShowcaseTextChat from '../components/showcase/ShowcaseTextChat'
import ShowcaseVoiceOrb from '../components/showcase/ShowcaseVoiceOrb'
import AgentOrb from '../components/showcase/AgentOrb'
import Orb from '../components/showcase/Orb'

/* ═════════════════════ Catalog data ═════════════════════ */

const ASK_BAR_VARIANTS = [
  { id: 'default', name: 'Default', desc: 'Expanded pill with search + ⌘K shortcut. The main/full-featured option.' },
  { id: 'compact', name: 'Compact', desc: 'Condensed single-row pill. Use when space is tight.' },
  { id: 'pro', name: 'Pro', desc: 'Search-only, no branding row. For power users.' },
  { id: 'minimal', name: 'Minimal', desc: 'No status dot, no mic. Lightest footprint.' },
  { id: 'voice-first', name: 'Voice-first', desc: 'Prominent glowing mic button for voice-led experiences.' },
]

const VOICE_ORB_STYLES = [
  {
    id: 'react-bits-orb',
    name: 'React-bits Orb · WebGL',
    desc: 'GPU shader orb with organic noise. Distorts when voice is active.',
    states: [
      { s: 'processing', label: 'Thinking (Normal)', desc: 'Baseline — no distortion' },
      { s: 'speaking', label: 'Talking (Active)', desc: 'Hover state · voice reactive' },
    ],
  },
  {
    id: 'classic',
    name: 'Classic · AI Sphere',
    desc: 'Pearlescent sphere with drifting color swirls. ChatGPT / 11Labs feel.',
    states: [
      { s: 'idle', label: 'Click to talk', desc: 'Ready — tap to start' },
      { s: 'listening', label: 'Listening', desc: 'Capturing user speech' },
      { s: 'processing', label: 'Thinking', desc: 'Processing the request' },
      { s: 'speaking', label: 'Talking', desc: 'AI is responding' },
    ],
  },
]

const TEXT_CHAT_VARIANTS = [
  { id: 'greeting', name: 'Greeting', desc: 'First assistant message on open — agent always opens the conversation.' },
  { id: 'full', name: 'Full conversation', desc: 'Multi-turn assistant/user exchange.' },
  { id: 'with-attachment', name: 'With image', desc: 'User sent a photo.' },
  { id: 'compact', name: 'Compact', desc: 'Shorter height for denser layouts.' },
]

const THEMES = ['dark', 'light']

/* ═════════════════════ Page ═════════════════════ */

export default function ShowcasePage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-32">
      <header className="border-b border-stone-200 px-6 py-5 flex items-center justify-between sticky top-0 z-30 bg-white/95 backdrop-blur">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">FORMA AI — Component Catalog</h1>
          <p className="text-stone-500 text-xs mt-0.5">All variants of the Ask Bar, Voice Orb, and Text Chat. For stakeholder selection.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[11px] text-stone-500">
            <span className="inline-flex w-1.5 h-1.5 bg-violet-500 rounded-full" /> Violet = brand accent
          </div>
          <Link to="/" className="text-xs text-stone-500 hover:text-stone-900 transition-colors">← Back to app</Link>
        </div>
      </header>

      <nav className="px-6 py-3 border-b border-stone-200 flex gap-6 text-xs text-stone-500 sticky top-[73px] z-20 bg-white/95 backdrop-blur">
        <a href="#askbar" className="hover:text-stone-900 flex items-center gap-1.5"><Dot /> Ask Bar <span className="text-stone-400">({ASK_BAR_VARIANTS.length})</span></a>
        <a href="#voice" className="hover:text-stone-900 flex items-center gap-1.5"><Dot /> Voice Orb <span className="text-stone-400">({VOICE_ORB_STYLES.length} styles)</span></a>
        <a href="#text" className="hover:text-stone-900 flex items-center gap-1.5"><Dot /> Text Chat <span className="text-stone-400">({TEXT_CHAT_VARIANTS.length})</span></a>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-12 space-y-24">
        <AskBarSection />
        <VoiceSection />
        <TextChatSection />
      </main>
    </div>
  )
}

/* ═════════════════════ Sections ═════════════════════ */

function AskBarSection() {
  return (
    <ComponentBlock
      id="askbar"
      title="Ask Bar"
      summary="The floating AI entry point. All variants share the same BorderBeam-wrapped surface — layout differs."
      count={ASK_BAR_VARIANTS.length}
    >
      {ASK_BAR_VARIANTS.map((v, i) => (
        <VariantCard key={v.id} index={i + 1} name={v.name} desc={v.desc}>
          <div className="grid md:grid-cols-2 gap-3">
            {THEMES.map((theme) => (
              <PreviewFrame key={theme} theme={theme}>
                <div className="w-full max-w-[520px]">
                  <ShowcaseAskBar theme={theme} variant={v.id} colorVariant="colorful" beamSize="md" />
                </div>
              </PreviewFrame>
            ))}
          </div>
        </VariantCard>
      ))}
    </ComponentBlock>
  )
}

function VoiceSection() {
  return (
    <ComponentBlock
      id="voice"
      title="Voice Orb"
      summary="Three orb styles to choose from. Each is shown clean — just the orb in every state, then one reference of how it looks inside the full voice widget."
      count={`${VOICE_ORB_STYLES.length} styles`}
    >
      <div className="space-y-10">
        {VOICE_ORB_STYLES.map((style, i) => (
          <StyleCard key={style.id} index={i + 1} name={style.name} desc={style.desc} stateCount={style.states.length}>
            {/* Orb-only state grid — the focus */}
            {THEMES.map((theme) => (
              <div key={theme} className="space-y-3">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-stone-500 px-1">{cap(theme)} — states</p>
                <div className={`grid gap-3 ${style.states.length >= 4 ? 'md:grid-cols-2 xl:grid-cols-4' : `md:grid-cols-${style.states.length}`}`}>
                  {style.states.map(({ s, label, desc }) => (
                    <OrbTile key={s} styleId={style.id} state={s} theme={theme} label={label} desc={desc} />
                  ))}
                </div>
              </div>
            ))}

            {/* Reference: the orb inside the full voice widget — one tile per theme */}
            <details className="group mt-4">
              <summary className="text-[11px] uppercase tracking-wider font-semibold text-stone-500 px-1 cursor-pointer hover:text-stone-900 list-none flex items-center gap-1.5">
                <svg className="w-3 h-3 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
                View in full widget context
              </summary>
              <div className="grid md:grid-cols-2 gap-3 mt-3">
                {THEMES.map((theme) => (
                  <PreviewFrame key={theme} theme={theme} tall>
                    <ShowcaseVoiceWidget
                      theme={theme}
                      variant={style.id}
                      orbState={style.id === 'react-bits-orb' ? 'speaking' : 'speaking'}
                    />
                  </PreviewFrame>
                ))}
              </div>
            </details>
          </StyleCard>
        ))}
      </div>
    </ComponentBlock>
  )
}

/* Renders just the orb (no chat window chrome) centered on a theme surface. */
function OrbTile({ styleId, state, theme, label, desc }) {
  const isDark = theme === 'dark'
  const surface = isDark ? 'bg-stone-950' : 'bg-white'
  const labelColor = isDark ? 'text-stone-100' : 'text-stone-900'
  const subColor = isDark ? 'text-stone-500' : 'text-stone-500'

  const statusText = {
    idle: styleId === 'agent-orb' ? 'Idle' : 'Click to talk',
    listening: 'Listening…',
    processing: styleId === 'react-bits-orb' ? 'Thinking' : 'Thinking…',
    speaking: styleId === 'agent-orb' ? 'Talking' : 'Talking…',
  }[state] || label

  return (
    <div className="space-y-1.5">
      <div className="relative rounded-xl border border-stone-200 bg-stone-50">
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-white/80 text-stone-600 border border-stone-300/60 backdrop-blur">
            {cap(theme)}
          </span>
          <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200/70">
            {label}
          </span>
        </div>
        <div className={`${surface} rounded-xl mx-4 mt-12 mb-4 h-[320px] flex flex-col items-center justify-center gap-4 overflow-hidden`}>
          <OrbRender styleId={styleId} state={state} theme={theme} />
          <p className={`text-xs ${labelColor}`}>{statusText}</p>
        </div>
      </div>
      <p className="text-[11px] text-stone-500 px-1">
        <span className="font-semibold text-stone-700">{label}</span> — {desc}
      </p>
    </div>
  )
}

function OrbRender({ styleId, state, theme }) {
  if (styleId === 'classic') {
    return <ShowcaseVoiceOrb state={state} size="lg" />
  }
  if (styleId === 'agent-orb') {
    const agentState = state === 'speaking' ? 'talking' : state === 'listening' ? 'listening' : 'idle'
    return <AgentOrb state={agentState} size={160} />
  }
  if (styleId === 'react-bits-orb') {
    const isActive = state === 'speaking' || state === 'listening'
    const bg = theme === 'dark' ? '#0c0a09' : '#ffffff'
    const intensity =
      state === 'listening' ? 0.45 :
      state === 'speaking' ? 0.3 :
      0.2
    return (
      <div className="w-[200px] h-[200px]">
        <Orb
          hue={298}
          hoverIntensity={intensity}
          rotateOnHover={true}
          forceHoverState={isActive}
          backgroundColor={bg}
        />
      </div>
    )
  }
  return null
}

function TextChatSection() {
  return (
    <ComponentBlock
      id="text"
      title="Text Chat"
      summary="Five conversation states — from empty prompt-chips to full multi-turn exchanges."
      count={TEXT_CHAT_VARIANTS.length}
    >
      {TEXT_CHAT_VARIANTS.map((v, i) => (
        <VariantCard key={v.id} index={i + 1} name={v.name} desc={v.desc}>
          <div className="grid md:grid-cols-2 gap-3">
            {THEMES.map((theme) => (
              <PreviewFrame key={theme} theme={theme} tall>
                <ShowcaseTextChat theme={theme} variant={v.id} />
              </PreviewFrame>
            ))}
          </div>
        </VariantCard>
      ))}
    </ComponentBlock>
  )
}

/* ═════════════════════ Primitives ═════════════════════ */

function ComponentBlock({ id, title, summary, count, children }) {
  return (
    <section id={id} className="scroll-mt-28">
      <div className="flex items-end justify-between pb-5 mb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
              {typeof count === 'number' ? `${count} variants` : count}
            </span>
          </div>
          <p className="text-sm text-stone-500 mt-1 max-w-2xl">{summary}</p>
        </div>
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  )
}

function VariantCard({ index, name, desc, children }) {
  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-5">
      <header className="flex items-baseline gap-3 mb-4">
        <span className="text-[10px] font-mono font-semibold text-stone-400 w-6">0{index}</span>
        <div>
          <h3 className="text-sm font-semibold text-stone-900">{name}</h3>
          <p className="text-xs text-stone-500 mt-0.5">{desc}</p>
        </div>
      </header>
      {children}
    </article>
  )
}

function StyleCard({ index, name, desc, stateCount, children }) {
  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-6">
      <header className="flex items-start justify-between gap-3 mb-6 pb-4 border-b border-stone-100">
        <div className="flex items-baseline gap-3">
          <span className="text-[10px] font-mono font-semibold text-stone-400 w-6">0{index}</span>
          <div>
            <h3 className="text-base font-semibold text-stone-900">{name}</h3>
            <p className="text-xs text-stone-500 mt-0.5">{desc}</p>
          </div>
        </div>
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
          {stateCount} states
        </span>
      </header>
      <div className="space-y-6">{children}</div>
    </article>
  )
}

function PreviewFrame({ theme, label, tall = false, children }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50 relative">
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
        <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-white/80 text-stone-600 border border-stone-300/60 backdrop-blur">
          {cap(theme)}
        </span>
        {label && (
          <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200/70">
            {label}
          </span>
        )}
      </div>
      <div className={`flex items-center justify-center p-10 ${tall ? 'min-h-[560px]' : 'min-h-[220px]'}`}>
        {children}
      </div>
    </div>
  )
}

function Dot() {
  return <span className="inline-block w-1 h-1 rounded-full bg-stone-400" />
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1) }
