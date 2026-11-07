# Redforge — Style Reference
> dark obsidian grid with electric-red punctuation.

## Theme

**Theme:** dark

The system is derived from the supplied visual reference: a near-black canvas, a vivid red primary mark, sharp high-contrast typography, restrained surfaces, and red used as the dominant functional accent. The interface should feel technical, premium, fast, and confident rather than decorative.

The original reference uses a neutral-first editorial system with generous rounding, hairline borders, compact body text, and large display typography. This version preserves that structural language while rebuilding the visual hierarchy around **black + white + electric red**.

---

## Design Principles

1. **Black is the canvas.** The interface should feel built from deep black surfaces rather than gray-on-white UI.
2. **Red is the identity.** Red is the main interactive and brand accent, not a decorative secondary color.
3. **White carries hierarchy.** Primary headlines and important controls use near-white rather than pure white wherever possible.
4. **No color soup.** Do not introduce blue, green, purple, orange, or yellow into the core UI.
5. **Borders over heavy shadows.** Use subtle dark-gray hairlines to separate surfaces.
6. **Large type, compact UI.** Headlines can be visually dominant while controls and metadata remain dense.
7. **Red should be intentional.** Large red fills are reserved for hero moments, primary CTAs, active states, and branded visual elements.
8. **The logo language is geometric.** Abstract angular forms, lightning-like cuts, and simple silhouettes are preferred over complex illustrations.

---

# Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Void | `#000000` | `--color-void` | Primary page canvas and deepest background |
| Obsidian | `#080808` | `--color-obsidian` | Main dark surface and navigation background |
| Carbon | `#101010` | `--color-carbon` | Cards, panels, and elevated sections |
| Graphite | `#171717` | `--color-graphite` | Secondary dark surfaces |
| Iron | `#262626` | `--color-iron` | Borders, dividers, inactive controls |
| Steel | `#404040` | `--color-steel` | Icons and secondary structural elements |
| Fog | `#737373` | `--color-fog` | Muted body copy and metadata |
| Ash | `#A3A3A3` | `--color-ash` | Placeholder and tertiary text |
| Silver | `#D4D4D4` | `--color-silver` | Secondary text on dark surfaces |
| Snow | `#F5F5F5` | `--color-snow` | Primary text and high-contrast UI |
| White | `#FFFFFF` | `--color-white` | Maximum-contrast text and icon surfaces |
| Electric Red | `#FF1A1A` | `--color-red` | Primary brand accent, CTA, active state |
| Bright Red | `#FF3333` | `--color-red-bright` | Hover state and visual emphasis |
| Deep Red | `#B30000` | `--color-red-deep` | Pressed state and dark red surfaces |
| Red Wash | `#2A0808` | `--color-red-wash` | Very subtle red-tinted panels |
| Red Glow | `rgba(255, 26, 26, 0.22)` | `--color-red-glow` | Restricted glow for active/hero elements |

### Color Rules

- `#FF1A1A` is the primary brand color.
- Red may be used for primary CTAs, links, active navigation, key metrics, badges, focused inputs, and brand graphics.
- Do not use red for every heading or paragraph.
- Never place large amounts of pure red text on black; use red as an accent.
- Do not introduce additional chromatic accent colors.
- Pure black `#000000` is allowed as the canvas because the visual reference is explicitly black.
- White and near-white provide the main contrast hierarchy.

---

# Tokens — Typography

### Cosmica / DM Sans

Use a single geometric sans family throughout the product.

**Primary:** Cosmica  
**Fallback:** DM Sans, Inter, ui-sans-serif, system-ui, sans-serif

- Display: 56–72px / weight 600–700
- Section heading: 32–48px / weight 600–700
- Body: 14–16px / weight 400
- UI: 13–15px / weight 400–500
- Metadata: 11–13px / weight 400–500
- Letter spacing: normal to slightly tight
- Display line-height: 1.05–1.2
- Body line-height: 1.45–1.6

### Type Scale

