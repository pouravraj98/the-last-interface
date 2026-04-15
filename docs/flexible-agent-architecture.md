# Flexible Agent Architecture — Non-Linear Shopping

## Problem
Shopping is non-linear. Users browse, add, forget, come back, remove, ask questions mid-checkout, change shipping after choosing address, add more items, and eventually buy. A rigid step-by-step checkout fails when users deviate.

## Solution: Smart Context (Single Agent, Context Does The Thinking)

The AI stays as one agent, but the **context bridge** becomes the brain. It reads all stores and computes a decision summary:
1. What **mode** the user is in (BROWSING / CART / CHECKOUT / POST_PURCHASE)
2. What's been **done** (✓)
3. What's still **missing** (✗)
4. What to do **next**
5. What the user **can do** right now

The system prompt becomes SHORT — just personality + tool descriptions + "read your context and follow the NEXT ACTION."

---

## Shopping Modes

### BROWSING
User is exploring products. No checkout intent.
```
Context shows:
- Page context (what they're viewing)
- Cart summary (if anything in cart)
→ NEXT: Help discover products
```

### CART
User has items, managing cart. Not yet checking out.
```
Context shows:
- Full cart details
- Pairing suggestion status
→ NEXT: Suggest complementary items or help browse more
```

### CHECKOUT
User expressed intent to buy ("check out", "buy", "proceed").
```
Context shows checkout readiness checklist:
  ✓ Cart has items ($83.00)
  ? Shipping: Standard (default) — not explicitly chosen
  ✗ Address: NOT selected
  ✗ Coupon: NOT offered yet
  ✓ Payment: Visa ····4242 on file
→ NEXT: Ask about shipping. Then address. Then offer coupon.
→ MISSING: address, coupon
→ USER CAN: add/remove items, change shipping, ask questions, cancel
```

### POST_PURCHASE
Order just placed.
```
Context shows:
- Recent order details
→ NEXT: Celebrate, show shipping info, ask if anything else needed
```

---

## How Context Bridge Computes Mode

```javascript
function determineMode(messages, cart, orders) {
  // Check last 5 messages for checkout intent keywords
  const recent = messages.slice(-5).map(m => m.text?.toLowerCase() || '')
  const hasCheckoutIntent = recent.some(m => 
    m.includes('check out') || m.includes('buy') || 
    m.includes('proceed') || m.includes('place order')
  )
  
  // Just ordered?
  const justOrdered = messages.some(m => m.type === 'confirmation')
  
  if (justOrdered) return 'POST_PURCHASE'
  if (hasCheckoutIntent && cart.items.length > 0) return 'CHECKOUT'
  if (cart.items.length > 0) return 'CART'
  return 'BROWSING'
}
```

---

## Checkout Readiness Checklist

The context bridge computes this on every AI call during CHECKOUT:

| Item | How it's tracked | Default |
|---|---|---|
| Cart has items | `cart.items.length > 0` | Must have items |
| Shipping speed | `chatStore.shippingExplicitlySet` | Standard (default, not asked) |
| Address selected | `chatStore.addressSelected` | Not selected |
| Coupon offered | `chatStore.couponOffered` | Not offered |
| Payment on file | Always ✓ (Visa ····4242) | Always ready |
| User confirmed | Must say "confirm" | Not confirmed |

When ALL items are ✓ and user says "confirm" → `process_order`.

---

## What User Can Do At ANY Point

| Action | AI Response |
|---|---|
| "Add the sneaker size 10" | add_to_cart → confirm → suggest pairing or resume checkout |
| "Remove the tee" | remove_from_cart → update cart → resume |
| "What's in my cart?" | Describe all items with sizes, colors, prices |
| "How much is shipping?" | List Standard/Express/Next Day with prices |
| "Change to express" | set_shipping → updated total → resume |
| "Ship to my office" | show_address → mark done → resume |
| "New address: 123 Main St" | save_address → show card → resume |
| "Any discounts?" | Offer best coupon → apply if yes |
| "When will it arrive?" | Calculate from selected shipping |
| "What's your return policy?" | Answer → "back to your order" → resume |
| "Is this true to size?" | Answer from product data |
| "Show me reviews" | show_reviews card |
| "Cancel" / "never mind" | "Items saved in cart for later" |
| "Confirm" / "place order" | Check readiness → process_order if ready |
| "Show me something else" | Back to BROWSING mode → show_products |

---

## System Prompt (New — Short & Flexible)

```
## Checkout & Cart
Read the "Shopping State" section in your context. It tells you:
- Current mode (BROWSING / CART / CHECKOUT / POST_PURCHASE)
- What's done (✓) and what's missing (✗)  
- What to do NEXT
- What the user can do

Follow the NEXT ACTION. If user asks something else, handle it, then come back 
to whatever's still missing.

You can handle ANY request at ANY point: add items, remove items, change 
shipping, change address, apply coupons, answer questions.

To place an order: ALL checklist items must be ✓ and user must explicitly confirm.
If something's missing: "I just need [X] before I can place this."

NEVER force the user through a sequence. Be flexible. Be helpful.
```

---

## Files Changed

| File | Change | Impact |
|---|---|---|
| `contextBridge.js` | Rewrite: mode detection + checkout readiness + next action | Core change |
| `systemPrompt.js` | Simplify: remove rigid steps, add "follow NEXT ACTION" | Shorter prompt |
| `useChatStore.js` | Add: couponOffered, addressSelected, shippingExplicitlySet | 3 new flags |
| `toolHandlers.js` | Update flags after: set_shipping, show_address, apply_coupon | Small additions |
| `VoiceMode.jsx` | Smoother transitions for mid-checkout changes | UI polish |

---

## Test Scenarios

| # | Scenario | Expected Result |
|---|---|---|
| 1 | Add item → browse more → add another → "check out" | Both items in cart, smooth checkout |
| 2 | Mid-checkout → "remove the tee" → continue | Cart updates, AI resumes from where left off |
| 3 | Mid-checkout → "add another item" → inline add → continue | Quick add, no mode switch |
| 4 | Mid-checkout → "change to express" → continue | Shipping updates, new total shown |
| 5 | Mid-checkout → "return policy?" → answer → resume | AI answers then comes back to checkout |
| 6 | "Any discounts?" before checkout | AI offers coupon, applies if yes |
| 7 | "When will it arrive?" anytime | Calculated from current shipping |
| 8 | "What's in my cart?" anytime | Full cart description |
| 9 | "Cancel" mid-checkout | Items saved, not cleared |
| 10 | All ✓ + "confirm" | Order placed with all correct details |
