# CLAUDE.md

Shared UI components and design system for Flow applications. Published as `@flow-industries/ui` on npm.

## Architecture

Ships raw TypeScript/TSX source — no build step. Consumers compile via their own Vite + Tailwind pipelines.

```
src/
  index.ts              ← cn utility, useIsMobile hook
  styles/
    tokens.css          ← Design tokens (@theme, :root, .dark)
    base.css            ← Tailwind imports + base layer
  utils/cn.ts           ← clsx + tailwind-merge
  hooks/use-mobile.ts   ← Mobile detection hook
  components/
    logo.tsx            ← Flow logo (pink square)
    icons.tsx           ← Social icons (X, Discord, GitHub, Bluesky)
    ui/                 ← shadcn/ui components (55+)
```

## Commands

```bash
bunx tsc --noEmit           # type-check
bun publish --access public # publish to npm
```

## Adding Components

```bash
bunx shadcn add <component>   # adds to src/components/ui/
```

After adding, rewrite any `@/` path aliases to relative imports — this package does not use path aliases.

## Conventions

- No `@/` path aliases. All imports are relative within the package.
- Components follow shadcn/ui new-york style with Radix UI primitives.
- Standardize on `@radix-ui/react-*` individual packages (not consolidated `radix-ui`).
