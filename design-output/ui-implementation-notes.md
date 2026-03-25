# Phase 5 — UI Implementation Notes

## Approach

Instead of conditional JS-based theme detection, the implementation uses **CSS-scoped utility classes** that only activate under `.theme-risograph`. This means:
- Zero runtime overhead — no theme checks in component logic
- Classes like `riso-doc-teal` are harmless no-ops when Quiet Clarity is active
- All risograph styling lives in globals.css under `.theme-risograph` selectors

## Files Modified

### globals.css — Foundation
- Added 10 document surface utilities: `riso-doc-teal`, `riso-doc-teal-strong`, `riso-doc-coral`, `riso-doc-gold`, `riso-doc-neutral`, `riso-doc-gold-accent`, `riso-doc-coral-accent`, `riso-stamp`, `riso-divider`, `riso-input-ruled`
- Each has light and dark mode variants
- Hero card text override: `riso-doc-teal-strong` forces `color: foreground` on all children (overrides `text-white` from the gradient card)
- Gradient override changed from re-mapping gradient colors to `background-image: none` (fully flat)
- Texture overlay opacity increased: grain 0.035 → 0.045, speckle 0.02 → 0.025
- All `.border-border/50` elements get 2px borders in risograph mode

### page.tsx (Dashboard)
- Hero bulletin card → `riso-doc-teal-strong` (strong teal wash + 3px teal border)
- Primary status card → `riso-doc-teal`
- MovementCard → `riso-doc-coral` (coral wash for secondary category cards)
- "What Changed" card → `riso-doc-neutral`
- News preview cards → `riso-doc-coral-accent` (coral left-border)
- Settings link → `riso-doc-gold`
- Disclaimer → `riso-doc-gold-accent`
- Chevron divider (`riso-divider`) inserted between hero and status cards

### track/page.tsx
- Input form → `riso-doc-gold` (gold-bordered government form)
- Country select + date input → `riso-input-ruled` (ruled-line style)
- Error card → `riso-doc-coral`
- Saved tracker cards → `riso-doc-neutral`

### trends/page.tsx
- Chart cards (line, bar) → `riso-doc-neutral`
- Movement narrative → `riso-doc-gold-accent`
- Retrogression events → `riso-doc-coral`

### milestones/page.tsx
- Milestone cards → `riso-doc-neutral`
- CheckSquare (checked state) → `riso-stamp` (2° rotation)
- Disclaimer → `riso-doc-gold-accent`

### news/page.tsx
- News article cards → `riso-doc-coral-accent` (coral left-border "clipping")
- Skeleton cards → `riso-doc-neutral`
- Disclaimer → `riso-doc-gold-accent`

### glossary/page.tsx
- Glossary term cards → `riso-doc-neutral`
- Search input → `riso-input-ruled`

### compare/page.tsx
- EB2 column → `riso-doc-teal`
- EB3 column → `riso-doc-coral`
- `CategoryColumn` now accepts optional `className` prop
- Recommendation card → `riso-doc-gold-accent`
- Error card → `riso-doc-coral`
- Disclaimers → `riso-doc-gold-accent`

### settings/page.tsx
- Priority Configuration → `riso-doc-gold` (gold-bordered form)
- Appearance → `riso-doc-neutral`
- Disclaimer → `riso-doc-gold-accent`

### bottom-nav.tsx
- Border thickness increased: `border-t` → `border-t-2`

## Known Limitations

1. **HopeContext, ResultCard, JourneySnapshot** — These are imported components in `src/components/ui/` and `src/components/track/`. They were not modified in this pass. Their cards will inherit the default 2px border treatment from the global `.border-border/50` override but won't have specific document surface tints.

2. **VelocityArc** — Still uses the default color scheme. Could be updated to use risograph teal/coral/red in a future pass.

3. **Chart components** (TrendLineChart, MovementBarChart) — The chart colors are already handled by the `--chart-*` CSS variables in the risograph theme block, so they automatically use risograph palette colors. No code changes needed.

4. **Confetti particles** — Still use default colors. Could be tinted to risograph palette.

## Build Status

✅ `next build` passes with zero TypeScript or compilation errors.
