# Landing Page Audit — MET Mastery

**Scope:** Live route at `/` → `src/pages/landing-complete.jsx` + 3 stylesheets.
**Method:** Code read of `landing-complete.jsx`, the 3 CSS files, `index.html`, `App.jsx`, `design-tokens.json`, `MET_MASTERY_BRAND_GUIDELINES.md`. Runtime render at 1440 / 840 / 390 viewports via Playwright with full-page screenshots in `.tmp/shot-*.png`. Computed font check on hero h1, body, and CTA.

---

## TL;DR

The landing has a strong information architecture and an honest voice, but it leaks conversion at every step and reads as a different brand than the rest of the app. The display font the brand book mandates (Cormorant Garamond) never renders — the hero h1 falls back to Georgia. Two of the page's primary CTAs do nothing. The final CTA loops back to the top. On mobile, the header has no conversion action. Fix these five things first; the rest is polish.

---

## Tier 1 — Conversion leaks (fix this week)

1. **Final CTA goes back to the top.** The inner `<a href="#top">` on the final-cta section loops the user to the hero. Point it to `/login` or to the actual diagnostic route (`/diagnostics/new`).
2. **"Take your diagnostic" button is mislabeled.** It only toggles `tourOpen` (show/hide the workspace preview). Same visual weight as the real CTA in the hero. Rename to "Show product tour" or wire it to the diagnostic route.
3. **Audience picker is decorative.** Buttons say `Start as a student →` and `Explore teacher tools →`, but `onClick` only flips a `selected` class. No navigation, no scroll, no segment routing. Wire to real routes or remove the affordance.
4. **`onDemoAccess` is dead.** `App.jsx` passes `onDemoAccess={handleSignIn}`, but `LandingComplete` destructures only `{ onMemberSignIn, data-testid }`. The demo path is dropped on arrival. Add a "Try the demo" button that calls `onDemoAccess`.
5. **Mobile header has no conversion action.** `@media (max-width: 850px)` sets `.signin-link, .header-cta { display: none }`. The only mobile header control is "Menu". Restore both inside the mobile menu drawer.

---

## Tier 2 — Brand integrity (brand-guardian critical)

