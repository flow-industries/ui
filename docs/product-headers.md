# Product headers

Standalone Flow apps have no header bar. Their chrome is three bare islands that float over the content:

- **The top row:** `FloatingHeader`, with the app's `HeaderBrand` on the left and the profile (or Sign in) on the right. It holds nothing else, not even the page title.
- **The Dock:** the app's places, then every main control. A rail at the right edge from 640px, a bar along the bottom below.
- **Presence:** a ring around the profile avatar, drawn by `ProfilePill`.

Import `@flow-industries/ui/styles/base.css`; it carries the geometry below as CSS. Keep the geometry independent of sign-in state, account names, avatar loading and scroll position.

## The top row

```tsx
import { FloatingHeader, HeaderBrand } from "@flow-industries/ui/components/header";
import { ProfilePill } from "@flow-industries/ui/components/profile-pill";

<FloatingHeader
  brand={<HeaderBrand label="Time" render={<a href="/" />} />}
  end={user ? <ProfilePill username={user.username} image={user.image} status="online" self /> : <Button variant="secondary">Sign in</Button>}
/>
```

| Property | Standard |
| --- | --- |
| Position | Fixed at the top; content scrolls beneath |
| Row | 48px, 24px from the top plus the top safe-area inset |
| Side insets | 16px below 768px, 32px from 768px (`--flow-top-row-inset`), plus the side safe-area insets |
| Brand | `HeaderBrand` at its default size: a 20px mark and 19.8px wordmark, the mark's left edge on the left inset |
| Profile | `ProfilePill` at its default small size: a medium `text-sm` name, then a 24px avatar; the ring's outer edge on the right inset |
| Signed out | Sign in (or Join) in the same slot, at the default button height (40px). Use the secondary variant where the page has its own main action |
| Narrow rows | The brand never shrinks; the end slot takes what is left and never crosses the right inset. When its content doesn't fit, the 16px gap to the brand shrinks to 8px first. Past that, a button tightens its padding and is capped (its label clipped) rather than reaching the brand; the profile name truncates, and below 5rem of slot it is hidden (still announced), leaving the avatar and ring. At 320px beside FLOW INDUSTRIES, Join fits with tighter padding and Sign in only just fits |
| Centres | Brand and avatar centred 48px from the top |
| Room | 96px plus the top safe-area inset (`--flow-top-row-height`). `FloatingHeader` renders a spacer that holds it, so content starts at 96px |
| Anchors | `scroll-padding-top: var(--flow-top-row-fade-height)` (104px) is set on the page whenever the row is present |

**The fade.** A full-width fade sits behind the islands, inside the row's own stacking context, and appears only once content has scrolled under it. It is solid to 80px and ramps out by 104px. Its colour is read from the page's actual background (the scroller or its nearest painted ancestor), not from a token, and is read again when the theme changes.

**Inner scrollers.** When content scrolls in its own box rather than the window, run that box under the row and let the fade follow it:

```tsx
const [scroller, setScroller] = useState<HTMLElement | null>(null);

<FloatingHeader spacer={false} scrollTarget={scroller} brand={…} end={…} />
<main ref={setScroller} className="h-dvh overflow-y-auto pt-(--flow-top-row-height) [scroll-padding-top:var(--flow-top-row-fade-height)]">…</main>
```

Pass the element (from a callback ref, as above) when the scroller can mount after the header; a ref object is read once, when the header mounts.

**Placement.** `containerClassName` styles the spacer that holds the row's place: give it the old header's grid area in a grid layout, or it jumps. If the page already left room for a fixed header, pass `spacer={false}` instead of adding a second 96px. Anything that sized itself from the old header's live height reads `--flow-top-row-height` instead.

**Fallbacks.** The row returns to the page flow for short windows (under 32rem tall, which also covers 200% zoom and large default text), forced colours and print. The fade goes, and `--flow-top-row-height` and `--flow-top-row-fade-height` become 0px, so inner-scroller padding collapses with them.

## The Dock

```tsx
import { Dock } from "@flow-industries/ui/components/dock";

<Dock
  items={[
    { label: "Today", icon: <Sun />, render: <Link to="/" />, current: path === "/" },
    { label: "History", icon: <History />, href: "/history", current: path === "/history" },
    { label: "Search", icon: <Search />, shortcut: "⌘K", onClick: openSearch },
    { label: "Dark mode", icon: <Moon />, pressed: dark, onClick: toggleTheme },
  ]}
/>
```

