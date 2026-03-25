# Phase 4 — Visual System: Risograph Passport Theme

---

## Principles

1. **Flat ink, no gradients** — every color is a single risograph ink drum. No blending, no linear-gradient.
2. **Documents, not cards** — surfaces are tinted paper with visible borders, not floating white rectangles.
3. **Serif stamps, sans data** — DM Serif Text for structural labels; system sans for values and body.
4. **Texture earns trust** — paper grain and ink speckle signal physicality. Never heavy enough to hinder reading.
5. **One hero per document** — each card surface has a single dominant element. Everything else supports it.

---

## Color Tokens

### Light Mode (.theme-risograph)

| Token | Hex | Role |
|-------|-----|------|
| `--riso-paper` | `#F4EDE1` | Page background — warm cream paper stock |
| `--riso-paper-light` | `#FAF5ED` | Default card interior — slightly lighter paper |
| `--riso-ink` | `#2D2B2A` | Primary text, headings, icons — charcoal ink |
| `--riso-ink-muted` | `#8A847E` | Secondary/metadata text — faded ink |
| `--riso-ink-faint` | `#B8B2A8` | Placeholder text, disabled states |
| `--riso-teal` | `#4AADA3` | Teal ink — visa document surfaces, positive movement, current status |
| `--riso-teal-dark` | `#2D7A72` | Teal text on teal surfaces (contrast) |
| `--riso-teal-wash` | `rgba(74, 173, 163, 0.12)` | Teal surface tint for document cards |
| `--riso-teal-wash-strong` | `rgba(74, 173, 163, 0.22)` | Teal surface for hero/primary documents |
| `--riso-coral` | `#CF7B73` | Coral ink — secondary documents, near status, warmth |
| `--riso-coral-dark` | `#A85A52` | Coral text on coral surfaces (contrast) |
| `--riso-coral-wash` | `rgba(207, 123, 115, 0.12)` | Coral surface tint for document cards |
| `--riso-gold` | `#DEAD45` | Marigold gold — borders, frames, highlights, rings |
| `--riso-gold-dark` | `#B8922A` | Gold text on light surfaces (contrast) |
| `--riso-gold-wash` | `rgba(222, 173, 69, 0.12)` | Gold surface tint (sparingly) |
| `--riso-red` | `#C43C3C` | Stamp red — alerts, retrogression, critical only |
| `--riso-red-wash` | `rgba(196, 60, 60, 0.10)` | Red surface tint (danger cards) |
| `--riso-border` | `#D1CABD` | Default neutral border — tan/warm gray |
| `--riso-border-teal` | `#4AADA3` | Teal document border |
| `--riso-border-coral` | `#CF7B73` | Coral document border |
| `--riso-border-gold` | `#DEAD45` | Gold accent border / frame |

### Dark Mode (.theme-risograph.dark) — "Night Print"

| Token | Hex | Role |
|-------|-----|------|
| `--riso-paper` | `#1C1917` | Dark warm charcoal stock |
| `--riso-paper-light` | `#272220` | Card interior on dark stock |
| `--riso-ink` | `#E9E1D4` | Primary text — cream on dark |
| `--riso-ink-muted` | `#9C9488` | Secondary text |
| `--riso-ink-faint` | `#5C5650` | Placeholder/disabled |
| `--riso-teal` | `#6CC5BB` | Brightened teal ink on dark stock |
| `--riso-teal-dark` | `#80D1C8` | Teal text (lighter for dark bg) |
| `--riso-teal-wash` | `rgba(108, 197, 187, 0.10)` | Teal surface tint |
| `--riso-teal-wash-strong` | `rgba(108, 197, 187, 0.18)` | Hero teal surface |
| `--riso-coral` | `#D9908A` | Brightened coral |
| `--riso-coral-dark` | `#E0A49E` | Coral text on dark |
| `--riso-coral-wash` | `rgba(217, 144, 138, 0.10)` | Coral surface tint |
| `--riso-gold` | `#E8BE5A` | Brightened gold |
| `--riso-gold-dark` | `#F0CC70` | Gold text on dark |
| `--riso-gold-wash` | `rgba(232, 190, 90, 0.10)` | Gold surface tint |
| `--riso-red` | `#D96060` | Brightened red |
| `--riso-red-wash` | `rgba(217, 96, 96, 0.10)` | Red surface tint |
| `--riso-border` | `#40382F` | Dark mode neutral border |
| `--riso-border-teal` | `#6CC5BB` | Teal border (dark) |
| `--riso-border-coral` | `#D9908A` | Coral border (dark) |
| `--riso-border-gold` | `#E8BE5A` | Gold border (dark) |