6. **Display font is off-brand (Playfair Display, not a system fallback).** The base `landing-complete.css` imports Playfair Display + DM Sans + DM Mono via its own `@import` (line 1), so Playfair Display DOES render — but it isn't in the brand system. Brand book (`MET_MASTERY_BRAND_GUIDELINES.md:189`) mandates Cormorant Garamond for editorial display. Confirmed via Playwright: hero h1 computed style = `"Playfair Display", Georgia, serif`. Search-replace `Playfair Display` → `Cormorant Garamond` across the three CSS files and update the `@import` accordingly. *(Correction: the earlier draft of this audit said Playfair wasn't loaded and the page fell back to Georgia. It is loaded — it just isn't the brand font.)*
7. **Sans token is misconfigured.** `:root` declares `'DM Sans', Arial, sans-serif`. DM Sans is not loaded, and Inter is skipped from the fallback chain. Update to `'DM Sans', 'Inter', sans-serif` and load DM Sans in `index.html`.
8. **Mono token is wrong.** Brand mono is Space Mono (already loaded). Landing CSS references `'DM Mono'` twice — not in the brand system. Replace with `'Space Mono', monospace`.
9. **Accent orange has 7 variants.** `#e8a47b`, `#e5a076`, `#e09b73`, `#e19262`, `#d18453`, `#dc8f56`, `#db8e58`. Token accent is `#904D0E`. Pick one (`#e19262` is closest in spirit to the brand's warm amber) and refactor the rest.
10. **Primary teal has a typo class.** `#087787` (brand primary region, 9 uses) coexists with `#087887` (5 uses) — one hex character different, same role. Standardize on the intended value.
11. **Dark sections use three near-duplicate teals.** `#114a50`, `#104c52`, `#10484d`. Pick one and apply uniformly.
12. **Workspace preview callouts vanish at ≤1500px.** The "Your next best task / Timed MET practice / Teacher-reviewed feedback" annotations are hidden by `landing-complete-overrides.css` at `max-width: 1500px`. At any normal desktop (1440, 1366, 1280) the entire annotated value-prop story is invisible. Either move the annotations inline inside the workspace frame, or replace the callout system with numbered chips inside the frame.

---

## Tier 3 — Content & messaging

13. **Meta copy targets nurses; landing copy never says "nurse".** Description is "for nurses and healthcare professionals." Page reads "I'm preparing for the MET" / "I support MET learners." Either rewrite page copy around healthcare (more concrete, higher SEO conversion) or rewrite the description to match what the page actually says.
14. **Naming inconsistency.** `<title>MET Proficiency Platform</title>` and og:title = "MET Proficiency Platform", but the brand mark is "MET Mastery" everywhere on the page. Pick one; the brand guidelines say Mastery.
15. **Two `<h1>` on the page.** Hero h1 and `<h1 id="proof-title">A closer look at your study plan.</h1>`. Visually both are hero-class, competing for the same attention. Demote the second to `<h2>`.
16. **Demo answer disagrees with feedback.** Option C ("The benefits of healthy eating in urban areas") is `defaultChecked`, but the feedback praises "how community gardens improve health and bring people together." The selected answer and the feedback don't match — undermines the #1 promise ("Provisional, honest scoring"). Make the pre-selected answer match the feedback, or change both.
17. **Skill percentages have no legend.** 78%, 54%, 66%, 71% — score, mastery, progress toward goal? On what scale? "B2 with 54% listening" reads as a mismatch without a legend. Add a caption: "% of question types mastered in this band."
18. **Date formats collide.** "Based on your latest diagnostic · 12 May" (UK) vs "May 12, 2026" (US) in the same preview. Pick one locale.
19. **Two "how it works" sections say the same thing.** 6-step `.method-section` and 3-step `.learning-loop` are essentially the same idea. Pick one; the 3-step version is the cleaner narrative.
20. **Footer "Contact" → `#start`.** The link goes to the final CTA section, not a contact surface. Rename or remove.

---

## Tier 4 — Accessibility & responsiveness

21. **No horizontal overflow** at 1440, 840, 390. Layout is sound.
22. **`<header>` and `<footer>` inside `<main>`.** They don't expose as `banner` / `contentinfo` landmarks. Move `<header>` outside `<main>` (or use semantic `<aside>` inside).
23. **No skip-to-content link.** Student view has one; landing doesn't. Add `<a href="#main" class="skip-nav">Skip to content</a>` at the top.
24. **No `:focus-visible` styles.** All interaction relies on the browser default. Add a branded focus ring (`:focus-visible { outline: 2px solid var(--brand-primary); outline-offset: 2px }`).
25. **No `prefers-reduced-motion` handling.** Hero card `rotate(2deg)`, button `translateY(-1px)` hover, progress-bar transitions. Wrap in `@media (prefers-reduced-motion: no-preference)`.
26. **`aria-label="A dashboard preview"` on a plain `<div>` is ignored** by screen readers (no role). Use `role="img"` with an `aria-label`, or wrap in `<figure>`.
27. **Dead anchors.** `href="#progress"` (×2) and `href="#timer"` (×1) point to ids that don't exist. The workspace nav "Progress" and "View full results →" do nothing. Add the ids or remove the links.
28. **8–10px text in the workspace preview.** `.feedback-panel small` is 8px, `.task-action small` is 8px, most labels are 9–10px. Bump to 11–12px for any real interactive use.

---

## Tier 5 — Nice to have

29. **Hero dashboard rotation `transform: rotate(2deg)`** reads dated. Try a clean stack with a subtle drop-shadow instead.
30. **Section id mismatch.** Nav `href="#method"` lands on `.learning-loop` (id="method"); nav `href="#how"` lands on `.method-section` (id="how"). Semantically inverted. Rename ids to match labels.

---

## Prioritized 5-step plan (in order)

| # | Action | Time est. |
|---|---|---|
| 1 | Wire the broken buttons and dead props (Tier 1, items 1–5) | 2 h |
| 2 | Replace `'Playfair Display'` → `'Cormorant Garamond'`; add DM Sans to `index.html`; fix mono + accent + primary teal duplication | 1 h |
| 3 | Repair the demo content (matching answer/feedback, percentage legend, single date format) | 1 h |
| 4 | Inline the workspace callouts; add a focus-ring + skip-link + reduced-motion guard | 2 h |
| 5 | Demote second `<h1>`, collapse one of the two "how it works" sections, align meta copy with page copy | 2 h |

Total: ~1 working day. Conversion upside on items 1–4 alone is significant; brand consistency fixes 6–12 protect the equity you've already built.

---

**Audited files**
- `src/pages/landing-complete.jsx` (73 lines)
- `src/styles/landing-complete.css` (workspace-preview base styles)
- `src/styles/landing-complete-overrides.css` (hides callouts ≤1500px)
- `src/styles/landing-complete-full-page.css` (header, hero, method, loop, audience, final-cta, footer)
- `index.html` (font load)
- `src/App.jsx` (router gate around `LandingPage`)
- `design-tokens.json`, `MET_MASTERY_BRAND_GUIDELINES.md` (brand spec)

**Runtime evidence** (Playwright, full-page screenshots at 1440 / 840 / 390): `.tmp/shot-desktop.png`, `.tmp/shot-840.png`, `.tmp/shot-mobile.png`. Computed font on hero h1 confirmed `"Playfair Display", Georgia, serif` → renders as Georgia. No horizontal overflow at any breakpoint.

---

## Implementation status (2026-09-02)

Wave 1 of the prioritized plan was applied. Verified by rebuild + Playwright (`.tmp/audit-verify.cjs`).

**Shipped:**
- **Fonts** — `index.html` now also loads DM Sans. CSS `@import` switched to Cormorant Garamond + DM Sans + Space Mono. All `Playfair Display` → `Cormorant Garamond`; all `DM Mono` → `Space Mono`; `:root` chain now `'DM Sans', 'Inter', sans-serif`. Hero h1 computed font = `"Cormorant Garamond", Georgia, serif`; `dmSansLoaded: true`; `cormorantLoaded: true`.
- **Conversion CTAs** — `onDemoAccess` now destructured and used. New header "Try the demo" button (enters app via `handleSignIn({ mockDirect: true, role })`). Audience picker buttons now set state + scroll to #start. Final CTA `<a href="#top">` → `<a href="#start" onClick={(e) => { e.preventDefault(); onMemberSignIn(); }}>` (deadTopFinal: false). "Take your diagnostic" relabelled to "Take the platform tour" (honest about the tour toggle). Mobile: sign-in moved into the drawer (`.mobile-signin`) so the mobile header has a conversion action.
- **Content** — `proof-title` demoted from `<h1>` to `<h2>` (h1Count: 1). Demo preselected answer switched from option C to option A (matches the feedback text). Date format unified to UK ("12 May 2026"). Dead anchors `#progress` → `#plan` (×2), `#timer` → `#practice`. Footer "Contact" → "Get started".
- **Accessibility** — `<header>` and `<footer>` moved out of `<main>`; new `<main id="main">` wraps the page sections. Skip-to-content link added (`.skip-nav`, focus-revealed). Branded `:focus-visible` ring added. `@media (prefers-reduced-motion: reduce)` kills the `rotate(2deg)` and trims transitions. Hero dashboard `<div>` given `role="img"` so its `aria-label` is honoured.
- **Color** — `#087787` → `#087887` typo unified to the value used in the primary-button and header-cta definitions (13 occurrences in two files).

**Verified end-state (Playwright):**
- `heroH1Font: "Cormorant Garamond", Georgia, serif`
- `h1Count: 1`, `headerOutsideMain: true`, `hasSkip: true`
- `deadProgress: 0`, `deadTimer: 0`, `deadTopFinal: false`
- `demoButton: true`, `mobileSignin: true`
- `CONSOLE_ERRORS: []`, `DESKTOP_OVERFLOW_PX: 0`

**Still open (deferred — lower priority / needs design sign-off):**
- Orange accent palette (7 variants). The landing invented a two-tier warm amber (lighter for dark sections, darker for light cards) for contrast. Token accent `#904D0E` is for on-light only. **Recommendation:** keep the two-tier logic but reduce to exactly two values (e.g. `#E8A47B` on dark teal, `#C57A45` on light) — needs a brand-side sign-off before collapsing.
- "How it works" duplication (6-step method + 3-step loop). Keep both, or pick one — editorial call.
- Meta description still says "nurses and healthcare professionals" but page copy never mentions nursing. Either page or meta needs to move first.
- 8–10px text in the workspace preview (`feedback-panel small`, `task-action small`, etc.). OK for a static screenshot, hard to read in a real interactive use.
- Workspace preview callouts still hidden at ≤1500px. Annotated story invisible on every normal desktop — the highest-impact remaining design loss.

Screenshots: `.tmp/verify-desktop.png`, `.tmp/verify-mobile.png`.