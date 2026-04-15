# The Last Interface — Architecture

## Overview
A full-fledged e-commerce prototype (brand: FORMA) demonstrating conversational AI commerce with 3 pillars: Conversational AI, Voice-Enabled, and Multimodal Awareness.

**54 source files | 8,400 lines | 39 products | 19 AI tools | 3 LLM providers**

## Tech Stack
| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 |
| Routing | React Router v6 (11 routes) |
| State | Zustand 5 (6 stores) |
| AI | Provider-agnostic (Gemini / OpenAI / Claude) |
| STT | Web Speech API (browser native) |
| TTS | ElevenLabs Flash v2.5 → OpenAI TTS → Browser fallback |
| Images | DummyJSON CDN (3-4 per product) + Unsplash |

## Directory Structure
```
src/
├── main.jsx                          # Entry + BrowserRouter
├── App.jsx                           # Layout + routes + scroll-to-top + page context
├── index.css                         # Tailwind + fonts + base resets
│
├── config/
│   ├── ai.js                         # LLM provider config + API keys
│   └── brand.js                      # Brand, shipping options, coupons, return policy
│
├── data/
│   ├── products.js                   # 39 products with 27 fields each (1,600 lines)
│   └── reviews.js                    # Reviews for all 39 products
│
├── stores/                           # Zustand global state
│   ├── useCartStore.js               # Cart items, shipping, coupons, totals
│   ├── useUserStore.js               # Profile, addresses, payment, notifications
│   ├── useWishlistStore.js           # Saved product IDs
│   ├── useOrderStore.js              # Order history, placeOrder with delivery calc
│   ├── usePageContextStore.js        # Current page, viewing product, interactions
│   └── useChatStore.js               # Chat state, messages, voice, results, highlights
│
├── services/
│   ├── ai/                           # LLM-agnostic AI layer
│   │   ├── index.js                  # Provider router: sendMessage()
│   │   ├── types.js                  # Unified message/tool formats
│   │   └── providers/
│   │       ├── gemini.js             # Gemini 2.5 Flash adapter
│   │       ├── openai.js             # GPT-4o adapter (handles tool_calls history)
│   │       └── anthropic.js          # Claude adapter (with CORS proxy)
│   │
│   ├── chat/                         # Chat-as-a-service
│   │   ├── index.js                  # sendChatMessage() orchestrator
│   │   ├── systemPrompt.js           # Dynamic prompt builder (247 lines)
│   │   ├── tools.js                  # 19 tool definitions in unified format
│   │   ├── toolHandlers.js           # Tool → store mutation bridge
│   │   └── contextBridge.js          # Reads all stores → AI context string
│   │
│   ├── stt.js                        # Web Speech API wrapper
│   └── tts.js                        # ElevenLabs → OpenAI → Browser fallback
│
├── hooks/
│   ├── useVoice.js                   # STT + TTS orchestration + interruption
│   └── usePageContext.js             # Route → pageContextStore sync
│
├── components/
│   ├── ui/
│   │   └── Toast.jsx                 # Toast notification system
│   │
│   ├── layout/
│   │   ├── Navbar.jsx                # Sticky nav + cart badge
│   │   └── Footer.jsx                # Site footer
│   │
│   ├── product/
│   │   ├── ProductCard.jsx           # Grid card + "Ask AI" pill + highlight
│   │   └── ProductGrid.jsx           # Responsive product grid
│   │
│   └── chat/
│       ├── ChatWidget.jsx            # Root: floating bar + modal + auto-greet
│       ├── ChatHeader.jsx            # Mode switch + reset + close (stops audio)
│       ├── ChatMessages.jsx          # Context-aware welcome + message list
│       ├── ChatInput.jsx             # Text + image upload + mic + send
│       ├── ChatBubble.jsx            # 15 card types (830 lines)
│       ├── ContextBar.jsx            # "Viewing: X" + "Cart: Y"
│       ├── VoiceMode.jsx             # Split view + orb + checkout panel (587 lines)
│       ├── VoiceOrb.jsx              # Animated orb (idle/listen/process/speak)
│       ├── VoiceProductShowcase.jsx  # Left panel: product detail + buy
│       ├── VoiceResultCarousel.jsx   # Horizontal product cards (legacy)
│       ├── VoiceIndicator.jsx        # Waveform animation
│       └── AskAiPill.jsx             # "Ask AI" hover pill
│
└── pages/
    ├── HomePage.jsx                  # Hero + bestsellers + new arrivals + categories
    ├── ProductListingPage.jsx        # Filters + sort + grid
    ├── ProductDetailPage.jsx         # Gallery + specs accordion + reviews + shipping
    ├── CartPage.jsx                  # Items + qty + discount + summary
    ├── CheckoutPage.jsx              # Address + shipping + payment + place order
    ├── OrderConfirmationPage.jsx     # Success + order details
    ├── AccountPage.jsx               # Profile + addresses + payment
    ├── OrderHistoryPage.jsx          # Past orders with status
    ├── OrderDetailPage.jsx           # Timeline visualization
    ├── WishlistPage.jsx              # Saved items
    └── NotFoundPage.jsx              # 404
```