### Chart Palette (both modes)

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--chart-1` | `#4AADA3` | `#6CC5BB` | Teal — primary data series |
| `--chart-2` | `#CF7B73` | `#D9908A` | Coral — secondary data series |
| `--chart-3` | `#DEAD45` | `#E8BE5A` | Gold — tertiary / highlight |
| `--chart-4` | `#2D2B2A` | `#E9E1D4` | Ink — axis labels, gridlines |
| `--chart-5` | `#C43C3C` | `#D96060` | Red — retrogression bars |

---

## Semantic Color Mapping

### Status Colors

| Status | Surface | Text | Border | Meaning |
|--------|---------|------|--------|---------|
| Current | `--riso-teal-wash` | `--riso-teal-dark` | `--riso-border-teal` | Priority date is current |
| Filing | `--riso-gold-wash` | `--riso-gold-dark` | `--riso-border-gold` | Eligible to file |
| Near | `--riso-coral-wash` | `--riso-coral-dark` | `--riso-border-coral` | Approaching currency |
| Retrogressed | `--riso-red-wash` | `--riso-red` | `--riso-red` | Date moved backward |
| Flat/Waiting | `transparent` | `--riso-ink-muted` | `--riso-border` | No movement |

### Document Surface Assignment

| Document Type | Surface | Border | Used On |
|---------------|---------|--------|---------|
| Hero status card | `--riso-teal-wash-strong` | `--riso-border-teal` 2px | Dashboard primary |
| Secondary category card | `--riso-coral-wash` | `--riso-border-coral` 2px | Dashboard other categories |
| Input form | `--riso-paper-light` | `--riso-border-gold` 2px | Track input |
| Result/processed | `--riso-teal-wash` | `--riso-border-teal` 2px | Track result |
| Chart report | `--riso-paper-light` | `--riso-border` 2px | Trends charts |
| Milestone checklist | `--riso-paper-light` | `--riso-border` 2px, gold on complete | Milestones |
| News clipping | `--riso-paper-light` | `--riso-border-coral` 1.5px left-border | News articles |
| Glossary entry | `--riso-paper-light` | `--riso-border` 1.5px | Glossary terms |
| Comparison column | `--riso-teal-wash` / `--riso-coral-wash` | respective ink border 2px | Compare |
| Settings form | `--riso-paper-light` | `--riso-border-gold` 2px | Settings |
| Informational/hope | `--riso-gold-wash` | `--riso-border-gold` 1.5px | Hope context, explainers |

---

## Typography Tokens

| Token | Font | Size | Weight | Line-height | Letter-spacing | Usage |
|-------|------|------|--------|-------------|----------------|-------|
| `--type-display` | DM Serif Text | 36px | 400 | 1.1 | -0.01em | Hero numbers (cutoff date, days remaining) |
| `--type-h1` | DM Serif Text | 24px | 400 | 1.2 | -0.005em | Page titles |
| `--type-h2` | DM Serif Text | 20px | 400 | 1.25 | 0 | Section headings, card document titles |
| `--type-h3` | DM Serif Text | 17px | 400 | 1.3 | 0 | Card sub-headings, form section labels |
| `--type-body` | System sans | 15px | 400 | 1.5 | 0 | Body text, data values, descriptions |
| `--type-body-medium` | System sans | 15px | 500 | 1.5 | 0 | Emphasized data values |
| `--type-caption` | System sans | 13px | 400 | 1.4 | 0.005em | Metadata, timestamps, secondary info |
| `--type-badge` | System sans | 11px | 600 | 1 | 0.05em | Status badges, labels (uppercase) |
| `--type-tiny` | System sans | 11px | 400 | 1.3 | 0.01em | Disclaimers, fine print |

### Typography Rules
- **Serif = structure** — headings, document titles, form labels, section names. These are the "printed" parts of the form.
- **Sans = data** — the values, dates, body paragraphs, UI controls. These are "written in" by the user/system.
- **No font-weight above 600** — risograph doesn't do heavy bold; it has one ink pass.
- **Minimum 11px** — smaller text loses readability with paper texture.

