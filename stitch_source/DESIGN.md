---
name: Electric Minimalism
colors:
  surface: '#fbf9f8'
  surface-dim: '#dbdad9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#e9e8e7'
  surface-container-highest: '#e4e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#434656'
  inverse-surface: '#303031'
  inverse-on-surface: '#f2f0f0'
  outline: '#747688'
  outline-variant: '#c4c5d9'
  surface-tint: '#104af0'
  primary: '#0040df'
  on-primary: '#ffffff'
  primary-container: '#2d5bff'
  on-primary-container: '#efefff'
  inverse-primary: '#b8c3ff'
  secondary: '#585f6c'
  on-secondary: '#ffffff'
  secondary-container: '#dce2f2'
  on-secondary-container: '#5e6572'
  tertiary: '#555555'
  on-tertiary: '#ffffff'
  tertiary-container: '#6d6d6d'
  on-tertiary-container: '#f0f0f0'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c3ff'
  on-primary-fixed: '#001355'
  on-primary-fixed-variant: '#0035bd'
  secondary-fixed: '#dce2f2'
  secondary-fixed-dim: '#c0c6d6'
  on-secondary-fixed: '#151c27'
  on-secondary-fixed-variant: '#404753'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1b1b1b'
  on-tertiary-fixed-variant: '#474747'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e2'
typography:
  display:
    fontFamily: Outfit
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Outfit
    fontSize: 20px
    fontWeight: '400'
    lineHeight: '1.5'
  body-md:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.5'
  label-bold:
    fontFamily: Outfit
    fontSize: 16px
    fontWeight: '600'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max-width: 640px
  gutter: 24px
  section-gap: 64px
  element-gap: 16px
---

## Brand & Style

This design system is built for a digital-native audience that values speed, clarity, and aesthetic confidence. The brand personality is "Vibrant Minimalist"—it strips away the clutter of traditional productivity tools in favor of a bold, centered experience. By combining a high-energy blue with a stark, pure white canvas, the UI feels both disciplined and energetic.

The visual style leans into **Minimalism** with a **High-Contrast** edge. It rejects complex shadows and skeuomorphism for a flat, clean, and spacious interface. Every element is intentionally oversized to create a sense of ease and focus, ensuring the user feels unhurried despite managing a busy schedule.

## Colors

The palette is restricted to maintain a high-impact, clean aesthetic. The primary color is a "vibrant blue," a saturated and luminous shade that demands attention without being aggressive. 

- **Primary Blue (#2D5BFF):** Used for all primary actions, active states, and focus indicators.
- **Surface (#FFFFFF):** The background is kept pure white to maximize whitespace and light.
- **Secondary Blue (#E9EFFF):** A soft, desaturated tint used for hover states or subtle grouping containers.
- **Text:** High-contrast black for headlines to ensure "bold" readability, and a softened neutral grey for secondary metadata.

## Typography

This design system utilizes **Outfit** for its geometric clarity and modern, "tech-forward" feel. The type hierarchy is intentionally scaled larger than standard enterprise applications to facilitate rapid scanning and a sense of "premium" space.

Headlines are set with heavy weights (700) and tight letter spacing to create a punchy, editorial look. Body text remains large (18px+) to ensure accessibility and comfort on mobile and desktop displays. Center-alignment is the default for primary reading paths (like task titles and empty states).

## Layout & Spacing

The layout philosophy centers on a **Fixed Grid** model. Content is vertically stacked and center-aligned within a narrow, focused container (640px max width). This prevents eye fatigue and mimics the focused experience of a mobile app even on large monitors.

Spacing is generous, using an 8px base unit. Generous "breathing room" (section-gap) is placed between different task groups or categories to prevent the UI from feeling "cramped" or overwhelming. Margins are kept wide to drive the user's eye toward the center of the screen.

## Elevation & Depth

To maintain the minimalist aesthetic, depth is created through **Low-Contrast Outlines** and **Tonal Layers** rather than heavy shadows. 

- **Flat Layering:** Most elements sit directly on the white background.
- **Strokes:** Use 1px or 2px borders in a very light grey or the secondary blue tint to define boundaries for cards and inputs.
- **Hover States:** Instead of rising (shadows), interactive elements should utilize a subtle color shift (e.g., background becoming slightly more saturated) to indicate clickability.
- **Active Elements:** Only the most critical active elements (like an open modal) may use a very large, ultra-soft, 2% opacity blue-tinted shadow to create a "floating" effect.

## Shapes

The shape language is **Rounded**, providing a friendly and modern "Gen Z" feel that contrasts with the rigid, sharp-edged productivity tools of the past. 

Standard components (buttons, input fields, cards) use a 0.5rem (8px) radius. Larger elements like task containers or empty-state illustrations use the `rounded-xl` (1.5rem / 24px) setting. Checkboxes are an exception; they should be styled as "super-ellipses" or circles to emphasize their interactive and friendly nature.

## Components

### Buttons
Primary buttons are large, spanning the full width of the center container. They use the primary blue background with white text. Typography is bold. The "bounce" interaction on click is encouraged to provide tactile feedback.

### Checkboxes
Checkboxes are oversized (at least 28px). When unchecked, they feature a thin, light blue border. When checked, they fill with the primary blue and show a thick white checkmark.

### Input Fields
Inputs are borderless or use a very faint bottom border, with large, center-aligned placeholder text. Focus states are indicated by a thicker primary blue bottom border or a subtle glow.

### Task Cards
Cards are minimalist white blocks with a thin light-grey stroke. They rely on the `body-lg` typography for the task name. Center-alignment is maintained for the card content.

### Chips & Tags
Used for categories, chips are pill-shaped with the secondary blue background and primary blue text. They use the `label-bold` type style.

### Progress Indicators
Progress is shown through thick, horizontal bars in primary blue against a light grey track, usually positioned at the very top of the center container.