# Handoff Summary — Risograph Passport Theme Refinement

## What was done

A full 7-phase design workflow refined the Risograph Passport theme across all 8 screens of the VisaDate Tracker app, transforming uniform white cards into distinct, surface-tinted document types inspired by a vintage passport/visa illustration reference.

## Files modified (16 total)

### CSS Foundation
- **`src/app/globals.css`** — 10 new risograph utility classes, hero text override, stronger texture overlays, 2px default borders, flat ink (no gradients)

### Page Components (8)
- **`src/app/page.tsx`** — Dashboard: teal hero, coral secondary cards, chevron divider, gold settings link
- **`src/app/track/page.tsx`** — Gold-bordered input form, ruled-line inputs, coral error cards
- **`src/app/trends/page.tsx`** — Neutral chart cards, gold-accent narrative, coral retrogression events
- **`src/app/milestones/page.tsx`** — Neutral milestone cards, stamped checkmarks (2° rotation)
- **`src/app/news/page.tsx`** — Coral left-border news clippings
- **`src/app/glossary/page.tsx`** — Neutral term cards, ruled-line search input
- **`src/app/compare/page.tsx`** — Teal EB2 vs coral EB3 side-by-side columns
- **`src/app/settings/page.tsx`** — Gold-bordered preferences form

### Layout Components (1)
- **`src/components/layout/bottom-nav.tsx`** — 2px top border

### UI Components (5)
- **`src/components/ui/confetti-burst.tsx`** — Risograph palette particles (teal/coral/gold)
- **`src/components/ui/empty-state.tsx`** — Replaced 6 hardcoded blues with `text-calm-blue` + `currentColor`
- **`src/components/ui/velocity-arc.tsx`** — Teal/coral/warm-neutral gradient stops
- **`src/components/ui/hope-context.tsx`** — Added gold-accent document surface
- **`src/components/track/result-card.tsx`** — Added teal document surface

### Design Documentation (5)
- **`design-output/normalized-brief.md`** — Product brief
- **`design-output/design-extraction.md`** — Reference deconstruction (7 principles, gap analysis)
- **`design-output/wireframe-blueprint.md`** — Screen anatomy for all 8 pages
- **`design-output/design-system.md`** — Full token system (colors, typography, spacing, borders, shadows, motion)
- **`design-output/ui-implementation-notes.md`** — Implementation approach and known limitations

## Architecture decisions

### CSS-scoped utilities (zero runtime cost)
All risograph styling uses utility classes (`riso-doc-teal`, `riso-doc-coral`, etc.) that are **no-ops outside `.theme-risograph`**. This means:
- No `if (theme === "risograph")` checks in any component
- No useThemeStore imports needed in page components
- Quiet Clarity theme is completely unaffected
- Adding the classes costs nothing when the theme isn't active

### Document surface assignment rules
| Surface class | Used for |
|---------------|----------|
| `riso-doc-teal-strong` | Hero/primary focal card (one per page max) |
| `riso-doc-teal` | Positive status, result cards, EB2 comparisons |
| `riso-doc-coral` | Secondary cards, warnings, EB3 comparisons, retrogressions |
| `riso-doc-gold` | Form containers (input forms, settings) |
| `riso-doc-neutral` | Default cards (charts, glossary entries, skeletons) |
| `riso-doc-gold-accent` | Informational cards, disclaimers, hope context |
| `riso-doc-coral-accent` | News clippings (left-border accent) |

## Future screen guidance

When adding a new screen to the app:

1. **Identify the hero element** — what is the single most important piece of information? Give its card `riso-doc-teal-strong`.
2. **Categorize remaining cards** using the surface assignment table above.
3. **Add a `riso-divider`** between the hero section and the next section.
4. **Use `riso-doc-gold-accent`** for all disclaimers and informational callouts.
5. **Use `riso-doc-neutral`** for any card that doesn't have a strong semantic role.
6. **Never use gradients** — the risograph aesthetic is flat ink. Use wash + border instead.
7. **Keep serif for structure, sans for data** — headings and labels in DM Serif Text, values and body text in system sans.
8. **Minimum font size: 11px** — texture overlay reduces fine-text legibility.

## What was NOT changed

- **Quiet Clarity theme** — completely untouched
- **Journey Snapshot export** — has its own visual identity independent of theme
- **API routes, data logic, state management** — no functional changes
- **Accessibility features** — all ARIA labels, keyboard nav, focus states preserved

## Build status
✅ `next build` passes with zero TypeScript or compilation errors after all changes.
