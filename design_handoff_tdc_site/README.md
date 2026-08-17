# Handoff: The Deployment Club — Marketing Site

## Overview
A three-page marketing site for **The Deployment Club (TDC)**, a members-only community for forward deployed engineers: a landing page, a manifesto page, and a join/request-membership page. Dark, On.com-inspired aesthetic with "liquid glass" buttons and an interactive keycap hero.

Target: implement as a **Next.js (App Router) app deployable on Vercel**. No backend is required — the join form currently flips to a client-side confirmation state; wire it to your API/email provider of choice.

## About the Design Files
The `.dc.html` files in this bundle are **design references created in HTML** — prototypes showing intended look and behavior, not production code to copy directly. Recreate them in the target codebase (recommended: Next.js + React, plain CSS or Tailwind). If no codebase exists yet, scaffold `create-next-app` and implement these three routes: `/` (landing), `/manifesto`, `/join`.

## Fidelity
**High-fidelity.** Colors, typography, spacing, copy, and interactions are final. Recreate pixel-perfectly.

## Design Tokens
- Black background: `#000`
- White text: `#fff`
- Body/dark text: `#111`
- Signal orange (single accent): `#f5821e`
- Secondary text: `#b3b3b3` (dark bg), `#888`, `#666`, `#c9c9c9`, `#e8e8e8`
- Hairlines: `#2a2a2a`, `#1c1c1c`, card border `#222`, input border `#2c2c2c`, card bg `#0d0d0d`
- Fonts (Google Fonts): **Archivo** 400/500/600/700/800 (display + body), **JetBrains Mono** 400/500 (eyebrows, terminal strings)
- Radii: pills `999px`, form card `24px`, inputs `12px`
- Selection color: orange bg, white text
- Container: 1200px (landing), 860px (manifesto), 1100px (join); 40px side padding

## Liquid-glass button system (used for ALL buttons/nav links)
Clear glass (nav links, secondary CTAs):
```css
border-radius: 999px; color: #fff;
background: linear-gradient(160deg, rgba(255,255,255,0.18), rgba(255,255,255,0.05) 45%, rgba(255,255,255,0.12));
backdrop-filter: blur(24px) saturate(170%);
border: 1px solid rgba(255,255,255,0.3);
box-shadow: inset 0 1px 1px rgba(255,255,255,0.4), inset 0 10px 18px -12px rgba(255,255,255,0.3), inset 0 -10px 16px -10px rgba(0,0,0,0.5), 0 10px 30px -12px rgba(0,0,0,0.6);
transition: all 0.35s cubic-bezier(0.2, 1.4, 0.3, 1);
```
Hover: gradient brightens (0.3/0.12/0.2 alphas), border rgba(255,255,255,0.5), `transform: translateY(-2px) scale(1.04)`.
Active: `translateY(0) scale(0.98)`.

Orange glass (primary "Join" actions): same structure with orange tints —
gradient `rgba(245,130,30,0.55) → 0.28 @45% → 0.45`, border `rgba(255,175,100,0.55)`, insets `rgba(255,220,180,0.5)` / `rgba(255,200,150,0.35)` / `rgba(120,50,0,0.5)`, drop shadow `rgba(245,130,30,0.45)`. Hover gradient `0.75/0.45/0.6`, border `rgba(255,200,140,0.7)`.

Active-page nav pill: clear glass with stronger gradient (`0.32/0.14/0.24`), no hover animation.

## Screens / Views

### 1. Landing (`/`) — `Deployment Club Landing.dc.html`
- **Nav** (shared across pages, sticky top, solid `#000`, `padding: 8px 40px`, space-between):
  - Logo `assets/logo-dark.png` at height 64px, links to `/`.
  - Center: three clear-glass pills, 14px/500, `padding: 9px 20px`, 10px gap: Manifesto → `/manifesto`, The Club → `/`, Chapters → `/join`.
  - Right: orange-glass pill "Join the club" → `/join`, 14px/600, `padding: 10px 22px`.
- **Hero** (fills remaining viewport: page is `min-height: 100vh` flex column, header `flex: 1`, `align-content: center`, black bg, centered text, `padding-bottom: 80px`):
  - Keycap row: 600px wide (tweakable 400–920), centered, `margin-top: 64px`, flex `gap: 1.6%`; four images `assets/key-1..4.png` (widths 24.5% / 24.2% / 23.5% / 24.5%), transparent PNGs. Each key: `transition: transform 0.5s cubic-bezier(0.3, 1.8, 0.4, 1)`; hover `translateY(-16px) scale(1.06)` (springy pop).
  - Eyebrow: JetBrains Mono 13px, `letter-spacing: 0.18em`, uppercase, orange — "Members-only · Est. 2026". 24px gap between stacked hero items; text block `padding: 40px 40px 0`.
  - H1: Archivo 800, `clamp(56px, 8vw, 110px)`, `letter-spacing: -0.03em`, `line-height: 0.95` — "**Deploy** Together" with "Deploy" in orange.
  - Sub: 19px/1.5, `#b3b3b3`, max-width 560px — "A club for the people who take software the last mile. We meet, we demo, we deploy on Fridays."
  - CTAs (12px gap, `margin-top: 8px`): orange glass "Join the club" → `/join`; clear glass "Read the manifesto" → `/manifesto`; both 15px, `padding: 15px 32px`, weights 700/600.

