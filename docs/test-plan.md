# Full User Journey — Test & Fix Plan

## Overview
Test every flow end-to-end across 8 phases. Each phase is a distinct user journey. Test → report → fix → next phase.

---

## Phase 1: Discovery (Browse & Find Products)

### Flow A: Voice Discovery
1. Open site → click floating bar → voice mode opens → AI greets
2. Say "Show me sneakers" → products appear in showcase
3. Navigate between products (arrows) → AI speaks about each
4. Say "Show me something in black" → new products replace showcase
5. Say "What about dresses?" → different category loads

### Flow B: Text Discovery
1. Open chat in text mode → type "Show me bestsellers"
2. Product cards appear → click one → detail card with carousel + size picker
3. Type "Find similar" → new product cards
4. Type "What's popular in accessories?" → accessories shown

### Flow C: Visual Search (Image Upload)
1. Open chat → click image upload → pick a shoe photo
2. AI identifies it → shows similar products
3. Works in both text and voice mode

### Flow D: Page-Aware Discovery
1. Browse to PDP (/product/retro-rider-trainer) → open chat
2. AI knows you're viewing Retro Rider → greets contextually
3. Say "I like this but cheaper" → shows alternatives
4. Click "Ask AI" on a product card → chat opens with context

### Checklist
- [ ] Voice: products show in showcase correctly
- [ ] Voice: product navigation arrows work without breaking
- [ ] Voice: category switch replaces products
- [ ] Text: product cards render with images
- [ ] Text: clicking card shows detail with carousel
- [ ] Image upload works and finds similar products
- [ ] Page context: AI knows what you're viewing on PDP
- [ ] Page context: "Ask AI" pill works on product cards

---

## Phase 2: Product Details & Reviews

### Flow A: Voice → Details Page
1. In voice mode with a product showing
2. Say "Tell me more about this" or "Show me details"
3. AI says "Let me take you to the full product page" → navigates to PDP → chat closes
4. PDP loads with correct product (not blank)
5. Can see: image gallery, description, features, size selector, reviews, related products

### Flow B: Text → Details
1. In text mode, click product detail card
2. "View on site" button → closes chat → navigates to PDP
3. "See reviews →" link on detail card → AI shows reviews in chat

### Flow C: Reviews in Text Mode
1. Type "What do people think about the Off-White Sport Sneaker?"
2. Review card appears: rating distribution + individual reviews
3. "Show all X reviews" expands

### Checklist
- [ ] Voice: "tell me more" navigates to correct PDP (not blank)
- [ ] Voice: chat closes, audio stops on navigation
- [ ] Text: "View on site" closes chat + navigates
- [ ] Text: "See reviews" shows review card
- [ ] PDP: images load, carousel works
- [ ] PDP: size selector works
- [ ] PDP: "Ask AI" button on PDP works
- [ ] PDP: related products show at bottom

---

## Phase 3: Cart & Wishlist

### Flow A: Add to Cart via Voice
1. In voice showcase, select size → tap "Buy with Agent"
2. AI confirms: "Added the Off-White Sport Sneaker size 10 to your cart"
3. Navbar cart badge updates
4. Showcase stays (not replaced)

### Flow B: Add to Cart via Text Chat
1. In detail card, select size → click "Add Size 10 to Cart"
2. Cart update card with product image appears
3. AI confirms verbally if voice is on

### Flow C: Add to Cart on PDP
1. On product detail page, select size + color → click "Add to Cart"
2. Toast notification appears
3. Cart badge updates

### Flow D: Cart Page
1. Navigate to /cart
2. See all items with images, sizes, quantities
3. +/- quantity controls work
4. Remove item works
5. Cart summary updates (subtotal, tax, shipping, total)
6. "Proceed to Checkout" links to /checkout

### Flow E: Wishlist
1. AI: "Add this to my wishlist" → wishlist update card
2. Navigate to /wishlist → items show
3. "Add to Cart" from wishlist works
4. "Remove" from wishlist works

### Checklist
- [ ] Voice: "Buy with Agent" adds to cart correctly
- [ ] Voice: showcase stays after add-to-cart
- [ ] Voice: cart badge updates
- [ ] Text: detail card add-to-cart works
- [ ] Text: cart update card shows product image
- [ ] PDP: add to cart with toast
- [ ] Cart page: items display correctly
- [ ] Cart page: quantity +/- works
- [ ] Cart page: remove item works
- [ ] Cart page: summary calculations correct
- [ ] Wishlist: add via AI works
- [ ] Wishlist page: displays items

---

## Phase 4: Checkout & Payment

### Flow A: Voice Checkout
1. Say "Let's check out" or tap "Buy with Agent"
2. AI shows order summary (centered below orb, not in showcase) + speaks total
3. Auto-listen pauses (user taps orb to respond)
4. "Ship to my office" → address card appears
5. AI shows payment card → "Visa ending 4242"
6. "Confirm" → processing → order confirmation card
7. Cart clears, cart badge goes to 0