## Data Flow Architecture

### AI Chat Flow
```
User input (text/voice/image)
  → ChatWidget.handleSend()
    → sendChatMessage(text, image, { hidden })
      → contextBridge.buildContextString()     ← reads ALL stores
      → systemPrompt.buildSystemPrompt()       ← catalog + user + context + voice mode
      → ai/index.sendMessage()                 ← picks provider from config
        → provider adapter                     ← converts unified → native format
        → LLM API call                         ← Gemini/OpenAI/Claude
        → normalize response                   ← native → unified format
      → toolHandlers.handleToolCall()           ← executes each tool
        → store mutations                      ← add to cart, place order, etc.
      → latestResults / latestNonProductResults ← split for voice showcase
      → voice.speakText(response)              ← TTS if voice mode
```

### Voice Mode States
```
State A: Orb Centered (no products)
  ┌─────────────────────────┐
  │         ◉ Orb           │  ← Tap to speak
  │    "Tap to continue"    │
  │   [non-product cards]   │  ← Reviews, orders, checkout
  └─────────────────────────┘

State B: Split View (products showing)
  ┌──────────────┬──────────┐
  │  Product     │  ◉ Orb   │
  │  Showcase    │  Status  │
  │  (55%)       │  Cards   │
  │              │  (45%)   │
  └──────────────┴──────────┘

State C: Checkout (order review)
  ┌──────────────┬──────────┐
  │  Order       │  ◉ Orb   │
  │  Review      │  Checkout│
  │  (items +    │  Cards   │
  │   summary)   │          │
  └──────────────┴──────────┘

State D: Confirmation (orb centered)
  ┌─────────────────────────┐
  │         ◉ Orb           │
  │   [Order Confirmed!]    │
  │   [Shipping details]    │
  └─────────────────────────┘
```

### State Management (Zustand)
```
useCartStore ─────────── items, shipping, coupons, totals
  ├→ Navbar (badge)
  ├→ CartPage (display + edit)
  ├→ CheckoutPage (summary)
  ├→ contextBridge (AI awareness)
  ├→ toolHandlers (add/remove/checkout)
  └→ VoiceMode CheckoutOverviewPanel

useUserStore ─────────── profile, addresses, payment, notify list
  ├→ AccountPage
  ├→ CheckoutPage
  ├→ contextBridge (preferences)
  └→ toolHandlers (save address, notify)

useOrderStore ────────── orders, placeOrder()
  ├→ OrderHistory/Detail pages
  ├→ contextBridge (order history)
  └→ toolHandlers (process order, track)

usePageContextStore ──── current page, viewing product
  ├→ usePageContext hook (route sync)
  ├→ contextBridge (page awareness)
  └→ ChatMessages (context-aware welcome)

useChatStore ─────────── messages, voice state, results, highlights
  ├→ ChatWidget (open/close, greet, width)
  ├→ VoiceMode (products, checkout, orb state)
  ├→ ChatMessages (render messages)
  ├→ ChatHeader (mode switch)
  ├→ ProductCard (highlight glow)
  └→ contextBridge (showcase awareness)

useWishlistStore ─────── saved product IDs
  ├→ WishlistPage
  └→ contextBridge
```

