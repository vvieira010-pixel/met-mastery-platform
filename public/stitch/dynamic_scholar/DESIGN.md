---
name: Dynamic Scholar
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
  primary: '#006574'
  on-primary: '#ffffff'
  primary-container: '#008093'
  on-primary-container: '#f8fdff'
  inverse-primary: '#69d5eb'
  secondary: '#a14000'
  on-secondary: '#ffffff'
  secondary-container: '#ff7a31'
  on-secondary-container: '#622400'
  tertiary: '#3d626a'
  on-tertiary: '#ffffff'
  tertiary-container: '#557a83'
  on-tertiary-container: '#f8fdff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a4eeff'
  primary-fixed-dim: '#69d5eb'
  on-primary-fixed: '#001f25'
  on-primary-fixed-variant: '#004e5a'
  secondary-fixed: '#ffdbcc'
  secondary-fixed-dim: '#ffb694'
  on-secondary-fixed: '#351000'
  on-secondary-fixed-variant: '#7b2f00'
  tertiary-fixed: '#c2e9f3'
  tertiary-fixed-dim: '#a6cdd6'
  on-tertiary-fixed: '#001f25'
  on-tertiary-fixed-variant: '#264c54'
  background: '#f6fafb'
  on-background: '#171c1d'
  surface-variant: '#dfe3e4'
  academic-blue-soft: '#E3F2FD'
  energy-orange-glow: '#FFAB7B'
  teal-deep: '#006877'
  surface-ice: '#F6FAFB'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
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
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
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
  gutter-sm: 16px
  gutter-lg: 24px
  margin-mobile: 20px
  margin-desktop: 48px
  max-width: 1200px
---

## Brand & Style

The design system evolves the "MET Mastery" foundation into a more high-energy, immersive academic environment. It transitions from a passive workspace to an active, "vibrant" student companion. The brand personality is **inspiring, energetic, and high-performance**, catering to students who value both professional rigor and a dynamic learning experience.

The design style is **Modern Corporate with Glassmorphic Energy**. It maintains a structured, grid-based layout but introduces fluid gradients and tonal depth to make the "Learning Loop" feel like an evolving journey rather than a static checklist. The aesthetic uses depth and light to guide focus toward active progress, making the interface feel alive and responsive to student achievement.

**Key Principles:**
- **Momentum-Driven:** Visual transitions and gradients should suggest forward motion.
- **Engaging Clarity:** High readability paired with energetic accents to prevent academic fatigue.
- **Layered Hierarchy:** Use translucency and depth to separate secondary data from primary learning actions.

## Colors

The palette is centered on a high-contrast triad of Vibrant Teal, Energetic Orange, and Soft Academic Blue.

