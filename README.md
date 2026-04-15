# FLOW UI

Shared design system and component library for [Flow](https://flow.industries) applications.

Ships raw TypeScript source. No build step. Your Vite + Tailwind pipeline compiles it.

## Install

```bash
bun add @flow-industries/ui
```

## Setup

Import the design tokens and base styles in your app's CSS. Fonts (Geist Sans, Geist Mono, Geist Pixel) are included automatically via base.css.

```css
@import "@flow-industries/ui/styles/tokens.css";
@import "@flow-industries/ui/styles/base.css";

@source "../../node_modules/@flow-industries/ui/src";
```

## Usage

```tsx
import { Button } from "@flow-industries/ui/components/button"
import { Input } from "@flow-industries/ui/components/input"
import { Card, CardContent } from "@flow-industries/ui/components/card"
import { toast } from "@flow-industries/ui/components/toast"
import { cn } from "@flow-industries/ui"
```

## Accessibility

- `prefers-reduced-motion` is respected globally — all CSS and JS animations are disabled

## Development

```bash
bun run dev   # landing page at localhost:5173
```

## License

MIT
