---
name: TiendaDeportivaLM
description: Monochrome streetwear-running storefront where product photography and the price carry the page.
colors:
  white: "#FFFFFF"
  surface: "#F5F5F5"
  line: "#E5E5E5"
  line-strong: "#CACACB"
  ink: "#111111"
  ink-raised: "#3A3A3A"
  grey: "#707072"
  grey-d: "#4B4B4D"
  red: "#D30005"
  night-deep: "#0B0B0B"
  night-core: "#121212"
  night-glow: "#2C2C2E"
  hero-ground: "#1C1A17"
  on-dark-muted: "#C7C7C9"
  on-dark-faint: "#B3B3B5"
typography:
  display:
    fontFamily: "Archivo, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "clamp(4.25rem, 1.6rem + 10vw, 6rem)"
    fontWeight: 900
    lineHeight: 0.86
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 62"
  headline:
    fontFamily: "Archivo, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "clamp(2rem, 1.4rem + 2.4vw, 3.25rem)"
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 62"
  title:
    fontFamily: "Archivo, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "clamp(1.5rem, 1.25rem + 1vw, 2rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  product-name:
    fontFamily: "Archivo, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Archivo, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: "Archivo, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Archivo, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1
  caption:
    fontFamily: "Archivo, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  wordmark:
    fontFamily: "Archivo, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "1.15rem"
    fontWeight: 800
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 75"
rounded:
  none: "0px"
  focus: "4px"
  field: "10px"
  panel: "12px"
  bar: "18px"
  dialog: "20px"
  pill: "999px"
spacing:
  gutter: "clamp(1.25rem, 3.5vw, 3rem)"
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1.25rem"
  lg: "2.5rem"
  section: "clamp(3rem, 7vw, 5rem)"
  header: "64px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.75rem 1.5rem"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.ink-raised}"
    textColor: "{colors.white}"
  button-light:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.75rem 1.5rem"
    height: "48px"
  button-light-hover:
    backgroundColor: "{colors.line}"
    textColor: "{colors.ink}"
  button-outline-light:
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.75rem 1.5rem"
    height: "48px"
  button-ghost:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.75rem 1.5rem"
    height: "48px"
  button-disabled:
    backgroundColor: "{colors.line}"
    textColor: "#6E6E70"
    rounded: "{rounded.pill}"
  icon-button:
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    size: "44px"
  icon-button-hover:
    backgroundColor: "{colors.line}"
  chip:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.pill}"
    padding: "0.5rem 1.1rem"
    height: "40px"
  chip-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
  search-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.pill}"
    padding: "0 1rem"
    height: "44px"
  search-field-focus:
    backgroundColor: "{colors.white}"
  text-input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.field}"
    padding: "0.6rem 0.9rem"
    height: "48px"
  product-tile:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.none}"
  stock-low:
    textColor: "{colors.red}"
    typography: "{typography.label}"
  stock-out:
    textColor: "{colors.grey-d}"
    typography: "{typography.label}"
  toast:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.pill}"
    padding: "0.85rem 1.25rem"
  admin-bar:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    rounded: "{rounded.bar}"
    padding: "0.85rem 1rem 0.85rem 1.4rem"
  dialog:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.dialog}"
    padding: "1.75rem"
---

# Design System: TiendaDeportivaLM

## Overview

**Creative North Star: "The Night-City Shop Floor"**