---

## Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Icon-to-label gap, inline spacing |
| `--space-2` | 8px | Tight intra-element gap |
| `--space-3` | 12px | Related items within a card |
| `--space-4` | 16px | Card internal padding, standard gap |
| `--space-5` | 20px | Card padding (generous), page horizontal margin |
| `--space-6` | 24px | Between cards/documents within a section |
| `--space-7` | 32px | Between sections |
| `--space-8` | 48px | Major section breaks, page top/bottom padding |

### Spacing Rules
- **Inter-document gap: 24px** — documents are distinct; give them room to breathe.
- **Intra-document padding: 16-20px** — content within a document is cohesive.
- **Intra-field gap: 8-12px** — related fields within a form section are tight.
- **Page margin: 20px** — consistent horizontal breathing room.

---

## Radius Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Badges, small chips |
| `--radius-md` | 8px | Document cards, input fields |
| `--radius-lg` | 12px | Hero cards, modals |
| `--radius-pill` | 999px | Chip selectors, pill buttons |

### Radius Rules
- **Documents use 8-12px** — like a real document with slightly rounded corners from handling.
- **No rounded-full on cards** — documents aren't circular.
- **Chips/selectors stay pill-shaped** — these are UI controls, not documents.

---

## Border Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--border-thin` | 1.5px | Subtle borders (news left-accent, glossary entries) |
| `--border-normal` | 2px | Standard document borders |
| `--border-heavy` | 3px | Hero document frames, gold accent borders |

### Border Rules
- **Every document card has a visible border** — no borderless floating cards. Risograph ink has weight.
- **Border color matches document type** — teal documents get teal borders, coral get coral, etc.
- **Gold borders = important/active** — used for focused input, highlighted sections, completed milestones.

---

## Shadow Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-document` | `0 1px 3px rgba(45, 43, 42, 0.06)` | Default card — barely there, documents rest on paper |
| `--shadow-lifted` | `0 2px 8px rgba(45, 43, 42, 0.10)` | Hover state — document slightly lifted |
| `--shadow-stamp` | `0 1px 2px rgba(45, 43, 42, 0.15)` | Badges/stamps — pressed into paper |

### Shadow Rules
- **Shadows are minimal** — risograph is flat printing. Shadows only hint at paper stacking.
- **No blur above 8px** — keep edges tight, not glowy.
- **Dark mode shadows use `rgba(0,0,0, 0.3)`** — darker but same restraint.

---

## Texture Overlays

### Paper Grain
```css
body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  background-image: url("data:image/svg+xml,..."); /* fractal noise */
  opacity: 0.045; /* slightly stronger than current 0.035 */
  mix-blend-mode: multiply;
}
```

### Ink Speckle
```css
body::after {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  background-image: url("data:image/svg+xml,..."); /* white dots */
  opacity: 0.025; /* slightly stronger than current 0.02 */
  mix-blend-mode: screen;
}
```

### Dark Mode Adjustments
- Grain: `mix-blend-mode: screen`, `opacity: 0.04`
- Speckle: `mix-blend-mode: overlay`, `opacity: 0.03`

---

## Component Styling Guide

### Document Cards (all card types)
```
Background:  surface tint per document type (see mapping above)
Border:      2px solid, ink color per type
Radius:      8px (--radius-md)
Padding:     16-20px (--space-4 to --space-5)
Shadow:      --shadow-document
Hover:       --shadow-lifted, border brightens slightly
```

### Chip Selectors (country, category, mode toggles)
```
Inactive:    bg transparent, border 1.5px --riso-border, text --riso-ink
Active:      bg --riso-teal, text white, border --riso-teal
Radius:      --radius-pill (999px)
Padding:     6px 14px
Font:        --type-caption, weight 500
Transition:  150ms background-color, border-color
```

### Status Badges / Stamps
```
Background:  status surface color (see mapping)
Text:        status text color
Border:      1.5px solid, slightly darker than bg
Radius:      --radius-sm (4px)
Padding:     2px 8px
Font:        --type-badge (11px, uppercase, tracked)
Transform:   rotate(-2deg) — subtle stamp tilt
```

### Input Fields (Track form)
```
Background:  transparent
Border-bottom: 2px solid --riso-border (ruled line, not full box)
Padding:     8px 0
Font:        --type-body
Focus:       border-bottom-color --riso-gold, ring none
Placeholder: --riso-ink-faint
```
*Form fields look like ruled lines on a paper form, not boxed inputs.*