### 2. Manifesto (`/manifesto`) — `Manifesto.dc.html`
- Same nav (Manifesto pill in active state).
- Main column 860px, `padding: 96px 40px 140px`:
  - Eyebrow: Archivo 600 13px, `0.22em` tracking, uppercase, orange — "&gt;_ manifesto", 28px below.
  - H1: Archivo 800 `clamp(48px, 6.5vw, 88px)`, lh 1.02 — "Great people. Real problems. Technology deployed where it matters." 56px below.
  - Body paragraphs (19px/1.65, `#c9c9c9`, max 680px, 40px gaps) — copy verbatim in the HTML file.
  - Pull quote: `border-left: 2px solid #f5821e`, 28px pad, 24px/600 white — "We believe the last mile is the whole job. Everything before it is preparation."
  - "The rules" list (72px above, 1px `#2a2a2a` top border, 48px pad): orange eyebrow, then 4 rows — mono num (`/01`…, 14px `#666`) + 18px `#e8e8e8` text, 1px `#1c1c1c` bottom borders. Rule copy verbatim from file (rule /01: "No BS, bring your A game & innovate with peers.").
  - Bottom CTAs: orange glass "Join the club" → `/join`, clear glass "Back home" → `/`.

### 3. Join (`/join`) — `Join the Club.dc.html`
- Same nav (Chapters pill active; right pill scrolls to form).
- Main: 1100px, two-column grid (1fr/1fr, 80px gap), `padding: 96px 40px 140px`:
  - Left: mono orange eyebrow "&gt;_ init membership"; H1 `clamp(44px, 5.5vw, 76px)` — "Your finger is already on the **key**." ("key" in orange); sub 18px `#b3b3b3`; stats list (Archivo 500 15px `#888`, orange `>` markers): "400+ FDEs and counting", "14 city chapters", "One demo night a month".
  - Right: form card `#0d0d0d`, 1px `#222` border, radius 24px, 40px padding, 18px gaps. Fields (label 13px/600 `#aaa` + input: black bg, 1px `#2c2c2c`, radius 12px, `14px 16px` padding, 15px): Name, Work email (type=email), Role (select: Forward deployed engineer / Aspiring FDE / Founder / Hiring manager), City, "What did you deploy last?" (placeholder "One line. Specifics beat adjectives."). Submit: orange-glass button "Request to join". Note below: Archivo 13px `#666` — "No spam. One email per release cycle."
  - Submit behavior: prevent default, swap card content to confirmation — mono orange "&gt;_ deploy accepted", 26px/800 "You're in the queue, {name}.", 15px `#b3b3b3` explainer.

## Interactions & Behavior
- All glass buttons: hover lift `translateY(-2px) scale(1.04)` + brighten, active press `scale(0.98)`; 0.35s `cubic-bezier(0.2, 1.4, 0.3, 1)`.
- Keycaps: independent springy hover pop (see above).
- Join form: controlled inputs; client-side state only; email required + HTML validation.
- Links: default `a { color: inherit; text-decoration: none }`, `a:hover { opacity: 0.6 }` (glass buttons override opacity on hover).

## State Management
- Join page: `{ name, email, role, city, lastDeploy, joined }`; `joined` toggles form vs confirmation.
- No other state. Landing "hero image width" was a design-time tweak; hardcode 600px.

## Assets (in `assets/`)
- `key-1.png` … `key-4.png` — transparent keycap slices (blank, `>_` terminal, blank, orange "Deploy"), derived from a keycap render.
- `logo-dark.png` — cream TDC lockup for dark backgrounds (transparent).
- `logo-light.png` — ink variant for light backgrounds (unused currently).
- `hero-keys.png`, `hero-keys-band.png`, `hero-topo.png` — source/alternate hero art (topo image currently unused).

## Files
- `Deployment Club Landing.dc.html` — landing page reference
- `Manifesto.dc.html` — manifesto page reference
- `Join the Club.dc.html` — join page reference
- `assets/` — all images above

Note: the `.dc.html` files contain the full markup inside `<x-dc>` (template) and a small logic class in a trailing script tag; treat them as the styling/copy source of truth.
