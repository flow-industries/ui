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

## Components

57 components built on [Base UI](https://base-ui.com) primitives with Tailwind CSS.

Accordion, Alert Dialog, Animated Icons, Aspect Ratio, Avatar, Badge, Breadcrumb, Button, Button Group, Card, Carousel, Chart, Checkbox, Collapsible, Color Swatch, Combobox, Context Menu, Dialog, Drawer, Dropdown Menu, Empty, Field, Form, Hover Card, Input, Input Group, Input OTP, Item, Kbd, Label, Menubar, Native Select, Navigation Menu, Pagination, Popover, Progress, Radio Group, Resizable, Scroll Area, Select, Separator, Sheet, Sidebar, Skeleton, Slider, Spinner, Switch, Table, Tabs, Textarea, Toast, Toggle, Toggle Group, Tooltip, Typography, Word Flash

## Design tokens

All colors use oklch. Simplified semantic color system:

- **background** / **foreground** — page surface and primary text
- **primary** / **primary-foreground** — buttons, active states
- **secondary** / **secondary-foreground** — cards, elevated surfaces
- **muted** / **muted-foreground** — hover highlights, subdued text
- **brand** / **brand-foreground** — Flow brand CTA (dark pink)
- **destructive** / **success** — status colors
- **input** — input/textarea/select backgrounds
- **focus** — focus border color (dark pink)

Custom palette: Flow Pink, Mint, Blueberry, Grape, Strawberry, Orange, Banana — with light and dark variants.

Other tokens:
- `--border-width` / `--border-width-focus` (2px) for consistent borders
- `--radius` with superellipse corner shapes
- `--ease-out` / `--ease-out-expo` / `--ease-spring` animation easing curves
- Typography scale (Geist Sans / Geist Mono / Geist Pixel) — fonts bundled
- Typography components: `Title`, `Subtitle`, `Overline`, `Mono`

## Accessibility

- `prefers-reduced-motion` is respected globally — all CSS and JS animations are disabled

## Development

```bash
bun run dev   # landing page at localhost:5173
```

## License

MIT
