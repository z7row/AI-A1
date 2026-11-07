---
name: "Cinescope Mail"
description: "Pure black void with frost-blue borders. Editorial serif hero, geometric sans sections, pill CTAs, and a multi-color accent system that performs against the dark."
tags: [dark, editorial, developer, cinematic]
colors:
  primary: "#f0f0f0"
  secondary: "#a1a4a5"
  tertiary: "#ff801f"
  neutral: "#000000"
  surface: "#000000"
typography:
  display: Fraunces
  body: Inter
  mono: "JetBrains Mono"
  scale:
    hero: "4.5rem / 1 / 400 / -0.96px"
    h1: "3.5rem / 1.2 / 400 / -2.8px"
    h2: "1.5rem / 1.3 / 500 / 0"
    body: "1rem / 1.5 / 400 / 0"
radius:
  sm: 4px
  md: 8px
  lg: 16px
  pill: 9999px
shadows:
  card: "rgba(176, 199, 217, 0.145) 0 0 0 1px"
borders:
  card: "1px solid rgba(214, 235, 253, 0.19)"
  divider: "rgba(214, 235, 253, 0.19)"
buttons:
  primary:
    background: #FFFFFF
    color: #000000
    border: none
    shape: pill
    padding: 10px 22px
    font: 600
  secondary:
    background: #000000
    color: #FFFFFF
    border: 1px solid rgba(255,255,255,0.12)
    shape: pill
    padding: 10px 22px
    font: 600
  outline:
    background: transparent
    color: #FFFFFF
    border: 1px solid rgba(135,206,250,0.4)
    shape: pill
    padding: 10px 22px
    font: 600
  ghost:
    background: transparent
    color: rgba(255,255,255,0.6)
    border: none
    shape: pill
    padding: 10px 14px
    font: 600
charts:
  variant: "thin-bars"
  stroke_width: 1.5
  fill_opacity: 0
  gridlines: false
  bar_gap: 12px
  highlight: all
  dot_marker: true
  palette:
    [
      "#ff801f",
      "#11ff99",
      "#3b9eff",
      "#ffc53d",
      "#ff2047",
      "#ff801f",
      "#3b9eff",
    ]
fonts_url: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400&display=swap"
dependencies: ["lucide-react"]
---

# Cinescope Mail

## AI Build Instructions

> **Read this section before writing any code.** The rules below
> are non-negotiable. Every value used in the UI must come from this
> file's frontmatter — never substitute, approximate, or invent new
> colors, fonts, radii, or shadows. If a value is missing, ask the
> user before adding one.

### 1 · Your role

You are building UI for a project that has adopted **Cinescope Mail** as its
design system. Treat `DESIGN.md` as the single source of truth.
Your job is to translate the user's product requirements into
components and pages that look like they were designed by the same
person who authored this file.

### 2 · Token compliance

- Pull every color, font family, radius, shadow, and spacing value
  from the frontmatter at the top of this file.
- Use semantic roles (e.g. `primary`, `accent`, `muted`) — never
  hard-code hex values that bypass the system.
- When a token can be expressed as a CSS variable, declare it once
  in your global stylesheet and reference it everywhere downstream.
- The Google Fonts `<link>` is provided in the Typography section.
  Add it to `<head>` before any component renders.

### 3 · Component recipes

Use these recipes verbatim when building the corresponding component.

#### Buttons

Four variants are defined. Pick one — never blend variants or invent a fifth.

- **Primary** — pill shape, bg `#FFFFFF`, text `#000000`, padding `10px 22px`, weight `600`.
- **Secondary** — pill shape, bg `#000000`, text `#FFFFFF`, border `1px solid rgba(255,255,255,0.12)`, padding `10px 22px`, weight `600`.
- **Outline** — pill shape, text `#FFFFFF`, border `1px solid rgba(135,206,250,0.4)`, padding `10px 22px`, weight `600`.
- **Ghost** — pill shape, text `rgba(255,255,255,0.6)`, padding `10px 14px`, weight `600`.

