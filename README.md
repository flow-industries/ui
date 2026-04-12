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

50+ components built on [Base UI](https://base-ui.com) primitives with Tailwind CSS.

Accordion, Alert Dialog, Aspect Ratio, Avatar, Badge, Breadcrumb, Button, Button Group, Card, Carousel, Chart, Checkbox, Collapsible, Combobox, Context Menu, Dialog, Drawer, Dropdown Menu, Empty, Field, Form, Hover Card, Input, Input Group, Input OTP, Item, Kbd, Label, Menubar, Native Select, Navigation Menu, Pagination, Popover, Progress, Radio Group, Resizable, Scroll Area, Select, Separator, Sheet, Sidebar, Skeleton, Slider, Spinner, Switch, Table, Tabs, Textarea, Toast, Toggle, Toggle Group, Tooltip, Word Flash

## Design tokens

All colors use oklch. The system ships a custom palette (Flow Pink, Mint, Blueberry, Grape, Strawberry, Orange, Banana) with light variants, plus semantic tokens for backgrounds, surfaces, and states.

Key tokens:
- `--border-width` / `--border-width-focus` for consistent borders
- `--radius` with superellipse corner shapes
- Typography scale (Geist Sans / Geist Mono)
- Success and destructive variants on buttons and badges

## Development

```bash
bun run dev   # landing page at localhost:5173
```

## License

MIT