### Primary Button
```
Background:  --riso-ink (#2D2B2A)
Text:        --riso-paper (#F4EDE1)
Border:      none
Radius:      --radius-md (8px)
Padding:     12px 24px
Font:        --type-body-medium
Hover:       opacity 0.85
Active:      transform scale(0.98)
```

### Secondary/Ghost Button
```
Background:  transparent
Text:        --riso-ink
Border:      2px solid --riso-border
Radius:      --radius-md (8px)
Padding:     10px 20px
Font:        --type-body
Hover:       bg --riso-teal-wash, border --riso-teal
```

### Section Dividers
```
Decorative:  Chevron/arrow pattern using repeating SVG
             Color: --riso-gold at 40% opacity
             Height: 8px
             Margin: --space-7 vertical

Simple:      2px solid --riso-border
             Margin: --space-4 vertical
```

### Bottom Navigation
```
Background:  --riso-paper with backdrop-blur
Border-top:  2px solid --riso-border
Active icon: --riso-teal
Active bg:   --riso-teal-wash
Inactive:    --riso-ink-muted
Font:        --type-tiny
```

---

## Motion Guidelines

| Interaction | Duration | Easing | Property |
|-------------|----------|--------|----------|
| Card enter (stagger) | 300ms | ease-out | opacity, translateY(8px → 0) |
| Chip select | 150ms | ease-in-out | background-color, border-color |
| Card hover lift | 200ms | ease-out | box-shadow, border-color |
| Accordion expand | 250ms | ease-out | height, opacity |
| Badge appear | 200ms | spring(0.5) | scale(0.8 → 1), opacity |
| Page transition | 200ms | ease-in-out | opacity |
| Stamp rotate | 0ms | none | Static transform, no animation |

### Motion Rules
- **No spring/bounce on cards** — documents don't bounce. Use ease-out only.
- **Stagger delays: 50ms** between sibling cards entering.
- **No parallax or 3D transforms** — flat print aesthetic.
- **Confetti (milestones)** — keep but tint particles with risograph palette (teal, coral, gold).
- **VelocityArc** — keep but use risograph teal/coral/red instead of blue.

---

## Accessibility Notes

| Requirement | Implementation |
|-------------|----------------|
| Color contrast | All text/bg combos meet WCAG AA (4.5:1 min). Teal-dark on teal-wash = 5.2:1. Coral-dark on coral-wash = 4.8:1. Ink on paper = 12.1:1. |
| Focus visible | 2px solid --riso-gold outline, 2px offset. Gold is high-contrast on both light and dark. |
| Motion preference | `prefers-reduced-motion: reduce` → disable stagger, reduce transitions to 0ms. Stamp rotation stays (static). |
| Touch targets | Minimum 44×44px for all interactive elements. Chips, buttons, nav items. |
| Screen reader | Decorative textures use `pointer-events: none` and `aria-hidden`. Chevron dividers are presentational. |
| Color independence | Status is never communicated by color alone — always paired with text label and/or icon. |

---

## Do

- Use teal and coral as **bold surface tints** on document cards, not tiny accent dots
- Give every card a **visible 2px+ border** in its semantic color
- Apply **DM Serif Text** to all headings, card titles, and form section labels
- Use **gold borders** to frame important or active documents
- Maintain **generous 24px gaps** between documents
- Use **ruled lines** (border-bottom only) for form inputs instead of boxed inputs
- Tilt status badges **2-3 degrees** for organic stamp feel
- Use **flat, solid colors** — risograph inks never gradient
- Apply **chevron/arrow divider patterns** between major sections

## Don't

- Use any `linear-gradient` or `radial-gradient` — violates risograph ink model
- Make all cards the same white — **vary surface tints** by document type
- Use borders thinner than 1.5px — risograph ink has visible weight
- Apply shadows deeper than `0 2px 8px` — documents stack, they don't float
- Use neon or high-saturation blues — palette is **earthy and muted**
- Go below 11px font size — texture overlay reduces fine-text legibility
- Use `rounded-full` on document cards — real documents have slight corners
- Apply glassmorphism, blur effects, or transparency on cards
- Animate cards with spring/bounce — physical documents don't spring
- Use `font-weight: 700+` — risograph has single ink density per pass