| Role | Weight | Size | Line Height | Token |
|------|--------|------|-------------|-------|
| caption | 400 | 12px | 1.5 | `--text-caption` |
| meta | 400 | 13px | 1.5 | `--text-meta` |
| body | 400 | 15px | 1.5 | `--text-body` |
| body-lg | 400 | 18px | 1.5 | `--text-body-lg` |
| subheading | 600 | 20px | 1.4 | `--text-subheading` |
| heading-sm | 600 | 32px | 1.2 | `--text-heading-sm` |
| heading | 600 | 40px | 1.15 | `--text-heading` |
| heading-lg | 600 | 56px | 1.12 | `--text-heading-lg` |
| display | 700 | 64px | 1.05 | `--text-display` |
| display-xl | 700 | 72px | 1.02 | `--text-display-xl` |

---

# Tokens — Spacing & Shapes

**Base unit:** 4px

**Density:** compact with generous macro spacing.

## Spacing Scale

| Name | Value | Token |
|------|-------|-------|
| 4 | 4px | `--spacing-4` |
| 8 | 8px | `--spacing-8` |
| 12 | 12px | `--spacing-12` |
| 16 | 16px | `--spacing-16` |
| 20 | 20px | `--spacing-20` |
| 24 | 24px | `--spacing-24` |
| 28 | 28px | `--spacing-28` |
| 32 | 32px | `--spacing-32` |
| 40 | 40px | `--spacing-40` |
| 48 | 48px | `--spacing-48` |
| 64 | 64px | `--spacing-64` |
| 80 | 80px | `--spacing-80` |
| 96 | 96px | `--spacing-96` |
| 120 | 120px | `--spacing-120` |

## Border Radius

| Element | Value |
|---------|-------|
| cards | 28–36px |
| large surfaces | 36–40px |
| icons | 14–20px |
| pills | 10000px |
| badges | 10–12px |
| inputs | 14px |
| buttons | 14px |

The geometry should remain soft and premium even though the logo language is angular.

---

# Elevation

Heavy shadows are discouraged.

### Card

```css
border: 1px solid #262626;
box-shadow: none;
```

### Elevated Card

```css
border: 1px solid #2A2A2A;
box-shadow: 0 12px 40px rgba(0, 0, 0, 0.28);
```

### Red CTA

```css
box-shadow:
  inset 0 0.5px 0 rgba(255,255,255,0.22),
  0 0 0 1px rgba(255,26,26,0.18),
  0 8px 24px rgba(255,26,26,0.12);
```

### Red Glow

Use only on hero graphics, active controls, and major CTA hover states.

```css
box-shadow: 0 0 32px rgba(255, 26, 26, 0.18);
```

---

# Components

## Primary Action Button

**Role:** Main CTA.

- Background: `#FF1A1A`
- Text: `#FFFFFF`
- Border: `1px solid #FF3333`
- Radius: `14px`
- Padding: `12px 18px`
- Font: 14–15px / 500
- Hover: `#FF3333`
- Active: `#B30000`

The primary CTA should immediately communicate that red is the product identity.

---

## Secondary Button

**Role:** Secondary action.

- Background: `#101010`
- Text: `#F5F5F5`
- Border: `1px solid #262626`
- Radius: `14px`
- Padding: `12px 18px`
- Hover background: `#171717`
- Hover border: `#404040`

---

## Ghost Button

**Role:** Low-emphasis action.

- Background: transparent
- Text: `#A3A3A3`
- Border: transparent
- Radius: `14px`
- Hover background: `#171717`
- Hover text: `#FFFFFF`

---

## Red Accent Badge

**Role:** Brand status, highlighted category, important state.

```text
Background: #2A0808
Border: 1px solid rgba(255,26,26,0.28)
Text: #FF3333
Radius: 12px
Padding: 4px 8px
Font: 12px / 500
```

For high-priority badges, use a solid red background with white text.

---

## Dark Feature Card

**Role:** Feature, pain point, metric, or product capability.

- Background: `#101010`
- Border: `1px solid #262626`
- Radius: `36px`
- Padding: `28px`
- Heading: `#F5F5F5`
- Body: `#A3A3A3`
- Accent icon: `#FF1A1A`

Use a small amount of red to identify the important element instead of making the entire card red.

---

## Red Feature Card

**Role:** Hero feature or high-priority promotional block.

- Background: `#FF1A1A`
- Text: `#FFFFFF`
- Radius: `36px`
- Padding: `32px`
- Optional darker red geometric graphic
- No gradients unless they are extremely subtle

Large red surfaces should be rare so they remain visually powerful.

---

## Input Field

