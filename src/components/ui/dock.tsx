import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { ArrowUpRight, Ellipsis } from "lucide-react";
import type * as React from "react";
import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useScrollEdge } from "../../hooks/use-scroll-edge";
import { cn } from "../../utils/cn";

type DockGroup = "place" | "control";
type DockLayout = "auto" | "rail" | "bar";

/**
 * One item in the Dock. An item with `href` or `render` is a link (a place);
 * one without is a button (a control), and `pressed` makes it a toggle.
 */
type DockItem = {
  /** Identity and React key; defaults to `label`. */
  id?: string;
  /** Shown in the rail's popover, under the icon on the phone bar and in the More sheet. Carry what the old control showed ("Language · English"). */
  label: string;
  icon: React.ReactNode;
  /** Defaults to `place` for links and `control` for buttons. Places come first, then controls, separated by space. */
  group?: DockGroup;
  /** Which items stay on the phone bar when it runs out of width: lower stays. Defaults to the item's position in `items`. Kept items keep the rail's order. */
  priority?: number;
  /** A link. */
  href?: string;
  /** A link rendered by the app's router, e.g. `<Link to="/rooms" />`. */
  render?: React.ReactElement;
  /** The current place: `aria-current="page"` and the selected fill. */
  current?: boolean;
  /** Opens in a new tab and says so with an outward mark. */
  external?: boolean;
  onClick?: React.MouseEventHandler<HTMLElement>;
  /** Makes a button a toggle (`aria-pressed`), shown as a dot and as On/Off in the sheet. Its label stays the same. */
  pressed?: boolean;
  /** A keyboard shortcut shown beside the label on the rail ("⌘K"). */
  shortcut?: string;
  /** A small count or mark on the item. */
  badge?: React.ReactNode;
  /** `accent` only for what is new or addressed to the viewer. */
  badgeTone?: "default" | "accent";
};

/** Words the Dock draws itself, for translation. */
type DockLabels = {
  more?: string;
  on?: string;
  off?: string;
  newTab?: string;
};

type DockProps = Omit<React.ComponentProps<"nav">, "children"> & {
  items: DockItem[];
  /** `auto` is a rail from 640px and a phone bar below; `rail` and `bar` pin one. */
  layout?: DockLayout;
  /** Which edge the rail sits on. */
  side?: "right" | "left";
  /** Most items on the phone bar, More included. Fewer stay when their labels don't fit its width. */
  barLimit?: number;
  labels?: DockLabels;
};

type DockEntry = {
  item: DockItem;
  key: string;
  index: number;
  link: boolean;
  group: DockGroup;
};

const itemClassName = cn(
  "group/dock-item relative flex shrink-0 select-none items-center justify-center rounded-lg border-[length:var(--border-width)] border-transparent text-muted-foreground outline-none [-webkit-touch-callout:none]",
  "transition-[color,background-color,border-color] duration-150 ease-(--ease-out)",
  "hover:text-foreground focus-visible:border-focus",
  "aria-[current=page]:bg-secondary aria-[current=page]:text-foreground forced-colors:aria-[current=page]:border-[CanvasText]",
  "data-popup-open:bg-secondary data-popup-open:text-foreground",
  "dock-rail:size-(--flow-dock-item)",
  "dock-bar:h-13.5 dock-bar:min-w-14 dock-bar:flex-col dock-bar:gap-0.5 dock-bar:px-1.5",
  // A pressed toggle is not the current place: a foreground icon and a dot,
  // under the icon on the rail and at its top-right on the phone bar.
  "aria-pressed:text-foreground aria-pressed:after:absolute aria-pressed:after:size-1 aria-pressed:after:rounded-full aria-pressed:after:bg-current",
  "dock-rail:aria-pressed:after:bottom-0.5 dock-rail:aria-pressed:after:left-1/2 dock-rail:aria-pressed:after:-translate-x-1/2",
  "dock-bar:aria-pressed:after:top-1.5 dock-bar:aria-pressed:after:left-[calc(50%+11px)]",
);

// A bar item's width: its label plus padding and border, at least 56px.
const measureClassName =
  "min-w-14 shrink-0 border-[length:var(--border-width)] px-1.5 text-xs leading-tight font-medium whitespace-nowrap";

const iconClassName =
  "flex [&_svg]:size-5 [&_svg]:shrink-0 [&_svg]:stroke-[2.25]";

const sheetItemClassName =
  "flex min-h-11 w-full cursor-default items-center gap-3 rounded-lg px-3 text-sm font-medium text-foreground no-underline outline-none select-none data-highlighted:bg-muted aria-[current=page]:bg-secondary [&>[data-slot=dock-icon]]:text-muted-foreground data-checked:[&>[data-slot=dock-icon]]:text-foreground aria-[current=page]:[&>[data-slot=dock-icon]]:text-foreground";

