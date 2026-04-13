# Bug Tracker — Test & Fix

## Phase 1: Discovery

### BUG-001: Voice overlap when clicking arrows quickly
- **Where:** Voice mode → split view → product navigation arrows
- **Steps:** Click arrows rapidly to cycle between products
- **Expected:** Previous voice stops, new voice starts
- **Actual:** Multiple voices overlap — previous TTS doesn't stop before new one starts
- **Root cause:** `handleProductNavigate` calls `voice.speakText()` but doesn't stop the current TTS first
- **Fix:** Call `voice.stopSpeaking()` before starting new speech in `handleProductNavigate`
- **Status:** 🔴 Open

---

### BUG-002: No gender in user profile — AI can't filter products
- **Where:** All modes — AI recommends men's and women's products randomly
- **Steps:** Ask "Show me sneakers" — might show heels or men's shoes without preference
- **Expected:** AI should know user's gender and prioritize relevant products
- **Actual:** No gender field in user profile. AI guesses or shows everything.
- **Root cause:** `useUserStore.user` has no `gender` field. System prompt doesn't mention it.
- **Fix:** Add `gender: 'male'` to user profile + update system prompt to say "Prioritize products matching the customer's gender, but show unisex items too. If the customer asks for items outside their gender (e.g. gift shopping), show those."
- **Status:** 🔴 Open

---

### BUG-003: "Ask AI" on a new product shows stale showcase from previous conversation
- **Where:** PLP/PDP → "Ask AI" pill or button while a conversation is already active
- **Steps:** Have an ongoing conversation with products showing → close chat → browse to a different product → click "Ask AI" → chat reopens
- **Expected:** Showcase updates to the newly clicked product. AI talks about the new product.
- **Actual:** Old product stays in showcase from previous conversation. AI may reference the old product.
- **Root cause:** "Ask AI" opens chat and sends a message, but `latestResults` still has the old products (we made it stable — only replaced by new product tool calls). The new message triggers AI but the showcase doesn't update until AI returns new `show_product` results. Also the `sendChatMessage` in AskAiPill might not clear the old results.
- **Fix:** When "Ask AI" is clicked on a NEW product: 1) Clear `latestResults` so old showcase disappears. 2) Set the new product as page context. 3) Send the message. The AI response will populate the showcase fresh.
- **Status:** 🔴 Open

---

### BUG-004: Reset button doesn't fully reset — AI still talks about old product
- **Where:** Chat header → reset button (↻) while on a different page
- **Steps:** Have a conversation about a product → navigate to PLP → click reset → AI auto-greets but still references the old product instead of the current page context
- **Expected:** Full reset — AI should greet fresh based on current page (e.g. "Browsing footwear? I can help narrow it down")
- **Actual:** AI re-greets but the auto-greet message still uses stale context or the previous product
- **Root cause:** `resetConversation` clears messages and latestResults, and `hasGreeted` resets to false — so auto-greet fires again. BUT the auto-greet in ChatWidget reads `pageContextStore.viewingProduct` which might still hold the old product if user navigated back to PLP (where `viewingProduct` should be null, but `clearViewingProduct` might not have fired yet, or the auto-greet fires before `usePageContext` hook updates).
- **Fix:** In the auto-greet effect, read page context fresh at the moment of greeting (not from a stale closure). Also ensure `usePageContext` properly clears `viewingProduct` when on PLP.
- **Status:** 🔴 Open

---

### BUG-005: Reopening chat after close resumes old conversation instead of fresh start
- **Where:** Close chat (X or backdrop) → browse around → click floating bar to reopen
- **Steps:** Have a conversation → close chat → browse to different page → reopen chat
- **Expected:** Two possible behaviors (need to decide):
  - Option A: Fresh start every time — clear conversation, AI greets based on current page
  - Option B: Resume but AI acknowledges context change — "Welcome back! I see you're now looking at dresses. Want to continue where we left off or start fresh?"
- **Actual:** Old messages and showcase stay. No acknowledgment of context change. Feels stale.
- **Decision needed:** Should close = reset, or close = pause?
- **Status:** 🔴 Open — needs decision

---

