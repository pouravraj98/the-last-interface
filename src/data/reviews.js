/**
 * Customer Reviews — keyed by product ID
 */

export const reviews = {
  'off-white-sport-sneaker': [
    { name: 'James T.', rating: 5, date: 'Mar 2026', title: 'My everyday shoe now', text: 'Bought these for casual wear and they quickly became my go-to for everything. Super comfortable out of the box.', verified: true },
    { name: 'Priya K.', rating: 4, date: 'Feb 2026', title: 'Great quality, bold color', text: 'Beautiful shoe, great quality. The red accent is eye-catching. Runs true to size.', verified: true },
    { name: 'Marcus L.', rating: 5, date: 'Feb 2026', title: 'Versatile sneaker', text: 'Goes with jeans, chinos, even shorts. Get compliments every time I wear these.', verified: true },
  ],
  'retro-rider-trainer': [
    { name: 'David K.', rating: 5, date: 'Mar 2026', title: 'Retro vibes, modern comfort', text: 'The cushioning on these is surprisingly good for a retro-style shoe. Great for walks.', verified: true },
    { name: 'Emma S.', rating: 5, date: 'Mar 2026', title: 'So many compliments', text: 'The colorway is gorgeous. I get compliments every time I wear these. True to size.', verified: true },
    { name: 'Tom H.', rating: 4, date: 'Feb 2026', title: 'Great shoe, bold look', text: 'Love the look and feel. The retro style is on point. Very comfortable right away.', verified: true },
  ],
  'graphic-crew-tee': [
    { name: 'Mike D.', rating: 5, date: 'Mar 2026', title: 'Best basic tee I own', text: 'I have 6 of these now. The cotton weight is perfect — not too thin, not too thick.', verified: true },
    { name: 'Lisa C.', rating: 5, date: 'Mar 2026', title: 'Great everyday tee', text: 'Comfortable, well-made, holds its shape after washing. What more do you need?', verified: true },
    { name: 'Aisha M.', rating: 5, date: 'Feb 2026', title: 'Replaced all my old tees', text: 'Bought one to try, then ordered 4 more. The fit is perfect — relaxed but not sloppy.', verified: true },
  ],
  'slim-chino': [
    { name: 'Dan F.', rating: 5, date: 'Mar 2026', title: 'Perfect office pant', text: 'These chinos are exactly what I needed. Slim but not tight, stretch makes them super comfortable.', verified: true },
    { name: 'Kevin S.', rating: 4, date: 'Feb 2026', title: 'Great fit, good fabric', text: 'Love the khaki color. The stretch is nice without being too casual.', verified: true },
    { name: 'Maria G.', rating: 5, date: 'Feb 2026', title: 'Buy these immediately', text: 'I have been looking for chinos this good for years. The drape, the fit, the fabric — everything is dialed in.', verified: true },
  ],
  'merino-crewneck': [
    { name: 'Sophie L.', rating: 5, date: 'Mar 2026', title: 'Luxury feel at a fair price', text: 'This sweater feels like it should cost twice as much. The merino is incredibly soft.', verified: true },
    { name: 'Andrew M.', rating: 5, date: 'Feb 2026', title: 'Year-round staple', text: 'Light enough for spring, warm enough for fall. Machine washable is a huge plus.', verified: true },
    { name: 'Rachel K.', rating: 4, date: 'Jan 2026', title: 'Beautiful sweater', text: 'Gorgeous color and very soft. Runs slightly large — size down if between sizes.', verified: true },
  ],
  'original-straight-jean': [
    { name: 'Matt C.', rating: 5, date: 'Mar 2026', title: 'Real selvedge, great price', text: 'Proper selvedge denim at a fraction of the usual price. Already showing nice fade patterns.', verified: true },
    { name: 'Brian L.', rating: 5, date: 'Jan 2026', title: 'My new go-to jeans', text: 'Perfect straight leg cut. The button fly takes getting used to but I prefer it now.', verified: true },
  ],
  'performance-jogger': [
    { name: 'Tyler D.', rating: 5, date: 'Mar 2026', title: 'Gym to errands seamlessly', text: 'Look good enough for coffee runs but perform well at the gym. Zip pockets are clutch.', verified: true },
    { name: 'Derek P.', rating: 5, date: 'Jan 2026', title: 'Best joggers I have tried', text: 'Best balance of style and performance. No sagging, no bunching. Just right.', verified: true },
  ],
  'evening-gown': [
    { name: 'Victoria H.', rating: 5, date: 'Mar 2026', title: 'Show-stopping dress', text: 'Wore this to a gala and received so many compliments. The drape is exquisite and it photographs beautifully.', verified: true },
    { name: 'Catherine W.', rating: 5, date: 'Feb 2026', title: 'Worth every penny', text: 'The quality is incredible for this price point. The slit detail is tasteful and elegant.', verified: true },
    { name: 'Amara J.', rating: 4, date: 'Jan 2026', title: 'Gorgeous but runs small', text: 'Absolutely stunning dress. Size up — it runs about half a size small in the bust.', verified: true },
  ],
  'knit-midi-dress': [
    { name: 'Elena R.', rating: 5, date: 'Mar 2026', title: 'My most-worn dress', text: 'Threw it on for a work meeting, then wore it to dinner that evening. So versatile.', verified: true },
    { name: 'Jasmine P.', rating: 4, date: 'Feb 2026', title: 'Elegant and comfortable', text: 'The knit fabric is thick enough to look polished but stretchy enough to be comfortable all day.', verified: true },
  ],
  'crossbody-bag': [
    { name: 'Nicole F.', rating: 5, date: 'Mar 2026', title: 'Beautiful leather', text: 'The leather quality is outstanding. Developing a lovely patina already. Fits everything I need.', verified: true },
    { name: 'Rebecca T.', rating: 5, date: 'Feb 2026', title: 'Perfect everyday bag', text: 'Finally found a crossbody that fits my phone, wallet, keys, AND sunglasses without being bulky.', verified: true },
  ],
  'classic-sunglasses': [
    { name: 'Alex M.', rating: 5, date: 'Mar 2026', title: 'Great quality for the price', text: 'Polarized, solid build, looks premium. Better than some pairs I have paid three times as much for.', verified: true },
    { name: 'Jordan K.', rating: 4, date: 'Feb 2026', title: 'Classic look', text: 'Exactly what I wanted — simple black frames, good lenses. The case is a nice touch.', verified: true },
  ],
}

export function getReviewsForProduct(productId) {
  return reviews[productId] || []
}

export function getReviewSummary(productId) {
  const r = reviews[productId] || []
  if (r.length === 0) return { average: 0, count: 0, distribution: {} }
  const total = r.reduce((sum, rev) => sum + rev.rating, 0)
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  r.forEach((rev) => { distribution[rev.rating]++ })
  return { average: Math.round((total / r.length) * 10) / 10, count: r.length, distribution }
}
