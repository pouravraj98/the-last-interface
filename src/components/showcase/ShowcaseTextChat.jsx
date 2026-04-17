import ShowcaseWidgetHeader from './ShowcaseWidgetHeader'

/**
 * Text chat widget — 4 preset variants.
 * Agent always opens with a greeting; there is no empty state.
 *  - 'greeting'         — single assistant opener
 *  - 'full'             — long conversation
 *  - 'with-attachment'  — user sent an image (preview shown in bubble)
 *  - 'compact'          — shorter height, denser input
 */
export default function ShowcaseTextChat({
  theme = 'light',
  variant = 'greeting',
  name = 'FORMA AI',
  status = 'ONLINE · OPENAI',
}) {
  const isDark = theme === 'dark'
  const surface = isDark ? 'bg-stone-950' : 'bg-white'
  const inputBorder = isDark ? 'border-stone-800' : 'border-stone-100'

  const bubbleAssistant = isDark
    ? 'bg-stone-800 text-stone-100 border border-stone-700/60'
    : 'bg-stone-100 text-stone-900'
  const bubbleUser = isDark ? 'bg-violet-500 text-white' : 'bg-stone-900 text-white'
  const inputSurface = isDark
    ? 'bg-stone-900 text-stone-200 placeholder:text-stone-500'
    : 'bg-stone-50 text-stone-900 placeholder:text-stone-400'
  const iconBtn = isDark ? 'text-stone-500 hover:text-stone-300' : 'text-stone-400 hover:text-stone-600'
  const sendBtn = isDark ? 'bg-stone-100 text-stone-900 hover:bg-white' : 'bg-stone-900 text-white hover:bg-stone-800'

  const isCompact = variant === 'compact'
  const height = isCompact ? 'h-[400px]' : 'h-[520px]'

  const messages = MESSAGE_PRESETS[variant] ?? []

  return (
    <div className={`${surface} rounded-2xl shadow-chat overflow-hidden w-full max-w-[720px] ${height} flex flex-col`}>
      <ShowcaseWidgetHeader theme={theme} name={name} status={status} mode="text" />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((m, i) => (
          <MessageBubble
            key={i}
            message={m}
            bubbleAssistant={bubbleAssistant}
            bubbleUser={bubbleUser}
            isDark={isDark}
          />
        ))}
      </div>

      <div className={`border-t ${inputBorder} shrink-0`}>
        <div className={`flex items-center gap-2 px-4 ${isCompact ? 'py-2' : 'py-3'}`}>
          <button className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${iconBtn}`} title="Upload image">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
            </svg>
          </button>
          <input
            type="text"
            placeholder="Type a message..."
            readOnly
            className={`flex-1 text-sm ${inputSurface} rounded-full px-4 py-2.5 border-none outline-none`}
          />
          <button className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${iconBtn}`} title="Voice input">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
            </svg>
          </button>
          <button className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${sendBtn}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message, bubbleAssistant, bubbleUser, isDark }) {
  const isUser = message.role === 'user'
  const wrap = isUser ? 'justify-end' : 'justify-start'
  const base = isUser ? bubbleUser : bubbleAssistant

  return (
    <div className={`flex ${wrap}`}>
      <div className={`px-3.5 py-2 rounded-2xl text-sm max-w-[75%] ${base}`}>
        {message.image && (
          <div className="mb-2 rounded-xl overflow-hidden">
            <img src={message.image} alt="attached" className="w-full h-auto max-h-[180px] object-cover" />
          </div>
        )}
        {message.text && <div>{message.text}</div>}
      </div>
    </div>
  )
}

const SAMPLE_IMAGE = 'https://cdn.dummyjson.com/product-images/mens-shoes/sports-sneakers-off-white-&-red/thumbnail.webp'

const MESSAGE_PRESETS = {
  greeting: [
    { role: 'assistant', text: "Hey there, Alex! How's your day going so far?" },
  ],
  full: [
    { role: 'assistant', text: "Hey there, Alex! How's your day going so far?" },
    { role: 'user', text: 'Looking for white sneakers under $80.' },
    { role: 'assistant', text: 'Got it — I pulled three options under $80 that match. Want me to narrow by size?' },
    { role: 'user', text: 'Size 10, clean look.' },
    { role: 'assistant', text: 'Here’s the cleanest pick in your size — minimal upper, rubber outsole, $68.' },
    { role: 'user', text: 'Add it to cart.' },
    { role: 'assistant', text: 'Added. Anything else you’d like to pair with it?' },
  ],
  'with-attachment': [
    { role: 'user', image: SAMPLE_IMAGE, text: 'Can you find shoes similar to these?' },
    { role: 'assistant', text: 'Nice pick. I spotted 4 visually similar sneakers in our catalog — want me to show them?' },
  ],
  compact: [
    { role: 'assistant', text: 'Quick question?' },
    { role: 'user', text: 'What size should I get?' },
    { role: 'assistant', text: 'Based on your history — size 10 runs true to fit for this model.' },
  ],
}
