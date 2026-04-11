# FLOW UI

Shared design system and component library for [Flow](https://flow.industries) applications.

Ships raw TypeScript source. No build step. Your Vite + Tailwind pipeline compiles it.

## Install

```bash
bun add @flow-industries/ui
```

## Setup

Import the design tokens and base styles in your app's CSS:

```css
@import "@flow-industries/ui/styles/tokens.css";
@import "@flow-industries/ui/styles/base.css";

@source "../../node_modules/@flow-industries/ui/src";
```

## Usage

```tsx
import { Button } from "@flow-industries/ui/components/button"
import { Input } from "@flow-industries/ui/components/input"
import { cn } from "@flow-industries/ui"
```

## Components

55 components built on Radix UI primitives with Tailwind CSS.

Accordion, Alert, Alert Dialog, Aspect Ratio, Avatar, Badge, Breadcrumb, Button, Button Group, Calendar, Card, Carousel, Chart, Checkbox, Collapsible, Command, Context Menu, Dialog, Drawer, Dropdown Menu, Empty, Field, Form, Hover Border Gradient, Hover Card, Input, Input Group, Input OTP, Item, Kbd, Label, Menubar, Navigation Menu, Pagination, Popover, Progress, Radio Group, Resizable, Scroll Area, Select, Separator, Sheet, Sidebar, Skeleton, Slider, Sonner, Spinner, Switch, Table, Tabs, Textarea, Toggle, Toggle Group, Tooltip, Word Flash

## Design tokens

All colors use oklch. The system ships a custom palette (Flow Pink, Mint, Blueberry, Grape, Strawberry, Orange, Banana) with light variants, plus semantic tokens for backgrounds, surfaces, and states.

Key tokens:
- `--border-width` / `--border-width-focus` for consistent borders
- `--radius` with superellipse corner shapes
- Apple-inspired typography scale (Geist Sans / Geist Mono)
- 44px default touch targets (WCAG AAA compliant)

## Development

```bash
bun run dev   # landing page at localhost:5173
```

## License

MIT
