# Product Data Enhancement — Full Scope & Execution Plan

## Summary
Add 13 product info fields + delivery system. Touches 15 files. Execution in 5 steps.

## Data Flow
```
products.js (source of truth)
  → ProductDetailPage (display all details)
  → VoiceProductShowcase (show key details)
  → systemPrompt (AI can answer questions)
  → toolHandlers (pass to order)

brand.js (shipping options)
  → useCartStore (shipping calculation + selection)
  → CartPage (shipping selector UI)
  → CheckoutPage (shipping selector UI)
  → useOrderStore.placeOrder (capture shipping method)
  → OrderConfirmation/Detail/History pages (display)
  → ChatBubble OrderSummaryCard (display in chat)
  → VoiceMode NonProductCard (display in voice)
```

## Step 1: Product Data (`products.js`)
Add to each of 39 products:
```js
fit: 'Regular',                    // Slim | Regular | Relaxed | Oversized | Fitted
trueToSize: 'True to size',       // Runs small | True to size | Runs large
careInstructions: 'Machine wash cold, tumble dry low',
fabricComposition: '100% organic cotton, 180gsm',
stretch: 'Slight stretch',        // No stretch | Slight stretch | 4-way stretch
weight: 'Midweight',              // Lightweight | Midweight | Heavyweight
closure: 'Pull-on',               // Pull-on | Button | Zip | Tie | Snap | Hook
neckline: 'Crew',                 // Crew | V-neck | Collar | Scoop | Mock | Hood
sleeveType: 'Short sleeve',       // Short | Long | Sleeveless | 3/4 | Cap
length: 'Regular',                // Cropped | Regular | Long | Midi | Maxi | Mini
pockets: 'No pockets',            // No pockets | 2 side | 2 side + 1 back | etc.
lining: 'Unlined',                // Unlined | Fully lined | Partial lining
countryOfOrigin: 'Made in Portugal',
modelInfo: 'Model is 6\'1", wearing size M',
```

## Step 2: Delivery System (`brand.js` + `useCartStore.js`)
**brand.js** — add shipping options:
```js
shippingOptions: [
  { id: 'standard', name: 'Standard', price: 5.95, days: [5, 7], freeAbove: 75 },
  { id: 'express', name: 'Express', price: 9.95, days: [2, 3] },
  { id: 'nextday', name: 'Next Day', price: 14.95, days: [1, 1], cutoff: '2:00 PM' },
],
returnPolicy: { window: 30, freeReturns: true, freeExchanges: true },
```

**useCartStore.js** — add:
- `selectedShipping: 'standard'` state
- `setShipping(id)` action
- Update `shipping()` to lookup from brand.shippingOptions
- Add `estimatedDelivery()` computed

## Step 3: Order System (`useOrderStore.js`)
- Update `placeOrder()` to accept `shippingMethod` param
- Store `shippingMethod`, `shippingCost` on order
- Calculate `estimatedDelivery` from shipping option days
- Update 3 pre-seeded orders with shipping info

## Step 4: UI Pages
**ProductDetailPage** — Add specs table:
- Product Specifications (fit, closure, neckline, sleeve, length, pockets, lining)
- Material & Care (composition, weight, stretch, care instructions)
- Shipping & Returns (delivery estimate, return policy)
- Model info

**CartPage** — Add shipping selector below items

**CheckoutPage** — Add shipping selector before payment

**OrderConfirmation/Detail** — Show shipping method + delivery date

## Step 5: Chat & Voice
**systemPrompt.js** — Add new fields to catalog serialization + shipping options

**toolHandlers.js** — Pass shipping to show_order_summary + process_order

**ChatBubble OrderSummaryCard** — Show shipping method + delivery date

**VoiceMode NonProductCard** — Show shipping method + delivery date

## Files Changed (15)
| # | File | Change Size |
|---|---|---|
| 1 | `src/data/products.js` | Large — 13 fields × 39 products |
| 2 | `src/config/brand.js` | Small — add shippingOptions + returnPolicy |
| 3 | `src/stores/useCartStore.js` | Medium — shipping selection + calculation |
| 4 | `src/stores/useOrderStore.js` | Medium — schema + placeOrder + pre-seeded orders |
| 5 | `src/pages/ProductDetailPage.jsx` | Medium — specs table + delivery + model info |
| 6 | `src/pages/CartPage.jsx` | Small — shipping selector |
| 7 | `src/pages/CheckoutPage.jsx` | Small — shipping selector |
| 8 | `src/pages/OrderConfirmationPage.jsx` | Small — show shipping method |
| 9 | `src/pages/OrderDetailPage.jsx` | Small — show shipping method |
| 10 | `src/services/chat/systemPrompt.js` | Small — catalog fields + shipping info |
| 11 | `src/services/chat/toolHandlers.js` | Small — pass shipping to orders |
| 12 | `src/components/chat/ChatBubble.jsx` | Small — OrderSummaryCard delivery |
| 13 | `src/components/chat/VoiceMode.jsx` | Small — NonProductCard delivery |
| 14 | `src/components/chat/VoiceProductShowcase.jsx` | Small — fit/material tags |
| 15 | `src/pages/OrderHistoryPage.jsx` | Tiny — optional shipping badge |

## Execution Order
1. `products.js` — biggest change, do first
2. `brand.js` + `useCartStore.js` — delivery foundation
3. `useOrderStore.js` — order schema
4. `ProductDetailPage.jsx` — visible impact
5. `CartPage.jsx` + `CheckoutPage.jsx` — shipping selection
6. Order pages — confirmation, detail, history
7. `systemPrompt.js` + `toolHandlers.js` — AI awareness
8. Chat/Voice cards — display in chat
9. Test all flows
