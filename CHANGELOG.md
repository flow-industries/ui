# Changelog

## 0.13.0

### Added

- **Dock** — `size` prop with `sm`, `md`, `lg` variants (default `md`). `lg` matches the original size; `md`/`sm` are progressively more compact.

### Changed

- **Dock** — Animation polish: dropped the `whileHover` scale (button bg already gives feedback and `whileHover` fires on touch tap-and-hold), tightened `whileTap` to 0.97, switched to ui's `--ease-out` token for color transitions, collapsed two competing scale springs into one, added origin-aware `transform-origin` so the popover scales from the trigger edge, slowed the exit from 50 ms to 120 ms, removed jitter on item-switch.
- **Dock** — Each Dock instance now uses its own `useId`-scoped `layoutId`, so popovers no longer share content across multiple Docks on the same page.

### Fixed

- **Dock** — Glass background no longer flickers in Chromium during the entry animation. The backdrop element now only animates opacity (no transform), with the scale animation moved onto an inner content wrapper, so `backdrop-filter` samples the screen correctly throughout.

## 0.12.0

### Added

- **Dock** — Animated icon dock with hover popovers for label/extra content. Items support `default`, `secondary`, and `primary` variants, custom icons, and a slot for arbitrary popover content. Three sizes (`sm`, `md`, `lg`) — `md` is the default; `lg` matches the original size in talk. Respects `prefers-reduced-motion`. Extracted from `flow-industries/talk` (`src/components/ui/dock.tsx`).
- **DissolveFilter** — SVG filter primitive that animates a turbulence + displacement + blur dissolve effect. Drop the component anywhere and reference its `filterId` from a target element via `filter: url(#id)`. Accepts optional `seed` and `duration` for deterministic / customized animation. Extracted from `flow-industries/talk` (`src/components/DissolveFilter.tsx`).
- **TimeElapsed** — Renders a relative-time label (`just now`, `5m`, `2h`, `3d`, `2w`, `4mo`, `1y`) for a given `date`. Auto-refreshes once per minute when within the last hour, refreshes on window focus, and switches to a formatted absolute date (configurable via `longFormat`, default `MMM d`) after three weeks. Extracted from `flow-industries/talk` (`src/components/TimeLabel.tsx`).
- **TimeSince** — Renders a date as `MMM yyyy` (configurable via `format`). Useful for "joined" / "since" labels. Extracted from `flow-industries/talk` (`src/components/TimeLabel.tsx`).
