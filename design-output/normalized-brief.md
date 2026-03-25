# Normalized Product Brief

## Product name
VisaDate Tracker

## One-sentence description
A mobile-first app that lets employment-based U.S. immigration applicants track their priority date against monthly USCIS visa bulletin cutoff dates and monitor movement over time.

## Primary user
Employment-based green card applicants (EB1/EB2/EB3) — predominantly Indian and Chinese nationals — who are currently in the U.S. on work visas and waiting for their priority date to become current.

## Main problem to solve
Visa bulletin data is published monthly in dense government tables. Users must manually find their category, locate their country, compare dates, and remember what changed from last month. This is tedious, anxiety-inducing, and easy to misread.

## Primary action on the first screen
Instantly see how their personal priority date compares to the latest bulletin cutoff — are they current, close, or far away — with clear directional movement from the prior month.

## Secondary actions
1. View month-over-month trend of cutoff date movement
2. Track milestones in the immigration process (filing, biometrics, approval, etc.)
3. Compare across categories and countries
4. Read relevant immigration news
5. Look up visa terminology in a glossary
6. Adjust default country, category, and processing path in settings

## Key screens (priority order)
1. **Dashboard** — personalized bulletin comparison with movement indicator
2. **Track** — enter priority date and evaluate eligibility status
3. **Trends** — historical line/bar charts of cutoff date movement
4. **Milestones** — immigration process checklist
5. **News** — aggregated immigration news feed
6. **Glossary** — terminology reference
7. **Compare** — side-by-side category/country comparison
8. **Settings** — user preferences (country, category, path, theme)

## Emotional tone
- Trustworthy — this is legal/immigration data; accuracy and sobriety matter
- Calm — reduce anxiety, not amplify it
- Clear — no visual clutter; information hierarchy is paramount
- Premium — feels crafted, not government-issued
- Warm — approachable, not clinical

## Technical stack
- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4 (CSS-first config)
- Zustand (state management with localStorage persistence)
- Supabase (backend)
- Framer Motion (animations)
- Recharts (data visualization)
- date-fns, Zod, html-to-image

## Constraints
| Type | Detail |
|------|--------|
| Mandatory | Mobile-first; must be highly readable on small screens |
| Mandatory | No personally identifiable information stored client-side |
| Mandatory | Accessible (ARIA labels, keyboard nav, focus states, contrast ratios) |
| Mandatory | Must not fabricate or approximate visa bulletin data |
| Preference | Should feel modern and reassuring, not bureaucratic |
| Preference | Light and dark mode support |
| Preference | Animations should be subtle and purposeful, not distracting |
| Existing | Two design themes already exist: "Quiet Clarity" (default) and "Risograph Passport" |

## Reference usage notes

### Reference image: Vintage passport/visa illustration (risograph style)
**Role:** Visual mood and texture inspiration

**Borrow:**
- Warm, earthy color palette (cream, coral/salmon, teal, marigold, charcoal)
- Risograph printing texture and grain aesthetic
- Vintage government document feel — stamps, seals, form-field patterns
- Layered paper/card surfaces with rounded corners
- Bold, confident typography with serif accents
- Decorative border patterns (chevron/arrow tape at edges)

**Do not copy:**
- The "X" / rejection motif (wrong emotional signal for a tracker)
- Literal passport layout (too restrictive for app UI)
- Dense illegible placeholder text blocks
- The specific illustrated face/portrait style

---

## Assumptions log
1. The app already exists with a working Risograph Passport theme — this redesign effort is about refining/evolving the visual system, not starting from scratch.
2. The reference image aligns with the existing Risograph theme direction already in the codebase.
3. Dashboard is the most important screen; design should be optimized for it first.
4. The primary audience checks the app once per month (when new bulletin drops) with occasional interim visits.
5. Users care most about: (a) am I current? (b) did the date move? (c) how much closer am I?
6. Bottom navigation is the established mobile nav pattern and should be preserved.

## Resolved questions
1. **Scope:** Refinement of the existing Risograph theme — current implementation is far from the desired vision.
2. **Theme focus:** Risograph direction only. Quiet Clarity is untouched.
3. **Screen coverage:** All screens/pages need the refinement — dashboard, track, trends, milestones, news, glossary, compare, settings.
4. **New features:** None planned. Focus is purely on visual refinement of existing functionality.