### Flow B: Text Checkout
1. Type "Check out" → order summary card with product images
2. "Ship to home" → address card
3. Payment card shows
4. "Confirm" → confirmation card with order number

### Flow C: Site Checkout (no AI)
1. From cart page → "Proceed to Checkout"
2. Select shipping address (radio buttons)
3. Payment method shown
4. Order review with items
5. "Place Order" → processing animation → order confirmation page
6. Order appears in order history

### Flow D: New Address via Chat
1. "Ship to 123 Main St, Brooklyn, NY 11201"
2. AI parses → saves address → shows address saved card
3. New address available for future orders

### Checklist
- [ ] Voice: order summary shows centered (not in showcase)
- [ ] Voice: auto-listen pauses during checkout
- [ ] Voice: full flow works (summary → address → payment → confirm)
- [ ] Voice: cart clears after order
- [ ] Text: checkout flow works end-to-end
- [ ] Site: checkout page works without AI
- [ ] New address saves and shows card
- [ ] Order confirmation shows correct details

---

## Phase 5: Order Tracking & History

### Flow A: Voice Order Tracking
1. "Where's my order?" → AI shows all orders card
2. "Track order FM-5102" → specific order with timeline
3. Timeline shows correct states (done/current/pending)

### Flow B: Text Order Tracking
1. Type "Show my orders" → all orders card
2. Click through to specific order status

### Flow C: Site Order History
1. Navigate to /account/orders → list of orders with status badges
2. Click an order → full detail page with timeline
3. Newly placed orders appear at top

### Checklist
- [ ] Voice: "where's my order" shows all orders
- [ ] Voice: specific order tracking works
- [ ] Text: order cards render correctly
- [ ] Site: /account/orders lists all orders
- [ ] Site: order detail page with timeline
- [ ] New orders appear after checkout

---

## Phase 6: Returns & Exchanges

### Flow A: Return via Voice/Text
1. "I want to return the sneakers from order FM-4821"
2. AI asks for reason
3. "It doesn't fit" → return confirmation card
4. Shows: return ID, refund amount, refund method, timeline
5. "Return label sent to alex@email.com"

### Flow B: Exchange via Voice/Text
1. "I want to exchange for a size 11"
2. Exchange card: current size → new size visual comparison
3. Exchange ID, "Free exchange", new delivery estimate

### Checklist
- [ ] Return: AI asks for reason before processing
- [ ] Return: confirmation card shows correct info
- [ ] Exchange: size comparison card (old → new)
- [ ] Exchange: free exchange shown
- [ ] Only delivered orders can be returned/exchanged

---

## Phase 7: Out of Stock & Notifications

### Flow A: Out of Stock Discovery
1. Ask about Gold Flat, Linen Camp Shirt, or Power Suit (all out of stock)
2. AI mentions unavailability — does NOT offer to add to cart
3. "Notify me when it's back" → notify card with email confirmation

### Flow B: Out of Stock UI
1. Product cards on PLP show "Out of Stock" overlay
2. PDP shows out-of-stock state (no add to cart, notify button instead)
3. Voice showcase shows orange badge + "Notify Me" button

### Checklist
- [ ] AI correctly identifies out-of-stock items
- [ ] AI doesn't offer to add out-of-stock items
- [ ] Notify card shows with email
- [ ] Product card overlay visible on PLP
- [ ] PDP handles out-of-stock correctly
- [ ] Voice showcase handles out-of-stock correctly

---

## Phase 8: Cross-Cutting Concerns

### A: Reset
1. Click reset → everything clears (messages, products, voice state, audio)
2. AI auto-greets again fresh
3. No stale data anywhere

### B: Voice ↔ Text Switching
1. Switch modes mid-conversation → messages preserved
2. Audio stops immediately on switch
3. Products from voice visible as cards in text mode

### C: Audio Lifecycle
1. Close chat → audio stops immediately
2. Navigate to PDP → audio stops
3. Switch modes → audio stops
4. Reset → audio stops
5. No overlapping voices ever

### D: User Preferences
1. Size auto-selects: 10 for footwear, M for tops/dresses, 32 for chinos/jeans
2. AI mentions user's preferred size when recommending
3. Preferred colors (Black, White, Navy) influence recommendations

### E: Provider Switching
1. Switch VITE_AI_PROVIDER between gemini and openai
2. Both work with tool calling
3. Header shows correct provider name

### Checklist
- [ ] Reset clears everything + re-greets
- [ ] Mode switch preserves messages, stops audio
- [ ] No overlapping audio in any scenario
- [ ] Size auto-select works per category
- [ ] Provider switch works

---

## How to Test

For each phase:
1. Read the flows above
2. Test each flow step-by-step
3. Note what works ✅ and what's broken ❌
4. Report back with the specific issue + screenshot if possible
5. I fix it
6. Re-test the broken items
7. Move to next phase

**Start with Phase 1: Discovery.** Test all 4 flows (voice, text, image upload, page-aware) and report back.
