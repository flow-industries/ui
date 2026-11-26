import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type * as React from "react";
import { useRef } from "react";

import { type ScrollTarget, useScrollEdge } from "../../hooks/use-scroll-edge";
import { cn } from "../../utils/cn";
import { Logo } from "../logo";

type HeaderProps = React.ComponentProps<"header"> & {
  layout?: "plain" | "product";
};

function Header({ className, layout = "plain", ...props }: HeaderProps) {
  return (
    <header
      data-slot="header"
      className={cn(
        "flex items-center justify-between gap-4",
        layout === "product" && "flow-product-header",
        className,
      )}
      {...props}
    />
  );
}

const brandSizes = {
  sm: {
    logo: 16,
    gap: "gap-1.5",
    text: "text-sm tracking-widest",
    label: "ml-0.5",
  },
  default: {
    logo: 20,
    gap: "gap-2",
    text: "text-lg tracking-widest",
    label: "ml-0.5",
  },
  lg: {
    logo: 38,
    gap: "gap-3",
    text: "text-2xl tracking-[0.2em]",
    label: "ml-1",
  },
} as const;

type HeaderBrandSize = keyof typeof brandSizes;

type HeaderBrandProps = useRender.ComponentProps<"span"> & {
  label: string;
  start?: string;
  size?: HeaderBrandSize;
  logoSize?: number;
};

function HeaderBrand({
  className,
  label,
  start = "FLOW",
  size = "default",
  logoSize,
  render,
  onClick,
  ...props
}: HeaderBrandProps) {
  const s = brandSizes[size];
  // A bare brand is static text; rendered as a link or button it needs the
  // same touch floor and focus border as every other control.
  const interactive = render !== undefined || onClick !== undefined;

  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(
          "inline-flex shrink-0 items-center leading-tight text-foreground",
          s.gap,
          interactive &&
            "-m-0.5 rounded-sm border-[length:var(--border-width)] border-transparent outline-none pointer-coarse:min-h-11 focus-visible:border-focus",
          className,
        ),
        onClick,
        children: (
          <>
            <Logo size={logoSize ?? s.logo} className="shrink-0" />
            <span className={cn("uppercase", s.text)}>
              <span className="font-extralight">{start}</span>
              <span className={cn("font-semibold", s.label)}>{label}</span>
            </span>
          </>
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "header-brand",
      size,
    },
  });
}

function HeaderActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="header-actions"
      className={cn("flex items-center gap-2.5", className)}
      {...props}
    />
  );
}

type FloatingHeaderProps = Omit<React.ComponentProps<"header">, "children"> & {
  /** The app's `HeaderBrand`, at its default size. */
  brand: React.ReactNode;
  /** The profile (`ProfilePill`, or its menu trigger), or Sign in while signed out. */
  end?: React.ReactNode;
  /**
   * The element whose scroll shows the fade, when content scrolls in an inner box
   * rather than the window. Pass the element itself (from a callback ref) if it
   * mounts after the header; a ref object is read once, when the header mounts.
   */
  scrollTarget?: ScrollTarget;
  /**
   * Keep the row's room in the page flow (default). Pass `false` when the page
   * leaves room itself, e.g. an inner scroller that runs under the row with
   * `padding-top: var(--flow-top-row-height)`.
   */
  spacer?: boolean;
  /** Classes for the spacer that holds the row's place: grid area, margins. */
  containerClassName?: string;
};

/**
 * The floating top row every Flow app shares: the brand on the left inset and
 * the profile on the right, both centred 48px from the top, fixed while content
 * scrolls beneath. It holds nothing else. It owns its 96px of room (content
 * starts at `--flow-top-row-height`) and a page-coloured fade that appears once
 * content is under the row. Short windows, large text, forced colours and print
 * put it back in the page flow.
 */
function FloatingHeader({
  brand,
  end,
  scrollTarget,
  spacer = true,
  className,
  containerClassName,
  ref,
  ...props
}: FloatingHeaderProps) {
  const header = useRef<HTMLElement | null>(null);
  useScrollEdge(header, { target: scrollTarget, scroll: true });
  const row = useRender({
    render: <header data-slot="floating-header" />,
    ref: ref ? [header, ref] : header,
    props: mergeProps<"header">(
      {
        className: cn("flow-top-row", className),
        children: (
          <>
            <div
              data-slot="floating-header-fade"
              aria-hidden="true"
              className="flow-top-row-fade"
            />
            <div data-slot="floating-header-brand">{brand}</div>
            <div data-slot="floating-header-end">{end}</div>
          </>
        ),
      },
      props,
    ),
  });

  return (
    <div
      data-slot="floating-header-spacer"
      data-spacer={spacer ? undefined : "false"}
      className={cn("flow-top-row-spacer", containerClassName)}
    >
      {row}
    </div>
  );
}

export type {
  FloatingHeaderProps,
  HeaderBrandProps,
  HeaderBrandSize,
  HeaderProps,
};
export { FloatingHeader, Header, HeaderActions, HeaderBrand };
