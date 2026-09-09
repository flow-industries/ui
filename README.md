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

## Accessibility

CI also runs axe (`tests/a11y.spec.ts`) over the same pages and themes, plus each
overlay in its open state, failing on serious/critical violations. Genuine findings get
fixed or filed against the UI-3 audit — see `knownViolations` in the spec for the
tracked exceptions; `allowlistedRules` is reserved for documented false positives.

```bash
bun run build && bunx playwright test tests/a11y.spec.ts
```

## License

MIT

## Practice sessions

`@flow-industries/ui/focus` is an opt-in entry point for `FocusProvider`,
`FocusPanel`, `StudySubjectPicker`, and the associated hooks and types. Install
`@flow-industries/id` version 0.22.0 or newer alongside the UI package to use it.
The SDK peer is optional for applications using only other UI components.

```tsx
import { createFocusApi } from "@flow-industries/id/focus";
import { FocusPanel, FocusProvider, useFocus } from "@flow-industries/ui/focus";

function Practice() {
  const focus = useFocus();
  return <FocusPanel focus={focus} surface="web" />;
}

// Keep this API instance stable; credentials and surface belong to the host.
const api = createFocusApi(authHost, getToken, "web");

<FocusProvider api={api} viewerId={viewerId}>
  <Practice />
</FocusProvider>;
```

Pass a stable authenticated account ID as `viewerId`, or `null` for an inert
provider. The host retains its guest, disabled-account, and embedded-surface
policy: omit the provider/panel wherever practice must be excluded. Account
changes clear session and subject state and discard old asynchronous responses.
The provider restores active sessions on mount and refreshes when the document
becomes visible. Outside a provider, hooks return an inert value.

`FocusPanel` accepts an explicit `focus` value, an optional `managementLink`, and
`text` as an injected `FocusText` translator. Use
`text={createFocusText(locale, messages)}` for locale and message overrides. The controlled `StudySubjectPicker`
accepts catalog/subjects, busy/error state, and pick/create callbacks; the host
owns requests when using it alone. Arrow keys navigate, Enter selects, and
Escape clears search or returns from a category. Private subject labels are
marked `data-user-content` and isolated for bidirectional text.

The showcase at `/#focus` provides account, delay, error, reload, and theme
controls with local fixture data. Run `bun run build` then
`bunx playwright test tests/focus.spec.ts` for recovery, privacy, keyboard and
failure checks.

## Packed package compatibility

`bun run test:package` packs the same `src` allowlist installed from npm and
installs it into disposable React 19.0.0 and 19.2.3 consumers with React Router
7.8.2, Vite 7.2.7 and Tailwind 4.1.18. Each consumer renders on the server,
builds browser assets, then hydrates in Chromium and exercises keyboard focus,
select/input rendering, button interaction and emitted CSS tokens. Install the
browser first with `bunx playwright install chromium`.

The check removes the component export and token stylesheet in the installed
copy and requires each broken build to fail, then restores the files and repeats
the successful browser check. PR CI and the publishing workflow both require
this gate. A new supported consumer configuration belongs in this matrix before
a release depends on it; incompatible changes require a coordinated package
version and consumer update. These checks use package imports, never source aliases.
