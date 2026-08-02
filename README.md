# Flow UI

Shared design system and component library for [Flow](https://flow.industries) applications.

Ships raw TypeScript source — no build step. Your Vite + Tailwind pipeline compiles it.

## Installation

```bash
bun add @flow-industries/ui
```

## Documentation

Full documentation at **[docs.flow.industries/en/ui](https://docs.flow.industries/en/ui)**.

- [Installation & setup](https://docs.flow.industries/en/ui/installation) — CSS imports, Tailwind config, source directive
- [Tokens](https://docs.flow.industries/en/ui/tokens) — every CSS custom property
- [Theming](https://docs.flow.industries/en/ui/theming) — light, dark, custom palettes
- [Typography](https://docs.flow.industries/en/ui/typography) — Geist families and scales
- [Branding](https://docs.flow.industries/en/ui/branding) — logo, logomark, social icons
- [Utilities](https://docs.flow.industries/en/ui/utilities) — `cn()`, `useIsMobile()`, shared patterns
- Components: [Buttons](https://docs.flow.industries/en/ui/components/buttons), [Forms](https://docs.flow.industries/en/ui/components/forms), [Layout](https://docs.flow.industries/en/ui/components/layout), [Navigation](https://docs.flow.industries/en/ui/components/navigation), [Overlays](https://docs.flow.industries/en/ui/components/overlays), [Feedback](https://docs.flow.industries/en/ui/components/feedback), [Data](https://docs.flow.industries/en/ui/components/data), [Effects](https://docs.flow.industries/en/ui/components/effects)

## Development

```bash
bun run dev   # landing page at localhost:5173
```

## Visual regression

CI screenshots the showcase (`#design`, `#showcases`, `#components` in light and dark) against
baselines committed under `tests/visual.spec.ts-snapshots/` and fails on any diff.

```bash
bun run build && bun run test   # compare against baselines (Linux only)
./scripts/update-snapshots.sh   # re-render baselines after an intended visual change (Docker)
```

Baselines are rendered on Linux inside the pinned Playwright image — a bare macOS run
diffs against them spuriously, so always update through the script (or grab the
`visual-diffs` artifact from a failed CI run to inspect changes).

## License

MIT