- Background: `#0D0D0D`
- Text: `#F5F5F5`
- Placeholder: `#737373`
- Border: `1px solid #262626`
- Radius: `14px`
- Padding: `12px 16px`

### Focus

```css
border-color: #FF1A1A;
box-shadow: 0 0 0 3px rgba(255,26,26,0.10);
```

---

## Navigation Bar

**Role:** Top-level navigation.

- Background: `rgba(0,0,0,0.82)`
- Backdrop blur: 16–20px
- Logo: white/red
- Links: `#A3A3A3`
- Active link: `#FFFFFF`
- Primary CTA: red
- Border: optional `1px solid rgba(255,255,255,0.06)`
- Height: approximately 64–76px

The navigation should feel almost invisible until the user interacts with it.

---

## Logo Treatment

The supplied logo reference establishes the main visual language:

- Black background
- Bright red geometric mark
- Minimal silhouette
- Angular cuts
- No unnecessary gradients
- No complex illustration
- High contrast
- Strong negative space

The logo should work in:

1. Red on black — primary
2. White on black — monochrome
3. Black on white — light-mode fallback
4. White on red — emergency/high-contrast variant

Do not add glow directly to the logo unless it is part of a hero visual.

---

# Surfaces

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 0 | Void | `#000000` | Main page background |
| 1 | Obsidian | `#080808` | Navigation and primary dark sections |
| 2 | Carbon | `#101010` | Cards and panels |
| 3 | Graphite | `#171717` | Elevated/recessed surfaces |
| 4 | Red Wash | `#2A0808` | Accent containers |
| 5 | Red | `#FF1A1A` | Primary brand surface |

---

# Layout

- **Page max-width:** 1200px
- **Wide max-width:** 1320px
- **Section gap:** 80–120px
- **Card padding:** 28–32px
- **Element gap:** 8–16px
- **Grid gap:** 16–24px
- **Mobile page padding:** 20px
- **Desktop page padding:** 32px

The layout should feel spacious at the section level but compact inside cards.

---

# Hero Direction

The hero is the strongest place to express the visual identity.

Recommended composition:

- Near-black background.
- Large white headline, 56–72px.
- One important word or phrase in electric red.
- Supporting copy in muted gray.
- Primary CTA in solid red.
- Secondary CTA in dark outlined style.
- Abstract angular red graphic or the supplied logo mark on the opposite side.
- Optional very subtle red radial glow behind the graphic.
- Avoid excessive particles, gradients, glassmorphism, or floating 3D objects.

### Hero Example

```text
BUILD
WHAT
MATTERS.

A sharp white editorial headline.
One selected word may use #FF1A1A.
```

The visual hierarchy should remain understandable without the graphic.

---

# Cards

Cards should not look like generic SaaS boxes.

Preferred:

- Very dark surface.
- 1px gray border.
- 28–36px radius.
- Large internal whitespace.
- Small red visual anchor.
- Strong white title.
- Muted supporting text.
- Minimal shadow.

Avoid:

- Thick borders.
- Multiple colors.
- Excessive gradients.
- Excessive glass effects.
- Tiny cards with too much information.

---

# Buttons & Interaction

### Default

```css
transition:
  background-color 160ms ease,
  border-color 160ms ease,
  color 160ms ease,
  transform 160ms ease;
```

### Hover

Red controls may become slightly brighter.

```css
background: #FF3333;
```

### Active

```css
background: #B30000;
transform: translateY(1px);
```

Do not use exaggerated scale animations.

---

# Imagery

Imagery should match the supplied black/red identity.

Preferred:

- High-contrast photography
- Dark environments
- Red practical lighting
- Black backgrounds
- Technical/product visuals
- Angular architecture
- Abstract metallic or industrial surfaces
- Minimal compositions
- Strong negative space

Avoid:

- Pastel imagery
- Colorful stock photography
- Generic startup illustrations
- Cartoon-style graphics
- Excessive 3D renders
- Blue/purple cyberpunk palettes

If photography is used, red should appear naturally or through controlled lighting rather than a heavy red overlay.

---

# Iconography

Use simple geometric icons.

Preferred:

- Lucide-style line icons
- 1.5–2px strokes
- White or muted gray
- Red only for active/important icons

Do not use colorful icon sets.

---

# Do's