Reach for **primary** as the single dominant CTA per screen.
**Secondary** for the supporting action. **Outline** for tertiary
actions in toolbars. **Ghost** for inline links and table actions.

#### Cards

- Background: `#000000`
- Border: `1px solid rgba(214, 235, 253, 0.19)`
- Shadow: `rgba(176, 199, 217, 0.145) 0 0 0 1px`
- Radius: `radius.lg` (`16px`)
- Internal padding: `20px` for compact cards, `24–28px` for content cards.

#### Charts

- Bar/line variant: `thin-bars`
- No gridlines — let the bars/lines carry the data.
- Highlight strategy: `all` — emphasize a single bar/point per chart.
- Use the declared palette in order: `#ff801f`, `#11ff99`, `#3b9eff`, `#ffc53d`, `#ff2047`, `#ff801f`, `#3b9eff`.

#### Typography pairings

- **Display (`Fraunces`)** — h1, h2, hero headlines, brand wordmarks.
- **Body (`Inter`)** — paragraphs, labels, button text, form inputs.
- **Mono (`JetBrains Mono`)** — code, eyebrows, metadata, numerals in tables.

### 4 · Hard constraints

Never do any of the following without explicit instruction from the user:

- Introduce a new color, font, radius, or shadow that isn't declared above.
- Mix this system with another (e.g. don't paste in Material or Bootstrap defaults).
- Use generic gradient defaults (purple→blue, peach→pink) — they break the system's voice.
- Reach for emoji icons. Use a consistent icon library and size icons in line with body type.
- Add motion that exceeds the system's restraint — keep transitions short (≤200ms) and subtle.

### 5 · Before you finish — verify

Run through this checklist for every screen you produce:

- [ ] Every color used appears in the Colors table above.
- [ ] Headlines use the display font; body copy uses the body font.
- [ ] Buttons match one of the declared variants exactly (shape, padding, weight).
- [ ] Border-radius values come from `radius.sm` / `radius.md` / `radius.lg` / `radius.pill`.
- [ ] Cards and dividers use the declared border + shadow tokens.
- [ ] No values were invented; if you needed something missing, you stopped and asked.

---

## 1. Atmosphere

Cinescope Mail is dark, cinematic, and unhurried. The page is draped in pure black (`#000000`) with text that glows in near-white (`#f0f0f0`) — a theatre-like experience where content performs on a void stage. This is not the typical developer-tool darkness. It is the controlled darkness of a photography gallery, where every element is lit with intention and nothing competes for attention.

The typography is the lead actor. A three-font hierarchy: a dramatic display serif at massive 96px for hero headlines (line-height 1.00, tracking -0.96px) creates magazine-cover energy; a geometric sans handles section headings with even more aggressive tracking (-2.8px at 56px) for compressed engineered authority; a clean grotesk takes over for body and UI to let the display fonts shine. A monospace voice rounds out the family for code blocks — code is treated as a first-class visual element, not an afterthought.

The signature visual element is the **icy frost border**. Instead of neutral gray, every container is outlined in `rgba(214, 235, 253, 0.19)` — a frosty, slightly blue-tinted line at 19% opacity that gives every divider a cold, crystalline quality against the black. Combined with pill-shaped CTAs (9999px), a multi-color accent system, and whisper-thin ring shadows, the result feels premium, precise, and quietly confident.

**Signature moves**

- Pure `#000000` void background — never warm or charcoal
- Three-font hierarchy: display serif (hero), geometric sans (sections), grotesk (body)
- Icy frost borders `rgba(214, 235, 253, 0.19)` — cold crystalline shimmer
- Multi-color accent system: orange, green, blue, yellow, red — each with its own role
- Pill CTAs (9999px), white solid or transparent + frost
- Mono as design element — used prominently, not hidden
- Whisper ring shadows: `rgba(176, 199, 217, 0.145) 0 0 0 1px`

## 2. Palette

### Canvas

- **Void Black** `#000000` — page background
- **Near White** `#f0f0f0` — primary text
- **Pure White** `#ffffff` — solid CTA, max emphasis

### Accent System

- **Orange** `#ff801f` (primary), `#ffa057` (light), `#ff5900` (deep)
- **Green** `#11ff99`, `#22ff99` — success, positive
- **Blue** `#3b9eff` (links), `#0081fd` — interactive
- **Yellow** `#ffc53d` — warnings, highlights
- **Red** `#ff2047` — errors, destructive

### Neutrals

- Silver `#a1a4a5` — secondary text
- Dark Gray `#464a4d` — tertiary
- Mid Gray `#5c5c5c` — hover

### Borders & Surface

- Frost `rgba(214, 235, 253, 0.19)` — universal
- Frost Soft `rgba(217, 237, 254, 0.145)` — list items
- Ring `rgba(176, 199, 217, 0.145) 0 0 0 1px` — shadow-as-border

## 3. Typography

| Role          | Font  | Size | Weight | Leading | Tracking |
| ------------- | ----- | ---- | ------ | ------- | -------- |
| Display Hero  | Serif | 96px | 400    | 1.00    | -0.96px  |
| Section Head  | Sans  | 56px | 400    | 1.20    | -2.8px   |
| Sub-heading   | Sans  | 20px | 400    | 1.30    | normal   |
| Feature title | Body  | 24px | 500    | 1.50    | normal   |
| Body L        | Body  | 18px | 400    | 1.50    | normal   |
| Body          | Body  | 16px | 400    | 1.50    | normal   |
| Nav           | Sans  | 14px | 500    | 1.43    | +0.35px  |
| Caption       | Body  | 14px | 400    | 1.60    | normal   |
| Code          | Mono  | 16px | 400    | 1.50    | normal   |

**The only positive tracking is on nav.** Display fonts compress (negative tracking); nav links breathe (+0.35px). Display serif is hero-only — never body. Each font has one job and never crosses lanes.

## 4. Buttons

### White Solid Pill (Primary)

```css
background: #ffffff;
color: #000000;
padding: 5px 12px;
border-radius: 9999px;
```

### Frost Pill (Secondary)

- Transparent background, `#f0f0f0` text
- `1px solid rgba(214, 235, 253, 0.19)`, 9999px radius
- Hover: `rgba(255,255,255,0.28)` glass

### Ghost

- Transparent, no border, `#f0f0f0` text, 4px radius

## 5. Cards

- Background: transparent or near-black
- Border: `1px solid rgba(214, 235, 253, 0.19)` (frost)
- Radius: 16px standard, 24px large
- Shadow: `rgba(176, 199, 217, 0.145) 0 0 0 1px` — ring only

## 6. Charts

**Multi-color accent bars.** Each bar takes its own color from the accent palette (orange / green / blue / yellow / red), creating syntax-highlighted data visualizations that match the code-block aesthetic. Line charts use thin strokes (1.5px) with no fill — pure linework against the void.

## 7. Spacing

- Base: 8px
- Scale: `4, 6, 8, 12, 16, 20, 24, 32, 40, 80, 120`
- Section vertical: 80–120px+ — cinematic black space

## 8. Depth & elevation

| Level | Treatment                          | Use                      |
| ----- | ---------------------------------- | ------------------------ |
| 0     | Flat black                         | Default                  |
| 1     | Frost border                       | Cards, dividers, buttons |
| 1b    | Ring shadow `0 0 0 1px`            | Floating panels          |
| 3     | Heavy black focus ring `0 0 0 8px` | Accessibility            |

**Borders ARE the depth.** On pure black, traditional shadows disappear. Cinescope Mail uses thin icy borders to create floating-glass-in-space depth — borders catch light, shadows don't.

## 9. Do's & don'ts

✅ **Do**

- Use `#000000` — pure void, never charcoal
- Apply frost borders (`rgba(214,235,253,0.19)`) for all structural lines
- Pin display serif to hero only, geometric sans to sections, grotesk to body
- Use pill (9999px) for primary CTAs and tags
- Use multi-color accents — each feature gets its own color
- Use +0.35px tracking on nav (the only positive tracking)

❌ **Don't**

- Use neutral gray borders — they kill the icy signature
- Use bold display serif on body
- Mix multiple accent colors in the same component
- Use box-shadow elevation on dark — frost borders only
- Apply opaque buttons — transparency + frost is the pattern

---

## Tokens

> Generated from the same source the live preview renders from.
> Treat the values below as the contract — never substitute approximations.

### Colors

| Role      | Value     |
| --------- | --------- |
| primary   | `#f0f0f0` |
| secondary | `#a1a4a5` |
| tertiary  | `#ff801f` |
| neutral   | `#000000` |
| surface   | `#000000` |

### Typography

- **Display:** Fraunces
- **Body:** Inter
- **Mono:** JetBrains Mono

| Role | size / leading / weight / tracking |
| ---- | ---------------------------------- |
| Hero | 4.5rem / 1 / 400 / -0.96px         |
| H1   | 3.5rem / 1.2 / 400 / -2.8px        |
| H2   | 1.5rem / 1.3 / 500 / 0             |
| Body | 1rem / 1.5 / 400 / 0               |

### Radius

- sm: `4px`
- md: `8px`
- lg: `16px`
- pill: `9999px`

### Shadows

- **card:** `rgba(176, 199, 217, 0.145) 0 0 0 1px`

### Borders

- **card:** `1px solid rgba(214, 235, 253, 0.19)`
- **divider:** `rgba(214, 235, 253, 0.19)`

### Buttons

Four variants, each fully tokenized. The preview renders from these exact values.

#### Primary

| Property   | Value       |
| ---------- | ----------- |
| shape      | `pill`      |
| background | `#FFFFFF`   |
| color      | `#000000`   |
| border     | `none`      |
| padding    | `10px 22px` |
| fontWeight | `600`       |

#### Secondary

| Property   | Value                              |
| ---------- | ---------------------------------- |
| shape      | `pill`                             |
| background | `#000000`                          |
| color      | `#FFFFFF`                          |
| border     | `1px solid rgba(255,255,255,0.12)` |
| padding    | `10px 22px`                        |
| fontWeight | `600`                              |

#### Outline

| Property   | Value                             |
| ---------- | --------------------------------- |
| shape      | `pill`                            |
| background | `transparent`                     |
| color      | `#FFFFFF`                         |
| border     | `1px solid rgba(135,206,250,0.4)` |
| padding    | `10px 22px`                       |
| fontWeight | `600`                             |

#### Ghost

| Property   | Value                   |
| ---------- | ----------------------- |
| shape      | `pill`                  |
| background | `transparent`           |
| color      | `rgba(255,255,255,0.6)` |
| border     | `none`                  |
| padding    | `10px 14px`             |
| fontWeight | `600`                   |

### Charts

| Property    | Value                                                                       |
| ----------- | --------------------------------------------------------------------------- |
| variant     | `thin-bars`                                                                 |
| strokeWidth | `1.5`                                                                       |
| fillOpacity | `0`                                                                         |
| gridlines   | `false`                                                                     |
| barGap      | `12px`                                                                      |
| highlight   | `all`                                                                       |
| dotMarker   | `true`                                                                      |
| palette     | `#ff801f`, `#11ff99`, `#3b9eff`, `#ffc53d`, `#ff2047`, `#ff801f`, `#3b9eff` |

---

## Pro tokens

> Production-fidelity tokens. States, density, motion, elevation,
> content rules and a measured WCAG contract — derived from the
> resting tokens unless explicitly authored.

### States

#### Button

- **hover** — bg: `rgba(255, 128, 31, 0.92)`, shadow: `0 4px 20px -8px rgba(255, 128, 31, 0.4)`
- **focus** — outline: `1.5px solid #ff801f`, outline-offset: `4px`
- **active** — transform: `translateY(1px)`, filter: `brightness(0.95)`
- **disabled** — opacity: `0.45`
- **loading** — opacity: `0.7`
- **selected** — bg: `#f0f0f0`, color: `#000000`

#### Input

- **hover** — border: `1px solid #f0f0f0`
- **focus** — border: `1px solid #ff801f`, shadow: `0 1px 0 0 #ff801f`
- **disabled** — opacity: `0.45`
- **error** — border: `1px solid #991B1B`, shadow: `0 1px 0 0 #991B1B`

#### Card

- **hover** — shadow: `0 8px 24px -12px rgba(15,23,42,0.14)`, transform: `translateY(-1px)`
- **selected** — border: `1px solid #f0f0f0`

#### Tab

- **hover** — color: `#f0f0f0`
- **focus** — outline: `1.5px solid #ff801f`, outline-offset: `3px`
- **selected** — color: `#ff801f`, border: `0 0 2px 0 solid #ff801f`

### Density

| Mode        | padding × | row × | body      | radius × | Use for                                      |
| ----------- | --------- | ----- | --------- | -------- | -------------------------------------------- |
| compact     | 0.72      | 0.78  | 0.8125rem | 0.85     | Information-dense — tables, IDEs, dashboards |
| comfortable | 1         | 1     | 0.9375rem | —        | Default — most product UI                    |
| spacious    | 1.35      | 1.3   | 1rem      | 1.15     | Editorial — marketing, long-form, settings   |

### Motion

**Signature — Page turn.** Deliberate, measured motion — like turning a magazine page. Never jerky, never overdone.

```css
transition: all 320ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
```

| Token             | Value                                  |
| ----------------- | -------------------------------------- |
| duration.instant  | `80ms`                                 |
| duration.fast     | `180ms`                                |
| duration.base     | `320ms`                                |
| duration.slow     | `500ms`                                |
| easing.standard   | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` |
| easing.decelerate | `cubic-bezier(0.0, 0, 0.2, 1)`         |
| easing.accelerate | `cubic-bezier(0.4, 0, 1, 1)`           |
| easing.spring     | `cubic-bezier(0.5, 1.2, 0.6, 1)`       |

### Elevation

Five-level scale, system-specific recipe.

| Level  | Shadow                                  | Recipe                                           |
| ------ | --------------------------------------- | ------------------------------------------------ |
| level0 | `none`                                  | Hairline only — typical editorial resting state. |
| level1 | `0 1px 2px rgba(15,23,42,0.04)`         | Barely visible — list rows, dividers.            |
| level2 | `0 8px 24px -12px rgba(15,23,42,0.12)`  | Pull-quote, sidebar — soft lift.                 |
| level3 | `0 16px 40px -16px rgba(15,23,42,0.18)` | Cover story card — clear lift.                   |
| level4 | `0 32px 80px -24px rgba(15,23,42,0.28)` | Modal — overlays the layout, with scrim.         |

### Content

- **measure:** `60ch` (max line length for body prose)
- **paragraph spacing:** `1.5em`
- **list indent:** `1.75em`
- **list gap:** `0.55em`
- **link:** color `#ff801f`, underline `always`
- **blockquote:** border `4px solid #ff801f`, padding `0.4em 0 0.4em 1.5em`
- **code:** background `rgba(240, 240, 240, 0.06)`, color `#f0f0f0`

### Accessibility (WCAG 2.1)

**Overall:** AAA

| Pair                  | Ratio   | Required | Grade | Suggested fix |
| --------------------- | ------- | -------- | ----- | ------------- |
| Body text on surface  | 18.43:1 | AA       | AAA   | —             |
| Body text on canvas   | 18.43:1 | AA       | AAA   | —             |
| Muted text on surface | 8.37:1  | AA       | AAA   | —             |
| Accent on surface     | 8.36:1  | AA-Large | AAA   | —             |
| Accent on canvas      | 8.36:1  | AA-Large | AAA   | —             |
