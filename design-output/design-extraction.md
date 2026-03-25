# Phase 2 — Reference Deconstruction

## Reference: Vintage Passport/Visa Illustration (Risograph Style)

---

## Design Principles (7)

### 1. Layered Paper Surfaces
The reference shows documents stacked at slight offsets — a teal-bordered visa/permit card overlapping a coral/salmon ID page. The app should feel like *leafing through documents*, with cards that have real material presence: distinct backgrounds, visible edges, and subtle stacking depth.

### 2. Government Artifact Warmth
The aesthetic is *official but human*. Not sterile government forms — instead, the warmth of a well-worn passport: cream paper stock, ink that bleeds slightly, stamps that land at imperfect angles. Typography is authoritative (serif) but the texture is approachable.

### 3. Constrained Ink Palette
Risograph printing uses a fixed set of ink drums. Each color is deliberate and limited. The reference uses exactly 5 inks: **cream/paper, teal, coral/salmon, marigold gold, charcoal black**. Colors never blend or gradient — they either overlap (creating darker variants) or sit cleanly next to each other.

### 4. Texture as Authenticity
The grain, speckle, and slight misregistration are not decoration — they signal *physical printing*. This texture should be visible but never interfere with readability. It's the difference between a government PDF and a printed document you'd hold.

### 5. Bold Typographic Hierarchy
The reference uses thick, confident strokes for headings and form labels. There's a strong separation between "label" text (bold, structured) and "data" text (the values that fill in forms). The app should echo this: headings feel *stamped*, data feels *written in*.

### 6. Decorative Borders as Wayfinding
Chevron/arrow tape borders, scalloped edges, and ruled lines aren't ornamental — they delineate sections like a physical form. The app should use border patterns and dividers as structural elements, not just hairlines.

### 7. Single Focal Point Per Surface
Each document in the reference has one dominant element — the stamp/seal on the visa, the portrait on the ID. The app should avoid competing focal points on a single card. One hero number, one status indicator, one action.

---

## Style Trait Inventory

### Color Roles (from reference)

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Paper / Background | Warm cream | `#F4EDE1` | Page background, card interiors |
| Ink / Text | Charcoal | `#2D2B2A` | Body text, headings, primary UI |
| Document Teal | Seafoam teal | `#4AADA3` | Visa card surface, positive movement, "current" status |
| Warm Coral | Salmon/coral | `#CF7B73` | ID card surface, secondary surfaces, "near" status |
| Border Gold | Marigold | `#DEAD45` | Document borders, accent frames, highlights, rings |
| Stamp Red | Deep red | `#C43C3C` | Alerts, retrogression, critical status only |
| Deep Teal | Darker teal | `#2D7A72` | Teal text on light teal surfaces (contrast) |

**Color behavior rules:**
- Teal and coral are *surface* colors — they tint entire cards, not just small badges
- Gold is a *border/frame* color — it outlines, never fills large areas
- Red is *rare and urgent* — stamps, denials, retrogression only
- Charcoal is the primary text color on cream; cream is the primary text color on teal/coral
- No gradients. Flat ink only. Colors can overlap at reduced opacity to simulate overprint.

### Dark Mode ("Night Print") Adjustments
- Paper becomes dark warm charcoal (`#1C1917`)
- Inks brighten slightly as if printed on dark stock
- Texture overlays invert: grain uses `screen` blend mode
- Gold becomes more luminous as the primary accent against dark

---

## Typography Hierarchy

| Level | Style | Reference Cue |
|-------|-------|---------------|
| Display / Hero number | DM Serif Text, 32-40px, charcoal | The large stamp/seal — the single most important number |
| Section heading | DM Serif Text, 20-24px, charcoal | Form section labels — "VISA", document type headers |
| Card title | DM Serif Text, 16-18px, charcoal | Field labels on the document forms |
| Body / Data values | System sans-serif, 14-15px, charcoal | The filled-in data, dates, descriptions |
| Caption / Metadata | System sans-serif, 12-13px, muted charcoal | Small print, footnotes, secondary info |
| Badge / Status label | System sans-serif, 11-12px, uppercase, tracked | Stamped labels, status indicators |

