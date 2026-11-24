# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
General public in Guatemala City and the rest of the country, of every age: young people who train (football, gym, running), parents buying for their children or school teams, and casual athletes. Many browse on a phone. Older visitors must be able to buy without help.

## Product Purpose
TiendaDeportivaLM sells sports gear (running shoes, footballs, basketballs, team shirts, gym equipment, accessories). Customers browse the catalogue, add items to a cart and send the order by WhatsApp; the owner confirms availability and delivery there. Success: a visitor finds a product, trusts the price and stock, and sends the order in under a minute.

## Positioning
Accessible prices plus personal attention by WhatsApp: a real person advises on sizes and models, instead of an anonymous checkout.

## Operating Context
- Orders and questions go to WhatsApp +502 5487 0255 (`wa.me/50254870255`).
- Prices in Guatemalan quetzales, written "Q." (e.g. Q.549).
- Stock shown to customers ("Quedan N" / "Agotado") comes from `js/catalogo.js`; the owner edits it from the in-page "Menú administrador" (PIN, changes saved on that device; "Descargar catálogo" exports catalogo.js to publish for everyone). Google Sheets sync was cancelled by the owner.
- Hosted on GitHub Pages; often opened by double-click (file://), so no ES module scripts loaded from local files.

## Capabilities and Constraints
- Static HTML/CSS/JS, libraries from CDN (GSAP + ScrollTrigger, Lenis, Three.js). No build step, no server.
- Catalogue: categories Running, Fútbol, Baloncesto, Gimnasio, Accesorios; search; filters; cart drawer; WhatsApp order message.
- Undecided: real address, delivery times, payment methods, exchange policy. The current copy about "24 h delivery", "cambios en 15 días" and "contra entrega" is placeholder and must not be presented as a confirmed promise without the owner's approval.

## Brand Commitments
- Name: TiendaDeportivaLM. Existing logo `assets/logo.svg` (may be redrawn in a redesign).
- Spanish (Guatemala), plain and friendly tone.

## Evidence on Hand
- Product photos are AI-generated studio shots in `assets/img/` (8 products + banner). No real store photos, customers, reviews, brands, years in business or address. Do not fabricate testimonials, ratings, brand partnerships, store history or statistics.

## Product Principles
1. Price, stock and "how to buy" are always obvious; nothing decorative stands between a visitor and the WhatsApp order.
2. Usable by everyone: large readable text, generous tap targets, works with keyboard and on cheap phones.
3. Feels like a real, established shop, not a template: concrete product information over slogans.
4. Honest: show only facts the owner has confirmed.

## Accessibility & Inclusion
WCAG 2.1 AA contrast, visible focus, keyboard operable, respects prefers-reduced-motion, 48px+ targets; older users are an explicit audience.