## 19 AI Tools
| # | Tool | Category | Action |
|---|---|---|---|
| 1 | show_product | Discovery | Show single product card |
| 2 | show_product_detail | Discovery | Full detail with carousel |
| 3 | show_products | Discovery | Multiple product cards |
| 4 | show_reviews | Evaluation | Review card with distribution |
| 5 | add_to_cart | Cart | Add item to cart |
| 6 | remove_from_cart | Cart | Remove item from cart |
| 7 | add_to_wishlist | Cart | Save to wishlist |
| 8 | show_order_summary | Checkout | Cart summary card |
| 9 | set_shipping | Checkout | Set shipping speed |
| 10 | show_saved_addresses | Checkout | List all addresses |
| 11 | show_address | Checkout | Show specific address |
| 12 | show_payment | Checkout | Payment method card |
| 13 | apply_coupon | Checkout | Apply discount code |
| 14 | process_order | Checkout | Place order + confirm |
| 15 | show_order_status | Post-purchase | Order timeline |
| 16 | show_all_orders | Post-purchase | All past orders |
| 17 | initiate_return | Post-purchase | Start return process |
| 18 | initiate_exchange | Post-purchase | Start exchange |
| 19 | notify_restock | Notifications | Out-of-stock notify |
| 20 | save_address | User mgmt | Save new address |
| 21 | navigate_to | Navigation | Navigate to page |
| 22 | highlight_product | UI | Glow effect on product card |

## Product Data Schema (27 fields)
```javascript
{
  // Identity
  id, name, price, compareAtPrice, category, subcategory,
  // Display
  description, features[], image, images[], badge, inStock, sizeStock{},
  // Options
  sizes[], colors[{name, hex}],
  // AI Matching
  material, style[], use[], visual, gender, collections[],
  // Specifications
  fit, trueToSize, fabricComposition, stretch, weight,
  closure, neckline, sleeveType, length, pockets, lining,
  // Meta
  countryOfOrigin, modelInfo, careInstructions,
  rating, reviewCount,
}
```

## Checkout Sequence
```
1. show_order_summary → speak total
2. set_shipping → Standard/Express/Next Day
3. show_address → Home/Office/New
4. apply_coupon → FORMA10/FORMA15/WELCOME20 (if not applied)
5. show_payment → Visa ····4242
6. process_order → Order confirmed + delivery date
```

## Provider Adapter Pattern
```
Unified format (tools.js)
  ↓ convertTools()
Provider-specific format
  ↓ API call
Provider response
  ↓ normalize()
Unified response { textParts, toolCalls, rawParts }
```

Each provider handles:
- Tool format conversion (functionDeclarations / tools / tools)
- Message history format (contents / messages / messages)
- Image/vision format (inlineData / image_url / image)
- Tool result handling (Gemini auto, OpenAI requires tool role messages)

## TTS Fallback Chain
```
ElevenLabs Flash v2.5 (human-like, ~75ms)
  ↓ fails (quota/error)
OpenAI TTS tts-1 shimmer (natural, ~200ms)
  ↓ fails
Browser SpeechSynthesis (robotic, instant)
```

## Key Behaviors

### Close = Reset
Closing the chat popup resets everything (messages, products, voice state). Next open is a fresh start with auto-greet.

### Auto-Greet
On first open: sends hidden message based on page context → AI greets → TTS speaks. Product-aware, category-aware, cart-aware.

### Post Add-to-Cart
Showcase collapses → AI suggests cross-category pairing → "Complete the look" / "Check out" buttons.

### Voice Interruption
Tap orb while AI is speaking → TTS stops → STT starts. Orb shows pause icon during speech.

### Auto-Listen
After AI finishes speaking → 1.2s pause → auto-starts listening. Pauses during checkout steps.

## Environment Variables
```
VITE_AI_PROVIDER=openai          # gemini | openai | anthropic
VITE_GEMINI_KEY=...              # Google AI Studio
VITE_OPENAI_KEY=...              # OpenAI API
VITE_ANTHROPIC_KEY=...           # Anthropic (needs CORS proxy)
VITE_ELEVENLABS_KEY=...          # ElevenLabs TTS
VITE_ELEVENLABS_VOICE=...        # ElevenLabs voice ID
```
