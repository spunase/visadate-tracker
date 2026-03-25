# Phase 3 — Wireframe Blueprint

> Structure only. No color or decoration decisions — those come in Phase 4.
> All screens are mobile-first (max-width ~448px), single-column.

---

## Global Shell

```
┌──────────────────────────────┐
│  [Status Bar - system]       │
│                              │
│  ┌──────────────────────────┐│
│  │ Page Content (scrollable)││
│  │                          ││
│  │                          ││
│  │                          ││
│  │                          ││
│  └──────────────────────────┘│
│                              │
│  ┌──────────────────────────┐│
│  │ Bottom Nav (fixed)       ││
│  │ Home Track Trends Mile.. ││
│  └──────────────────────────┘│
└──────────────────────────────┘
```

**Bottom Nav:** 6 tabs — Home, Track, Trends, Milestones, News, Glossary. Fixed at bottom, safe-area aware. Active tab has animated indicator.

**Page Header:** Every page gets a top-left title (serif heading) with optional right-aligned action area (theme toggle, settings gear, notifications).

---

## Screen 1: Dashboard (Home)

**User goal:** Instantly see how my priority date compares to the latest bulletin.

### Anatomy (top to bottom)

```
┌──────────────────────────────┐
│ HEADER                       │
│ "VisaDate Tracker"    [⚙][🎨]│
│  March 2026 Bulletin         │
├──────────────────────────────┤
│                              │
│ ┌─ COUNTRY CHIPS ──────────┐│
│ │ India  China  Phil  Other ││
│ └───────────────────────────┘│
│ ┌─ CATEGORY CHIPS ─────────┐│
│ │ EB-1    EB-2    EB-3     ││
│ └───────────────────────────┘│
│                              │
│ ╔══════════════════════════╗ │
│ ║ HERO DOCUMENT CARD       ║ │
│ ║ "Your EB-2 Status"      ║ │
│ ║                          ║ │
│ ║  ┌─────────┐ ┌────────┐ ║ │
│ ║  │Final Act│ │Filing  │ ║ │
│ ║  │ Date    │ │ Date   │ ║ │
│ ║  │ Jan 2012│ │ Sep 2013║ │
│ ║  └─────────┘ └────────┘ ║ │
│ ║                          ║ │
│ ║  [Movement Indicator]    ║ │
│ ║  +45 days forward ↑     ║ │
│ ║                          ║ │
│ ║  [VelocityArc visual]   ║ │
│ ╚══════════════════════════╝ │
│                              │
│ ┌──── OTHER CATEGORIES ────┐ │
│ │ EB-1 card (compact)      │ │
│ │ EB-3 card (compact)      │ │
│ └──────────────────────────┘ │
│                              │
│ ┌── WHAT CHANGED ──────────┐ │
│ │ Summary of month's moves │ │
│ └──────────────────────────┘ │
│                              │
│ ┌── HOPE CONTEXT ──────────┐ │
│ │ Encouragement message    │ │
│ └──────────────────────────┘ │
│                              │
│ ▸ Other Countries (collapse) │
│                              │
│ ┌── TOP NEWS ──────────────┐ │
│ │ 3 article previews       │ │
│ └──────────────────────────┘ │
│                              │
│ ┌── SHARE ─────────────────┐ │
│ │ Journey Snapshot export  │ │
│ └──────────────────────────┘ │
│                              │
│ [Disclaimer fine print]      │
└──────────────────────────────┘
```

### Priority map
1. **Hero document card** — THE focal point. Shows selected category status with both dates and movement. This is the "visa stamp" equivalent.
2. **Country/Category selectors** — Quick switching, always visible above fold.
3. **Other categories** — Secondary context (what else is happening for my country).
4. **What Changed** — Monthly diff summary.
5. **Everything below** — tertiary: hope, news preview, share, disclaimer.

### Component hierarchy
- `PageHeader` → title + action buttons
- `ChipSelector` × 2 → country, category (radiogroup pattern)
- `HeroDocumentCard` → primary status (teal document surface)
- `CompactCategoryCard` × 2 → other EB categories (coral/neutral documents)
- `ChangesSummaryCard` → monthly movement summary
- `HopeContextCard` → encouragement
- `CollapsibleSection` → other countries
- `NewsPreviewList` → 3 items
- `JourneySnapshot` → share/export

### Responsive collapse
- Single column at all breakpoints
- Hero card always full-width
- Compact category cards stack vertically on narrow, 2-col grid on wider
- Collapsible section closed by default

---

## Screen 2: Track

