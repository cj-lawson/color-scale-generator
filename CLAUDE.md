@AGENTS.md

# Color Scale Generator

A web app for generating accessible, perceptually uniform color scales
for design systems using the OKHsl color space.

## Stack

- Next.js 15 (App Router), TypeScript, Tailwind CSS
- culori for OKHsl ↔ sRGB conversion
- Zustand for state management

## Architecture — read this first

- `src/lib/color-engine/` — pure TypeScript, zero React dependency
  - All color math lives here. Never import React here.
  - `generateScale(config: ScaleConfig): ScaleOutput` is the only public API
- `src/lib/export/` — transform ScaleOutput to CSS/JSON/Figma formats
- `src/stores/colorStore.ts` — Zustand store, calls engine, feeds components
- `src/components/color-scale/` — UI components, read from store only

## Key algorithm (Matt Ström-Awn / Stripe approach)

- Uses OKHsl color space via culori
- Hue shifts with Bezold-Brücke correction: H(n) = baseHue + 5\*(1-n)
- Saturation follows parabolic curve: S(n) = -4(Smax-Smin)n² + 4(Smax-Smin)n + Smin
- Lightness derived from WCAG contrast ratios baked in per step
- Background color as input enables automatic dark mode adaptation

## Rules

- Color engine must remain pure TS — no framework imports ever
- Components never call generateScale directly — only read from store
- All color steps must include WCAG contrast ratios at generation time
- Use 2-space indentation, named exports only (no default exports in lib/)

## Commands

- `npm run dev` — start dev server
- `npm run typecheck` — run tsc --noEmit
- `npm test` — run vitest