**Key rule:** Serif = structure/labels (the form itself). Sans = data/values (what's written in). This separation is critical to the vintage document feel.

---

## Spacing Rhythm

The reference shows generous negative space between document elements with tight grouping within related fields.

| Token | Value | Usage |
|-------|-------|-------|
| Page padding | 16-20px | Screen edge margins |
| Section gap | 24-32px | Between major card groups |
| Card padding | 16-20px | Interior card breathing room |
| Intra-card gap | 8-12px | Between related fields within a card |
| Border width | 2-3px | Document border/frame thickness |
| Card radius | 8-12px | Rounded but not pill-shaped — like a real document corner |

**Key rule:** More space *between* cards, less space *within* cards. Documents feel separate from each other but internally cohesive.

---

## Surface Language

| Surface | Treatment |
|---------|-----------|
| Page background | Cream `#F4EDE1` with paper grain overlay |
| Primary card | Off-white `#FAF5ED` with 2px border in `#D1CABD` or gold |
| Teal document card | Teal `#4AADA3` at 12-18% opacity fill, 2px teal border |
| Coral document card | Coral `#CF7B73` at 12-18% opacity fill, 2px coral border |
| Gold-framed highlight | White/cream fill with 2-3px gold `#DEAD45` border |
| Elevated card | Subtle warm shadow (`0 2px 8px rgba(45,43,42,0.08)`) |
| Stamp/badge | Solid ink color, rotated 2-5°, slightly rough edge feel |

**Key rule:** Cards should feel like *distinct documents* — each with their own paper color, border treatment, and content structure. Not uniform white rectangles.

---

## Component Cues from Reference

| Reference Element | App Component Mapping |
|---|---|
| Teal visa card with seal | Dashboard hero card — bulletin status with movement indicator |
| Coral ID page with portrait and fields | Track result card — priority date evaluation |
| Gold chevron border tape | Section dividers, card group separators |
| Circular seal/stamp | Status badges, category indicators |
| Form field rows (lines + text) | Data display rows (label: value pairs) |
| Wavy lines (signature area) | Decorative separator or loading state |
| Fern/leaf decoration | Optional decorative element for empty states |
| Stacked document offset | Card stacking for related cards (e.g., Final Action + Filing dates) |

---

## Do / Don't Rules

### DO
- Use teal and coral as *surface tints* for cards, not just tiny accent dots
- Apply DM Serif Text to all structural labels and headings
- Use gold borders to frame important sections
- Add paper grain texture to backgrounds
- Make cards feel like individual documents with distinct borders
- Use flat, solid colors — risograph inks don't gradient
- Rotate status badges/stamps slightly (1-3°) for organic feel
- Keep generous whitespace between document-cards
- Use chevron/arrow patterns as decorative dividers

### DON'T
- Use gradients anywhere (violates risograph ink model)
- Make all cards the same white — vary surface tints
- Use thin 1px borders — risograph printing has visible ink weight (2-3px)
- Apply drop shadows heavier than `0 2px 8px` — documents stack, they don't float
- Use neon or high-saturation colors — risograph inks are muted and earthy
- Make text smaller than 12px — printed documents have readable type
- Use rounded-full pills for cards — documents have slight corner radius only
- Add blur effects or glassmorphism — incompatible with print aesthetic
- Animate aggressively — physical documents don't bounce or spring

---

## Gap Analysis: Current Implementation vs. Reference

| Aspect | Current Theme | Reference Target | Gap |
|--------|--------------|-------------------|-----|
| Card surfaces | Uniform off-white `#FAF5ED` | Varied — teal tints, coral tints, gold-bordered | **Large** — cards all look the same |
| Card borders | Muted tan `#D1CABD` 1px | 2-3px in teal, coral, or gold per card type | **Large** — borders too subtle |
| Color usage | Teal/coral as small accents | Teal/coral as full surface tints | **Large** — not using color boldly enough |
| Typography | DM Serif on headings | DM Serif on headings + form labels | **Small** — mostly there |
| Texture | Grain at 0.035 opacity | Visible but not heavy grain | **Small** — could be slightly stronger |
| Card radius | 0.5rem (8px) | 8-12px | **OK** — close enough |
| Decorative elements | None | Chevron borders, stamps, seals | **Large** — missing entirely |
| Document feel | Generic card UI | Distinct layered documents | **Large** — key identity missing |
| Gradients | Hero card uses gradient | No gradients in risograph | **Medium** — needs removal |
| Shadows | Standard card shadows | Minimal warm shadows | **Small** — minor adjustment |