**User goal:** Enter my priority date and see if I'm current / eligible to file.

### Anatomy

```
┌──────────────────────────────┐
│ HEADER                       │
│ "Check Your Status"          │
├──────────────────────────────┤
│                              │
│ ╔══════════════════════════╗ │
│ ║ INPUT FORM DOCUMENT      ║ │
│ ║                          ║ │
│ ║ Category:  [EB1][EB2][3] ║ │
│ ║ ─────────────────────── ║ │
│ ║ Country:   [Dropdown ▾]  ║ │
│ ║ ─────────────────────── ║ │
│ ║ Priority:  [Date input]  ║ │
│ ║ ─────────────────────── ║ │
│ ║ Path:      [AOS] [CP]   ║ │
│ ║                          ║ │
│ ║ [ Check Status ████████ ]║ │
│ ╚══════════════════════════╝ │
│                              │
│ ╔══════════════════════════╗ │
│ ║ RESULT DOCUMENT          ║ │
│ ║ (appears after check)    ║ │
│ ║                          ║ │
│ ║ Status: CURRENT ✓        ║ │
│ ║ or: XX days remaining    ║ │
│ ║                          ║ │
│ ║ [JourneyProgress bars]   ║ │
│ ║                          ║ │
│ ║ [Save] [Share]           ║ │
│ ╚══════════════════════════╝ │
│                              │
│ ┌── SAVED TRACKERS ────────┐ │
│ │ Tracker 1          [✕]   │ │
│ │ Tracker 2          [✕]   │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

### Priority map
1. **Input form document** — THE action. Styled as a fill-in government form.
2. **Result document** — appears on submit, styled as a different document (stacked on top of form visually).
3. **Saved trackers** — tertiary, list below.

### Key structural note
The input form should feel like a **blank government form** with ruled lines between fields. The result should feel like a **stamped/processed document** — a different paper surface from the form.

---

## Screen 3: Trends

**User goal:** See historical movement of cutoff dates over time.

### Anatomy

```
┌──────────────────────────────┐
│ HEADER                       │
│ "Trends & History"           │
├──────────────────────────────┤
│                              │
│ ┌─ CATEGORY CHIPS ─────────┐│
│ │ EB-1    EB-2    EB-3     ││
│ └───────────────────────────┘│
│ ┌─ COUNTRY CHIPS ──────────┐│
│ │ India   China   Other    ││
│ └───────────────────────────┘│
│ ┌─ MODE TOGGLE ────────────┐│
│ │ Final Action | Filing    ││
│ └───────────────────────────┘│
│                              │
│ ╔══════════════════════════╗ │
│ ║ LINE CHART DOCUMENT      ║ │
│ ║ [TrendLineChart]         ║ │
│ ║ Priority date movement   ║ │
│ ║ over 12+ months          ║ │
│ ╚══════════════════════════╝ │
│                              │
│ ╔══════════════════════════╗ │
│ ║ BAR CHART DOCUMENT       ║ │
│ ║ [MovementBarChart]       ║ │
│ ║ Monthly +/- days         ║ │
│ ╚══════════════════════════╝ │
│                              │
│ ┌── NARRATIVE ─────────────┐ │
│ │ Plain-English trend      │ │
│ │ summary                  │ │
│ └──────────────────────────┘ │
│                              │
│ ┌── RETROGRESSION LOG ─────┐ │
│ │ Event cards (if any)     │ │
│ │ Hope context card        │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

### Priority map
1. **Filters** — always above charts so user controls context first.
2. **Line chart** — primary visual, the trend over time.
3. **Bar chart** — secondary, monthly delta view.
4. **Narrative + retrogression** — explanatory context below charts.

---

## Screen 4: Milestones

**User goal:** Know what to prepare at each stage of the immigration process.

### Anatomy

```
┌──────────────────────────────┐
│ HEADER                       │
│ "Your Milestones"            │
├──────────────────────────────┤
│                              │
│ ┌── YOUR BAND ─────────────┐ │
│ │ Current status indicator  │ │
│ └──────────────────────────┘ │
│                              │
│ ┌─ BAND FILTER CHIPS ──────┐│
│ │ Far  Approaching  Near   ││
│ │ File-Ready  Current      ││
│ └───────────────────────────┘│
│                              │
│ ╔══════════════════════════╗ │
│ ║ MILESTONE DOCUMENT 1     ║ │
│ ║ Title         [band dot] ║ │
│ ║ Description              ║ │
│ ║ Sources: [badge] [badge] ║ │
│ ║ ☐ Checklist item 1       ║ │
│ ║ ☐ Checklist item 2       ║ │
│ ║ ☑ Checklist item 3       ║ │
│ ╚══════════════════════════╝ │
│                              │
│ ╔══════════════════════════╗ │
│ ║ MILESTONE DOCUMENT 2     ║ │
│ ║ ...                      ║ │
│ ╚══════════════════════════╝ │
│                              │
│ [Disclaimer]                 │
└──────────────────────────────┘
```