A premium sportswear storefront played straight. The page is white and grey ground, near-black ink, and full-bleed night-city running photography; the product image and its price do the persuading, and the interface stays out of their way. Every surface is either a quiet commerce ground (white, #F5F5F5 tiles) or a dark campaign band (photo under a bottom-weighted scrim, the near-black radial showroom, the solid ink advice band). The page alternates between the two, and that alternation is the rhythm of the whole site.

Type is one variable family, Archivo, doing two jobs: compressed, black-weight uppercase for the few campaign statements, and regular-width medium/semibold for every piece of shopping UI. Shapes are binary: product media is square-cornered and borderless, everything you press is a full pill. Colour is almost absent; the single chromatic value in the interface is a functional red that only ever means "few left".

Motion is quiet and settles rather than bounces: one long expo-out entrance on the hero, scrubbed parallax on campaign photos, a slow image scale on tile hover, a pinned spotlight whose 3D ball turns once with the scroll, and a drag-to-spin 3D shoe in the showroom. All of it collapses under `prefers-reduced-motion`.

**Key Characteristics:**
- Monochrome commerce UI (white, #F5F5F5, #111111, two greys); colour comes from photography and 3D product only.
- One family, Archivo variable: width 62% + weight 900 + uppercase for display; normal width for UI.
- Square, borderless, grey-grounded product media; pill-shaped controls everywhere else.
- Alternating light commerce sections and dark full-bleed campaign bands.
- Red #D30005 is reserved for low stock.
- Tabular numerals on every price, count and quantity.

## Colors

A near-colourless palette of whites, greys and ink, so photography and product supply all the colour.

### Primary
- **Shop Ink** (`ink`): text, primary buttons, selected chips, focus outline, selection highlight, cart badge, the solid advice band, admin bar and toast. It is the brand colour; there is no other accent.
- **Raised Ink** (`ink-raised`): hover state of the ink button only.

### Tertiary
- **Low-Stock Red** (`red`): the "Quedan N" stock line on product cards. Nothing else.

### Neutral
- **Paper White** (`white`): page ground, header, drawer, dialogs, light buttons on dark bands.
- **Tile Grey** (`surface`): product and category media grounds, utility bar, search field rest state, spotlight band, admin tool panel, quiet hover fills.
- **Hairline Grey** (`line`): dividers (footer, cart lines, drawer foot), sticky-header underline, icon-button hover, disabled button fill.
- **Control Grey** (`line-strong`): 1.5px borders of ghost buttons, chips, selects, steppers, inputs; secondary text on the ink band; scrollbar thumb.
- **Nike Grey** (`grey`): secondary text: category under product name, counts, placeholders, cart notes (4.9:1 on white).
- **Deep Grey** (`grey-d`): longer secondary copy on light grounds: footer lists, empty states, dialog help text, spotlight description, the "Agotado" stock line.
- **Night Deep / Core / Glow** (`night-deep`, `night-core`, `night-glow`): the showroom radial, `radial-gradient(60% 70% at 65% 50%, glow 0%, core 55%, deep 100%)`, lit off-centre behind the 3D shoe.
- **Hero Ground** (`hero-ground`): warm near-black behind the hero photo while it loads.
- **On-Dark Muted** (`on-dark-muted`): descriptive copy and legends on the showroom band.
- **On-Dark Faint** (`on-dark-faint`): hints and loading text on dark 3D stages.

### Named Rules
**The Red Means Scarcity Rule.** Red #D30005 appears only on the low-stock line. Errors, sale states and emphasis use ink weight, never red; the form error message is ink 600.

**The Photography Carries Colour Rule.** UI chrome stays monochrome. A new surface gets its colour from a product image, a campaign photo or a 3D render, not from a tinted background or accent.

## Typography

**Display Font:** Archivo variable (wght 100–900, wdth 62–125), self-hosted and embedded, with Helvetica Neue, Helvetica, Arial fallback
**Body Font:** Archivo (same file)

**Character:** One grotesque, stretched to two extremes: compressed black-weight caps that read like a running-campaign poster, and a plain, roomy UI voice at regular width that older shoppers can read without effort.

### Hierarchy
- **Display** (900, width 62%, clamp 4.25–6rem, line-height 0.86, uppercase, balanced wrap): the hero headline only; the showroom product name uses the same treatment at clamp(3.5rem, 1.6rem + 6vw, 6rem).
- **Headline** (900, width 62%, clamp 2–3.25rem, line-height 0.9–0.95, uppercase): statements on campaign bands: editorial, spotlight product name, advice band.
- **Title** (600, clamp 1.5–2rem): section heads ("Compra por deporte", catalogue), cart drawer and dialog titles, showroom/spotlight price.
- **Product Name** (600, 1.125rem, 1.3): card names; card price shares size and weight with tabular numerals.
- **Body** (400, 1.125rem, 1.5): the base page size; hero and band copy capped around 30–36rem.
- **Body Small** (400, 1rem): category lines, chips, inputs, cart lines, footer.
- **Label** (500, 1rem, line-height 1): buttons, nav links, stock lines.
- **Caption** (400, 0.875rem): utility bar, hints, cart note, footer base, small buttons.
- **Wordmark** (800, width 75%, 1.15rem): "TiendaDeportiva" in ink with "LM" in Nike Grey.

### Named Rules
**The Two Widths Rule.** Compressed width (62%) belongs only to uppercase 900-weight campaign statements on bands or the hero. Shopping UI (names, prices, buttons, forms) is always regular width, sentence case.

**The Tabular Price Rule.** Every price, count, total and quantity sets `font-variant-numeric: tabular-nums`. Prices are written "Q.499".

## Layout

Full-bleed sections stacked vertically; content inset by one fluid gutter (`spacing.gutter`) on both sides. The header is a three-column grid (wordmark, centred category nav, tools) at 64px, sticky, gaining a 1px hairline once scrolled and sliding away on scroll down; below 960px the nav drops and it becomes two columns.

Campaign bands are tall (hero ~min(100svh − header − utility, 820px), editorial min(80svh, 760px), spotlight 100svh pinned) with copy anchored bottom-left inside the gutter and capped to roughly 24–40rem. The showroom is a 5fr/7fr split (copy left, 3D stage right) that stacks with the stage first below 860px.

The catalogue grid is 4 columns, 3 under 1100px, 2 under 760px, with tight column gaps (0.75rem, 0.5rem on phones) and generous row gaps (2.5rem, 2rem): tiles read as a continuous shelf, rows breathe. Category tiles sit in a horizontal snap rail of 4:5 portraits, min 240px wide. Section vertical padding is fluid (`spacing.section`, roughly 3–5.5rem). The footer is three columns, one on phones.

Overlays: the cart is a right-side drawer up to 27rem; dialogs are centred at 26rem (38rem for the two-column add-product form, one column under 560px); the admin bar floats bottom-centre up to 64rem wide.

## Elevation & Depth

The commerce layer is flat: cards and tiles have no shadow and no border; separation comes from the grey media ground against white and from whitespace. Depth is reserved for things that float above the page, and for the dark bands, where photographic scrims and the 3D stage provide atmosphere.

### Shadow Vocabulary
- **Header hairline** (`box-shadow: 0 1px 0 #E5E5E5`): sticky header once scrolled past 40px.
- **Drawer edge** (`box-shadow: -24px 0 48px -24px rgba(0,0,0,.25)`): cart panel.
- **Dialog lift** (`box-shadow: 0 30px 80px -20px rgba(0,0,0,.35)`): admin dialogs.
- **Floating bar** (`box-shadow: 0 18px 40px -12px rgba(0,0,0,.45)`): admin bar.
- **Scrim**: `rgba(17,17,17,.45)` behind drawer and dialogs.
- **Photo scrim**: bottom-weighted black linear gradients (to .72 on the hero, .65 on the editorial) so white copy sits on photography.

### Named Rules
**The Flat Shelf Rule.** Product and category tiles never take a shadow or border. Only overlays (drawer, dialog, admin bar) are lifted.

## Shapes

Two shapes and almost nothing between them. Media (product tiles, category portraits, cart thumbnails, campaign photos) is square-cornered with no border. Interactive controls are full pills (999px): buttons, chips, search, select, stepper, nav hover, toast, skip link, the cart badge; icon buttons and colour swatches are circles. Containers that hold controls get moderate radii: inputs 10px, admin tool panel 12px, admin bar 18px (16px on phones), dialogs 20px. Control borders are 1.5px; dividers are 1px. Line icons are inline SVG at 1.6 stroke with round caps and joins, 20–24px.

## Components

### Buttons
Solid, confident pills with a 48px minimum height.
- **Shape:** full pill (`rounded.pill`), 1.5px border slot, 0.75rem × 1.5rem padding, label 500 at 1rem, optional 20px leading icon with 0.55rem gap.
- **Primary (ink):** ink fill, white label; hover to Raised Ink. Used for add-to-cart, "Pedir por WhatsApp", dialog submit.
- **Light:** white fill, ink label, hover to hairline grey. The primary action on dark bands (hero, editorial, showroom, advice).
- **Outline light:** transparent with a white 85% border; hover adds a 14% white wash. Secondary action on dark bands and the admin bar.
- **Ghost:** white with Control Grey border; hover turns the border ink. Cancel actions.
- **Small:** 40px, 0.55rem × 1rem, caption size. Admin bar only.
- **Disabled:** hairline fill, #6E6E70 label, no border, not-allowed cursor.
- **Card variant (desktop ≥761px):** the card's add button rests as a ghost and becomes solid ink on button or card hover; on phones it is always solid ink.

### Chips
- **Style:** white pill, 1.5px Control Grey border, 40px min height, body-small text; hover border goes ink.
- **State:** selected (`aria-pressed="true"`) is solid ink with white text. Category filters in a horizontally scrolling row.

### Cards / Containers
- **Product card:** square 1:1 media on Tile Grey, no radius, no border, no shadow; image scales to 1.035 on card hover over 0.8s. Body below: optional stock line (red "Quedan N" when ≤5, Deep Grey "Agotado" with the image dimmed to 45%), name, category in Nike Grey, price, then a full-width add button pinned to the card bottom.
- **Category tile:** 4:5 portrait on Tile Grey, label 600 with a Nike Grey count beneath; image scales to 1.04 on hover.
- **Admin tools:** hidden in shopping mode; in admin mode a 12px-radius Tile Grey panel replaces the add button with a stepper and underlined text actions.

### Inputs / Fields
- **Search:** Tile Grey pill, 44px, leading 20px icon, no border; focus turns it white with a 1.5px ink ring.
- **Select:** white pill with Control Grey border and an inline chevron; hover border ink.
- **Dialog inputs:** 48px, 10px radius, 1.5px Control Grey border; focus shifts the border to ink. File inputs use a ghost-pill selector button.
- **Stepper:** Control Grey pill outline holding two 40px circular buttons and a tabular count; hover fills the button Tile Grey; disabled at 30% opacity.
- **Error:** ink, 600 weight, reserved line height; never red.

### Navigation
Utility bar on Tile Grey at caption size (WhatsApp line, number in 600). Header: wordmark left, five category links (500, 1rem, pill padding 0.6rem × 0.8rem, Tile Grey pill on hover) centred, then 44px circular icon buttons for search and cart; the cart badge is an 18px ink pill with tabular white count, hidden at zero. Footer links are Deep Grey and go ink with a 3px-offset underline on hover.

### 3D Showroom (signature)
A near-black radial band hosting a photoreal shoe on a WebGL canvas (ACES filmic tone mapping, key + rim white directional lights, soft blob shadow) that the visitor drags to spin 360°. Copy column holds the compressed display name, muted description, title-size price, and a row of 48px circular colour swatches (inset 1px white 25% ring; checked shows a 2px white outline at 3px offset) before a light pill add button. A faint caption hint with a double-arrow icon sits bottom-centre of the stage.

### Spotlight (signature)
A Tile Grey band pinned for 1.2 viewport heights while a 3D football turns once with the scroll; headline-size uppercase name, Deep Grey description and an ink add button sit bottom-left.

### Overlays
- **Cart drawer:** white right panel up to 27rem, slides in from the right (0.5s expo-out, out 0.35s power3-in) over a 45% ink scrim; lines are 96px square thumbnails with hairline dividers; foot holds the total and a full-width ink button.
- **Dialog:** white, 20px radius, 1.75rem padding, dialog lift shadow.
- **Toast:** ink pill dropping from the top centre over 0.45s.
- **Admin bar:** floating ink bar, 18px radius, light and outline-light small pills.

## Do's and Don'ts

### Do:
- **Do** keep commerce UI monochrome: white, Tile Grey (#F5F5F5), Shop Ink (#111111), and the two greys for secondary text.
- **Do** reserve Low-Stock Red (#D30005) for the "Quedan N" line.
- **Do** set campaign statements in Archivo 900, width 62%, uppercase, line-height 0.86–0.95, and only on the hero or a dark/full-bleed band.
- **Do** make every pressable control a pill or circle with at least 44px (icon) or 48px (button) height.
- **Do** show product media square-cornered on Tile Grey with no border or shadow.
- **Do** use tabular numerals for prices, counts and quantities, formatted "Q.499".
- **Do** put white copy on photography only over a bottom-weighted black scrim.
- **Do** use the shared ease `cubic-bezier(.16, 1, .3, 1)` (or GSAP expo-out/power3-out) for settles; keep motion off under `prefers-reduced-motion`.

### Don't:
- **Don't** introduce a second accent colour, tinted section backgrounds, or neon/brand colours in UI chrome.
- **Don't** use red for errors, sales or emphasis.
- **Don't** set prices, product names, buttons or form text in the compressed width or in uppercase.
- **Don't** add borders or shadows to product or category tiles.
- **Don't** round product media or use square-cornered buttons.
- **Don't** use bouncy or overshooting easing.
- **Don't** show other companies' logos in photography.