- **Vibrant Teal (#0996AB):** The primary color, used for core navigation and progress indicators. It represents growth and focus.
- **Energetic Orange (#FF7A31):** The secondary color, used for "Momentum Moments"—milestones, active timers, and urgent notifications. It provides the "spark" of energy.
- **Academic Blue (#E3F2FD):** A tertiary "wash" color used for large background areas or grouped content containers to provide a cool, stable base.
- **Neutral Slate (#737879):** Used for typography and structural borders to maintain professional grounding.

**Application Logic:**
- **The Learning Loop:** Active tasks use a subtle gradient from **Teal Deep** to **Vibrant Teal** to create visual pull.
- **Success States:** Combine Teal with **Energy Orange** accents to celebrate completion.
- **Surface Strategy:** Use **Surface Ice** for the base layer, with containers utilizing "Surface-Container" tiers for depth.

## Typography

The typography shifts from the traditional serif pairing to a purely modern, high-legibility sans-serif stack to increase the "crisp" and "dynamic" feel.

- **Hanken Grotesk:** Chosen for its sharp, contemporary geometry. Use for all headlines to project a sense of forward-thinking confidence. Bold weights are preferred for display levels to ground the energy of the color palette.
- **DM Sans:** Retained for body text due to its exceptional readability and neutral tone, ensuring that instructional content is never obscured by the design's energy.
- **JetBrains Mono:** Replaces Space Mono for a more modern, "developer-grade" technical precision in data points and timestamps.

**Formatting:**
- **Vertical Spacing:** Use generous paragraph spacing (1.5x font size) to ensure complex academic content remains digestible.
- **Accent Text:** Use **Energetic Orange** sparingly for Hanken Grotesk labels to draw the eye to critical metrics.

## Layout & Spacing

This design system utilizes a **Fluid-Fixed Hybrid Grid** designed to maximize focus on the "Learning Loop" modules.

- **Desktop (1200px+):** A 12-column grid with 24px gutters. Primary learning content should occupy 8 columns (left/center), with secondary analytics and teacher feedback in a 4-column right-hand "Insight Panel."
- **Tablet (768px - 1199px):** An 8-column grid. The Insight Panel reflows to a horizontal "Stats Bar" at the top of the view.
- **Mobile (<767px):** A 4-column grid with 20px margins. All cards stack vertically, with heavy emphasis on the "Next Action" CTA fixed to the bottom of the screen.

**Spacing Rhythm:**
- Use a strictly divisible 8px scale. 
- Elements within a card (e.g., icon to title) should use **8px**.
- Modules within a section should use **24px**.
- Distinct functional sections (e.g., Dashboard to Course List) should use **48px**.

## Elevation & Depth

Hierarchy is established through **Glassmorphic Tonal Layers** and **Tinted Shadows**, moving away from flat outlines to create a more immersive, "high-tech" feel.

- **Background Layer:** A soft gradient from `#F6FAFB` to `#E3F2FD`.
- **Primary Surface:** White cards with a subtle 1px border (`#0996AB` at 10% opacity) and a diffuse shadow tinted with the Primary Teal.
- **Active Overlay:** Use backdrop blurs (12px) for modals and dropdown menus to maintain the context of the underlying learning content.
- **The "Learning Loop" Glow:** The current or "Up Next" task card should feature a soft, energetic glow effect using a 5% opacity Orange shadow to signal priority.

## Shapes

The shape language is **Rounded (Level 2)**, balancing friendly approachability with modern precision.

- **Buttons & Inputs:** 8px (0.5rem) roundedness to maintain a sturdy, clickable feel.
- **Content Cards:** 16px (1rem) roundedness for a softer, more modern container look.
- **Interactive Badges:** Use Pill-shapes (full rounding) for status indicators like `In Progress` or `Complete` to distinguish them from rectangular buttons.
- **Progress Fill:** Progress bars should use rounded caps at both ends to feel organic and fluid.

## Components

### Buttons
- **Primary (Action):** Gradient background (Teal Deep to Vibrant Teal), white text, 8px radius. Features a subtle "lift" on hover.
- **Secondary (Momentum):** Energetic Orange background with white text. Reserved for high-achievement actions or "Start Now."
- **Tertiary:** Transparent background, Teal border, for navigation or secondary utilities.

### Learning Loop Cards
- **Construction:** 16px radius, soft Teal tinted shadow.
- **Header:** Title in Hanken Grotesk (Headline-md).
- **Body:** Skill category labeled in JetBrains Mono. 
- **Footer:** Full-width Teal button for the "Next Action."

### Input Fields
- Use a 1px `Academic Blue` border that transforms into a 2px `Vibrant Teal` border with a soft outer glow when focused. Labels should be small and bold in DM Sans.

### Chips & Badges
- **Status Chips:** Semi-transparent background of the status color (e.g., 10% Orange for "Urgent") with high-saturation text of the same hue.

### Progress Visualizations
- **Ring Progress:** Use a thick stroke of Vibrant Teal with a background track of Academic Blue.
- **Streak Counters:** Use the Energetic Orange with a flame or spark icon to denote daily consistency.

### Navigation Sidebar
- High-contrast sidebar using a deep Teal background with white icons. Active states should use a "Cut-out" shape effect with the Energetic Orange for high-visibility indication.