### Priority map
1. **Band indicator** — where am I in the process right now.
2. **Band filter** — narrow view to relevant milestones.
3. **Milestone cards** — each is a "document" with checklist items. Interactive checkboxes with confetti on completion.

### Key structural note
Milestone cards should feel like **checklist forms** — each one a discrete document you're working through. Checked items feel "stamped complete."

---

## Screen 5: News

**User goal:** Stay informed on immigration policy changes.

### Anatomy

```
┌──────────────────────────────┐
│ HEADER                       │
│ "Immigration News"           │
├──────────────────────────────┤
│                              │
│ ┌─ TOPIC TABS ─────────────┐│
│ │ All  USCIS  H-1B  EB     ││
│ └───────────────────────────┘│
│                              │
│ ╔══════════════════════════╗ │
│ ║ NEWS ARTICLE CARD 1      ║ │
│ ║ [Topic badge] [Source]   ║ │
│ ║ [Freshness indicator]    ║ │
│ ║ ─────────────────────── ║ │
│ ║ Headline (serif)         ║ │
│ ║ Summary text             ║ │
│ ║ "Why it matters"         ║ │
│ ║ [Read source →]          ║ │
│ ╚══════════════════════════╝ │
│                              │
│ ╔══════════════════════════╗ │
│ ║ NEWS ARTICLE CARD 2      ║ │
│ ║ ...                      ║ │
│ ╚══════════════════════════╝ │
└──────────────────────────────┘
```

### Priority map
1. **Topic filter** — quick narrowing.
2. **Article cards** — each a distinct "clipping" document. Headline is the focal point. Badges and freshness are metadata in the document header.

---

## Screen 6: Glossary

**User goal:** Look up an immigration term quickly.

### Anatomy

```
┌──────────────────────────────┐
│ HEADER                       │
│ "Glossary"                   │
├──────────────────────────────┤
│                              │
│ ┌── SEARCH ────────────────┐ │
│ │ 🔍 Search terms...   [✕] │ │
│ │ X results found          │ │
│ └──────────────────────────┘ │
│                              │
│ ╔══════════════════════════╗ │
│ ║ TERM CARD (collapsed)    ║ │
│ ║ Priority Date        [▾] ║ │
│ ╚══════════════════════════╝ │
│                              │
│ ╔══════════════════════════╗ │
│ ║ TERM CARD (expanded)     ║ │
│ ║ Adjustment of Status [▴] ║ │
│ ║ ─────────────────────── ║ │
│ ║ Definition text          ║ │
│ ║ Related: [PD] [I-485]   ║ │
│ ║ Source: [uscis.gov →]    ║ │
│ ╚══════════════════════════╝ │
│                              │
│ ╔══════════════════════════╗ │
│ ║ TERM CARD (collapsed)    ║ │
│ ║ Visa Bulletin        [▾] ║ │
│ ╚══════════════════════════╝ │
└──────────────────────────────┘
```

### Priority map
1. **Search** — primary action, always at top.
2. **Term cards** — accordion pattern. Collapsed = just the term name. Expanded = definition + related terms + source.

### Key structural note
Glossary terms should feel like **index cards** or dictionary entries — compact documents with ruled separator between term and definition.

---

## Screen 7: Compare

**User goal:** See EB-2 vs EB-3 side by side for my country.

### Anatomy