function isLink(item: DockItem) {
  return item.href !== undefined || item.render !== undefined;
}

/** The keys the phone bar keeps with `slots` places, More included: the current place, then by priority. */
function barKeys(entries: DockEntry[], slots: number) {
  if (entries.length <= slots) return new Set(entries.map((e) => e.key));
  const room = Math.max(0, slots - 1);
  const kept = new Set<string>();
  for (const e of entries) {
    if (e.item.current && kept.size < room) kept.add(e.key);
  }
  const ranked = [...entries].sort(
    (a, b) => (a.item.priority ?? a.index) - (b.item.priority ?? b.index),
  );
  for (const e of ranked) {
    if (kept.size >= room) break;
    kept.add(e.key);
  }
  return kept;
}

/** Shows the label while a touch is held, and swallows the click that ends it. */
function useLongPress() {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const held = useRef(false);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const release = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = held.current
      ? setTimeout(() => setOpen(false), 1200)
      : null;
  };

  return {
    open,
    handlers: {
      onPointerDown: (event: React.PointerEvent) => {
        if (event.pointerType !== "touch") return;
        held.current = false;
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => {
          held.current = true;
          setOpen(true);
        }, 450);
      },
      onPointerUp: release,
      onPointerCancel: release,
      onPointerLeave: release,
      onContextMenu: (event: React.MouseEvent) => {
        if (held.current) event.preventDefault();
      },
      onClickCapture: (event: React.MouseEvent) => {
        if (!held.current) return;
        held.current = false;
        event.preventDefault();
        event.stopPropagation();
      },
    },
  };
}

function ExternalMark({ newTab }: { newTab: string }) {
  return (
    <>
      <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0" />
      <span className="sr-only">({newTab})</span>
    </>
  );
}

function DockLabel({
  item,
  side,
  newTab,
}: {
  item: DockItem;
  side: "right" | "left";
  newTab: string;
}) {
  return (
    <span
      data-slot="dock-label"
      className={cn(
        "pointer-events-none flex items-center gap-1 font-medium whitespace-nowrap",
        "dock-bar:text-xs dock-bar:leading-tight",
        "dock-rail:absolute dock-rail:top-1/2 dock-rail:z-10 dock-rail:-translate-y-1/2 dock-rail:rounded-lg dock-rail:bg-background dock-rail:px-3 dock-rail:py-1.5 dock-rail:text-sm dock-rail:text-foreground dock-rail:opacity-0 dock-rail:shadow-md dock-rail:ring-1 dock-rail:ring-primary/10 dock-rail:transition-opacity dock-rail:duration-150 dock-rail:ease-(--ease-out)",
        side === "left"
          ? "dock-rail:left-[calc(100%+0.5rem)]"
          : "dock-rail:right-[calc(100%+0.5rem)]",
        "dock-rail:group-hover/dock-item:opacity-100 dock-rail:group-focus-visible/dock-item:opacity-100 dock-rail:group-data-label-open/dock-item:opacity-100",
      )}
    >
      {item.label}
      {item.external ? <ExternalMark newTab={newTab} /> : null}
      {item.shortcut ? (
        <span
          aria-hidden="true"
          className="ml-1 text-muted-foreground dock-bar:hidden"
        >
          <kbd className="font-sans">{item.shortcut}</kbd>
        </span>
      ) : null}
    </span>
  );
}

function badgeToneClassName(item: DockItem) {
  return item.badgeTone === "accent"
    ? "bg-brand text-brand-foreground"
    : "bg-secondary text-foreground";
}

function DockLink({
  item,
  className,
  children,
  ...props
}: React.ComponentProps<"a"> & { item: DockItem }) {
  const own: React.ComponentProps<"a"> = {
    className,
    children,
    onClick: item.onClick,
  };
  if (item.href !== undefined) own.href = item.href;
  if (item.current) own["aria-current"] = "page";
  if (item.external) {
    own.target = "_blank";
    own.rel = "noopener noreferrer";
  }
  return useRender({
    defaultTagName: "a",
    render: item.render,
    props: mergeProps<"a">(own, props),
  });
}