### BUG-006: Blank screen when asking for different color — AI speaks but no UI
- **Where:** Voice mode → ask "Do you have this in black?" or "Show me a different color"
- **Steps:** Have a product in showcase → ask for different color → screen goes blank but voice still responds
- **Expected:** New product(s) appear in showcase, or AI explains no other colors available
- **Actual:** Blank white screen. Voice works but UI is empty.
- **Root cause:** AI likely responds with only text (describing the color options) without calling `show_product` or `show_products`. Since no product tool results come back, `latestResults` doesn't update. But the chat modal might have an issue rendering — the split view condition might evaluate to false if the AI's text-only response somehow clears state. OR: AI might call `navigate_to` which closes the chat.
- **Related to:** Same blank screen pattern as BUG when asking for details. Likely the AI is calling `navigate_to` or `show_product_detail` which triggers navigation away.
- **Fix:** Need to check what tool the AI actually calls. Likely same root cause — AI navigates away instead of showing products in showcase. System prompt needs to be clearer: when user asks for different color/style, use `show_products` to show alternatives, don't navigate.
- **Status:** 🔴 Open

---

### BUG-007: Auto-greet message is too long — AI rambles on intro
- **Where:** Chat opens → AI auto-greets in voice mode
- **Steps:** Open chat for the first time or after reset
- **Expected:** Short, punchy greeting — 1-2 sentences max. e.g. "Hey! I'm your FORMA stylist. What are you looking for today?"
- **Actual:** AI gives a long intro describing everything it can do, takes too long to speak
- **Root cause:** The auto-greet sends a chat message like "Hi, what can you help me with today?" — AI responds with a full paragraph. The system prompt says 3-5 sentences for voice mode.
- **Fix:** Two changes: 1) Change the auto-greet message to be more specific so AI doesn't over-explain. e.g. "Greet the customer briefly" 2) Add a special instruction in system prompt: "First greeting should be SHORT — one sentence max. Don't list your capabilities. Just say hi and ask what they need."
- **Status:** 🔴 Open

---

### BUG-008: AI mentions colors but single-image products can't show them
- **Where:** Voice mode → Slim Chino and other Unsplash-backed products
- **Steps:** Ask "Show me the Slim Chino in navy" → AI says navy is available but image stays khaki
- **Expected:** Show navy version or acknowledge image limitation
- **Actual:** AI talks about navy but only khaki image shows — confusing
- **Root cause:** Bottoms products only have 1 Unsplash image. Color data says Navy/Khaki but no navy image exists.
- **Fix:** Remove extra color options from single-image products. If we can't show it, don't offer it. Keep only the color that matches the image.
- **Status:** 🔴 Open

---

### BUG-009: AI shows wrong category products — asked for tshirts, got sneakers
- **Where:** Text mode → ask "and similar tshirts?"
- **Steps:** Ask about a shirt → follow up with "similar tshirts?" → AI shows sneakers instead of tops
- **Expected:** AI should show products from the tops category (tees, shirts)
- **Actual:** Shows sneakers (Off-White Sport Sneaker, Red Accent, Retro Rider) — wrong category
- **Root cause:** AI is confused about product indices or not filtering by category. The system prompt has the full catalog but the AI isn't matching categories correctly when asked for "similar."
- **Fix:** Add stronger instruction in system prompt: "When user asks for similar items, match the SAME category first. 'Similar tshirts' = search tops category only. Never cross categories unless user explicitly asks."
- **Status:** 🔴 Open

---

### BUG-010: Internal auto-greet prompt visible as user message in text mode
- **Where:** Voice mode auto-greets → switch to text mode → "Greet me briefly..." shows as user bubble
- **Steps:** Open chat (voice) → AI greets → switch to text → see internal prompt as user message
- **Expected:** Only real user messages visible. Auto-greet should be hidden/system-level.
- **Actual:** "Greet me briefly and ask what I'm looking for." shows as a dark user bubble
- **Root cause:** `sendChatMessage` adds ALL messages to the UI including the auto-greet. Need to send auto-greet as a hidden/system message that doesn't render.
- **Fix:** Add a `hidden` flag to the auto-greet message so it doesn't render in ChatBubble. Or use a separate function that adds to conversation history but not to UI messages.
- **Status:** 🔴 Open

---

*Keep testing — add more bugs below as you find them.*