```
┌──────────────────────────────┐
│ HEADER                       │
│ [←] "Compare Categories"     │
├──────────────────────────────┤
│                              │
│ Bulletin: March 2026         │
│                              │
│ ┌─ COUNTRY CHIPS ──────────┐│
│ │ India   China   Other    ││
│ └───────────────────────────┘│
│ ┌─ MODE TOGGLE ────────────┐│
│ │ Final Action | Filing    ││
│ └───────────────────────────┘│
│                              │
│ ┌────────────┬─────────────┐ │
│ │   EB-2     │    EB-3     │ │
│ │            │             │ │
│ │ Cutoff:    │ Cutoff:     │ │
│ │ Jan 2012   │ Jun 2011    │ │
│ │            │             │ │
│ │ Movement:  │ Movement:   │ │
│ │ +45 days   │ +30 days    │ │
│ │            │             │ │
│ │ Distance:  │ Distance:   │ │
│ │ 4,380 days │ 5,110 days  │ │
│ └────────────┴─────────────┘ │
│                              │
│ ┌── EXPLAINER ─────────────┐ │
│ │ Understanding the        │ │
│ │ EB-2 vs EB-3 tradeoff    │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

### Priority map
1. **Filters** — country + mode selection.
2. **Comparison columns** — the two category "documents" side by side. Each column is a mini-document with its own data.
3. **Explainer** — educational context below.

### Key structural note
The two columns should feel like **two documents laid side by side** — each with its own border and surface treatment.

---

## Screen 8: Settings

**User goal:** Set my default preferences.

### Anatomy

```
┌──────────────────────────────┐
│ HEADER                       │
│ [←] "Settings"               │
│  Customize your experience   │
├──────────────────────────────┤
│                              │
│ ╔══════════════════════════╗ │
│ ║ PREFERENCES DOCUMENT     ║ │
│ ║                          ║ │
│ ║ Default Country          ║ │
│ ║ [chip] [chip] [chip]     ║ │
│ ║ ─────────────────────── ║ │
│ ║ Default Category         ║ │
│ ║ [chip] [chip] [chip]     ║ │
│ ║ ─────────────────────── ║ │
│ ║ Processing Path          ║ │
│ ║ [AOS] [CP]              ║ │
│ ╚══════════════════════════╝ │
│                              │
│ ╔══════════════════════════╗ │
│ ║ APPEARANCE DOCUMENT      ║ │
│ ║                          ║ │
│ ║ Theme                    ║ │
│ ║ [Light] [Dark] [System]  ║ │
│ ╚══════════════════════════╝ │
│                              │
│ ┌── RESET ─────────────────┐ │
│ │ Reset All Settings       │ │
│ │ [ Reset to Defaults ]    │ │
│ └──────────────────────────┘ │
│                              │
│ [Disclaimer]                 │
└──────────────────────────────┘
```

### Priority map
1. **Preferences form** — the primary document, styled like a form to fill out.
2. **Appearance** — secondary document.
3. **Reset** — destructive, lowest priority, visually muted.

---

## Cross-Screen Component Map

| Component | Used On | Document Metaphor |
|-----------|---------|-------------------|
| `PageHeader` | All screens | Document header / title block |
| `BottomNav` | All screens | Navigation frame (chevron border treatment) |
| `ChipSelector` | Dashboard, Trends, Compare, Settings | Form radio buttons / selector fields |
| `HeroDocumentCard` | Dashboard | Primary visa stamp document |
| `CompactCategoryCard` | Dashboard | Secondary permit cards |
| `InputFormCard` | Track | Blank government application form |
| `ResultCard` | Track | Processed/stamped result document |
| `ChartDocumentCard` | Trends | Data report document |
| `MilestoneCard` | Milestones | Checklist form document |
| `NewsArticleCard` | News | News clipping document |
| `GlossaryTermCard` | Glossary | Index/dictionary card |
| `ComparisonColumn` | Compare | Side-by-side permit documents |
| `SettingsFormCard` | Settings | Preferences form document |
| `StatusBadge` | Multiple | Stamp / seal element |
| `MovementIndicator` | Dashboard, Trends, Compare | Ink arrow / directional marker |
| `SectionDivider` | Multiple | Chevron/ruled line between sections |

---

## Responsive Collapse Behavior

All screens are mobile-first single-column. For wider viewports (>640px):

| Screen | Collapse behavior |
|--------|-------------------|
| Dashboard | Compact category cards → 2-col grid |
| Track | No change — single column form |
| Trends | Charts may widen but remain stacked |
| Milestones | Milestone cards may go 2-col grid |
| News | Article cards may go 2-col grid |
| Glossary | No change — accordion list |
| Compare | Comparison columns already 2-col |
| Settings | No change — single column form |

---

## Rationale

The "document stack" metaphor serves multiple purposes:
1. **Thematic fit** — visa tracking is about government documents; the UI echoes what users interact with in real life
2. **Visual variety** — different document types (teal visa card, coral ID, gold-bordered form) prevent monotonous card repetition
3. **Hierarchy clarity** — each document has ONE focal point, reducing cognitive load
4. **Risograph alignment** — layered papers with distinct ink colors is exactly how risograph printing works
5. **Progressive disclosure** — documents can be "stacked" (collapsed sections) or "spread out" (expanded), naturally mapping to show/hide patterns
