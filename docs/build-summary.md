# The Last Interface — Build Summary

## What We've Built

### E-Commerce Site (FORMA Brand)
- **Homepage** — Hero, trust bar, bestsellers, new arrivals, category cards, brand story
- **Product Listing Page** — Filters (category, price), sort (featured, price, rating, newest), responsive grid
- **Product Detail Page** — Image gallery with thumbnails, color/size selectors, add to cart, features, related products, "Ask AI" button
- **Cart Page** — Items with quantity controls, remove, cart summary with tax/shipping calc
- **Checkout Page** — Address selection, payment on file, order review, place order
- **Order Confirmation** — Success state with order details
- **Account Page** — Profile, addresses, payment methods, order count
- **Order History** — Past orders with status badges, click to detail
- **Order Detail** — Full timeline visualization (done/current/pending states)
- **Wishlist** — Saved items with add to cart / remove
- **404 Page**

### Product Catalog
- **39 products** across 5 categories: footwear (10), tops (5+1 sweater), dresses (10), bottoms (6), accessories (7)
- **32 products with DummyJSON multi-image** (3-4 images each, consistent photography)
- **7 products with Unsplash single images** (bottoms + sweater)
- **3 out-of-stock** products (Gold Flat, Short Sleeve Casual Shirt, Power Suit)
- **Reviews** for 11 products with rating distribution
- **3 pre-seeded orders** with timeline data
- **Similarity clusters** for "find similar" demo

### AI Chat System (Provider-Agnostic)
- **3 LLM adapters**: Gemini, OpenAI, Anthropic (Claude)
- **Switch provider** via VITE_AI_PROVIDER env var
- **Unified tool format** — tools defined once, converted per provider
- **OpenAI tool_calls/results** handling for conversation history
- **17 AI tools**: show_product, show_products, show_product_detail, show_reviews, add_to_cart, remove_from_cart, show_order_summary, show_address, show_payment, process_order, show_order_status, show_all_orders, add_to_wishlist, navigate_to, highlight_product, notify_restock, save_address, initiate_return, initiate_exchange

### Chat UI — Text Mode
- **Floating AI bar** at bottom (dark, gold avatar, "Ask me anything")
- **Centered modal** (680px wide)
- **Context-aware welcome** — different greeting based on page/product/cart
- **Quick action buttons** — contextual shortcuts
- **Rich cards**: product cards (clickable → detail), product detail (carousel, size picker, add to cart, reviews link, out-of-stock), order summary, address, payment, confirmation, order status, all orders, cart update, wishlist update, return confirmation, exchange confirmation, notify restock, address saved, review card with distribution
- **Context bar** — shows viewing product + cart count
- **Image upload** — visual search
- **Mic button** — voice input in text mode

### Chat UI — Voice Mode (Split View)
- **State A: No product** — large orb centered, status text
- **State B: Product showing** — split layout (55% showcase / 45% orb), modal widens to 900px
- **Voice Product Showcase** (left panel): image with thumbnails, product info, description, features, size selector (auto-selects from user preferences), "Buy with Agent" button, "View Full Details" button, multi-product navigation (1 of N arrows)
- **Voice Orb** (right panel): 4 visual states (idle/listening/processing/speaking), pause icon during speech for "tap to interrupt"
- **Auto-listen** after AI speaks (pauses during checkout)
- **Interruption** — tap orb while AI is speaking → stops TTS → starts listening

### Voice Pipeline
- **STT**: Web Speech API (browser native, Chrome)
- **TTS**: ElevenLabs Flash v2.5 (human-like) + browser SpeechSynthesis fallback
- **Auto-speak**: AI responses spoken aloud when voice enabled
- **Fallback descriptions**: if AI returns products with no text, auto-generates spoken description

### Multimodal Awareness
- **Page context tracking** — usePageContext hook syncs route to store
- **"Ask AI" pills** — on product cards (hover) and PDP (always visible)
- **Product highlighting** — AI can trigger golden glow on product cards
- **Context bar** — shows currently viewed product in chat
- **Voice showcase context** — AI knows which product is in the voice split view
- **Cart awareness** — AI knows cart contents
- **Wishlist awareness** — AI knows saved items

### User Management
- **Simulated auth** — pre-logged-in as Alex Johnson
- **Profile**: shoe size 10, clothing M, bottom 32, preferred colors
- **2 saved addresses**: Home + Office
- **Payment on file**: Visa ····4242
- **Size auto-select** based on product category
- **New address saving** via AI chat
- **Restock notifications** for out-of-stock items

### State Management (Zustand — 6 stores)
- useCartStore — items, totals, add/remove/update
- useUserStore — profile, addresses, payment, notify list
- useWishlistStore — saved product IDs
- useOrderStore — order history, place order
- usePageContextStore — current page, viewing product
- useChatStore — chat state, messages, voice state, latest results, greeted flag

### Design System
- **Tailwind CSS** — custom stone palette + terracotta accent
- **Fonts**: Instrument Serif (headlines) + Inter (body)
- **Custom animations**: orb breathe/ripple/wave/spin, waveform, slide-up, fade-in, highlight-glow, pulse-ring
- **Toast notifications** for cart/wishlist actions
- **Scroll to top** on route change

## Tech Stack
- React 18 + Vite 5
- Tailwind CSS 3
- React Router v6
- Zustand 5
- Web Speech API (STT)
- ElevenLabs Flash v2.5 (TTS)
- DummyJSON CDN (product images)

## API Keys
- VITE_AI_PROVIDER — gemini | openai | anthropic
- VITE_GEMINI_KEY — Google AI Studio
- VITE_OPENAI_KEY — OpenAI
- VITE_ELEVENLABS_KEY — ElevenLabs
- VITE_ELEVENLABS_VOICE — Voice ID

## File Count
- ~60 source files
- 39 products, 11 review sets, 3 pre-seeded orders
- 17 AI tools, 3 provider adapters
- 11 pages, ~25 components
