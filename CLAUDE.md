# CLAUDE.md

Shared UI components and design system for Flow applications. Published as `@flow-industries/ui` on npm.

## Architecture

Ships raw TypeScript/TSX source — no build step. Consumers compile via their own Vite + Tailwind pipelines.

```
src/
  index.ts              <- cn utility, useIsMobile hook
  styles/
    tokens.css          <- Design tokens (@theme, :root, .dark)
    base.css            <- Tailwind imports + base layer
  utils/cn.ts           <- clsx + tailwind-merge
  hooks/use-mobile.ts   <- Mobile detection hook
  components/
    logo.tsx            <- Flow logo (pink square)
    icons.tsx           <- Social icons (X, Discord, GitHub, Bluesky)
    ui/                 <- 50+ components
```

## Commands

```bash
bunx tsc --noEmit           # type-check
bun publish --access public # publish to npm
```

## Conventions

- No `@/` path aliases. All imports are relative within the package.
- Components use Base UI (`@base-ui/react`) primitives — not Radix UI.
- Use `render` prop (not `asChild`) for element composition.
- Borders use `--border-width` / `--border-width-focus` tokens.
- Inputs use `border-transparent bg-input` default, `focus-visible:border-focus` on focus.
- No focus rings — only border color changes for focus indication. Use `--focus` token (pink).
- Never use `transition-all` — specify exact properties (e.g. `transition-[color,background-color,border-color]`).
- Use animation tokens: `ease-(--ease-out)`, `ease-(--ease-out-expo)`, `ease-(--ease-spring)`.
- Accordion uses motion for animations, not CSS keyframes.
- Toast uses Base UI native Toast, not sonner.
- Drawer uses Base UI native Drawer, not vaul.
- Motion-based components (accordion, tabs, word-flash) respect `useReducedMotion()`.
- No sidebar-specific color tokens — sidebar uses `secondary`, `tertiary`, `foreground` directly.
