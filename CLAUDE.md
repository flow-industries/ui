# CLAUDE.md

Shared UI components and design system for Flow applications. Published as `@flow-industries/ui` on npm.

## Architecture

Ships raw TypeScript/TSX source — no build step. Consumers compile via their own Vite + Tailwind pipelines.

```
src/
  index.ts              <- cn utility, useIsMobile hook
  styles/
    tokens.css          <- Design tokens (@theme, :root, .dark)
    base.css            <- Tailwind imports + base layer + font import
    fonts.css           <- @font-face declarations (Geist Sans, Mono, Pixel)
  utils/cn.ts           <- clsx + tailwind-merge
  hooks/use-mobile.ts   <- Mobile detection hook
  components/
    logo.tsx            <- Flow logo + LogoSpinner
    icons.tsx           <- Social icons (X, Discord, GitHub, Bluesky)
    ui/                 <- 50+ components (including typography)
```

## Commands

```bash
bun run typecheck           # tsc --noEmit
bun run lint                # biome check
bun run check               # biome check --write (auto-fix lint + formatting)
bun publish --access public # publish to npm
```

### Before pushing: CI must pass

CI runs the shared quality gate (`flow-industries/lint` ts-check workflow): `bun run lint` and `bun run typecheck`. Both must be clean before every push — run them locally and fix everything they surface (`bun run check` auto-fixes most lint/format issues). Never push with a failing gate.

## Publishing

`@flow-industries/ui` publishes to npm **automatically on a version bump**. Change `version` in
`package.json`, open a PR, merge it — the push to `main` runs `.github/workflows/publish.yml`,
which publishes that exact version through npm trusted publishing (GitHub OIDC; there is no npm
token stored anywhere).

- **Never run `npm publish` by hand.** The workflow is the only publisher. A manual publish from a
  stale checkout is how you get `You cannot publish over the previously published versions`.
- **The version is the trigger, not the file.** Merging any other `package.json` change is a no-op:
  the workflow checks the registry first and skips a version that already exists.
- **Do not rename `publish.yml`.** npm authenticates the run against that exact filename, so it can
  only change if the trusted publisher on npmjs.com changes with it.
- **Automatic publishing does not remove the coordination.** Consumers pin a caret range, so a
  breaking change still needs every consumer bumped in the same pass — see UI-46, where moving
  `className` from the wrapper to the control required renaming three call sites in `talk` and
  `game` to `containerClassName`.

## Conventions

- No `@/` path aliases. All imports are relative within the package.
- Components use Base UI (`@base-ui/react`) primitives — not Radix UI.
- Use `render` prop (not `asChild`) for element composition.
- Borders use `--border-width` / `--border-width-focus` tokens.
- Square media (avatars, thumbnails) use `rounded-squircle`, never `rounded-full`: it is 50% where `corner-shape` is supported (the superellipse makes that a squircle) and 35% where it isn't, so the fallback is a rounded square instead of a circle. `rounded-full` stays for things that are genuinely round or pill-shaped (dots, switches, progress tracks).
- Inputs use `border-transparent bg-input` default, `focus-visible:border-focus` on focus.
- Size variants emit plain utility classes (via `cva`), never `data-[size=...]:h-*`. An attribute-scoped rule outranks a consumer's bare `className`, so their override lands in the stylesheet and silently loses the cascade.
- `className` styles the control a consumer can see — the `<input>`, `<select>`, or trigger — never a layout wrapper around it. A wrapper that exists to anchor an overlay (`native-select`'s chevron, `input-otp`'s slots) is reachable through a second prop (`containerClassName`), which is also where width, margin, and flex/grid placement belong.
- Interactive controls guarantee a 44px touch target with `pointer-coarse:min-h-11`. It is a floor on coarse pointers only — fine-pointer density is unchanged, and a consumer opting out needs the same variant (`pointer-coarse:min-h-0`).
- No focus rings — only border color changes for focus indication. Use `--focus` token (pink).
- Never use `transition-all` — specify exact properties (e.g. `transition-[color,background-color,border-color]`).
- Use animation tokens: `ease-(--ease-out)`, `ease-(--ease-out-expo)`, `ease-(--ease-spring)`.
- Accordion uses motion for animations, not CSS keyframes.
- Toast uses Base UI native Toast, not sonner.
- Drawer uses Base UI native Drawer, not vaul.
- Motion-based components (accordion, tabs, word-flash) respect `useReducedMotion()`.
- No sidebar-specific color tokens — sidebar uses `secondary`, `tertiary`, `foreground` directly.