function DockItemControl({
  entry,
  overflow,
  side,
  newTab,
}: {
  entry: DockEntry;
  overflow: boolean;
  side: "right" | "left";
  newTab: string;
}) {
  const { item } = entry;
  const longPress = useLongPress();
  const shared = {
    "data-slot": "dock-item",
    "data-group": entry.group,
    "data-overflow": overflow ? "" : undefined,
    "data-label-open": longPress.open ? "" : undefined,
    className: cn(itemClassName, overflow && "dock-bar:hidden"),
    ...longPress.handlers,
  };
  const content = (
    <>
      <span data-slot="dock-icon" aria-hidden="true" className={iconClassName}>
        {item.icon}
      </span>
      <DockLabel item={item} side={side} newTab={newTab} />
      {item.badge !== undefined && item.badge !== null ? (
        <span
          data-slot="dock-badge"
          className={cn(
            "pointer-events-none absolute flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-xs leading-none font-semibold tabular-nums",
            badgeToneClassName(item),
            "dock-rail:-top-1 dock-rail:-right-1 dock-bar:top-0.5 dock-bar:right-1",
          )}
        >
          {item.badge}
        </span>
      ) : null}
    </>
  );

  if (entry.link) {
    return (
      <DockLink item={item} {...shared}>
        {content}
      </DockLink>
    );
  }
  return (
    <button
      type="button"
      aria-pressed={item.pressed}
      onClick={item.onClick}
      {...shared}
    >
      {content}
    </button>
  );
}

function DockSheetItem({
  entry,
  labels,
}: {
  entry: DockEntry;
  labels: Required<DockLabels>;
}) {
  const { item } = entry;
  const content = (
    <>
      <span data-slot="dock-icon" aria-hidden="true" className={iconClassName}>
        {item.icon}
      </span>
      <span className="flex min-w-0 items-center gap-1">
        {item.label}
        {item.external ? <ExternalMark newTab={labels.newTab} /> : null}
      </span>
      {item.badge !== undefined && item.badge !== null ? (
        <span
          className={cn(
            "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold tabular-nums",
            badgeToneClassName(item),
          )}
        >
          {item.badge}
        </span>
      ) : null}
    </>
  );

  if (entry.link) {
    return (
      <MenuPrimitive.LinkItem
        closeOnClick
        render={item.render}
        href={item.href}
        aria-current={item.current ? "page" : undefined}
        target={item.external ? "_blank" : undefined}
        rel={item.external ? "noopener noreferrer" : undefined}
        onClick={item.onClick}
        className={sheetItemClassName}
      >
        {content}
      </MenuPrimitive.LinkItem>
    );
  }
  if (item.pressed !== undefined) {
    return (
      <MenuPrimitive.CheckboxItem
        checked={item.pressed}
        onClick={item.onClick}
        className={sheetItemClassName}
      >
        {content}
        <span aria-hidden="true" className="ml-auto pl-4 text-muted-foreground">
          {item.pressed ? labels.on : labels.off}
        </span>
      </MenuPrimitive.CheckboxItem>
    );
  }
  return (
    <MenuPrimitive.Item onClick={item.onClick} className={sheetItemClassName}>
      {content}
    </MenuPrimitive.Item>
  );
}

/**
 * The app's places and every main control, floating: a rail at the right edge
 * from 640px with its centre line on the profile avatar's, and a bar along the
 * bottom on phones with its edges on the top row's insets. Places (links) come
 * first, then controls (buttons and toggles), separated by space. Labels show
 * on hover, keyboard focus and long-press on the rail, and under the icons on
 * the bar. When the bar runs out of width it keeps the current place and the
 * highest-priority items, and the rest go into a More sheet.
 *
 * Content keeps clear of it with `--flow-dock-rail-room` on the rail's side
 * and `--flow-dock-bar-room` at the bottom on phones.
 */