- Use `#000000` / `#080808` as the visual foundation.
- Use `#FF1A1A` as the primary brand color.
- Keep typography large and confident.
- Use white for primary information.
- Use muted gray for supporting information.
- Use 1px borders instead of excessive shadows.
- Keep cards around 28–36px radius.
- Keep buttons around 14px radius.
- Use red for interaction and emphasis.
- Preserve large negative space.
- Keep the visual system simple enough to recognize immediately.
- Use the angular logo language as inspiration for decorative geometry.

---

# Don'ts

- Do not introduce blue, green, purple, orange, or yellow into the core palette.
- Do not make every component red.
- Do not use red body text for long paragraphs.
- Do not use huge glowing effects everywhere.
- Do not use heavy drop shadows on every card.
- Do not use excessive glassmorphism.
- Do not add random gradients.
- Do not make the interface look like a gaming dashboard.
- Do not use sharp 0px corners for normal UI containers.
- Do not use decorative elements that compete with the logo.
- Do not turn the entire page into a red/black pattern; black should dominate.

---

# Responsive Behavior

## Desktop

- Hero: two-column or asymmetric composition.
- Display text: 64–72px.
- Cards: 3-column or 4-column grids.
- Large red visual element can occupy 35–45% of hero width.
- Section spacing: 96–120px.

## Tablet

- Hero: 1–2 columns depending on content.
- Display text: 48–60px.
- Cards: 2 columns.
- Section spacing: 72–96px.

## Mobile

- Hero: single column.
- Display text: 40–48px.
- Cards: 1 column.
- CTA buttons can become full width.
- Section spacing: 56–72px.
- Red visual mark should remain visible but never dominate the viewport.

---

# Accessibility

- Maintain strong contrast between white text and dark surfaces.
- Do not rely on red alone to communicate errors or status.
- Focus states must be clearly visible.
- Interactive red elements should remain readable against black.
- Minimum body text target: 14px.
- Avoid placing muted gray below a readable contrast level.

### Error State

Use:

```text
Red border + red icon + explicit text
```

rather than color alone.

---

# Motion

Motion should be fast and controlled.

Recommended durations:

- Micro interaction: 120–160ms
- Component transition: 180–240ms
- Section reveal: 300–500ms

Preferred animations:

- opacity
- translateY
- subtle scale
- border-color
- background-color
- controlled red glow

Avoid:

- continuous spinning
- excessive bouncing
- large elastic animations
- constant particles
- distracting background motion

---

# Design Language

The visual personality can be summarized as:

**Dark. Angular. Precise. Premium. Fast. Red-led.**

The system should feel closer to a premium technology/product brand than a generic SaaS template.

The key visual equation is:

```text
BLACK CANVAS
+
WHITE TYPOGRAPHY
+
ELECTRIC RED
+
HAIRLINE BORDERS
+
LARGE TYPE
+
SOFT ROUNDED SURFACES
=
CORE VISUAL IDENTITY
```

---

# Agent Prompt Guide

When generating or modifying UI using this design system:

> Build a premium dark interface using a black/obsidian canvas and electric red as the single brand accent. Use large bold geometric typography, white primary text, muted gray secondary text, subtle 1px dark borders, and generous 28–36px card radii. Keep layouts spacious and editorial, with compact internal UI density. Use red intentionally for primary CTAs, active states, important labels, and geometric brand graphics. Avoid blue, purple, green, orange, excessive gradients, excessive glow, and generic SaaS visual patterns. The overall result should feel technical, minimal, sharp, premium, and highly intentional.

---

# Quick Color Reference

- Background: `#000000`
- Main surface: `#080808`
- Card surface: `#101010`
- Secondary surface: `#171717`
- Border: `#262626`
- Primary text: `#F5F5F5`
- Secondary text: `#A3A3A3`
- Muted text: `#737373`
- Brand red: `#FF1A1A`
- Bright red: `#FF3333`
- Deep red: `#B30000`
- Red wash: `#2A0808`

---

# CSS Custom Properties

