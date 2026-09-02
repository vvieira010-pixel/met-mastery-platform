---
name: MET Mastery
colors:
  surface: '#f6fafb'
  surface-dim: '#d6dbdc'
  surface-bright: '#f6fafb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f4f5'
  surface-container: '#eaefef'
  surface-container-high: '#e4e9ea'
  surface-container-highest: '#dfe3e4'
  on-surface: '#171c1d'
  on-surface-variant: '#3d494b'
  inverse-surface: '#2c3132'
  inverse-on-surface: '#edf1f2'
  outline: '#6d797c'
  outline-variant: '#bdc9cc'
  surface-tint: '#006877'
  primary: '#006877'
  on-primary: '#ffffff'
  primary-container: '#32a9be'
  on-primary-container: '#003942'
  inverse-primary: '#69d5eb'
  secondary: '#3f646c'
  on-secondary: '#ffffff'
  secondary-container: '#bfe6ef'
  on-secondary-container: '#436870'
  tertiary: '#904d0e'
  on-tertiary: '#ffffff'
  tertiary-container: '#da8847'
  on-tertiary-container: '#532800'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a4eeff'
  primary-fixed-dim: '#69d5eb'
  on-primary-fixed: '#001f25'
  on-primary-fixed-variant: '#004e5a'
  secondary-fixed: '#c2e9f2'
  secondary-fixed-dim: '#a7cdd6'
  on-secondary-fixed: '#001f25'
  on-secondary-fixed-variant: '#274c54'
  tertiary-fixed: '#ffdcc5'
  tertiary-fixed-dim: '#ffb782'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#703800'
  background: '#f6fafb'
  on-background: '#171c1d'
  surface-variant: '#dfe3e4'
typography:
  display-lg:
    fontFamily: Cormorant Garamond
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Cormorant Garamond
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Cormorant Garamond
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm-bold:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: Space Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  max-width-content: 1120px
---

## Brand & Style

The design system is built on a "Calm, Capable, and Structured" narrative. It positions itself as a focused learning workspace rather than a generic educational app. The aesthetic is professional and encouraging, avoiding "childish" gamification in favor of academic clarity and teacher-led credibility.

The design style is **Modern Corporate with Tactile Warmth**. It utilizes generous whitespace, a sophisticated serif/sans-serif pairing, and soft UI elements to create an environment conducive to concentration. The interface prioritizes the "Learning Loop" (Class → Feedback → Exercise), ensuring that the next action is always the most prominent visual element.

**Key Principles:**
- **Evidence-Led:** Visuals should reflect actual progress and verified data.
- **Supportive Structure:** Use soft containers and clear hierarchies to guide the user through complex diagnostic data.
- **Teacher-Student Boundary:** Maintain distinct visual modes for the student's personal practice space and the teacher's operational workspace.

## Colors

The palette is anchored by **Vibrant Teal**, representing stability and modern direction. It is used intentionally for primary actions and active states—never for mere decoration.

- **Vibrant Teal (#0996AB):** The primary driver for navigation and "Commit" actions, offering a fresh and energetic academic atmosphere.
- **Neutral Slate (#737879):** Used for structural elements and balanced surfaces to provide a grounded, professional feel.
- **Muted Sage (#587D85):** A secondary supporting tone for secondary actions and UI grouping.
- **Terracotta Accent (#DA8847):** Used sparingly for "small moments of emphasis" like key numbers, notifications, or progress milestones.

**Status Logic:**
- **Success:** Use the primary Vibrant Teal. Completed work is a state of mastery, not a separate "green" alert.
- **Warning/Error:** Used for "Attention needed" and "Blocked" states respectively, maintaining a muted, professional tone.

## Typography

This system employs a sophisticated typographic pairing to balance editorial authority with functional readability.

- **Cormorant Garamond (Serif):** Used for headlines and "Editorial Emphasis." It provides a sense of academic heritage and prestige. It should never be used for dense UI or body text.
- **DM Sans (Sans-Serif):** The workhorse for all product copy, inputs, and student dashboards. It ensures high legibility across CEFR levels.
- **Space Mono (Monospace):** Used strictly for metadata, dates, ID codes, and technical evidence (e.g., timestamps in listening exercises).

**Formatting Rules:**
- Use **Sentence case** for almost all UI copy.
- **Title Case** is reserved for navigation items and official program names.
- **Small Caps/Uppercase Labels** are permitted for secondary descriptors like `NEXT STEP` or `DUE FRIDAY` to create hierarchy without increasing font size.

## Layout & Spacing

The layout philosophy follows a **Fixed-Fluid Hybrid** model. Content is contained within a max-width container on desktop to ensure line lengths remain readable for language learners, while the background remains fluid.

- **Grid:** A 12-column grid for desktop; 4-column for mobile.
- **Vertical Rhythm:** Built on an 8px base unit. Gaps between related items (like task title and status) should be 8px, while gaps between distinct cards should be 24px.
- **Reflow:** On mobile, side-by-side elements (like "Status" and "Deadline") should stack vertically to maintain font size integrity.
- **Safe Areas:** Ensure a minimum 16px margin on mobile devices to prevent touch targets from hitting the screen edge.

## Elevation & Depth

Hierarchy is conveyed through **Tonal Layers** and extremely subtle shadows, avoiding heavy "skeuomorphic" depth to keep the interface feeling light and airy.

- **The Base:** The Neutral Slate background serves as the grounded foundation layer.
- **The Surface:** Cards and main containers use high-contrast surfaces to reduce eye strain and provide a clear academic focus.
- **Shadows:** Use "Ambient Shadows"—soft, diffused, and low-opacity (4-8%). Shadows should only be used to lift active cards or dropdowns, not for every container.
- **Borders:** Low-contrast outlines are preferred over shadows for defining task boundaries. This maintains a clean, "worksheet" aesthetic.

## Shapes

The shape language is **Rounded (Level 2)** to maintain a friendly, approachable atmosphere without feeling juvenile.

- **Standard Elements:** 8px (0.5rem) radius for buttons and input fields.
- **Large Containers:** 16px (1rem) radius for cards and modal windows.
- **Pill Shapes:** Reserved for "Status Tags" (e.g., `Submitted`, `Reviewed`) to distinguish them from actionable buttons.

## Components

### Buttons
- **Primary:** Vibrant Teal background, white text, 8px radius. Use for the "Next Step" in the learning loop.
- **Secondary/Ghost:** Vibrant Teal border, no background. Use for "View Progress" or "Message Teacher."

### Task Cards
- Use clean surface backgrounds with subtle `outline-variant` borders.
- **Structure:** Skill Icon (Top Left), Status Badge (Top Right), Title (Headline-md), Context/Meaning (Body-md), and a Task-led CTA at the bottom.

### Progress Tracking
- **Progress Bars:** Use a Vibrant Teal fill on a neutral track. 
- **Milestones:** Use the Terracotta Accent for specific "Mastery" markers or high-achievement data points.

### Feedback Loops
- **Feedback Blocks:** Differentiate automated feedback (light teal background) from Teacher Evaluation (thin teal border with a small "Teacher" identifier).
- **Teacher Workspace:** Provide condensed list items with clear status indicators: `Submitted`, `Reviewed`, `Approved`, `Awaiting Action`.

### Inputs & Selection
- **Input Fields:** 8px radius, clean background, `outline` border that thickens and changes to Vibrant Teal on focus.
- **Checkboxes/Radios:** Use Vibrant Teal for active states. Ensure high-contrast focus rings for accessibility.

### Icons
- Use thin-stroke, geometric icons. Every icon must be paired with a text label or have an `aria-label` to ensure accessibility for learners of all levels.