function Dock({
  items,
  layout = "auto",
  side = "right",
  barLimit = 5,
  labels,
  className,
  ref,
  ...props
}: DockProps) {
  const words: Required<DockLabels> = {
    more: labels?.more ?? "More",
    on: labels?.on ?? "On",
    off: labels?.off ?? "Off",
    newTab: labels?.newTab ?? "opens in a new tab",
  };
  const nav = useRef<HTMLElement | null>(null);
  const measure = useRef<HTMLSpanElement | null>(null);
  const fade = useRef<HTMLDivElement | null>(null);
  const [fit, setFit] = useState(barLimit);
  useScrollEdge(fade, { scroll: false });

  const { entries, groups } = useMemo(() => {
    const all = items.map((item, index): DockEntry => {
      const link = isLink(item);
      return {
        item,
        index,
        link,
        key: item.id ?? item.label,
        group: item.group ?? (link ? "place" : "control"),
      };
    });
    const grouped = [
      all.filter((e) => e.group === "place"),
      all.filter((e) => e.group === "control"),
    ];
    return { entries: grouped.flat(), groups: grouped };
  }, [items]);

  useLayoutEffect(() => {
    const bar = nav.current;
    const row = measure.current;
    if (!bar || !row) return;
    const run = () => {
      const widths = new Map<string, number>();
      let moreWidth = 0;
      for (const child of row.children) {
        const width = child.getBoundingClientRect().width;
        const key = child.getAttribute("data-key");
        if (key) widths.set(key, width);
        else if (child.hasAttribute("data-more")) moreWidth = width;
      }
      const gap = Number.parseFloat(getComputedStyle(bar).columnGap) || 0;
      let slots = Math.min(barLimit, entries.length);
      for (; slots > 1; slots--) {
        const kept = barKeys(entries, slots);
        const more = kept.size < entries.length;
        let total = (kept.size + (more ? 1 : 0) - 1) * gap;
        if (more) total += moreWidth;
        for (const key of kept) total += widths.get(key) ?? 0;
        if (total <= bar.clientWidth) break;
      }
      setFit(slots);
    };
    run();
    const observer = new ResizeObserver(run);
    observer.observe(bar);
    observer.observe(row);
    return () => observer.disconnect();
  }, [entries, barLimit]);

  const kept = barKeys(entries, fit);
  const sheetGroups = groups
    .map((group) => group.filter((e) => !kept.has(e.key)))
    .filter((group) => group.length > 0);

  const navigation = useRender({
    render: <nav data-slot="dock" data-dock-layout={layout} data-side={side} />,
    ref: ref ? [nav, ref] : nav,
    props: mergeProps<"nav">(
      {
        "aria-label": "Places and controls",
        className: cn(
          "fixed z-40 flex items-center gap-1.5 print:hidden",
          "dock-rail:top-1/2 dock-rail:-translate-y-1/2 dock-rail:flex-col",
          side === "left"
            ? "dock-rail:left-(--flow-dock-rail-left)"
            : "dock-rail:right-(--flow-dock-rail-right)",
          "dock-bar:right-(--flow-dock-bar-right) dock-bar:bottom-(--flow-dock-bar-bottom) dock-bar:left-(--flow-dock-bar-left) dock-bar:justify-around dock-bar:gap-1",
          className,
        ),
        children: (
          <>
            {groups.map((group, index) =>
              group.length === 0 ? null : (
                <Fragment key={group[0]?.group}>
                  {index > 0 && groups[0]?.length ? (
                    <span
                      aria-hidden="true"
                      className="h-3 w-full shrink-0 dock-bar:hidden"
                    />
                  ) : null}
                  {group.map((entry) => (
                    <DockItemControl
                      key={entry.key}
                      entry={entry}
                      overflow={!kept.has(entry.key)}
                      side={side}
                      newTab={words.newTab}
                    />
                  ))}
                </Fragment>
              ),
            )}
            {sheetGroups.length > 0 ? (
              <MenuPrimitive.Root>
                <MenuPrimitive.Trigger
                  data-slot="dock-more"
                  className={cn(itemClassName, "dock-rail:hidden")}
                >
                  <span aria-hidden="true" className={iconClassName}>
                    <Ellipsis />
                  </span>
                  <span
                    data-slot="dock-label"
                    className="text-xs leading-tight font-medium whitespace-nowrap"
                  >
                    {words.more}
                  </span>
                </MenuPrimitive.Trigger>
                <MenuPrimitive.Portal>
                  <MenuPrimitive.Positioner
                    side="top"
                    align="end"
                    sideOffset={8}
                    className="isolate z-50 outline-none"
                  >
                    <MenuPrimitive.Popup
                      data-slot="dock-sheet"
                      className="flex max-h-(--available-height) min-w-52 origin-(--transform-origin) flex-col gap-2 overflow-y-auto rounded-xl bg-background p-1.5 text-foreground shadow-md ring-1 ring-primary/10 duration-150 ease-(--ease-out) outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
                    >
                      {sheetGroups.map((group) => (
                        <MenuPrimitive.Group
                          key={group[0]?.group}
                          className="flex flex-col gap-0.5"
                        >
                          {group.map((entry) => (
                            <DockSheetItem
                              key={entry.key}
                              entry={entry}
                              labels={words}
                            />
                          ))}
                        </MenuPrimitive.Group>
                      ))}
                    </MenuPrimitive.Popup>
                  </MenuPrimitive.Positioner>
                </MenuPrimitive.Portal>
              </MenuPrimitive.Root>
            ) : null}
            <span
              ref={measure}
              aria-hidden="true"
              className="pointer-events-none invisible absolute top-0 left-0 flex size-0 overflow-hidden"
            >
              {entries.map((entry) => (
                <span
                  key={entry.key}
                  data-key={entry.key}
                  className={measureClassName}
                >
                  {entry.item.label}
                </span>
              ))}
              <span data-more="" className={measureClassName}>
                {words.more}
              </span>
            </span>
          </>
        ),
      },
      props,
    ),
  });

  return (
    <>
      <div
        ref={fade}
        data-slot="dock-fade"
        data-dock-layout={layout}
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 hidden h-(--flow-dock-bar-room) dock-bar:block print:hidden"
      />
      {navigation}
    </>
  );
}

export {
  Dock,
  type DockGroup,
  type DockItem,
  type DockLabels,
  type DockLayout,
  type DockProps,
};