```css
:root {
  /* Colors */
  --color-void: #000000;
  --color-obsidian: #080808;
  --color-carbon: #101010;
  --color-graphite: #171717;
  --color-iron: #262626;
  --color-steel: #404040;
  --color-fog: #737373;
  --color-ash: #A3A3A3;
  --color-silver: #D4D4D4;
  --color-snow: #F5F5F5;
  --color-white: #FFFFFF;

  --color-red: #FF1A1A;
  --color-red-bright: #FF3333;
  --color-red-deep: #B30000;
  --color-red-wash: #2A0808;
  --color-red-glow: rgba(255, 26, 26, 0.22);

  /* Typography */
  --font-primary: 'Cosmica', 'DM Sans', Inter, ui-sans-serif, system-ui, sans-serif;

  --text-caption: 12px;
  --text-meta: 13px;
  --text-body: 15px;
  --text-body-lg: 18px;
  --text-subheading: 20px;
  --text-heading-sm: 32px;
  --text-heading: 40px;
  --text-heading-lg: 56px;
  --text-display: 64px;
  --text-display-xl: 72px;

  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Spacing */
  --spacing-4: 4px;
  --spacing-8: 8px;
  --spacing-12: 12px;
  --spacing-16: 16px;
  --spacing-20: 20px;
  --spacing-24: 24px;
  --spacing-28: 28px;
  --spacing-32: 32px;
  --spacing-40: 40px;
  --spacing-48: 48px;
  --spacing-64: 64px;
  --spacing-80: 80px;
  --spacing-96: 96px;
  --spacing-120: 120px;

  /* Layout */
  --page-max-width: 1200px;
  --page-max-width-wide: 1320px;
  --section-gap: 96px;
  --card-padding: 28px;
  --element-gap: 12px;

  /* Radius */
  --radius-buttons: 14px;
  --radius-inputs: 14px;
  --radius-badges: 12px;
  --radius-cards: 36px;
  --radius-large: 40px;
  --radius-pills: 10000px;

  /* Shadows */
  --shadow-card: none;
  --shadow-elevated: 0 12px 40px rgba(0, 0, 0, 0.28);
  --shadow-red:
    inset 0 0.5px 0 rgba(255,255,255,0.22),
    0 0 0 1px rgba(255,26,26,0.18),
    0 8px 24px rgba(255,26,26,0.12);

  /* Surfaces */
  --surface-canvas: #000000;
  --surface-main: #080808;
  --surface-card: #101010;
  --surface-subtle: #171717;
  --surface-red: #FF1A1A;
  --surface-red-wash: #2A0808;
}
```

---

# Tailwind v4

```css
@theme {
  /* Colors */
  --color-void: #000000;
  --color-obsidian: #080808;
  --color-carbon: #101010;
  --color-graphite: #171717;
  --color-iron: #262626;
  --color-steel: #404040;
  --color-fog: #737373;
  --color-ash: #A3A3A3;
  --color-silver: #D4D4D4;
  --color-snow: #F5F5F5;
  --color-white: #FFFFFF;

  --color-red: #FF1A1A;
  --color-red-bright: #FF3333;
  --color-red-deep: #B30000;
  --color-red-wash: #2A0808;

  /* Typography */
  --font-primary: 'Cosmica', 'DM Sans', Inter, ui-sans-serif, system-ui, sans-serif;

  --text-caption: 12px;
  --text-meta: 13px;
  --text-body: 15px;
  --text-body-lg: 18px;
  --text-subheading: 20px;
  --text-heading-sm: 32px;
  --text-heading: 40px;
  --text-heading-lg: 56px;
  --text-display: 64px;
  --text-display-xl: 72px;

  /* Spacing */
  --spacing-4: 4px;
  --spacing-8: 8px;
  --spacing-12: 12px;
  --spacing-16: 16px;
  --spacing-20: 20px;
  --spacing-24: 24px;
  --spacing-28: 28px;
  --spacing-32: 32px;
  --spacing-40: 40px;
  --spacing-48: 48px;
  --spacing-64: 64px;
  --spacing-80: 80px;
  --spacing-96: 96px;
  --spacing-120: 120px;

  /* Radius */
  --radius-xl: 12px;
  --radius-2xl: 16px;
  --radius-3xl: 24px;
  --radius-3xl-2: 28px;
  --radius-3xl-3: 36px;
  --radius-3xl-4: 40px;
  --radius-full: 10000px;

  /* Shadows */
  --shadow-elevated: 0 12px 40px rgba(0, 0, 0, 0.28);
}
```

---

# Final Reference

The uploaded visual reference should be treated as the identity anchor:

**Black background + simple geometric red mark + extreme contrast + minimal composition.**

Everything in the UI should support that same feeling without copying the logo literally.

The red is not decoration.

**Red is the signal.**