| Property | Standard |
| --- | --- |
| Rail (from 640px) | Right edge, vertically centred, 40px items (44px on coarse pointers) 6px apart; its centre line on the profile avatar's, 48px from the right at 1440px |
| Bar (below 640px) | Bottom, 12px up plus the bottom safe-area inset, its edges on the side insets; labels under the icons; a page-coloured fade behind it |
| Groups | Places (links) first, then controls (buttons, toggles), 24px apart on the rail. Set `group` to override the default (links are places, buttons controls) |
| Current place | `aria-current="page"`, the `secondary` fill and a foreground icon |
| Toggles | `aria-pressed`, a foreground icon and a 4px dot (under the icon on the rail, top-right on the bar); never the current place's fill |
| Inactive | `--muted-foreground` at full opacity |
| Labels | On the rail, a solid popover on hover, keyboard focus and long-press (a tap never shows one); on the bar, always visible |
| Focus | The Flow focus border |
| Phone budget | The bar keeps the current place, then the items with the lowest `priority`, as many as fit its width (at most `barLimit`, default 5, More included); the rest go into a More sheet that groups places then controls and states each toggle as On or Off |
| Room | Keep content clear with `--flow-dock-rail-room` (80px) on the rail's side from 640px and `--flow-dock-bar-room` (100px plus the safe area) at the bottom below |

`layout="rail"` or `layout="bar"` pins one layout where 640px is the wrong switch; `side="left"` moves the rail to the left edge, centred on the logo mark. `labels` translates the words the Dock draws itself (More, On, Off, "opens in a new tab"). The bar hides while a text field has focus on a touch device, and the Dock is hidden in print.

Put places a person moves between in the Dock; content navigation (a file tree, a room list, a table of contents) stays content. A panel's own toggle stays on that panel's edge. An app with no places and one control gets no Dock. Switching places should land at the new section's top.

## Profile and presence

`ProfilePill` is bare (no fill or outline until focused), reads name first and avatar last, and is small by default. Its focus border runs 2px outside the presence ring; in the top row's end slot the pill moves 4px outward so the ring's outer edge, not the focus border, lands on the inset. The avatar always keeps the ring's 4px of room, so nothing moves when presence loads.

| Status | Ring |
| --- | --- |
| Online | A full ring in `--success-foreground` |
| Idle | A grey ring, open clockwise from 12 o'clock by `away` minutes ("Idle for 12 minutes") |
| Busy | A `--destructive` ring cut by a minus bar |
| Invisible | Dashed, only with `self`; everyone else sees Offline |
| Offline | No ring; the photo greys to 55% |
| None | Nothing |

The ring is 2px wide and 2px out from the avatar, with the avatar's radius plus 4px and the same `corner-shape`, so it stays concentric with the squircle. Every ring has an accessible name; `statusLabel` overrides it ("Busy until 15:00"). `PresenceRing` draws the same ring inside any `Avatar`; `PresenceIndicator` remains for inline status beside text.

## Exceptions

- Authentication dialogs, authorization forms, room and thread toolbars, voice frames, game customizers and chat embeds are embedded or task-local chrome: no top row and no Dock of their own. The host provides the chrome.
- `Header layout="product"` is the in-flow header these components replace. It stays available while apps migrate.
- Hero and content logos keep their own scale variants.

Record new exceptions in the consumer's guide.

## Verify

Capture 1440x900 and 390x844 in both themes, including a mid-scroll capture with content under the islands, then measure: the mark's left edge on the inset (32 / 16), a 20px mark, brand and avatar centres at 48, a 24px avatar, the ring's outer edge on the right inset, the rail's centre on the avatar's (48px from the right at 1440), the bar's edges on the insets, and content starting at 96px. Also check contrast over the worst content beneath the islands, that no focused element is hidden under them, no horizontal overflow at 320px, 44px touch targets, signed-out, loading and signed-in states, long names, delayed and failed avatars, and account switches. Compare bounding rectangles across transitions, not just final screenshots.
