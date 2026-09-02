---
timestamp: 2026-08-29T01-21-38Z
slug: stitch-saas-landing-page-home
---
# MET Mastery — critique snapshot

Date: 2026-08-28
Target: stitch_saas_landing_page_home
Mode: degraded single-context review; no sub-agent tool was exposed.

## Overall assessment

Score: 17/40 — Poor. The marketing landing page is unusually strong and specific, and several desktop study screens have a clear, teacher-led learning tone. The application shell does not yet meet that bar: a primary mobile route is visually clipped, and the current offline icon fallback turns meaningful controls into indistinguishable outlined squares.

## Confirmed priority findings

### P0 — Practice Studio is unusable on a 390px viewport

`practice_studio_redesign/code.html` retains a desktop left offset after desktop navigation is hidden. Browser evidence: `main` is positioned at x=256 with a width of 134px in a 390px viewport. It looks like a blank screen with a narrow visible content strip. This is a primary learning route and must be fixed before any visual polish.

### P1 — Icon fallback removes the visual meaning of controls across application pages

The runtime recovery removes remote Material Symbol text but replaces it with a generic outline square. The Writing Studio alone has 24 such placeholders, including six icon-only controls. Navigation, formatting controls, status indicators, and quick actions become visually indistinguishable. Provide a local icon font/SVG set, or use explicit text labels until icons render.

### P1 — The landing page's primary diagnostic CTA does not enter the product

The hero CTA points to `#signin`, not the local Login screen. It changes scroll position rather than beginning a diagnostic or sign-in journey, so the strongest marketing promise is not connected to a usable conversion flow.

### P2 — State, confirmation, and recovery are not designed in key learner actions

The prototype presents actions such as save draft, submit, record, and complete without durable visible success, validation, loading, retry, or recovery states. Learners need clear confirmation of what was saved or sent, particularly for teacher-reviewed work.

### P2 — Dark mode is implemented as a hidden capability rather than user control

CSS variables respond to `data-mm-theme=dark`, but there is no discoverable UI control for a learner to select or reverse the theme. Do not count hidden state as user control.

### P3 — The landing page uses an all-caps eyebrow above the hero

The hero is strong, but the all-caps eyebrow is generic SaaS treatment and weakens the otherwise calm, editorial learning tone. Replace it with a natural sentence or remove it.

## Strengths worth preserving

- The landing page’s central message, editorial typography, and progress preview communicate an identifiable MET preparation product rather than generic study software.
- Teacher feedback and skill-oriented vocabulary make the screens feel grounded in a real classroom routine.
- Homework remains readable at mobile width; the issue is route-specific, not an inevitable limitation of the visual system.

## Heuristic score

| Heuristic | Score / 4 | Notes |
| --- | ---: | --- |
| Visibility of system status | 2 | Static cards communicate progress, but actions lack feedback. |
| Match with real world | 3 | MET and teacher language are specific. |
| User control and freedom | 2 | Navigation exists, but no exposed theme control or recovery. |
| Consistency and standards | 2 | Strong visual voice, broken icon semantics and inconsistent shell behavior. |
| Error prevention | 1 | No meaningful validation or pre-submit guidance. |
| Recognition rather than recall | 2 | Good labels, but icon-only squares erase recognition. |
| Flexibility and efficiency | 1 | No acceleration or learner preference controls. |
| Aesthetic and minimalist design | 2 | Landing is excellent; app pages are hurt by fallback artifacts. |
| Error recovery | 1 | No actionable error/retry patterns. |
| Help and documentation | 1 | Contextual help is not evident. |

## Detector evidence (secondary, static signal)

The detector reported 310 signals: 167 cramped padding, 46 nested cards, 43 low contrast, 20 dark glow, 9 undersized text, and smaller heading/animation/style counts. Treat these as source-level leads, not all confirmed defects: the tool does not evaluate the runtime accessibility hardening or actual rendered contrast. The mobile clipping and icon failure above were independently browser-verified.

## Recommended repair order

1. Restore usable mobile layout in Practice Studio and then test every primary route at 390px.
2. Replace generic icon placeholders with meaningful local SVG/icon assets; audit every icon-only control for accessible labels and visible meaning.
3. Wire landing CTAs to real Login/diagnostic entry paths.
4. Add action states: editing, saving, saved, validation failure, submission success, retry.
5. Expose theme choice only if it is a maintained product feature; otherwise remove hidden dark-mode implementation.
