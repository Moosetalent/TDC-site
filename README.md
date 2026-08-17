# The Deployment Club — Marketing Site

Next.js (App Router) implementation of the TDC three-page marketing site, built from
`design_handoff_tdc_site/README.md`.

## Routes

| Route        | File                    | Notes                                              |
| ------------ | ----------------------- | -------------------------------------------------- |
| `/`          | `app/page.tsx`          | Landing — keycap hero, `Deploy Together`           |
| `/manifesto` | `app/manifesto/page.tsx`| Manifesto + the four rules                          |
| `/join`      | `app/join/page.tsx`     | Membership request form (client-side confirmation)  |

## Local development

```bash
npm run dev
```

## Build & deploy

The site is a **static export** (`output: "export"` in `next.config.mjs`) — every
route prerenders to HTML, so there is no serverless runtime. `npm run build`
writes the deployable site to `out/`.

`trailingSlash: true` emits each route as `<route>/index.html`, which static
hosts resolve natively (`/manifesto` → `/manifesto/index.html`). Do not enable
Vercel's `cleanUrls` on top of this — the two together shadow the root route.

Deploy the built directory:

```bash
npx vercel deploy --prod
```

Or push to a Vercel-connected repo.

## Notes on dependencies

- **Next 16.** Vercel rejects the Next 15.5.x line as vulnerable, and 15.5.23
  still pulled in flagged `postcss`/`sharp`. 16.3.1 audits clean.
- **Fonts are self-hosted** (`app/fonts/*.woff2`, wired up with `next/font/local`).
  `next/font/google` was requesting Archivo URLs that now 404, and self-hosting
  keeps the build off the network. Both files are latin-subset variable builds,
  which cover every character used on the site.
- **`images.unoptimized`** is required by static export. The keycaps and logo are
  small, pre-sized PNGs, so they are served as-is.

## Structure

- `app/globals.css` — design tokens, the liquid-glass button system (`.glass`,
  `.glass--orange`, `.glass--current`), and per-page layout.
- `app/components/Nav.tsx` — shared nav. `current` marks the active pill;
  `ctaHref` lets `/join` point its CTA at the on-page form.
- `app/join/JoinForm.tsx` — the only client component. Holds
  `{ name, email, role, city, lastDeploy, joined }`.
- `app/fonts/` — self-hosted Archivo + JetBrains Mono variable woff2.
- `public/assets/` — keycaps and logos used by the site. Unused source art
  (`hero-keys*.png`, `hero-topo.png`) stays in `design_handoff_tdc_site/assets/`.

## Wiring up the form

`handleSubmit` in `app/join/JoinForm.tsx` currently just flips to the confirmation
state. Post the collected fields to an API route or email provider there.
